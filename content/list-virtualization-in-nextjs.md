---
title: Next.js에서의 목록 가상화
summary: Next.js에서 react-virtuoso 패키지를 사용한 목록 가상화 작업 내용을 공유합니다.
publishedAt: 2024-10-18
---

## TL;DR

무한 스크롤을 통해 아이템이 계속 추가되면서 DOM 노드가 많아져 iOS 웹뷰에서 백화현상이 발생했습니다. 화면에 보여지는 부분만 렌더링하는 기술인 virtualization(windowing)을 통해 해결한 사례를 공유합니다.

## 패키지 선택

![react-virtual, react-virtualized, react-virtuoso, react-window의 다운로드 추이와 stars · 갱신일 · install size 비교](/images/list-virtualization-in-nextjs/package-comparison.png)

[패키지 비교 링크](https://npmtrends.com/@tanstack/react-virtual-vs-react-virtualized-vs-react-virtuoso-vs-react-window)

여러가지 조건으로 두고봤을 때

1. 업데이트가 지속적으로 이뤄진다.
2. 현재 표현되어있는 반응형과 관련해서 자동으로 지원해주는 부분이 있다.
3. 패키지 사이즈가 작다. **(253KB)**
4. 신뢰할만한 기업에서 해당 패키지를 유사한 UI에서 적용한 사례가 있다.

위와 같은 이유로 react-virtuoso를 선택했습니다.

## 마크업 개선사항

가상화 작업을 진행하기 전에 현재 UI의 html 구조 및 css 수정이 필요했습니다.
flex의 wrap과 basis/grow/shrink를 적절히 사용하여 구현이 되어있던 기존 UI를 이것을 Virtualization 패키지가 Row에 대한 값을 산출할 수 있게 변경해야 했습니다. useWindowSize 커스텀 훅을 활용하여 현재 뷰포트 크기를 감지하고, 백엔드로부터 받은 아이템들을 이에 맞춰 재배치하는 코드를 구현했습니다.

![flex-wrap으로 흘려보내던 article들을 row 단위 div로 묶는 구조 변경](/images/list-virtualization-in-nextjs/markup-refactoring.jpg)

| 뷰포트 | 1 row 당 아이템 |
| --- | --- |
| 360px 이상 | 1 item |
| 768px 이상 | 2 item |
| 1440px 이상 | 3 item |

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

## Virtuoso 적용 이후

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

1. 아이템의 높이를 자동으로 계산해주다보니 각 아이템(Row)의 높이에 대한 부분을 개발자가 추정하는 코드가 필요없어 상당히 편리했습니다. 덧붙여 반응형도 지원이 되었습니다.
2. endReached라는 props를 사용하여 기존에 IntersectionObserver API를 사용하여 data fetching을 하던 코드를 제거하여 컴포넌트 가독성이 좋아졌습니다.
3. useWindowScroll props가 제공됩니다. true로 설정하면 document 스크롤을 사용할 수 있어 UI 관련 고민을 덜 수 있어 좋았습니다.
4. components props의 Footer에 컴포넌트를 주입해 로딩 상태의 컴포넌트를 표현하는 코드가 더 간결해졌습니다.

![스크롤에 따라 DOM 노드가 교체되는 모습](/images/list-virtualization-in-nextjs/list-dom.gif)

## 스크롤 복원 문제점

목록의 아이템을 클릭하면 Next.js `<Link />` 컴포넌트의 기본 동작으로 스크롤이 유지되는데, 가상화를 적용한 뒤로는 아이템을 클릭하여 상세페이지로 이동한 뒤 브라우저의 뒤로가기 버튼 또는 UI의 백버튼을 사용하여 다시 목록으로 돌아왔을 때 스크롤이 유지되지 않는 문제가 발생했습니다. [목록 가상화의 마법 "우리 DOM이 달라졌어요"](https://techblog.pet-friends.co.kr/%EB%AA%A9%EB%A1%9D-%EA%B0%80%EC%83%81%ED%99%94%EC%9D%98-%EB%A7%88%EB%B2%95-%EC%9A%B0%EB%A6%AC-dom%EC%9D%B4-%EB%8B%AC%EB%9D%BC%EC%A1%8C%EC%96%B4%EC%9A%94-f8d0bca4681a) 펫프렌즈 기술블로그의 도움을 받아 해결할 수 있었습니다.

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

## 개선사항

> ❗️ 마크업 개선사항을 거치면서 article에서 div로 태그 변경되었습니다.

### 최초 화면

**AS-IS**

![개선 전 최초 화면 — 힙 스냅샷의 article 노드 15개, retained 11,784](/images/list-virtualization-in-nextjs/first-screen-as-is.png)

**TO-BE**

![개선 후 최초 화면 — HTMLDivElement 9개, retained 588](/images/list-virtualization-in-nextjs/first-screen-to-be.png)

### 무한 스크롤 이후 화면

**AS-IS**

![개선 전 무한 스크롤 이후 — article 노드 72개, retained 56,700](/images/list-virtualization-in-nextjs/infinite-scroll-as-is.png)

**TO-BE**

![개선 후 무한 스크롤 이후 — 여전히 HTMLDivElement 9개, retained 588](/images/list-virtualization-in-nextjs/infinite-scroll-to-be.png)

Chrome Task Manager에서 확인했을 때 메모리 사용량이 확실히 개선전보다 적은것을 확인할 수 있습니다.

| 항목 | AS-IS | TO-BE |
| --- | --- | --- |
| Memory | 144MB | **101MB** |
| JS Memory | 26,352K | **18,896K** |

![Chrome Task Manager의 개선 전후 메모리 사용량 — 144MB에서 101MB로](/images/list-virtualization-in-nextjs/memory.png)

## Conclusion

처음에는 복잡할 것으로 예상했던 작업이었으나, 가상화 패키지의 활용과 기본 원리에 대한 이해를 통해 예상보다 순조롭게 구현할 수 있었습니다.
또한 개선 과정에서 뷰포트 크기에 따른 row당 아이템 수를 계산하는 명령형 코드가 추가되었지만, 오히려 컴포넌트의 선언부가 더욱 간결해져 전반적인 개발 경험이 향상되었습니다.
비록 iOS 웹뷰 환경의 백화현상을 완전히 해결하지는 못했으나, 메모리 사용량 감소를 통한 성능 개선이라는 의미 있는 성과를 달성했습니다.

## References

- [List Virtualization](https://www.patterns.dev/vanilla/virtual-lists)
- [VirtualizedList(무한스크롤 리스트) 리팩토링 개발 이야기 - 오늘의집 블로그](https://www.bucketplace.com/post/2024-09-11-virtualizedlist-%EB%AC%B4%ED%95%9C%EC%8A%A4%ED%81%AC%EB%A1%A4-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EB%A6%AC%ED%8C%A9%ED%86%A0%EB%A7%81-%EA%B0%9C%EB%B0%9C-%EC%9D%B4%EC%95%BC%EA%B8%B0/)
- [Getting Started with React Virtuoso | React Virtuoso](https://virtuoso.dev/)
- [목록 가상화의 마법 "우리 DOM이 달라졌어요"](https://techblog.pet-friends.co.kr/%EB%AA%A9%EB%A1%9D-%EA%B0%80%EC%83%81%ED%99%94%EC%9D%98-%EB%A7%88%EB%B2%95-%EC%9A%B0%EB%A6%AC-dom%EC%9D%B4-%EB%8B%AC%EB%9D%BC%EC%A1%8C%EC%96%B4%EC%9A%94-f8d0bca4681a)
