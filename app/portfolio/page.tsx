import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { RequestFlow, type FlowLane } from "@/components/portfolio/request-flow";
import { SkillBadges } from "@/components/skill-badges";
import { portfolioSchema } from "@/lib/schema";
import {
  OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SKILLS,
  absoluteUrl,
  alternatesFor,
} from "@/lib/site";

const PORTFOLIO_DESCRIPTION = "그동안 만들어온 작업들입니다.";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: PORTFOLIO_DESCRIPTION,
  alternates: alternatesFor("/portfolio"),
  openGraph: {
    type: "profile",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: absoluteUrl("/portfolio"),
    title: `포트폴리오 · ${SITE_NAME}`,
    description: PORTFOLIO_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

/* One problem worked through end to end. Every case keeps the same order —
   title, figure, problem, solution, result — so that from the second case on
   the reader already knows where each part sits. The resume lists the rest
   of the work; this page only carries what needs the detail. */
type CaseStudy = {
  title: string;
  project: string;
  meta: string;
  url?: string;
  figure: { lanes: FlowLane[]; caption: string };
  problem: string;
  solution: string[];
  results: string[];
  /* What is still unsolved. Left out where there is nothing verified to say. */
  openIssue?: string;
};

const cases: CaseStudy[] = [
  {
    title: "한 서비스가 다섯 앱으로 늘어나는 동안 공유할 것과 갈라둘 것을 정한 경험",
    project: "리워드롭",
    meta: "아이브코리아 · 2025.01 ~ 2026.11 · 오퍼월 · 고객센터 · 이벤트 · 멀티미션 · 매체사 콘솔 모노레포",
    figure: {
      lanes: [
        {
          label: "함께 올린다",
          steps: [
            { label: "앱 5개" },
            {
              label: "pnpm catalog",
              note: "Next.js · Sentry 버전 고정",
              key: true,
            },
            { label: "업그레이드를 한 번에" },
          ],
        },
        {
          label: "필요한 앱만 공유한다",
          steps: [
            { label: "shared", note: "매체사 콘솔을 뺀 4개 앱" },
            {
              label: "ui-v1",
              note: "오퍼월 · 고객센터 전용",
              key: true,
            },
            { label: "이벤트 · 멀티미션은 자체 토큰" },
          ],
        },
        {
          label: "일부러 복사한다",
          steps: [
            { label: "모달 · 에러 · 점검 화면" },
            {
              label: "앱마다 한 벌씩",
              note: "UI가 갈라질 여지를 남김",
              key: true,
            },
            { label: "매체사 콘솔도 앱 전용으로 이관" },
          ],
        },
      ],
      caption:
        "코드가 비슷한지가 아니라, 함께 바뀌어야 하는지를 기준으로 공유 범위를 나눴습니다.",
    },
    problem:
      "오퍼월과 고객센터로 시작한 서비스가 이벤트, 멀티미션, 매체사 콘솔까지 5개 앱으로 늘었습니다. 앱마다 Next.js와 Sentry의 메이저 버전이 갈라졌고, 그렇다고 비슷한 코드를 모두 공용 패키지로 묶으면 한 앱의 UI 변경이 다른 앱까지 흔들 수 있었습니다.",
    solution: [
      "함께 움직여야 하는 프레임워크와 관측 도구는 pnpm catalog로 묶었습니다. Next.js 15와 16, Sentry 9와 10으로 갈려 있던 앱들을 한 버전으로 올리고, 이후 업그레이드는 catalog 한 곳에서 하도록 했습니다.",
      "UI는 반대로 공유 범위를 좁혔습니다. ui-v1은 오퍼월과 고객센터만 쓰게 하고, 이벤트에 남아 있던 overlay 참조 3곳을 끊었습니다. 복사한 overlay는 원본과 구현을 똑같이 유지해, 나중에 diff로 차이를 확인할 수 있게 했습니다.",
      "매체사 콘솔 약 2만 줄을 옮길 때도 세 번째 공용 패키지를 만들지 않았습니다. 기존 UI 패키지는 다른 제품이 계속 쓰고 있어 원본을 남기고, 콘솔이 실제로 쓰는 파일만 앱 안으로 복사했습니다. 이관 diff에는 최적화나 계층 재배치를 섞지 않았습니다.",
    ],
    results: [
      "앱 5개 · 공용 패키지 2개",
      "Next.js 15 → 16 단일 버전으로 통일",
      "매체사 콘솔 약 2만 줄 이관",
    ],
    openIssue:
      "복사를 택한 대가가 남아 있습니다. 오퍼월과 고객센터의 모달 · 에러 · 점검 화면은 같은 코드가 두 벌이라, 한쪽을 고치면 다른 쪽도 사람이 확인해야 합니다.",
  },
  {
    title: "앱 버전을 통제할 수 없는 웹뷰에서 네이티브 브리지의 하위 호환성을 설계한 경험",
    project: "리워드롭",
    meta: "아이브코리아 · 2026.10 · Android/iOS 앱과 웹뷰 사이의 통신 계층",
    figure: {
      lanes: [
        {
          label: "현재 운영",
          steps: [
            { label: "앱이 브리지 버전 전달" },
            { label: "구현이 없는 조합", note: "예: iOS v1", key: true },
            {
              label: "웹 브리지로 대체",
              note: "닫기는 무동작, 참여는 웹뷰에서 링크만 열림",
            },
          ],
        },
        {
          label: "버전 선택",
          steps: [
            { label: "구현이 없는 조합" },
            {
              label: "같은 플랫폼의 하위 버전",
              note: "iOS v1 → iOS v0",
              key: true,
            },
            { label: "폴백 발생을 Sentry에 기록" },
          ],
        },
        {
          label: "기능 확인",
          steps: [
            { label: "호출 전 네이티브 함수 확인" },
            {
              label: "없거나 응답 없음",
              note: "false가 아닌 null(판정 불가)",
              key: true,
            },
            { label: "미설치와 구분해 재시도 안내" },
          ],
        },
      ],
      caption:
        "웹은 배포 즉시 바뀌지만 앱은 사용자가 업데이트해야 바뀌므로, 모르는 버전이 와도 핵심 동작이 살아 있어야 합니다.",
    },
    problem:
      "웹은 배포하는 순간 모두에게 바뀌지만, 앱 SDK는 사용자가 업데이트해야 바뀝니다. 그래서 웹 배포 하나가 Android v0 · v1, iOS v0, 일반 브라우저를 동시에 상대해야 했습니다. 그런데 기존 브리지는 이 차이를 흡수하지 못했습니다. 구현이 없는 버전이 오면 웹 브리지로 떨어져 웹뷰 닫기는 아무 일도 하지 않았고, 참여는 네이티브 대신 웹뷰 안에서 링크만 열었습니다. 메서드는 선택 사항이고 반환형도 구현마다 달라서, '이 버전에는 기능이 없다'와 '앱이 설치되지 않았다'가 같은 false로 처리됐습니다. 이 모든 실패는 에러 없이 일어나 아무도 알아챌 수 없었습니다.",
    solution: [
      "버전 선택 규칙을 정했습니다. 정확한 구현이 있으면 그것을 쓰고, 없으면 같은 플랫폼에서 가장 가까운 하위 버전으로 내려가며, 그래도 없을 때만 웹으로 갑니다. 버전을 보내지 않는 구형 SDK는 0으로 취급합니다. 웹보다 먼저 나온 새 SDK 버전도 같은 규칙으로 처리되고, 폴백이 일어나면 조합마다 한 번씩 Sentry에 남겨 실제로 어떤 버전이 들어오는지 볼 수 있게 했습니다.",
      "계약은 타입으로 고정했습니다. 선택 메서드를 모두 필수로 올리고 반환형을 하나로 맞춘 뒤, satisfies로 플랫폼 · 버전별 구현이 같은 계약을 지키는지 컴파일 시점에 검사합니다. 새 버전을 추가할 때 메서드를 빠뜨리면 빌드에서 걸립니다.",
      "하위 버전으로 내려가면 그 버전의 네이티브 함수가 실제로 있다는 보장이 없습니다. 그래서 구현마다 호출 전에 함수가 있는지 확인하고, 없거나 응답이 오지 않으면 false 대신 null(판정 불가)을 돌려주게 했습니다. 호출부는 null일 때 '미설치'로 판정하지 않고 재시도를 안내하므로, 브리지 문제가 사용자에게 어뷰징 의심 문구로 보이던 경로도 함께 막았습니다.",
    ],
    results: [
      "구현 완료 · 운영 미반영",
      "플랫폼 · 버전별 구현 4개를 한 계약으로 검사",
      "판정 불가를 미설치와 분리 (true · false · null)",
    ],
    openIssue:
      "이 변경은 아직 운영에 반영되지 않았습니다. 앱 안에서만 재현되는 경로라 실기기 검증이 먼저 필요하고, 버전 선택 규칙과 null 분기를 고정하는 브리지 테스트도 아직 없습니다.",
  },
  {
    title: "느린 API 하나가 화면 전체를 붙잡지 않는 스트리밍 구조 설계 경험",
    project: "리워드롭",
    meta: "아이브코리아 · 2024.05 ~ 2026.11 · Android/iOS 앱 안에서 웹뷰로 동작하는 오퍼월 서비스",
    url: "https://ivekorea.notion.site/13471551813f80448fcbf68005063d4a?pvs=74",
    figure: {
      lanes: [
        {
          label: "이전",
          steps: [
            { label: "페이지 본체에서 전부 await" },
            { label: "가장 느린 API까지 셸 대기", key: true },
            { label: "빈 화면" },
          ],
        },
        {
          label: "이후",
          steps: [
            { label: "셸 · 스켈레톤 먼저 전송" },
            {
              label: "섹션별 Suspense 경계",
              note: "경계마다 자기 쿼리만 대기",
              key: true,
            },
            { label: "응답 순서대로 스트리밍" },
          ],
        },
        {
          label: "하이드레이션 뒤",
          steps: [
            { label: "서버에서 받은 값 표시" },
            {
              label: "클라이언트 재요청 없음",
              note: "staleTime 안에서는 다시 받지 않음",
              key: true,
            },
            { label: "홈을 떠날 때 무효화", note: "돌아오면 새로 받음" },
          ],
        },
      ],
      caption:
        "느린 섹션은 자기 자리만 늦게 채우고, 서버에서 받은 값은 브라우저에서 다시 받지 않습니다.",
    },
    problem:
      "페이지 본체에서 데이터를 await하면 셸이 가장 느린 응답까지 막혔습니다. 광고 목록처럼 느린 API가 있는 화면은 처음부터 끝까지 빈 화면이었고, 이미 채워진 데이터가 하이드레이션되면서 섹션별 스켈레톤도 전부 사라졌습니다.",
    solution: [
      "prefetch를 섹션별 Suspense 경계 안으로 내려 경계마다 자기 쿼리만 기다리게 했습니다. loading.tsx는 세그먼트 전체를 fallback 하나로 덮을 뿐이라 기각했고, 공통 데이터를 layout에서 await하는 안은 그룹 안 모든 페이지의 첫 응답에 API 왕복이 하나씩 붙어 기각했습니다.",
      "그 뒤 홈의 쿼리 10개 중 3개가 서버에서 받은 값을 보여준 직후 같은 요청을 다시 보내고 있었습니다. staleTime이 없어 기본값 0이었던 것, 0으로 지정돼 있던 것, refetchOnMount: 'always'가 staleTime을 무시한 것으로 원인이 셋 다 달랐습니다. ‘다시 들어오면 새로 받는다’는 동작은 홈을 떠날 때 무효화하는 방식으로 옮겼습니다.",
    ],
    results: [
      "적용 화면 4개 (홈 · 광고 목록 · 스토어 2종)",
      "홈 진입 시 중복 요청 쿼리 3개 → 0개",
    ],
    openIssue:
      "SSR과 스트리밍은 로컬에서 검증할 수 없습니다. 세션 쿠키를 심어주는 앱이 로컬에는 없어 어떤 페이지도 서버 렌더 결과를 내지 않기 때문에, 스트리밍이 실제로 조각나 도착하는지는 배포 후 실기기에서만 확인합니다.",
  },
  {
    title:
      "견적서 PDF 렌더링을 Web Worker로 분리하고, 쓰고 난 메모리까지 회수한 경험",
    project: "찾아옥외",
    meta: "아이브코리아 · 2023.03 ~ 2024.04 · 지도에서 옥외광고 매체를 찾고 견적을 받는 B2C 중개 플랫폼",
    url: "https://findooh.co.kr",
    figure: {
      lanes: [
        {
          label: "이전",
          steps: [
            { label: "다운로드 클릭" },
            {
              label: "메인 스레드에서 react-pdf 렌더",
              note: "30장 이상이면 메인 스레드 점유",
              key: true,
            },
            { label: "UI 미응답 · 스크립트 중단" },
          ],
        },
        {
          label: "이후",
          steps: [
            { label: "다운로드 클릭" },
            { label: "요청마다 Worker 생성" },
            {
              label: "Worker에서 react-pdf 렌더",
              note: "comlink wrap · expose",
              key: true,
            },
            {
              label: "Blob 전달 후 정리",
              note: "releaseProxy → terminate",
            },
          ],
        },
      ],
      caption:
        "PDF를 만드는 일은 메인 스레드 밖에서 하고, 끝나면 Worker와 데이터를 함께 버립니다.",
    },
    problem:
      "견적서와 매체그룹 목록을 @react-pdf/renderer로 PDF로 만들었는데, 매체마다 네이버 정적 지도(Raster) 이미지가 들어가 매체가 많을수록 페이지가 늘어났습니다. react-pdf 공식 문서는 30장 이상을 렌더하면 메인 스레드를 점유해 UI가 응답하지 않거나 스크립트가 중단될 수 있다고 안내합니다.",
    solution: [
      "렌더링을 Web Worker로 옮기고 comlink로 감쌌습니다. Worker에서는 렌더 함수를 expose하고 메인 스레드에서는 wrap으로 받아, postMessage를 직접 주고받지 않고 함수 하나를 부르듯 씁니다.",
      "Worker는 다운로드할 때마다 만들고, Blob을 받으면 releaseProxy로 프록시 참조를 끊은 뒤 terminate해 렌더러가 쓴 메모리를 Worker째로 돌려받았습니다. PDF용 쿼리는 gcTime을 0으로 두어 다운로드가 끝나면 캐시에서도 바로 지워지게 했습니다.",
      "webpack 5의 new Worker(new URL(...)) 문법을 쓸 때 URL을 변수로 빼면 번들러가 TS 파일을 워커 청크로 바꾸지 못해 브라우저가 .ts 파일을 동영상(MPEG-TS)으로 인식했습니다. new URL을 new Worker 안에 인라인으로 두어 해결했습니다.",
    ],
    results: [
      "PDF 렌더링을 메인 스레드에서 완전히 분리",
      "힙 스냅샷으로 해제 확인: 정리 코드를 빼면 Worker 메모리가 남고, 넣으면 회수됨",
    ],
    openIssue:
      "react-pdf에서 lineHeight를 지정하면 렌더 중 브라우저가 멈춥니다. 라이브러리 저장소에 이슈를 올려 두었습니다.",
  },
];

function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-md font-mono text-xs text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {new URL(href).host}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(새 탭)</span>
    </a>
  );
}

function PartLabel({ children }: { children: string }) {
  return (
    <h3 className="font-mono text-xs font-medium tracking-wider text-muted">
      {children}
    </h3>
  );
}

export default function PortfolioPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd data={portfolioSchema()} />

      <header data-reveal="">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          포트폴리오
        </h1>
        <p className="mt-4 text-base leading-relaxed sm:text-lg">
          프론트엔드에서 출발해 API 개발, DB 계층 설계, 무중단 배포까지 서비스의
          전체 흐름을 직접 다루는 개발자입니다. 네트워크 보안 엔지니어로 일한 2년
          7개월을 바탕으로 인증과 결제처럼 보안이 중요한 구간을 설계합니다.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          이력서에 적은 작업 가운데, 문제를 어떻게 발견하고 무엇을 비교해 골랐는지까지
          보여드릴 수 있는 네 가지를 골랐습니다.
        </p>
        <SkillBadges skills={SKILLS} />
      </header>

      <ol className="mt-16 space-y-20">
        {cases.map((study, index) => (
          <li key={study.title}>
            <article aria-labelledby={`case-${index + 1}`}>
              <div data-reveal="">
                <p className="font-mono text-xs text-muted">
                  <span className="me-2 text-sm text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {study.project}
                </p>
                <h2
                  id={`case-${index + 1}`}
                  className="mt-2 scroll-mt-28 text-lg font-bold leading-snug tracking-tight sm:text-xl"
                >
                  {study.title}
                </h2>
              </div>

              <div
                data-reveal=""
                className="mt-2 border-b-2 border-border-strong pb-3"
              >
                <p className="font-mono text-xs leading-relaxed text-muted">
                  {study.meta}
                </p>
                {study.url ? (
                  <p className="mt-1">
                    <ExternalLink href={study.url} />
                  </p>
                ) : null}
              </div>

              <div data-reveal="" className="mt-6">
                <RequestFlow
                  title={study.title}
                  lanes={study.figure.lanes}
                  caption={study.figure.caption}
                />
              </div>

              <div
                data-reveal=""
                className="mt-8 space-y-6 text-base leading-relaxed text-muted"
              >
                <section>
                  <PartLabel>문제</PartLabel>
                  <p className="mt-2">{study.problem}</p>
                </section>
                <section>
                  <PartLabel>해결</PartLabel>
                  <div className="mt-2 space-y-3">
                    {study.solution.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
                <section>
                  <PartLabel>결과</PartLabel>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {study.results.map((result) => (
                      <li
                        key={result}
                        className="rounded-md border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-foreground"
                      >
                        {result}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {study.openIssue ? (
                <aside
                  data-reveal=""
                  className="mt-8 rounded-xl border border-dashed border-border p-4 sm:p-5"
                >
                  <h3 className="text-sm font-semibold">아직 풀지 못한 것</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {study.openIssue}
                  </p>
                </aside>
              ) : null}
            </article>
          </li>
        ))}
      </ol>

      <nav className="mt-16 border-t border-border pt-8">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg text-sm font-medium text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← 홈으로
        </Link>
      </nav>
    </div>
  );
}
