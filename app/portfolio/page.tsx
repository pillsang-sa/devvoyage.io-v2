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

type Metric = {
  value: string;
  label: string;
};

/* One problem worked through end to end. The title names the experience, so
   skimming the titles alone tells the reader what was done; the paragraphs
   carry the problem, the fix and the alternatives that were turned down. */
type Story = {
  title: string;
  paragraphs: string[];
  results: string[];
};

type Brief = {
  title: string;
  detail: string;
};

type FeaturedProject = {
  name: string;
  company: string;
  period: string;
  contribution: string;
  summary: string;
  url?: string;
  flow?: { lanes: FlowLane[]; caption: string };
  stories: Story[];
  briefs: Brief[];
  /* What is still unsolved. Left out where there is nothing verified to say. */
  openIssue?: string;
};

type OtherWork = {
  name: string;
  meta: string;
  url?: string;
  items: string[];
};

const HEADLINE_METRICS: Metric[] = [
  { value: "1주 → 1~2일", label: "신규 서비스 구축 기간" },
  { value: "48회", label: "앱 배포 없이 1년간 웹 릴리스" },
  { value: "7종 / 2주", label: "직접 구현한 백엔드 API" },
];

const featured: FeaturedProject[] = [
  {
    name: "리워드롭",
    company: "아이브코리아",
    period: "2024.05 ~ 2026.11",
    contribution: "기여도 98%",
    summary:
      "Android/iOS 앱 안에서 웹뷰로 동작하는 B2B/B2C 오퍼월 서비스입니다. Next.js(v16)와 Turborepo 모노레포로 4개 앱을 운영합니다.",
    url: "https://ivekorea.notion.site/13471551813f80448fcbf68005063d4a?pvs=74",
    flow: {
      lanes: [
        {
          label: "인증 요청",
          steps: [
            { label: "웹뷰", note: "httpOnly 쿠키만 보유" },
            { label: "proxy.ts", note: "진입 시 토큰 발급·세션 재사용" },
            {
              label: "Route Handler 프록시",
              note: "토큰 부착 · 클라이언트 IP 전달",
              key: true,
            },
            { label: "오퍼월 API", note: "참여를 요청 IP로 기록" },
          ],
        },
        {
          label: "첫 화면",
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
      ],
      caption:
        "브라우저가 백엔드를 직접 부르는 곳은 없습니다. 토큰은 서버에서만 붙습니다.",
    },
    stories: [
      {
        title: "구버전 앱이 남아 있어도 깨지지 않는 네이티브 브릿지 설계 경험",
        paragraphs: [
          "기능을 바꿀 때마다 Android/iOS 앱을 배포해야 했고, 배포한 뒤에도 업데이트하지 않은 구버전 앱이 계속 남았습니다. 웹으로 화면을 옮기더라도 새 기능이 구버전 앱의 네이티브 쪽에서 깨지면 의미가 없었습니다.",
          "화면을 웹뷰 중심으로 옮기고 닫기·광고 참여·앱 설치 확인·네트워크 확인·다이얼로그·푸시 등 8종의 네이티브 메시지를 플랫폼별 브릿지 어댑터로 감쌌습니다. 브릿지 계약을 타입으로 강제하고, 새 메시지를 모르는 구버전 앱에서는 하위 버전 동작으로 폴백하게 했습니다.",
        ],
        results: ["네이티브 메시지 8종", "v1.0.0 이후 1년간 릴리스 48회"],
      },
      {
        title: "느린 API 하나가 화면 전체를 붙잡지 않는 스트리밍 구조 설계 경험",
        paragraphs: [
          "페이지 본체에서 데이터를 await하면 셸이 가장 느린 응답까지 막혔고, 이미 채워진 데이터가 hydrate되면서 섹션별 스켈레톤도 전부 사라졌습니다. 광고 목록처럼 느린 API가 있는 화면은 처음부터 끝까지 빈 화면이었습니다.",
          "prefetch를 섹션별 Suspense 경계 안으로 내려 경계마다 자기 쿼리만 기다리게 했습니다. loading.tsx는 세그먼트 전체를 fallback 하나로 덮을 뿐이라 기각했고, 공통 데이터를 layout에서 await하는 안은 그룹 안 모든 페이지의 첫 응답에 API 왕복이 하나씩 붙어 기각했습니다. 대신 두 경계가 같은 쿼리를 prefetch하는 중복 한 건을 받아들였습니다.",
        ],
        results: ["적용 화면 4개 (홈 · 광고 목록 · 스토어 2종)"],
      },
      {
        title: "토큰과 사용자 IP를 함께 지키는 BFF 프록시 설계 경험",
        paragraphs: [
          "토큰이 브라우저 스크립트에 노출되면 XSS 한 번으로 탈취될 수 있었습니다. 그런데 서버를 경유하게 하면, 요청 IP로 광고 참여를 기록하는 백엔드에 사용자 IP 대신 우리 서버 IP가 남았습니다.",
          "모든 호출이 Route Handler 프록시를 거치게 해 토큰은 서버에서만 붙이고, 참여 API에는 원래 요청의 클라이언트 IP를 따로 실어 보냈습니다.",
        ],
        results: ["브라우저의 백엔드 직접 호출 0곳"],
      },
    ],
    briefs: [
      {
        title: "신규 서비스 구축 1주 → 1~2일",
        detail:
          "Turborepo 모노레포로 4개 앱과 UI 컴포넌트 22종의 디자인 시스템을 포함한 4개 공용 패키지를 분리",
      },
      {
        title: "홈 개편 API 7종을 2주 만에 직접 구현",
        detail:
          "FastAPI 오퍼월 API 서버에 추가하고, API 서버 릴리스 7회를 프론트엔드 릴리스와 맞물려 배포",
      },
      {
        title: "수동 메모이제이션 47건 중 38건(81%) 제거",
        detail:
          "4개 앱에 React Compiler를 적용하고, 컴파일러가 최적화를 포기하는 9건은 컴파일 결과로 확인해 유지",
      },
      {
        title: "휴대폰 본인확인 연동 서버 구축",
        detail:
          "NestJS로 드림시큐리티 본인확인을 연동하고, CommonJS 전용 키 관리 라이브러리를 vm 컨텍스트로 불러와 통합. 거래 ID를 요청·완료 시점에 백엔드로 넘겨 대조하게 하고 발급 후 10분 유효시간을 검증해 인증 결과 재사용 차단",
      },
    ],
    openIssue:
      "SSR과 스트리밍은 로컬에서 검증할 수 없습니다. 세션 쿠키를 심어주는 앱이 로컬에는 없어 어떤 페이지도 서버 렌더 결과를 내지 않기 때문에, 스트리밍이 실제로 조각나 도착하는지는 배포 후 실기기에서만 확인합니다. 또 네이티브 브릿지와 뷰포트가 있어야 요청할 수 있는 광고 영역은 서버에서 미리 채울 수 없어, 응답이 오면 레이아웃이 밀리는 구간이 남아 있습니다.",
  },
  {
    name: "광고 어드민",
    company: "아이브코리아",
    period: "2026.08 ~ 현재",
    contribution: "기여도 100%",
    summary:
      "레거시 PHP CMS의 내부 관리 기능을 대체하는 광고 운영 어드민입니다. Next.js(v16) 서버 컴포넌트와 Server Actions로 API 서버 없이 28개 화면을 만들었습니다.",
    flow: {
      lanes: [
        {
          label: "쓰기",
          steps: [
            { label: "운영자 폼" },
            {
              label: "Server Action 래퍼",
              note: "세션·역할·입력 검증 · Writer 전환",
              key: true,
            },
            { label: "DAL", note: "세션 재확인" },
            {
              label: "Writer 풀",
              note: "쓰기 + 감사 로그 한 트랜잭션 · 5초 상한",
            },
            { label: "재렌더", note: "같은 요청이라 Writer 조회" },
          ],
        },
        {
          label: "읽기",
          steps: [
            { label: "페이지 요청" },
            { label: "proxy.ts", note: "세션 연장만 · DB 조회 없음" },
            { label: "서버 컴포넌트" },
            { label: "DAL", note: "첫 줄에서 세션 확인", key: true },
            { label: "Reader 풀", note: "10초 상한" },
          ],
        },
        {
          label: "같은 DB를 쓰는 시스템",
          steps: [
            { label: "레거시 PHP CMS" },
            { label: "리워드롭 백엔드" },
            { label: "광고 어드민", key: true },
            { label: "Aurora MySQL", note: "기능마다 쓰기 주체 하나" },
          ],
        },
      ],
      caption:
        "미들웨어는 보안 경계가 아니라 세션 연장 장치입니다. 인가는 데이터에 가장 가까운 DAL에서 매번 합니다.",
    },
    stories: [
      {
        title: "세 시스템이 함께 쓰는 운영 DB 위에서 점진 이전한 경험",
        paragraphs: [
          "레거시 PHP CMS, 리워드롭 백엔드, 새 어드민이 같은 Aurora MySQL을 씁니다. CMS의 종료 시점은 정해지지 않았고 리워드롭은 계속 운영되므로, 세 시스템의 공존은 일시적인 상황이 아니라 기본 조건이었습니다.",
          "Drizzle ORM은 스키마를 소유하지 않고 DB에서 가져오기만 하도록 두고, 마이그레이션 스크립트는 아예 만들지 않았습니다. 다른 시스템의 테이블은 변경하지 않고 부족한 것은 새 테이블에 얹었습니다. 공유 테이블에는 낙관적 잠금에 쓸 수정 시각이 없어 기능마다 쓰기 주체를 하나로 정했고, 다른 시스템이 데이터를 바꿔도 무효화할 주체가 없어 서버 캐시 없이 쿼리와 인덱스로만 성능을 확보했습니다.",
        ],
        results: [
          "기존 CMS에서 이전한 화면 16개",
          "리포트 4종 · 대시보드 2종 신규 구축",
        ],
      },
      {
        title: "인증 관문이 없는 App Router에서 인가를 데이터 옆에 둔 경험",
        paragraphs: [
          "App Router에서는 페이지 렌더, RSC payload, Server Action, Route Handler가 각각 독립된 진입점이라 한 곳에서 인증을 검사할 수 없었습니다. 미들웨어에서 DB를 조회하면 링크에 마우스를 올려 prefetch할 때마다 DB 조회가 일어났습니다.",
          "모든 데이터 접근 함수의 첫 줄에서 세션을 검사하고, Server Action은 세션·역할·입력 검증과 Writer 전환을 한 번에 처리하는 래퍼를 반드시 거치게 했습니다. 쿠키에는 신원과 만료만 담고 역할은 매 요청 DB에서 읽어 권한 강등이 바로 반영되게 했고, 세션 테이블이 없어 계정 단위 토큰 버전으로 세션을 무효화했습니다.",
        ],
        results: ["로그인 · 모든 쓰기에 감사 로그"],
      },
      {
        title: "Writer/Reader 분리 뒤 방금 저장한 데이터가 안 보이던 문제를 푼 경험",
        paragraphs: [
          "Writer/Reader 커넥션 풀을 나눴더니 저장 직후의 재렌더가 Server Action 밖에서 돌아 Reader로 떨어졌습니다. 복제가 따라오기 전이라 방금 저장한 내용이 화면에 보이지 않았습니다.",
          "풀 선택을 실행 컨텍스트가 아니라 요청 헤더로 넘겨, 같은 HTTP 요청 안의 재렌더도 Writer를 보게 했습니다. 생성 뒤에는 새 GET 요청이 되는 상세 화면 대신 목록으로 돌아가게 했습니다.",
        ],
        results: ["쿼리 시간 상한 Writer 5초 · Reader 10초"],
      },
    ],
    briefs: [
      {
        title: "컨테이너 2개를 교대하는 무중단 배포",
        detail:
          "멀티스테이지 Docker 빌드와 Bitbucket Pipelines, EC2 롤링 배포. 빌드가 성공해도 런타임 파일 누락으로 서버가 죽을 수 있어 CI에서 실제로 띄워 응답을 받는 단계까지 둠",
      },
    ],
    openIssue:
      "자동 회귀 테스트가 없습니다. 건수와 금액이 계속 바뀌는 공유 DB라 테스트에서 값을 고정할 수 없고, 목으로 대신하면 가장 큰 위험인 다른 시스템의 스키마 변경을 그대로 통과시키기 때문입니다. 그 스키마 변경을 CI에서 잡는 단계도 아직 없어 런타임에서야 드러나고, 리포트 집계가 목록·로그인과 같은 커넥션 풀을 써서 느린 집계가 가벼운 조회를 밀어내는 문제도 남아 있습니다.",
  },
  {
    name: "찾아옥외",
    company: "아이브코리아",
    period: "2023.03 ~ 2024.04",
    contribution: "기여도 45%",
    summary:
      "지도에서 옥외광고 매체를 찾고 견적을 받는 B2C 중개 플랫폼입니다. Next.js(v14)로 만들었습니다.",
    url: "https://findooh.co.kr",
    stories: [
      {
        title: "수만 개 지도 마커의 렌더링 병목을 해소한 경험",
        paragraphs: [
          "Naver Maps에 수만 개의 옥외광고 마커를 한 번에 그리면서 지도를 움직일 때마다 렌더링이 밀렸습니다. 가까운 마커를 묶는 클러스터링을 적용하고, 지도 이동 이벤트에 디바운싱을 걸어 이동이 멈춘 뒤에만 다시 계산하게 했습니다.",
        ],
        results: ["마커 수만 개"],
      },
      {
        title: "흩어진 견적 계산 로직을 단일 스토어로 모은 경험",
        paragraphs: [
          "광고주와 매체사 화면이 각자 견적 계산 로직을 들고 있어, 한쪽을 고치면 다른 쪽과 계산이 어긋날 수 있었습니다. 계산 로직을 Zustand 단일 스토어로 모아 모든 화면이 같은 상태에서 견적을 읽고, 수정도 한 곳에서 끝나게 했습니다.",
        ],
        results: ["견적 계산 지점 1곳"],
      },
      {
        title: "대용량 견적서 PDF 생성을 Web Worker로 옮긴 경험",
        paragraphs: [
          "대용량 견적서 PDF를 만드는 동안 메인 스레드가 점유돼 브라우저가 스크립트 중단 경고를 띄웠습니다. 생성 작업을 Web Worker로 넘겨, PDF를 만드는 동안에도 화면이 멈추지 않게 했습니다.",
        ],
        results: ["스크립트 중단 경고 해소"],
      },
    ],
    briefs: [
      {
        title: "공통 컴포넌트 90여 개와 Storybook 카탈로그 53개",
        detail: "디자이너와 같은 카탈로그를 보며 컴포넌트를 맞추는 협업 구조",
      },
      {
        title: "Sentry 에러 모니터링",
        detail:
          "API 스키마 런타임 검증과 전역 ErrorBoundary를 연동하고 요청·응답·유저 컨텍스트를 함께 수집",
      },
    ],
  },
];

const otherWork: OtherWork[] = [
  {
    name: "회사 브랜드 웹사이트 리뉴얼",
    meta: "아이브코리아 · 2026.06 ~ 2026.08 · 기여도 100%",
    url: "https://ivekorea.com",
    items: [
      "Vercel에서 EC2로 이전하며 구 URL 6개 301 처리와 app-ads.txt(387줄) 승계로 검색 유입·광고 수익 경로 유지",
      "3개 언어·15개 페이지의 라우트 정의에서 JSON-LD와 llms.txt를 생성해 검색엔진·생성형 AI 검색에 대응",
      "역할별 AI 에이전트 5종·스킬 13종으로 구현부터 QA까지의 개발 흐름 구성",
    ],
  },
  {
    name: "투표권 상점",
    meta: "아이브코리아 · 2024.12 ~ 2026.09",
    items: [
      "next-intl로 5개 언어(한국어·영어·일본어·중국어 간체/번체) 라우팅을 구성하고 언어별 배너·이벤트 소재까지 분기",
      "Danal(국내)·Eximbay(해외) 2개 PG의 주문 생성·결제 준비·결제 복귀를 Route Handler로 구성하고, 복귀 시 쿼리 값 대신 주문 ID로 서버에서 결제를 다시 검증",
      "두배 이벤트·응모권 추첨·시상식 이벤트 등 시즌 이벤트와 점검 모드 운영",
    ],
  },
  {
    name: "네트워크 보안 엔지니어 · 보안관제",
    meta: "㈜아이티이지 · 2020.01 ~ 2022.07",
    items: [
      "네트워크·웹 방화벽 등 온프레미스 보안 인프라 구축·운영과 자사 ISMS-P 기술적 취약점 조치",
      "네트워크 어플라이언스 OS API로 웹 대시보드 등 고객용 도구 PoC 개발",
      "Fortinet·Palo Alto·Juniper 방화벽과 PRTG·Zabbix 모니터링 운영",
    ],
  },
];

function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-1 rounded-md font-mono text-xs text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {new URL(href).host}
      <span
        aria-hidden="true"
        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        ↗
      </span>
      <span className="sr-only">(새 탭)</span>
    </a>
  );
}

function MetricStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex flex-col-reverse gap-0.5 bg-background px-4 py-3"
        >
          <dt className="text-xs text-muted">{metric.label}</dt>
          <dd className="font-mono text-lg font-semibold tracking-tight tabular-nums text-foreground">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
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
        <MetricStrip metrics={HEADLINE_METRICS} />
        <SkillBadges skills={SKILLS} />
      </header>

      <div className="mt-16 space-y-20">
        {featured.map((project) => (
          <section
            key={project.name}
            aria-labelledby={`project-${project.name}`}
          >
            <div
              data-reveal=""
              className="border-b-2 border-foreground pb-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2
                  id={`project-${project.name}`}
                  className="text-xl font-bold tracking-tight sm:text-2xl"
                >
                  {project.name}
                </h2>
                <p className="font-mono text-xs text-muted">
                  {project.company} · {project.period} · {project.contribution}
                </p>
              </div>
            </div>

            <div data-reveal="">
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                {project.summary}
              </p>
              {project.url ? (
                <p className="mt-2">
                  <ExternalLink href={project.url} />
                </p>
              ) : null}
            </div>

            {project.flow ? (
              <div data-reveal="" className="mt-8">
                <h3 className="font-mono text-xs font-medium tracking-wider text-muted">
                  요청 흐름
                </h3>
                <RequestFlow
                  title={`${project.name} 요청 흐름`}
                  lanes={project.flow.lanes}
                  caption={project.flow.caption}
                />
              </div>
            ) : null}

            <ol className="mt-10 space-y-10">
              {project.stories.map((story, index) => (
                <li key={story.title} data-reveal="">
                  <article>
                    <h3 className="font-semibold leading-snug tracking-tight sm:text-lg">
                      <span className="mr-2 font-mono text-sm text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {story.title}
                    </h3>
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted sm:text-[15px]">
                      {story.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {story.results.map((result) => (
                        <li
                          key={result}
                          className="rounded-md border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-foreground"
                        >
                          {result}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>

            {project.briefs.length > 0 ? (
              <div data-reveal="" className="mt-10">
                <h3 className="font-mono text-xs font-medium tracking-wider text-muted">
                  그 밖의 작업
                </h3>
                <ul className="mt-3 space-y-3">
                  {project.briefs.map((brief) => (
                    <li
                      key={brief.title}
                      className="border-l-2 border-border pl-4 text-sm leading-relaxed text-muted"
                    >
                      <strong className="font-medium text-foreground">
                        {brief.title}
                      </strong>
                      <span aria-hidden="true"> · </span>
                      {brief.detail}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {project.openIssue ? (
              <aside
                data-reveal=""
                className="mt-10 rounded-lg border border-dashed border-border p-4 sm:p-5"
              >
                <h3 className="text-sm font-semibold">아직 풀지 못한 것</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {project.openIssue}
                </p>
              </aside>
            ) : null}
          </section>
        ))}

        <section aria-labelledby="other-work">
          <div data-reveal="" className="border-b-2 border-foreground pb-3">
            <h2
              id="other-work"
              className="text-xl font-bold tracking-tight sm:text-2xl"
            >
              그 밖의 경력
            </h2>
          </div>
          <div className="mt-6 space-y-10">
            {otherWork.map((work) => (
              <article key={work.name} data-reveal="">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold tracking-tight">{work.name}</h3>
                  <p className="font-mono text-xs text-muted">{work.meta}</p>
                </div>
                {work.url ? (
                  <p className="mt-1">
                    <ExternalLink href={work.url} />
                  </p>
                ) : null}
                <ul className="mt-3 space-y-2">
                  {work.items.map((item) => (
                    <li
                      key={item}
                      className="border-l-2 border-border pl-4 text-sm leading-relaxed text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>

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
