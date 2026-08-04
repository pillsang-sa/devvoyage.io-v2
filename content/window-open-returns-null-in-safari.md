---
title: window.open returns null in safari
summary: 모바일 Safari에서 새 탭이 열리지 않았습니다. 범인은 팝업 차단 설정이 아니라, 클릭과 window.open 사이에 끼어 있던 비동기 호출이었습니다.
publishedAt: 2024-07-31
---

크로스 브라우징을 점검하다 모바일 Safari에서 버튼을 눌러도 아무 일이 일어나지 않는 걸 발견했습니다. `window.open()`이 `WindowProxy` 대신 `null`을 반환하고 있었습니다.

Safari의 Block Pop-ups 설정이 켜져 있는 게 원인이었지만, 그것만으로는 설명이 되지 않았습니다. 같은 설정에서 어떤 버튼은 잘 열리고 어떤 버튼은 열리지 않았기 때문입니다. 둘을 가른 건 **클릭과 `window.open` 호출 사이에 비동기 작업이 끼어 있는지**였습니다.

![Safari 설정의 Block Pop-ups 항목이 켜져 있는 화면](/images/window-open-returns-null-in-safari/cause.jpg)

## 클릭은 한 번뿐이다

문제가 된 코드는 버튼을 누르면 백엔드에서 URL을 받아온 뒤 그 값으로 창을 열고 있었습니다.

![버튼 클릭 → 백엔드에서 url 응답 → window.open(url), 그런데 아무 일도 일어나지 않는다](/images/window-open-returns-null-in-safari/flow.png)

```ts
const openLink = (url: string) => {
  if (typeof window === 'undefined') return;

  window.open(url, '_blank');
};
```

브라우저는 팝업을 열어도 되는지 판단할 때 **사용자 제스처가 살아 있는지**를 봅니다. 그리고 그 유효기간은 생각보다 짧습니다.

> Even if you make a direct interaction like clicking a button, timers or any asynchronous callback will be treated as not a direct interaction and the pop-up window will be blocked.
>
> 버튼 클릭 같은 직접적인 상호작용이 있었더라도, 타이머나 비동기 콜백을 거치면 직접적인 상호작용으로 간주하지 않아 팝업이 차단된다.

해당 API는 내부에서 다른 API를 다시 호출하는 구조라 평균 응답이 2,000~4,000ms였습니다. 응답을 기다리는 사이 제스처는 이미 만료돼 있었고, 비동기를 거치지 않던 다른 버튼들만 멀쩡히 동작했던 겁니다.

## 창을 먼저 열고, 주소는 나중에 채운다

그렇다면 순서를 뒤집으면 됩니다. 제스처가 살아 있는 클릭 순간에 **빈 창을 먼저 열어** `WindowProxy`를 확보해 두고, URL은 응답이 온 뒤에 주입합니다.

```ts
const popup = window.open('', '_blank');

if (!popup) return;

const data = await getURL();

if (data.url) popup.location.href = data.url;
else popup.close();
```

`window.open('', '_blank')`은 클릭 핸들러의 첫 줄에서 동기로 실행되므로 차단되지 않습니다. 이후 `location.href`를 바꾸는 건 이미 열린 창을 조작하는 것이라 팝업 정책과 무관합니다. 응답이 실패하면 빈 창을 닫아주면 됩니다.

이제 Block Pop-ups가 켜져 있어도 정상 동작합니다. 비동기가 필요 없는 곳에서는 기존 `openLink`를 그대로 쓰고, 응답을 기다려야 하는 곳에서만 이 패턴을 씁니다.

- [window.open returns null in Safari and Firefox after allowing pop-up on the browser](https://ffan0811.medium.com/window-open-returns-null-in-safari-and-firefox-after-allowing-pop-up-on-the-browser-4e4e45e7d926)
- [Window: open() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
