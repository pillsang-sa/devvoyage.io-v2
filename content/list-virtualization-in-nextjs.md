---
title: Next.js에서의 목록 가상화
summary: 무한 스크롤로 DOM이 계속 불어나 iOS 웹뷰가 백화됐습니다. react-virtuoso로 화면에 보이는 만큼만 남기니 노드 72개가 9개로, 메모리는 144MB에서 101MB로 줄었습니다.
publishedAt: 2024-10-18
---

무한 스크롤로 아이템이 계속 쌓이면서 DOM 노드가 불어났고, iOS 웹뷰에서 화면이 하얗게 뜨는 백화현상이 발생했습니다. 화면에 보이는 부분만 렌더링하는 virtualization(windowing)으로 접근했습니다.

## 패키지 고르기

![react-virtual, react-virtualized, react-virtuoso, react-window의 다운로드 추이와 stars · 갱신일 · install size 비교](/images/list-virtualization-in-nextjs/package-comparison.png)

다운로드 수만 보면 [react-virtuoso](https://virtuoso.dev/)는 넷 중 가장 아래입니다. 그럼에도 고른 기준은 네 가지였습니다. 업데이트가 꾸준하고, 반응형을 자동으로 다뤄주고, install size가 253kB로 작고, 비슷한 UI에 적용한 회사 사례가 있었습니다.

특히 두 번째가 결정적이었습니다. 가상화 라이브러리는 각 행의 높이를 알아야 스크롤 위치를 계산할 수 있는데, 대부분은 그 높이를 개발자가 추정해서 넘겨줘야 합니다. react-virtuoso는 이걸 알아서 측정합니다.

## 먼저 마크업부터

가상화를 붙이기 전에 HTML 구조를 손봐야 했습니다. 기존 UI는 flex의 `wrap`과 `basis`/`grow`/`shrink`로 아이템을 흘려보내는 방식이라, **"행"이라는 단위가 DOM에 존재하지 않았습니다.** 가상화 라이브러리는 행 단위로 렌더링 여부를 판단하므로 이 상태로는 계산할 대상이 없습니다.

![flex-wrap으로 흘려보내던 article들을 row 단위 div로 묶는 구조 변경](/images/list-virtualization-in-nextjs/markup-refactoring.jpg)

그래서 뷰포트 너비를 읽어 아이템을 직접 행으로 묶어 넘기기로 했습니다.

| 뷰포트 | 한 행에 들어가는 아이템 |
| --- | --- |
| 360px 이상 | 1개 |
| 768px 이상 | 2개 |
| 1440px 이상 | 3개 |

```ts
const getItemPerRow = () => {
  if (width >= 1440) return 3;
  if (width >= 768) return 2;
  return 1;
};

const rearrangeRows = (items: any[], itemsPerRow: 1 | 2 | 3) => {
  return items.reduce((rows, item, index) => {
    if (index % itemsPerRow === 0) rows.push([]);
    rows[rows.length - 1].push(item);
    return rows;
  }, []);
};

const rows = rearrangeRows(flatData, getItemPerRow());
```

`width`는 `useWindowSize` 커스텀 훅에서 가져옵니다. 명령형 코드가 하나 늘었지만, 대신 컴포넌트 선언부가 훨씬 단순해졌습니다.

## Virtuoso 붙이기

```tsx
<Virtuoso
  useWindowScroll
  endReached={onFetch}
  data={rows}
  itemContent={(index, row) => {
    return (
      <div key={index}>
        {row.map((item: any) => {
          return (
            <Item {...item} />
          );
        })}
      </div>
    );
  }}
  components={{
    Footer: () => {
      return (
        isLoading || isFetching ? <div>...loading</div> : <></>
      )
    },
  }}
/>
```

붙이고 나서 오히려 코드가 줄었습니다.

`endReached` 덕분에 `IntersectionObserver`로 바닥 감지를 하던 코드를 통째로 지웠습니다. `useWindowScroll`을 켜면 별도 스크롤 컨테이너 없이 document 스크롤을 그대로 쓰므로 레이아웃 고민도 사라집니다. 로딩 스피너는 `components.Footer`에 넘기면 됩니다. 행 높이를 추정하는 코드는 애초에 필요 없었습니다.

실제로 만들어지는 DOM을 열어보면 이 라이브러리가 무슨 일을 하는지 한눈에 보입니다.

```html
<div data-virtuoso-scroller="true">
  <div data-viewport-type="window">
    <div style="padding-top: 0px; padding-bottom: 768px">
      <div data-index="0" data-known-size="96">…</div>
      <div data-index="1" data-known-size="96">…</div>
      <!-- data-index="6" 까지, 화면에 걸치는 만큼만 -->
    </div>
  </div>
</div>
```

`data-known-size="96"`은 Virtuoso가 **직접 측정한** 행 높이입니다. 그리고 아직 렌더하지 않은 아래쪽 아이템들의 자리는 `padding-bottom: 768px`이 대신 차지합니다. 스크롤을 내리면 `data-index` 범위가 밀려 올라가면서 위아래 padding이 서로 값을 주고받습니다. 스크롤바 길이가 전체 목록 기준으로 유지되는 것도 이 여백 덕분입니다.

## 스크롤이 돌아오지 않는다

문제는 여기서 시작됐습니다. 목록에서 아이템을 눌러 상세로 들어갔다가 뒤로 가면, 원래는 Next.js `<Link />`가 스크롤 위치를 유지해 줍니다. 그런데 가상화를 붙인 뒤로는 목록 맨 위로 돌아왔습니다.

당연한 결과입니다. 가상화된 목록은 돌아온 시점에 **DOM에 첫 화면 몇 개밖에 없습니다.** 브라우저가 복원하려는 스크롤 위치에 해당하는 요소가 아직 존재하지 않으니 복원할 대상이 없는 겁니다.

해결은 픽셀 대신 **인덱스를 기억하는 것**입니다. 떠날 때 보고 있던 아이템의 인덱스를 `sessionStorage`에 넣어두고, 돌아와서 데이터가 준비되면 Virtuoso에게 그 인덱스로 스크롤하라고 시킵니다. [펫프렌즈 기술블로그의 글](https://techblog.pet-friends.co.kr/%EB%AA%A9%EB%A1%9D-%EA%B0%80%EC%83%81%ED%99%94%EC%9D%98-%EB%A7%88%EB%B2%95-%EC%9A%B0%EB%A6%AC-dom%EC%9D%B4-%EB%8B%AC%EB%9D%BC%EC%A1%8C%EC%96%B4%EC%9A%94-f8d0bca4681a)에서 도움을 받았습니다.

```ts
'use client';

import type { LocationOptions, VirtuosoHandle } from 'react-virtuoso';
import type { MutableRefObject } from 'react';
import { usePathname } from 'next/navigation.js';
import { useEffect, useMemo } from 'react';

const useScrollRestorationWithVirtuoso = (
  virtuosoRef?: MutableRefObject<VirtuosoHandle | null>,
  isProcessing?: boolean,
  sleep: number = 100,
  customScrollOptions?: LocationOptions,
) => {
  const pathname = usePathname();
  const scrollIndexKey = useMemo(() => `scrollIndex-${pathname}`, [pathname]);

  useEffect(() => {
    const startIndex =
      parseInt(sessionStorage.getItem(scrollIndexKey) ?? '', 10) ?? null;

    if (!isProcessing && startIndex && virtuosoRef?.current) {
      setTimeout(() => {
        virtuosoRef?.current?.scrollToIndex({
          align: 'center',
          behavior: 'smooth',
          index: startIndex,
          ...customScrollOptions,
        });
        sessionStorage.removeItem(scrollIndexKey);
      }, sleep);
    } else sessionStorage.removeItem(scrollIndexKey);
  }, [isProcessing, sleep, customScrollOptions, virtuosoRef, scrollIndexKey]);

  return { scrollIndexKey };
};

export default useScrollRestorationWithVirtuoso;
```

`isProcessing`으로 데이터 로딩이 끝날 때까지 기다리고, `setTimeout`으로 렌더 한 틱을 더 양보합니다. 키에 `pathname`을 섞어 두면 목록 페이지가 여러 개여도 서로 간섭하지 않습니다.

## 얼마나 줄었나

힙 스냅샷에서 목록 노드를 세어봤습니다. 마크업을 손대면서 `article`이 `div`로 바뀌었으니 태그 이름은 다릅니다.

| | 개선 전 | 개선 후 |
| --- | --- | --- |
| 최초 화면 | 노드 15개 | 노드 9개 |
| 무한 스크롤 이후 | 노드 72개 | **노드 9개** |
| retained size | 56,700 | 588 |

숫자보다 중요한 건 오른쪽 열이 **변하지 않는다**는 점입니다. 개선 전에는 스크롤할수록 노드가 계속 쌓였지만, 이제는 얼마나 스크롤하든 9개로 고정입니다. Chrome 작업 관리자에서 본 메모리도 144MB에서 101MB로, JS 메모리는 26,352K에서 18,896K로 내려갔습니다.

복잡할 줄 알았는데 생각보다 순조로웠습니다. 다만 iOS 웹뷰의 백화현상 자체를 완전히 없애지는 못했습니다. 메모리 사용량을 줄인 만큼 여유는 생겼지만, 근본 원인은 다른 곳에 있을지도 모르겠습니다.

- [List Virtualization](https://www.patterns.dev/vanilla/virtual-lists)
- [VirtualizedList(무한스크롤 리스트) 리팩토링 개발 이야기 — 오늘의집](https://www.bucketplace.com/post/2024-09-11-virtualizedlist-%EB%AC%B4%ED%95%9C%EC%8A%A4%ED%81%AC%EB%A1%A4-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EB%A6%AC%ED%8C%A9%ED%86%A0%EB%A7%81-%EA%B0%9C%EB%B0%9C-%EC%9D%B4%EC%95%BC%EA%B8%B0/)
- [목록 가상화의 마법 "우리 DOM이 달라졌어요" — 펫프렌즈](https://techblog.pet-friends.co.kr/%EB%AA%A9%EB%A1%9D-%EA%B0%80%EC%83%81%ED%99%94%EC%9D%98-%EB%A7%88%EB%B2%95-%EC%9A%B0%EB%A6%AC-dom%EC%9D%B4-%EB%8B%AC%EB%9D%BC%EC%A1%8C%EC%96%B4%EC%9A%94-f8d0bca4681a)
