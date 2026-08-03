---
title: 마크다운 본문을 반응형으로 만들기
summary: 코드 블록, 테이블, 이미지 — 마크다운이 만들어내는 요소들이 좁은 화면을 밀어내지 않게 하는 방법.
publishedAt: 2026-07-20
---

반응형 레이아웃에서 가장 자주 깨지는 건 우리가 직접 작성한 마크업이 아니라, **마크다운이 만들어낸 요소들**입니다. 긴 코드 한 줄, 컬럼이 많은 테이블, 원본 크기가 큰 이미지가 대표적입니다.

![세 가지 기준 화면 너비 — 375px, 768px, 1280px](/images/breakpoints.svg)

## 원칙: 페이지는 넘치지 않고, 내용물이 스크롤한다

가로 스크롤이 `<body>`에 생기면 페이지 전체가 흔들립니다. 넘치는 요소는 **자기 자신 안에서** 스크롤해야 합니다.

### 코드 블록

`pre`에 `overflow-x: auto`를 주는 것으로 끝납니다. 줄바꿈(`white-space: pre-wrap`)은 코드에서는 오히려 읽기 어려워지므로 쓰지 않았습니다.

```css
.prose pre {
  overflow-x: auto;
  font-size: 0.8125rem;
}

@media (min-width: 768px) {
  .prose pre {
    font-size: 0.875rem;
  }
}
```

정말 긴 줄이 어떻게 처리되는지 확인해 봅니다.

```ts
export const aVeryLongLineThatDefinitelyDoesNotFitOnAPhoneScreen = createSomething({ withOption: true, andAnother: "value", yetAnother: 42, keepGoing: "still going" });
```

### 테이블

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

| 요소 | 문제 | 처리 |
| --- | --- | --- |
| `pre` | 긴 줄이 페이지를 넓힘 | `overflow-x: auto` |
| `table` | 컬럼이 많으면 넘침 | 스크롤 래퍼로 감싸기 |
| `img` | 원본 크기 그대로 | `width: 100%; height: auto` |
| 긴 URL | 단어가 안 쪼개짐 | `overflow-wrap: break-word` |

### 이미지

`width: 100%; height: auto`로 담아내되, **원본 비율을 미리 알려주는 것**이 중요합니다. 그러지 않으면 이미지가 로드되는 순간 아래 내용이 밀려 내려갑니다.

정적 export에서는 Next의 이미지 최적화를 쓸 수 없어서, 빌드 타임에 `public/` 안의 파일에서 크기를 직접 읽어 `width`/`height` 속성에 넣었습니다.

```tsx
const { width, height } = imageSize(fs.readFileSync(file));
```

이제 브라우저가 공간을 미리 잡아두므로 레이아웃 시프트가 없습니다.

## 타이포그래피

본문 폭은 넓다고 좋은 게 아닙니다. 한 줄에 들어가는 글자 수가 너무 많으면 눈이 다음 줄을 찾기 어려워집니다. `max-w-3xl` 정도에서 멈추고, 글자 크기만 화면에 따라 조금 키웁니다.

```html
<div class="prose prose-neutral max-w-none md:prose-lg">
```

마지막으로 터치 타깃입니다. 링크와 버튼은 최소 44px을 확보해야 손가락으로 정확히 누를 수 있습니다. 데스크톱에서는 눈에 띄지 않지만 모바일에서는 체감 차이가 큽니다.
