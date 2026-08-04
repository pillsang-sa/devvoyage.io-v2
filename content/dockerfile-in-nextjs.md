---
title: Dockerfile in Next.js
summary: Docker를 이용하여 Next.js 이미지를 생성하는 방법을 공유합니다.
publishedAt: 2024-05-20
---

## TL;DR

비단 프론트엔드 뿐만이 아니더라도 development, staging, live(production) 환경이 달라 문제를 겪었던 경험은 개발자라면 한 번쯤은 있을 거라고 생각합니다. 이런 문제를 해결할 방법 중 Docker를 사용해 Next.js 이미지를 생성하고 Docker 컨테이너를 실행하는 방법에 대해 다뤄보려 합니다. Vercel에서 제공하는 Next.js의 Dockerfile 샘플을 가지고 설명을 하겠습니다.

[Next.js Dockerfile sample by Vercel](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile)

## Multi-stage란?

제공된 Dockerfile은 multi-stage로 구성되어있으며, multi-stage build를 사용하며 아래와 같은 장점이 있습니다.

- 최종 이미지에 필요한 파일만 포함할 수 있습니다. 빌드 중 생성된 임시 파일이나 개발 도구는 최종 이미지에 포함되지 않으므로 이미지 크기를 크게 줄일 수 있습니다.
- 빌드 프로세스를 여러 단계로 나눌 수 있어 각 단계에서 필요한 도구와 환경을 분리할 수 있습니다. 이를 통해 빌드 속도를 최적화하고 관리하기 쉽게 만듭니다.
- 다양한 빌드 환경을 손쉽게 관리할 수 있습니다. 예를 들어, 테스트와 프로덕션 환경을 별도로 구성하고 각 환경에 맞는 최적의 설정을 적용할 수 있습니다.
- Docker는 각 빌드 단계마다 캐시를 활용하므로, 변경되지 않은 단계는 다시 빌드하지 않습니다. 이를 통해 빌드 시간을 단축할 수 있습니다.

## Base stage

```dockerfile
// TODO(SAMPLE_1)
```

node:18-alpine는 기본 이미지로서 [Docker Hub](https://hub.docker.com)를 통해 본인에게 더 적합한 기본 이미지를 찾을 수 있습니다. 위 이미지는 nodejs 18버전을 사용합니다. alpine은 linux를 경량화하여 배포한 이미지로 보안에 특화되었고 불필요한 package와 daemon이 없으며 패키지 관리자로 apk를 사용합니다.

그리고 base stage에서 corepack을 enable 하면 base를 기반으로 한 stage에서 pnpm을 사용할때마다 corepack enable pnpm과 같은 명령어를 사용하지 않아도 됩니다.

## Deps stage

```dockerfile
// TODO(SAMPLE_2)
```

deps stage로 base 이미지를 그대로 가져와 사용합니다.

alpine 이미지는 musl libc 라이브러리를 사용합니다. 하지만 대부분의 라이브러리는 glibc로 작성되어 glibc와의 호환성을 위해 libc6-compat 패키지를 설치합니다.

WORKDIR 명령어로 /app 디렉터리를 작업 디렉터리로 설정해 준 뒤, 현재 프로젝트의 lock 파일을 가져와 종속된 패키지들을 설치합니다. 예제 Dockerfile은 yarn, npm, pnpm 3가지의 패키지 매니저에 대해 모두 작성되어있어 현재 프로젝트에서 사용하는 패키지 매니저와 관련없는 명령어는 덜어내고 사용가능합니다. 저는 pnpm을 사용하였는데 lock file이 업데이트 되지 않게 --frozen-lockfile 옵션을 추가했습니다.

또한 저는 sharp(이미지 최적화 패키지)를 linux 플랫폼과 호환되게 해당 stage에서 pnpm add를 통해 설치하였습니다.

```dockerfile
// TODO(SAMPLE_3)
```

## Builder stage

```dockerfile
// TODO(SAMPLE_4)
```

builder stage로 deps와 동일하게 base 이미지를 그대로 가져와 사용합니다.

WORKDIR을 /app으로 지정한 후 COPY 명령어를 사용해 deps stage에서 종속성 패키지 설치의 결과인 node_modules를 현재 경로의 /node_modules 내부로 복사하고 바로 다음 명령어로 COPY를 사용하여 프로젝트의 모든 파일을 복사합니다.

두번째 COPY만 사용해도 될것 같지만, Docker는 각 명령어마다 레이어를 생성하는데 이때 레이어가 변경되지 않으면, 캐시를 사용합니다. 효율적인 캐시 관리를 위해서 두개의 명령어로 나누어 사용합니다.

COPY를 완료한 뒤 RUN 명령어를 사용해 Next.js 프로젝트 build를 진행합니다. 종속성 패키지 설치와 동일하게 불필요한 명령어는 덜어내고 사용이 가능합니다.

## Runner stage

```dockerfile
// TODO(SAMPLE_5)
```

runner stage는 매우 간단합니다. 기존 stage에서 생성된 데이터 중 필요한 데이터를 가져와 서비스를 실행시키는 역할을 하고 있습니다.
base 이미지를 그대로 가져오고 /app을 작업 디렉터리로 지정합니다. production 값을 가진 NODE_ENV라는 환경변수를 생성합니다.
이후 id 1001 nodejs라는 시스템 user 그룹과 nextjs라는 시스템 user를 생성합니다. builder stage에서 public 폴더의 자료도 복사를 해줍니다.
이후 프로그램이 실행될 .next 디렉터리를 생성한 후 디렉터리의 owner로 nextjs user와 nodejs userGroup을 지정해줍니다.

이러한 권한과 관련된 작업은 아래와 같은 이점이 있습니다.

- 특정 파일이나 디렉토리에 대한 접근을 제한함으로써 컨테이너 내부에서 권한 상승 공격을 방지합니다.
- UID와 GID를 고정하여, 개발 및 배포 환경에서 권한 설정이 일관되게 유지되도록 합니다.
- 시스템 사용자와 그룹을 분리하여, 애플리케이션이 필요한 최소한의 권한만 가지도록 설정합니다.

이후 builder 스테이지의 빌드 artifact를 현재 디렉터리로 복사 후 포트를 지정하고 서버를 실행시키면 Docker container가 실행됩니다.

## Conclusion

Vercel에서 제공하는 기본 Dockerfile을 의미를 해석해보았는데, 이글을 보고 도움이 되었으면 좋겠습니다. 저의 경우 현업에서 별도로 서버구성 담당이 없기에 제가 직접 Docker환경을 구축하였으며, 위의 Dockerfile을 base로 sharp를 다운로드하는 로직 추가 또는 pm2 설정을 통한 무중단 서비스 제공 등 저희 프로젝트에 맞게 더 나아가 소프트웨어 운영에 도움이 되는 방향으로 수정하여 사용중입니다!
