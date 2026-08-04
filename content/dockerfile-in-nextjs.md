---
title: Dockerfile in Next.js
summary: Vercel이 제공하는 Next.js Dockerfile 샘플을 한 스테이지씩 뜯어 읽었습니다. 왜 네 단계로 나뉘어 있고, 각 단계가 무엇을 남기는지.
publishedAt: 2024-05-20
---

development, staging, production의 환경 차이 때문에 고생해 본 경험은 대부분 있을 겁니다. Docker로 Next.js 이미지를 만들어 두면 그 차이가 사라집니다. 여기서는 [Vercel이 제공하는 Dockerfile 샘플](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile)을 기준으로, 각 스테이지가 무엇을 하는지 읽어보겠습니다.

이 파일은 multi-stage build로 작성돼 있습니다. 빌드 과정을 여러 단계로 쪼개고 마지막 단계에는 **실행에 필요한 것만** 남기는 방식입니다. 빌드 도구나 중간 산출물이 최종 이미지에 딸려오지 않아 크기가 확 줄고, 각 단계가 레이어 캐시를 따로 가져가므로 변경되지 않은 단계는 다시 빌드하지 않습니다.

| 스테이지 | 하는 일 | 다음 단계에 넘기는 것 |
| --- | --- | --- |
| base | 기본 이미지와 공통 설정 | 이미지 자체 |
| deps | 의존성 설치 | `node_modules` |
| builder | Next.js 빌드 | `.next` 산출물 |
| runner | 서버 실행 | — |

## base

```dockerfile
FROM node:18-alpine AS base
RUN corepack enable
```

`node:18-alpine`은 Node.js 18을 담은 경량 리눅스 이미지입니다. alpine은 불필요한 패키지와 데몬이 없어 가볍고, 패키지 관리자로 `apk`를 씁니다. 다른 버전이 필요하면 [Docker Hub](https://hub.docker.com)에서 골라 쓰면 됩니다.

여기서 `corepack enable`을 해두면 이 이미지를 상속하는 모든 스테이지에서 pnpm을 바로 쓸 수 있습니다.

## deps

```dockerfile
# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi
```

alpine은 musl libc를 쓰는데 대부분의 네이티브 라이브러리는 glibc를 전제로 빌드돼 있습니다. `libc6-compat`이 그 간극을 메웁니다.

lock 파일만 먼저 복사하는 게 포인트입니다. 소스 코드는 자주 바뀌지만 의존성은 그렇지 않으므로, 이 레이어는 lock 파일이 바뀌지 않는 한 캐시에서 재사용됩니다.

샘플은 yarn·npm·pnpm 세 가지를 모두 분기 처리해 두었으니 쓰는 것만 남기면 됩니다. 저는 pnpm을 쓰면서 lock 파일이 갱신되지 않도록 `--frozen-lockfile`을 붙였고, 이미지 최적화에 쓰는 `sharp`를 리눅스 플랫폼에 맞게 이 단계에서 같이 설치했습니다.

```dockerfile
RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile && pnpm add sharp; \
  else echo "Lockfile not found." && exit 1; \
  fi
```

## builder

```dockerfile
# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi
```

`COPY --from=deps`로 앞 단계가 만든 `node_modules`를 가져온 뒤, 프로젝트 파일을 복사합니다.

`COPY . .` 하나면 될 것 같지만 두 줄로 나눈 데는 이유가 있습니다. Docker는 명령어마다 레이어를 만들고 변경이 없으면 캐시를 씁니다. 의존성 복사와 소스 복사를 분리해 두면, 소스만 고쳤을 때 앞 레이어는 그대로 재사용됩니다.

## runner

```dockerfile
# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
```

마지막 단계는 앞에서 만든 것 중 **실행에 필요한 것만** 골라 담습니다. 빌드 산출물과 `public`을 복사하고, 포트를 열고, 서버를 띄우면 끝입니다.

눈여겨볼 건 사용자 생성 부분입니다. `nodejs` 그룹과 `nextjs` 사용자를 만들고 `.next` 디렉터리의 소유권을 넘긴 뒤 `USER nextjs`로 전환합니다. root로 돌지 않으니 컨테이너 안에서 권한 상승 공격의 여지가 줄고, UID/GID를 1001로 고정해 두었으니 어느 환경에서 빌드하든 권한이 같습니다.

---

여기까지가 기본 형태입니다. 저는 별도의 인프라 담당이 없어 직접 Docker 환경을 꾸렸는데, 이 파일을 출발점으로 `sharp` 설치를 얹고 pm2로 무중단 배포를 붙이는 식으로 프로젝트에 맞게 고쳐 쓰고 있습니다.
