---
title: window.open returns null in safari
summary: window.open이 왜 null을 return 할까요?
publishedAt: 2024-07-31
---

## TL;DR

window.open() method에 대해 크로스 브라우징을 점검하다 모바일 Safari 환경에서 새 탭이 열리지 않는 이슈를 확인했습니다. 발생 원인과 해결한 경험을 공유드리겠습니다.

## 증상

![버튼 클릭 → 백엔드에서 url 응답 → window.open(url), 그런데 아무 일도 일어나지 않는다](/images/window-open-returns-null-in-safari/flow.png)

```ts
const openLink = (url: string) => {
  if (typeof window === 'undefined') return;

  window.open(url, '_blank');
};
```

구현한 flow와 코드는 위와 같이 되어있으며, 버튼 클릭 후 POST Request의 응답으로 백엔드에서 window.open의 인자로 들어가는 url을 받아오고 있었습니다. 문제는 모바일 Safari에서 버튼을 클릭하면 어떠한 동작도 일어나지 않으며, Return value인 WindowProxy가 아닌 null을 return하는 증상이 확인되었습니다.

## 원인

![Safari 설정의 Block Pop-ups 항목이 켜져 있는 화면](/images/window-open-returns-null-in-safari/cause.jpg)

원인은 Safari 앱의 Block Pop-ups 설정이 Enabled 되어있어 발생한 이슈였습니다. 하지만 해당 설정이 Enabled 되어있다고 해도 똑같이 openLink를 호출했을 때 동작이 될때도 있고 아닌 때도 있어서 정확한 원인을 짚어내기가 어려웠습니다. 그러다 구글링을 통해 어떤 게시글에서 답을 얻을 수 있었습니다.

> Even if you make a direct interaction like clicking a button, timers or any asynchronous callback will be treated as not a direct interaction and the pop-up window will be blocked.
>
> 사용자 interaction이 발생한 후 비동기 콜백등을 다루는 경우 직접적인 interaction으로 간주하지 않아 pop-up window를 차단한다.

저의 경우 flow와 같이 버튼 클릭 후 window.open에서 사용되는 url을 백엔드에서 받아오게끔 되어있었습니다. API는 비즈니스 로직으로 인해 API 호출 내부에서도 다른 API를 호출하게끔 구현되어 있어 평균 응답속도가 2000ms ~ 4000ms로 느린 편이었습니다.

이와같이 비동기 콜백을 다루다 보니 차단이 되었던 것이고 문제가 없던 부분은 비동기 콜백을 다루지 않았던 부분으로 확인했습니다.

## Conclusion

```ts
const popup = window.open('', '_blank');

if (!popup) return;

const data = await getURL();

if (data.url) popup.location.href = data.url;
else popup.close();
```

결론으로는 일반적인 상황에서는 openLink를 그대로 사용하되 비동기적인 코드를 다루는 부분에서는 위와 같이 사용자 interaction(e.g. click)이 발생했을 때 `window.open('', '_blank')`를 실행시켜 응답값인 WindowProxy를 변수에 담아두었다가 백엔드에서 url을 받아온 뒤 주입해주는 방식으로 변경했습니다.

이제는 Block Pop-ups가 Enabled 되어 있어도 잘 동작되는 것을 확인할 수 있었습니다.

## References

- [window.open returns null in Safari and Firefox after allowing pop-up on the browser](https://ffan0811.medium.com/window-open-returns-null-in-safari-and-firefox-after-allowing-pop-up-on-the-browser-4e4e45e7d926)
- [Window: open() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
