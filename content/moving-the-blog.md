---
title: 블로그를 이전하며
summary: Astro에서 Next.js 16으로 블로그를 옮기며 정리한 것들 — 마크다운 파이프라인, 조용한 날짜 함정, 그리고 본문이 화면을 밀어내지 않게 하는 법.
publishedAt: 2026-08-04
---

쓰던 블로그를 Next.js 16과 마크다운으로 다시 만들었습니다. 요구사항은 단순했습니다. **목록과 아티클, 두 개의 페이지**만 있으면 되고, 글은 마크다운으로 쓰고 싶었습니다.

## 왜 마크다운인가

에디터를 켜고 글을 쓰기까지의 마찰이 적을수록 글을 더 자주 쓰게 됩니다. 마크다운 파일은 저장소 안에 그냥 텍스트로 존재하고, 버전 관리가 되고, 어떤 편집기로든 열립니다. frontmatter로 메타데이터만 얹어주면 충분합니다.

```yaml
---
title: 블로그를 이전하며
summary: 한 줄 요약
publishedAt: 2026-08-04
---
```

| 항목 | 선택 | 이유 |
| --- | --- | --- |
| 콘텐츠 | 저장소 내 `.md` | 버전 관리, 마찰 없음 |
| 하이라이팅 | Shiki (빌드 타임) | 클라이언트 JS 0바이트 |
| 배포 | GitHub Pages | 정적이면 충분함 |

## 파싱 파이프라인

`gray-matter`로 frontmatter를 떼어내고, 본문은 remark/rehype 파이프라인에 태웁니다. 여기서 첫 번째 함정을 만났습니다.

`react-markdown`의 기본 `Markdown` 컴포넌트는 unified 파이프라인을 **동기로** 실행합니다. 그런데 코드 하이라이팅에 쓰는 `rehype-pretty-code`는 Shiki 하이라이터를 `await`하는 비동기 플러그인입니다. 그대로 조합하면 이런 에러가 납니다.

```text
Error: `runSync` finished async. Use `run` instead
```

해결책은 v10이 제공하는 `MarkdownAsync`입니다. 서버 전용 async 컴포넌트라서 비동기 플러그인과 컴포넌트 매핑을 둘 다 지원합니다.

```tsx
import { MarkdownAsync } from "react-markdown";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <MarkdownAsync
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypePrettyCode, { theme: "github-dark-dimmed" }]]}
    >
      {children}
    </MarkdownAsync>
  );
}
```

## 날짜에 숨어 있던 함정

두 번째 함정은 더 조용했습니다. `gray-matter`는 YAML을 js-yaml로 파싱하는데, 따옴표 없는 `2026-08-04`를 **문자열이 아니라 JS `Date` 객체로** 만들어 버립니다. 그래서 읽어들이는 지점에서 한 번 정규화해 줍니다.

```ts
function toDateString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  // ...
}
```

포맷팅할 때는 로케일과 타임존을 명시적으로 고정했습니다. 그러면 빌드 머신 설정과 무관하게 결과가 결정적이라, 서버와 클라이언트의 렌더 결과가 어긋날 일이 없습니다.

## 페이지는 넘치지 않고, 내용물이 스크롤한다

반응형에서 가장 자주 깨지는 건 직접 작성한 마크업이 아니라 **마크다운이 만들어내는 요소들**입니다. 긴 코드 한 줄, 컬럼이 많은 테이블, 원본 크기가 큰 이미지가 대표적입니다.

![세 가지 기준 화면 너비 — 375px, 768px, 1280px](/images/moving-the-blog/breakpoints.svg)

가로 스크롤이 `<body>`에 생기면 페이지 전체가 흔들립니다. 넘치는 요소는 **자기 자신 안에서** 스크롤해야 합니다.

| 요소 | 문제 | 처리 |
| --- | --- | --- |
| `pre` | 긴 줄이 페이지를 넓힘 | `overflow-x: auto` |
| `table` | 컬럼이 많으면 넘침 | 스크롤 래퍼로 감싸기 |
| `img` | 원본 크기 그대로 | `width: 100%; height: auto` |
| 긴 URL | 단어가 안 쪼개짐 | `overflow-wrap: break-word` |

`pre`는 `overflow-x: auto` 한 줄로 끝납니다. 줄바꿈(`white-space: pre-wrap`)은 코드에서는 오히려 읽기 어려워지므로 쓰지 않았습니다.

테이블은 `pre`처럼 자체적으로 스크롤하지 않으므로 래퍼가 필요합니다. 마크다운에는 래퍼를 쓸 자리가 없으니 렌더러 쪽에서 넣어줍니다.

```tsx
table({ children, ...rest }) {
  return (
    <div className="my-8 overflow-x-auto">
      <table {...rest}>{children}</table>
    </div>
  );
}
```

이미지는 `width: 100%; height: auto`로 담아내되, **원본 비율을 미리 알려주는 것**이 중요합니다. 그러지 않으면 이미지가 로드되는 순간 아래 내용이 밀려 내려갑니다. 정적 export에서는 Next의 이미지 최적화를 쓸 수 없어서, 빌드 타임에 `public/` 안의 파일에서 크기를 직접 읽어 `width`/`height` 속성에 넣었습니다.

```tsx
const { width, height } = imageSize(fs.readFileSync(file));
```

본문 폭은 넓다고 좋은 게 아닙니다. 한 줄에 들어가는 글자 수가 너무 많으면 눈이 다음 줄을 찾기 어려워집니다. `max-w-3xl` 정도에서 멈추고, 글자 크기만 화면에 따라 조금 키웁니다. 링크와 버튼은 최소 44px을 확보해야 손가락으로 정확히 누를 수 있습니다.

## 정적 export

배포처가 GitHub Pages라 `output: 'export'`로 빌드합니다. 서버가 없으니 모든 라우트는 빌드 타임에 만들어져야 하고, 이미지 최적화 API나 ISR 같은 건 쓸 수 없습니다.

블로그에는 아무 문제가 되지 않는 제약입니다. 오히려 CDN에 올라간 HTML 파일 몇 개가 전부라는 게 마음에 듭니다.

> 가장 좋은 인프라는 없는 인프라다.

## 옮기면서 알게 된 것

이전 블로그는 Astro + MDX였고, 코드 예제를 본문이 아니라 별도 `.ts` 파일에 템플릿 리터럴 상수로 보관한 뒤 import해서 렌더했습니다. 그런데 템플릿 리터럴은 백슬래시를 이스케이프 시퀀스로 해석합니다. 옮겨온 7편 중 6편의 코드가 그 때문에 손상돼 있었습니다.

| 원래 쓴 것 | 페이지에 나간 것 |
| --- | --- |
| `\d`, `\[` | `d`, `[` |
| `\"` | `"` |
| `\n` | 실제 줄바꿈 |
| `RUN \` + 줄바꿈 | 한 줄로 붙음 |

정규식은 의미가 바뀌었고, `package.json` 예제는 붙여넣으면 파싱 에러가 났고, 여러 줄짜리 셸 명령은 한 줄로 뭉개졌습니다. 코드가 본문 안에 그냥 있었다면 생기지 않았을 문제입니다.

마크다운 펜스에는 이스케이프 규칙이 없습니다. 쓴 그대로 나갑니다.

## 남은 것들

태그, 페이지네이션, RSS, 목차는 아직 없습니다. 필요해지면 그때 붙이면 됩니다. 지금은 글을 쓰는 게 먼저입니다.
