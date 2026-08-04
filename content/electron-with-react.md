---
title: Electron with React
summary: 사내 윈도우 앱을 React + Electron으로 만들면서 정리한 것들. 두 프로세스가 어떻게 나뉘고, contextBridge로 무엇을 얼마나 열어줄지.
publishedAt: 2024-11-19
---

사내에서 윈도우 데스크톱 앱 요청이 들어와 맡게 됐습니다. 기능이 많지는 않았지만 React + Electron 조합을 처음 써보면서 정리한 내용입니다.

Electron은 Chromium과 Node.js를 바이너리에 함께 넣어, JavaScript·HTML·CSS로 만든 화면을 데스크톱 앱으로 돌립니다. 하나의 코드베이스로 Windows·macOS·Linux를 모두 지원하는 원리가 여기 있습니다.

중요한 건 이 구조 때문에 **프로세스가 둘로 나뉜다**는 점입니다. Chromium이 화면을 그리는 Renderer Process가 있고, Node.js API를 쓸 수 있는 Main Process가 따로 있습니다. React 코드는 Renderer에서 돌아가며, 파일 시스템 같은 걸 건드리려면 Main에 부탁해야 합니다. 이 글의 절반은 그 부탁을 어떻게 주고받는지에 관한 이야기입니다.

## 프로젝트 세팅

```bash
# vite-react-typescript 프로젝트 시작
pnpm create vite first-electron --template react-ts

# Electron 및 빌드 관련 패키지 추가
pnpm add -D electron electron-builder wait-on concurrently
```

## 개발과 빌드를 나누는 스크립트

```json
"scripts": {
    "dev": "vite",
    "lint": "eslint .",
    "preview": "vite preview",
    "electron": "wait-on http://localhost:5173 && electron .",
    "electron:dev": "concurrently \"pnpm dev\" \"pnpm electron\"",
    "electron:package": "tsc -b && vite build",
    "electron:build": "pnpm electron:package && electron-builder --win --x64 --config electron-builder.json"
},
"main": "./public/main.cjs",
```

`electron:dev`는 Vite 개발 서버와 Electron을 동시에 띄웁니다. 그냥 동시에 실행하면 Electron이 아직 뜨지 않은 `localhost:5173`을 열려다 실패하므로, `wait-on`으로 서버가 응답할 때까지 기다린 뒤 실행합니다.

`electron:build`는 TypeScript와 Vite 빌드를 먼저 돌리고, 그 산출물을 electron-builder에 넘겨 설치 파일을 만듭니다.

`main` 필드도 중요합니다. Electron 앱의 진입점이라 경로가 틀리면 아무것도 뜨지 않습니다.

## electron-builder.json

```jsonc
{
  // 앱의 고유 식별자, 보통 역방향 도메인 표기법을 사용합니다.
  "appId": "com.first-electron",
  // 애플리케이션의 이름입니다.
  "productName": "First Electron",
  // 빌드된 파일들이 저장될 디렉토리를 지정합니다.
  "directories": {
    "output": "build"
  },
  // electron 빌드에 필요한 파일들을 지정합니다.
  "files": ["dist/**/*", "node_modules/**/*", "public/**/*"],
  // windows 관련 설정입니다.
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ],
    "icon": "./public/icon.ico"
  },
  // windows 인스톨러 관련 설정입니다.
  "nsis": {
    // 설치 파일의 이름 형식
    "artifactName": "First_Electron_Installer.${ext}",
    // false로 설정하여 사용자 정의 옵션 설치 제공
    "oneClick": false,
    // true로 설정하여 사용자가 설치 경로 변경 가능
    "allowToChangeInstallationDirectory": true,
    // true로 설정하여 바탕화면 바로가기 생성
    "createDesktopShortcut": true,
    // true로 설정하여 시작 메뉴 바로가기 생성
    "createStartMenuShortcut": true,
    // 바로가기의 이름
    "shortcutName": "First Electron",
    // 제거 시 앱 데이터도 함께 삭제
    "deleteAppDataOnUninstall": true
  }
}
```

`win.target`은 패키지 타입과 아키텍처를 정합니다. 위에서는 인스톨러 형태(`nsis`)에 64비트를 지정했습니다. 이 밖에 `nsis-web`이나 `portable` 같은 타입, `ia32`나 `arm64` 같은 아키텍처를 쓸 수 있습니다. `icon`은 탐색기와 작업 표시줄에 표시될 아이콘입니다.

## main.cjs

Main Process의 진입점입니다. 창을 만들고, 개발/프로덕션에 따라 다른 것을 로드하고, 앱 생명주기를 다룹니다.

```js
const { Menu, BrowserWindow, app } = require('electron');
const path = require('path');
require('./ipcHandler.cjs');

// public 폴더에 있는 preload.js를 위한 경로 설정
const preloadPath = path.join(__dirname, 'preload.cjs');

// 개발 환경에서 사용할 기본 URL입니다.
const BASE_URL = 'http://localhost:5173';
// app이 packaging(build)되었는지 확인해서 dev와 production을 구분합니다.
const isDev = !app.isPackaged;

// BrowserWindow 객체는 전역으로 관리합니다.
// 전역이 아닌 경우 자바스크립트 가비지 컬렉팅 발생 시 의도치 않게 browser window가 닫힐 수 있습니다.
let mainWindow = null;

const createWindow = () => {
  // 메뉴가 불필요하여 빈 메뉴로 설정 후 적용했습니다.
  Menu.setApplicationMenu(Menu.buildFromTemplate([]));

  // BrowserWindow 인스턴스를 생성하여 전역객체에 할당합니다.
  mainWindow = new BrowserWindow({
    // 가로 사이즈
    width: 800,
    // 세로 사이즈
    height: 600,
    // position
    center: true,
    // 사이즈 조절 유무
    resizable: false,
    webPreferences: {
      // 개발 도구(devTools) 사용 유무
      devTools: isDev,
      // Node.js 통합 비활성화 - 보안을 위해 렌더러 프로세스에서 Node.js API 직접 사용 방지
      nodeIntegration: false,
      // 컨텍스트 격리 활성화 - 메인 프로세스와 렌더러 프로세스의 실행 컨텍스트를 분리
      contextIsolation: true,
      // preload 스크립트 경로 - 안전하게 메인 프로세스와 렌더러 프로세스 간 통신을 설정
      preload: preloadPath,
      // 샌드박스 활성화 - 렌더러 프로세스의 샌드박스 모드 설정
      sandbox: true,
    },
  });

  if (isDev) {
    // vite로 실행된 localhost:5173의 index.html을 로드합니다.
    mainWindow.loadURL(BASE_URL);
    // devTools를 detach로 오픈합니다.
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // react build 아티팩트의 index.html의 경로를 지정하여 해당 파일을 로드합니다.
    mainWindow.loadFile(`${app.getAppPath()}/dist/index.html`);
  }
};

// Electron이 준비되면 whenReady 메서드가 호출되어, 초기화 및 browser window를 생성
app.whenReady().then(() => {
  createWindow();

  // macOS에서는 창을 모두 닫아도 앱이 완전히 종료되지 않습니다.
  // 백그라운드에서 돌아가는 앱을 다시 Dock에서 클릭했을 때 activate 이벤트가 감지되어 새창을 띄워줍니다.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 창을 닫는 이벤트가 탐지되면 앱을 종료시킵니다.
// 다만 macOS(darwin)에서는 창이 닫혀도 앱이 완전히 종료되지 않기 때문에 조건문 처리를 했습니다.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

`webPreferences`의 네 줄이 이 앱의 보안 자세를 결정합니다. `nodeIntegration: false`와 `contextIsolation: true`로 Renderer에서 Node.js API에 직접 손대지 못하게 막고, 대신 `preload` 스크립트를 통해 **필요한 것만 골라서** 열어줍니다.

## 두 프로세스를 잇는 preload

preload 스크립트는 Renderer와 같은 창에 붙지만 Node.js API에 접근할 수 있는 특별한 자리입니다. 여기서 `contextBridge`로 원하는 함수만 `window`에 노출합니다.

```js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  invokePing: (text) => ipcRenderer.invoke('invoke-ping', { text }),
  onPing: (listener) => ipcRenderer.on('on-ping', listener),
});
```

`exposeInMainWorld`의 첫 인자가 `window`에 붙을 이름, 두 번째가 노출할 API 묶음입니다. 여기서는 `window.electron.invokePing`처럼 쓰게 됩니다. Renderer는 `ipcRenderer` 자체에는 접근할 수 없고, 오직 이 두 함수만 쓸 수 있습니다.

`ipcRenderer`가 제공하는 통신 방식은 두 가지입니다.

| | 패턴 | 인자 |
| --- | --- | --- |
| `invoke` | Promise 기반 요청-응답 | 채널명, 보낼 메시지 |
| `on` | 응답 없는 이벤트 구독 | 채널명, 리스너 |

`invoke`는 값을 돌려받아야 할 때, `on`은 Main 쪽 상태를 계속 지켜봐야 할 때 씁니다.

TypeScript는 `contextBridge`로 붙인 것들을 알 수 없으므로 직접 선언해 줘야 합니다. `global.d.ts`를 만들어 넣었습니다.

```ts
export {};

declare global {
  interface Window {
    electron: {
      invokePing: (text: string) => Promise<string>;
      onPing: (echoText: () => string) => void;
    };
  }
}
```

이제 컴포넌트에서 평범한 함수처럼 부르면 됩니다.

```tsx
export default function Button() {
  const handleButtonClick = async () => {
    if (!window) return;
    const response = await window.electron.invokePing('ping');

    // expect "Received: ping"
    console.log(response);
  };
  return <button onClick={handleButtonClick}>ping</button>;
}
```

## 요청을 받는 쪽

`ipcRenderer`가 보내는 쪽이라면 `ipcMain`이 받는 쪽입니다. 채널명만 맞춰주면 됩니다.

```js
ipcMain.handle('invoke-ping', (event, message) => {
  console.log('invoke-ping received from renderer.');

  const { text } = message;
  const response = `Received: ${text}`;

  return response;
});
```

`app.whenReady().then()` 안에 넣어도 되지만, 저는 `ipcHandler.cjs`로 분리하고 핸들러 내부 로직도 기능별로 다시 나눴습니다. 첫 인자인 `event` 객체는 보안 검증이나 요청 출처 확인에 쓸 수 있는데, 이번에는 필요가 없어 쓰지 않았습니다.

여기까지가 통신을 붙이는 최소 구성입니다. 아직 코드 서명을 하지 못해 비공식 경로로 배포하고 있는데, 정식 배포까지 마무리해 보고 싶습니다. 웹만 하다가 프로세스 경계를 신경 쓰며 개발하는 경험이 꽤 새로웠습니다.

- [Electron](https://www.electronjs.org/)
- [electron-builder](https://www.electron.build/)
