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
    title: "다섯 개로 늘어난 앱에서, 함께 쓸 것과 나눌 것을 정한 경험",
    project: "리워드롭",
    meta: "아이브코리아 · 2025.01 ~ 2026.11 · 오퍼월 · 고객센터 · 이벤트 · 멀티미션 · 매체사 콘솔, 한 저장소의 앱 5개",
    figure: {
      lanes: [
        {
          label: "함께 맞춘다",
          steps: [
            { label: "앱 5개" },
            {
              label: "버전은 한 곳에서 관리",
              note: "프레임워크 · 에러 수집 도구",
              key: true,
            },
            { label: "업그레이드는 한 번에" },
          ],
        },
        {
          label: "필요한 앱끼리만 나눈다",
          steps: [
            { label: "공용 코드", note: "매체사 콘솔을 뺀 4개 앱" },
            {
              label: "공용 화면 코드",
              note: "오퍼월 · 고객센터만",
              key: true,
            },
            { label: "나머지 앱은 각자의 디자인" },
          ],
        },
        {
          label: "일부러 따로 둔다",
          steps: [
            { label: "모달 · 에러 · 점검 화면" },
            {
              label: "앱마다 한 벌씩",
              note: "앱마다 다르게 바뀔 수 있게",
              key: true,
            },
            { label: "매체사 콘솔도 앱 안으로" },
          ],
        },
      ],
      caption:
        "코드가 비슷한지보다, 앞으로 함께 바뀌어야 하는지를 기준으로 나눴습니다.",
    },
    problem:
      "앱이 다섯 개로 늘면서, 무엇을 함께 쓰고 무엇을 나눌지 정해야 했습니다. 처음에는 오퍼월과 고객센터, 앱 두 개였습니다. 이벤트, 멀티미션, 매체사 콘솔이 차례로 붙었습니다. 그사이 앱마다 쓰는 프레임워크 버전이 서로 달라졌습니다. 그렇다고 비슷한 코드를 전부 하나로 묶을 수도 없었습니다. 한 앱의 화면을 고치면 다른 앱 화면까지 바뀔 수 있었기 때문입니다.",
    solution: [
      "버전처럼 반드시 같이 움직여야 하는 것은 한 곳에 모았습니다. 앱마다 달랐던 프레임워크와 에러 수집 도구의 버전을 하나로 맞췄습니다. 이제 업그레이드할 때는 그 한 곳만 고치면 됩니다.",
      "화면 코드는 반대로 함께 쓰는 범위를 좁혔습니다. 공용 화면 코드는 디자인이 같은 오퍼월과 고객센터만 쓰게 했습니다. 디자인이 다른 이벤트 앱과는 연결을 끊었습니다.",
      "매체사 콘솔 약 2만 줄을 옮길 때도 새 공용 묶음을 만들지 않았습니다. 다른 제품이 아직 원본을 쓰고 있었기 때문입니다. 원본은 두고, 콘솔이 실제로 쓰는 파일만 앱 안으로 가져왔습니다. 옮기는 작업에는 다른 개선을 섞지 않아 리뷰하기 쉽게 했습니다.",
    ],
    results: [
      "앱 5개, 함께 쓰는 코드 묶음은 2개만 유지",
      "모든 앱의 프레임워크 버전을 하나로 통일",
      "매체사 콘솔 약 2만 줄 이관",
    ],
    openIssue:
      "따로 두기로 한 대가도 있습니다. 오퍼월과 고객센터의 모달 · 에러 · 점검 화면은 같은 코드가 두 벌입니다. 한쪽을 고치면 다른 쪽도 사람이 직접 확인해야 합니다.",
  },
  {
    title: "어떤 버전의 앱에서 열려도 동작하도록, 앱과 웹의 연결 구조를 설계한 경험",
    project: "리워드롭",
    meta: "아이브코리아 · 2026.10 ~ 2026.11 · Android/iOS 앱과 앱 속 웹 화면 사이의 연결 구조",
    figure: {
      lanes: [
        {
          label: "이전",
          steps: [
            { label: "앱이 자기 버전을 알려줌" },
            { label: "웹이 모르는 버전", note: "예: iOS v1", key: true },
            { label: "일반 웹 방식으로 처리", note: "닫기 · 참여가 동작하지 않음" },
          ],
        },
        {
          label: "버전 고르기",
          steps: [
            { label: "웹이 모르는 버전" },
            {
              label: "같은 플랫폼의 아래 버전으로",
              note: "iOS v1 → iOS v0",
              key: true,
            },
            { label: "내려간 일을 기록" },
          ],
        },
        {
          label: "기능 확인",
          steps: [
            { label: "쓰기 전에 기능이 있는지 확인" },
            {
              label: "없거나 응답이 없음",
              note: "'확인할 수 없음'으로 따로 표시",
              key: true,
            },
            { label: "'설치 안 됨'과 구분해 다시 시도 안내" },
          ],
        },
      ],
      caption:
        "웹이 모르는 버전이 와도, 닫기와 참여 같은 기본 동작은 살아 있어야 합니다.",
    },
    problem:
      "웹이 모르는 버전의 앱에서 열리면, 핵심 기능이 에러 없이 멈췄습니다. 리워드롭은 매체사 앱 안에 띄운 웹 화면에서 동작합니다. 웹은 배포하는 순간 모두에게 바뀌지만, 앱은 사용자가 업데이트해야 바뀝니다. 그래서 같은 웹 화면이 여러 버전의 앱 안에서 동시에 열립니다. 모르는 버전에서는 닫기 버튼을 눌러도 반응이 없었습니다. 광고 참여는 앱이 아닌 웹 화면 안에서 링크만 열었습니다. 웹은 '앱에 그 기능이 없는 경우'와 '광고 앱을 설치하지 않은 경우'도 구분하지 못했습니다. 이 모든 일이 조용히 일어나서 아무도 알아챌 수 없었습니다.",
    solution: [
      "모르는 버전이 와도, 같은 플랫폼의 가장 가까운 아래 버전으로 동작하게 했습니다. 아는 버전이면 그대로 쓰고, 아래 버전도 없을 때만 일반 웹 방식으로 처리합니다. 웹보다 먼저 나온 새 버전의 앱도 같은 규칙을 따릅니다. 버전이 내려간 일은 기록으로 남겨, 실제로 어떤 버전이 들어오는지 볼 수 있게 했습니다.",
      "모든 버전이 지켜야 할 약속을 하나로 정하고, 빠뜨리면 배포 전에 걸리게 했습니다. 버전에 따라 있어도 되고 없어도 되던 기능을 모두 필수로 바꿨습니다. 돌려주는 값의 모양도 하나로 맞췄습니다. 새 버전을 추가하다 기능 하나를 빠뜨리면 빌드 단계에서 바로 알 수 있습니다.",
      "확인할 수 없는 상황은 '설치 안 됨'과 따로 다루게 했습니다. 아래 버전으로 내려가면, 그 앱에 필요한 기능이 정말 있는지 알 수 없습니다. 그래서 기능을 쓰기 전에 먼저 있는지 확인합니다. 없거나 응답이 오지 않으면 '확인할 수 없음'으로 표시하고 다시 시도하도록 안내합니다. 앱을 설치한 사용자가 어뷰징 의심 문구를 보던 문제도 함께 막았습니다.",
    ],
    results: [
      "모르는 버전의 앱에서도 닫기와 참여가 동작",
      "플랫폼 · 버전별 구현 4개가 같은 약속을 지키는지 빌드에서 검사",
      "'확인할 수 없음'을 '설치 안 됨'과 분리",
    ],
    openIssue:
      "버전 규칙을 지켜줄 자동 테스트가 아직 없습니다. 실제로 어떤 버전의 앱이 들어오는지도 기록이 쌓이는 대로 확인하려 합니다.",
  },
  {
    title: "느린 응답 하나 때문에 화면 전체가 비지 않도록, 준비된 부분부터 보여준 경험",
    project: "리워드롭",
    meta: "아이브코리아 · 2024.05 ~ 2026.11 · Android/iOS 앱 안의 웹 화면으로 동작하는 오퍼월 서비스",
    url: "https://ivekorea.notion.site/13471551813f80448fcbf68005063d4a?pvs=74",
    figure: {
      lanes: [
        {
          label: "이전",
          steps: [
            { label: "모든 데이터를 기다림" },
            { label: "가장 느린 응답까지 대기", key: true },
            { label: "그동안 빈 화면" },
          ],
        },
        {
          label: "이후",
          steps: [
            { label: "화면 뼈대를 먼저 보여줌" },
            {
              label: "영역마다 따로 기다림",
              note: "각자 자기 데이터만",
              key: true,
            },
            { label: "준비된 영역부터 채움" },
          ],
        },
        {
          label: "화면이 뜬 뒤",
          steps: [
            { label: "서버에서 받은 데이터를 그대로 사용" },
            {
              label: "같은 요청을 다시 보내지 않음",
              note: "정해진 시간 동안은 재사용",
              key: true,
            },
            { label: "홈을 떠나면 비움", note: "돌아오면 새로 받음" },
          ],
        },
      ],
      caption:
        "느린 영역은 자기 자리만 늦게 채우고, 서버에서 이미 받은 데이터는 다시 받지 않습니다.",
    },
    problem:
      "가장 느린 응답 하나가 화면 전체를 붙잡고 있었습니다. 오퍼월 화면은 여러 곳에서 데이터를 받아 그립니다. 그런데 모든 데이터를 다 받은 뒤에야 화면을 그리는 구조였습니다. 광고 목록처럼 느린 응답이 있는 화면은 처음부터 끝까지 비어 있었습니다. 영역마다 준비해 둔 로딩 표시도 한 번도 보이지 않았습니다.",
    solution: [
      "화면을 영역으로 나눠, 준비된 영역부터 채워지게 했습니다. 화면 뼈대를 먼저 보내고, 각 영역은 자기 데이터만 기다립니다. 페이지 전체에 로딩 화면 하나를 씌우는 방법은 결국 모두가 함께 기다리게 해서 쓰지 않았습니다. 공통 데이터를 모든 페이지가 공유하는 틀에서 받는 방법도 버렸습니다. 그러면 모든 페이지가 그만큼 늦게 시작합니다.",
      "홈에서 같은 데이터를 두 번 받던 요청 3개를 없앴습니다. 데이터 10개 중 3개는 서버에서 받아 보여준 직후, 브라우저에서 같은 요청을 또 보냈습니다. 세 곳 모두 캐시 설정 문제였지만 원인은 조금씩 달랐습니다. '홈에 다시 들어오면 새로 받는다'는 원래 동작은 홈을 떠날 때 캐시를 비우는 방식으로 지켰습니다.",
    ],
    results: [
      "4개 화면에 적용 (홈 · 광고 목록 · 스토어 2종)",
      "홈에 들어올 때 중복 요청 3개 → 0개",
    ],
    openIssue:
      "이 구조는 로컬에서 검증할 수 없습니다. 로그인 정보를 넣어주는 앱이 로컬에는 없기 때문입니다. 화면이 실제로 나뉘어 도착하는지는 배포 후 실기기에서 확인합니다.",
  },
  {
    title:
      "견적서 PDF를 만드는 동안 화면이 멈추지 않게 하고, 쓴 메모리까지 돌려받은 경험",
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
              label: "화면과 같은 곳에서 PDF 생성",
              note: "30장이 넘으면 화면이 멈출 수 있음",
              key: true,
            },
            { label: "클릭 · 스크롤이 먹통" },
          ],
        },
        {
          label: "이후",
          steps: [
            { label: "다운로드 클릭" },
            { label: "다운로드마다 작업을 새로 시작" },
            {
              label: "백그라운드에서 PDF 생성",
              note: "화면은 계속 동작",
              key: true,
            },
            { label: "파일을 받으면 작업째로 종료" },
          ],
        },
      ],
      caption:
        "PDF는 화면 밖에서 만들고, 다 만들면 작업과 데이터를 함께 버립니다.",
    },
    problem:
      "매체를 많이 고를수록, PDF를 만드는 동안 화면이 멈출 위험이 커졌습니다. 찾아옥외에서는 고른 매체로 견적서를 PDF로 내려받을 수 있습니다. 매체마다 지도 이미지가 들어가서, 매체가 많을수록 PDF도 길어졌습니다. 그런데 PDF는 화면을 그리는 곳과 같은 곳에서 만들어지고 있었습니다. 사용하던 도구의 공식 문서도 30장이 넘으면 화면이 멈출 수 있다고 안내했습니다.",
    solution: [
      "PDF를 만드는 일을 화면과 분리된 백그라운드 작업으로 옮겼습니다. 그동안에도 화면은 멈추지 않습니다. 백그라운드와 주고받는 코드는 함수 하나를 부르듯 쓸 수 있게 감쌌습니다.",
      "다 만든 뒤에는 작업을 통째로 종료해, 쓴 메모리를 돌려받았습니다. 백그라운드 작업은 다운로드할 때마다 새로 시작하고, 파일을 받으면 바로 끝냅니다. PDF용 데이터도 다운로드가 끝나면 남기지 않고 지웁니다.",
      "도중에 브라우저가 작업 파일을 동영상 파일로 착각하는 문제도 풀었습니다. 파일 경로를 변수로 빼 두면 빌드 도구가 그 파일을 알아보지 못한 것이 원인이었습니다. 경로를 그 자리에 바로 적자 정상적으로 동작했습니다.",
    ],
    results: [
      "PDF 생성을 화면과 완전히 분리",
      "정리 코드를 넣고 뺀 메모리 기록을 비교해 해제 확인",
    ],
    openIssue:
      "PDF에 줄 간격을 지정하면 만드는 도중 브라우저가 멈추는 문제가 남아 있습니다. 사용하던 도구의 저장소에 이슈를 올려 두었습니다.",
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
          화면에서 출발해 API와 DB, 배포까지 서비스가 돌아가는 전 과정을 직접
          다루는 개발자입니다. 일할 때 늘 고민하는 질문은 두 가지입니다. 사용자의
          정보가 새어 나가지 않는가, 그리고 어딘가 하나가 고장 나도 서비스는 계속
          돌아가는가. 문제가 생길 때마다 급하게 고치기보다, 처음부터 구조로 답하려고
          합니다.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          이력서에 적은 일 가운데, 어떤 문제를 만났고 어떻게 풀었는지 자세히
          이야기할 수 있는 네 가지를 골랐습니다.
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
