import type { Metadata } from "next";
import Link from "next/link";
import { SkillBadges } from "@/components/skill-badges";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: "그동안 만들어온 작업들입니다.",
};

const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "NestJS",
  "RDBMS",
  "Git",
] as const;

type Highlight = {
  /* Projects lead with a bolded takeaway; plain task lists omit it. */
  title?: string;
  detail: string;
};

type Project = {
  name: string;
  period: string;
  contribution?: string;
  summary?: string;
  url?: string;
  highlights: Highlight[];
};

type Experience = {
  company: string;
  role: string;
  field: string;
  period: string;
  duration: string;
  projects: Project[];
};

const experiences: Experience[] = [
  {
    company: "아이브코리아",
    role: "개발실 · 과장 / 팀원",
    field: "프론트엔드",
    period: "2022.11 ~ 재직중",
    duration: "3년 9개월",
    projects: [
      {
        name: "리워드롭",
        period: "2024.01 ~ 현재",
        contribution: "기여도 98%",
        summary:
          "Next.js(v15), Turborepo 기반의 B2B/B2C 모노레포 오퍼월 서비스",
        url: "https://ivekorea.notion.site/13471551813f80448fcbf68005063d4a?pvs=74",
        highlights: [
          {
            title: "네이티브-웹뷰 하이브리드 아키텍처 구축",
            detail:
              "Android/iOS 크로스 플랫폼 대응을 위해 웹뷰 중심 구조로 전환하여 앱 배포 절차 없는 즉시 배포(Live Update) 체계를 완성하고 운영 유연성을 확보했습니다.",
          },
          {
            title: "모노레포 아키텍처 설계를 통한 개발 생산성 향상",
            detail:
              "Turborepo와 pnpm workspace 기반으로 4개 앱과 디자인 시스템, API 모듈, 유틸을 모듈화하여 신규 서비스 구축 기간을 평균 1주에서 1~2일로 단축했습니다.",
          },
          {
            title: "멀티 플랫폼 대응 네이티브 브릿지 계층 구현",
            detail:
              "Android/iOS/Web 연동을 위해 플랫폼별 브릿지 어댑터 버전 관리 체계를 구축하여 안정적인 양방향 통신 환경을 제공했습니다.",
          },
          {
            title: "BFF 패턴을 활용한 보안 강화",
            detail:
              "Next.js Route Handler 기반 서버 사이드 프록시를 구축해 Access/Refresh 토큰을 서버 세션에서만 관리함으로써 XSS 공격 위험을 근본적으로 차단했습니다.",
          },
          {
            title: "next-intl 기반 글로벌 다국어 라우팅 구축",
            detail:
              "5개국어(한국어, 영어, 일본어, 중국어 간체/번체)를 동적 세그먼트로 관리하고, API 요청 인터셉터를 통해 언어 헤더를 자동 주입했습니다.",
          },
          {
            title: "이중 PG 파이프라인 및 결제 검증 로직 구현",
            detail:
              "Danal(국내)과 Eximbay(해외) 결제를 이원화하고, 인증 세션이 없는 PG 콜백 구간에 위변조 검증 단계를 추가하여 결제 무결성을 확보했습니다.",
          },
          {
            title: "보안 샌드박스 기반의 외부 본인인증 모듈 통합",
            detail:
              "드림시큐리티 키 관리 라이브러리를 Node.js vm 샌드박스 환경에 안전하게 로드하고, NestJS 서버 환경에서 본인인증 결과의 재사용 및 위·변조를 차단했습니다.",
          },
        ],
      },
      {
        name: "회사 브랜드 웹사이트 리뉴얼",
        period: "2026.06 ~ 현재",
        contribution: "기여도 100%",
        summary:
          "Next.js(v16) 기반의 자사 대표 브랜드 웹사이트 리뉴얼(진행 중)",
        url: "https://ivekorea.com",
        highlights: [
          {
            title:
              "역할 기반 AI 에이전트 하네스 구축을 통한 개발 파이프라인 효율화",
            detail:
              "Next.js 빌더, UI 빌더, i18n/SEO 전문가, QA 엔지니어 등 역할별 AI 에이전트와 맞춤 스킬(Skills)을 개발 프로세스에 이식하여, 기능 구현부터 QA까지의 병목을 최소화하는 신규 DX 환경을 구축하고 있습니다.",
          },
          {
            title:
              "검색엔진 및 AI 에이전트 노출 향상을 위한 SEO/GEO 구조화 설계",
            detail:
              "시맨틱 태그 체계화와 Open Graph, JSON-LD 패턴을 선제적으로 설계·적용하여 구글/네이버 및 Generative Engine(AI 검색) 최적화 작업을 진행하고 있습니다.",
          },
          {
            title: "GSAP/Motion.dev 기반 고성능 인터랙션 구현",
            detail:
              "복잡한 모션 구동 시에도 안정적인 60fps를 유지할 수 있도록 GPU 가속과 CSS Transform 최적화 레이아웃을 적용했습니다.",
          },
          {
            title: "초기 로딩 속도 최적화를 위한 이미지 파이프라인 설계",
            detail:
              "Next.js Image Component를 활용한 차세대 포맷(WebP/AVIF) 자동 전환 및 Lazy Loading 전략을 수립하여 LCP 최적화를 추진하고 있습니다.",
          },
          {
            title: "표준 기반 반응형 웹 및 접근성(A11y) 체계 구축",
            detail:
              "Desktop, Tablet, Mobile 반응형 대응과 접근성 가이드라인 준수를 통해 일관된 유저 경험을 설계하고 있습니다.",
          },
        ],
      },
      {
        name: "찾아옥외",
        period: "2022.11 ~ 2024.04",
        contribution: "기여도 45%",
        summary: "Next.js(v14) 기반의 지도 중심 B2C 옥외광고 중개 플랫폼",
        url: "https://findooh.co.kr",
        highlights: [
          {
            title: "디자인 시스템 및 공통 컴포넌트 구축",
            detail:
              "90여 개의 공통 컴포넌트를 설계하고 Storybook 기반 53개 카탈로그를 구축하여, 디자이너와의 협업 효율과 컴포넌트 재사용률을 끌어올렸습니다.",
          },
          {
            title: "대규모 데이터 지도 렌더링 성능 최적화",
            detail:
              "Naver Maps API 사용 시 발생하던 수만 개 마커의 렌더링 병목을, 마커 클러스터링과 디바운싱 알고리즘을 적용해 프레임 드랍 없이 해소했습니다.",
          },
          {
            title: "상태 관리 단일화로 견적 데이터 무결성 확보",
            detail:
              "광고주/매체사별로 파편화된 계산 로직을 Zustand 단일 스토어(SSOT)로 통합하여 견적 관련 런타임 버그 전무(Zero)를 달성했습니다.",
          },
          {
            title: "Sentry 기반 실시간 에러 모니터링 체계 구축",
            detail:
              "API 스키마 런타임 검증과 전역 ErrorBoundary를 연동하고 요청/응답/유저 컨텍스트를 동시에 수집하여 장애 대응 시간을 단축했습니다.",
          },
          {
            title: "Web Worker를 활용한 UI 블로킹 해제",
            detail:
              "대용량 견적서 PDF 생성 시 메인 스레드 점유로 발생하던 스크립트 중단 이슈를 Web Worker 오프로딩으로 전환하여 100% 렌더링 안정성을 확보했습니다.",
          },
        ],
      },
    ],
  },
  {
    company: "㈜아이티이지",
    role: "기술팀 · 사원 / 매니저",
    field: "정보보안",
    period: "2020.01 ~ 2022.07",
    duration: "2년 7개월",
    projects: [
      {
        name: "네트워크 보안 엔지니어",
        period: "2021.01 ~ 2022.07",
        highlights: [
          {
            detail:
              "온프레미스 환경의 보안 인프라(네트워크 방화벽, 웹 방화벽, 네트워크 어플라이언스) 구축 및 운영",
          },
          { detail: "네트워크 보안 컨설팅 및 교육" },
          {
            detail:
              "네트워크 어플라이언스 OS의 API를 사용한 PoC 및 솔루션 개발(웹 대시보드, 고객 편의성 도구)",
          },
          { detail: "자사 ISMS-P 기술적 취약점 조치 및 개선" },
        ],
      },
      {
        name: "보안관제",
        period: "2020.01 ~ 2020.12",
        highlights: [
          { detail: "네트워크 방화벽 운영(Fortinet, Palo Alto, Juniper)" },
          { detail: "웹 방화벽 운영(DeepFinder)" },
          { detail: "네트워크 보안 모니터링(PRTG, Zabbix)" },
        ],
      },
    ],
  },
];

export default function PortfolioPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          포트폴리오
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          그동안 만들어온 작업들입니다.
        </p>
        <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
          모노레포 구조 전환과 주요 서버 연동 프로젝트를 주도하며 안정적이고
          유연한 프로덕트를 만들어 왔습니다. 언어와 프레임워크는 문제를 해결하기
          위한 도구로 바라보며, 기술적 트레이드오프를 고려해 상황에 맞는 최선의
          아키텍처를 선택하려 노력합니다.
        </p>

        <SkillBadges skills={skills} />
      </header>

      <div className="space-y-14">
        {experiences.map((experience) => (
          <section key={experience.company}>
            <div data-reveal="" className="border-b border-border pb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                  {experience.company}
                </h2>
                <p className="font-mono text-xs text-muted">
                  {experience.period} · {experience.duration}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted">
                {experience.role} · {experience.field}
              </p>
            </div>

            <ol className="mt-8 space-y-10">
              {experience.projects.map((project) => (
                <li key={project.name}>
                  <article data-reveal="">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="font-semibold tracking-tight sm:text-lg">
                        {project.name}
                      </h3>
                      <p className="font-mono text-xs text-muted">
                        {project.period}
                        {project.contribution
                          ? ` · ${project.contribution}`
                          : ""}
                      </p>
                    </div>

                    {project.summary ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {project.summary}
                      </p>
                    ) : null}

                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group mt-2 inline-flex items-center gap-1 rounded-md font-mono text-xs text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {new URL(project.url).host}
                        <span
                          aria-hidden="true"
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        >
                          ↗
                        </span>
                      </a>
                    ) : null}

                    <ul className="mt-4 space-y-3">
                      {project.highlights.map((highlight) => (
                        <li
                          key={highlight.detail}
                          className="border-l-2 border-border pl-4 text-sm leading-relaxed text-muted transition-colors hover:border-accent"
                        >
                          {highlight.title ? (
                            <strong className="block font-medium text-foreground">
                              {highlight.title}
                            </strong>
                          ) : null}
                          {highlight.detail}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        ))}
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
