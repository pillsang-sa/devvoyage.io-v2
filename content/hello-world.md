---
title: 블로그를 시작하며
summary: Next.js 16과 마크다운으로 정적 블로그를 만든 과정과, 그 과정에서 마주친 함정들.
publishedAt: 2026-08-01
updatedAt: 2026-08-03
---

오래 미뤄두었던 블로그를 드디어 만들었습니다. 요구사항은 단순했습니다. **목록과 아티클, 두 개의 페이지**만 있으면 되고, 글은 마크다운으로 쓰고 싶었습니다.

## 왜 마크다운인가

에디터를 켜고 글을 쓰기까지의 마찰이 적을수록 글을 더 자주 쓰게 됩니다. 마크다운 파일은 저장소 안에 그냥 텍스트로 존재하고, 버전 관리가 되고, 어떤 편집기로든 열립니다.

frontmatter로 메타데이터만 얹어주면 충분합니다.

```yaml
---
title: 블로그를 시작하며
summary: 한 줄 요약
publishedAt: 2026-08-01
updatedAt: 2026-08-03
---
```

## 파싱 파이프라인

`gray-matter`로 frontmatter를 떼어내고, 본문은 remark/rehype 파이프라인에 태웁니다. 여기서 첫 번째 함정을 만났습니다.

`react-markdown`의 기본 `Markdown` 컴포넌트는 unified 파이프라인을 **동기로** 실행합니다. 그런데 코드 하이라이팅에 쓰는 `rehype-pretty-code`는 Shiki 하이라이터를 `await`하는 비동기 플러그인입니다. 그대로 조합하면 이런 에러가 납니다.

```text
Error: `runSync` finished async. Use `run` instead
```

해결책은 v10이 제공하는 `MarkdownAsync`입니다. 서버 전용 async 컴포넌트라서 비동기 플러그인과 컴포넌트 매핑을 둘 다 지원합니다.

```tsx title="components/markdown/markdown.tsx"
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

두 번째 함정은 더 조용했습니다. `gray-matter`는 YAML을 js-yaml로 파싱하는데, 따옴표 없는 `2026-08-01`을 **문자열이 아니라 JS `Date` 객체로** 만들어 버립니다.

그래서 읽어들이는 지점에서 한 번 정규화해 줍니다.

```ts
function toDateString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  // ...
}
```

포맷팅할 때는 로케일과 타임존을 명시적으로 고정했습니다. 그러면 빌드 머신 설정과 무관하게 결과가 결정적이라, 서버와 클라이언트의 렌더 결과가 어긋날 일이 없습니다.

| 항목 | 선택 | 이유 |
| --- | --- | --- |
| 콘텐츠 | 저장소 내 `.md` | 버전 관리, 마찰 없음 |
| 하이라이팅 | Shiki (빌드 타임) | 클라이언트 JS 0바이트 |
| 배포 | GitHub Pages | 정적이면 충분함 |

## 정적 export

배포처가 GitHub Pages라 `output: 'export'`로 빌드합니다. 서버가 없으니 모든 라우트는 빌드 타임에 만들어져야 하고, 이미지 최적화 API나 ISR 같은 건 쓸 수 없습니다.

블로그에는 아무 문제가 되지 않는 제약입니다. 오히려 CDN에 올라간 HTML 파일 몇 개가 전부라는 게 마음에 듭니다.

> 가장 좋은 인프라는 없는 인프라다.

## 남은 것들

태그, 페이지네이션, RSS, 목차는 아직 없습니다. 필요해지면 그때 붙이면 됩니다. 지금은 글을 쓰는 게 먼저입니다.
