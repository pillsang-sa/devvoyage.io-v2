import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
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
    duration: "4년 1개월",
    projects: [
      {
        name: "리워드롭",
        period: "2024.01 ~ 현재",
        contribution: "기여도 98%",
        summary:
          "Next.js(v16), Turborepo 기반의 B2B/B2C 모노레포 오퍼월 서비스와 5개국어 투표권 상점",
        url: "https://ivekorea.notion.site/13471551813f80448fcbf68005063d4a?pvs=74",
        highlights: [
          {
            title: "네이티브-웹뷰 하이브리드 아키텍처 구축",
            detail:
              "Android/iOS 크로스 플랫폼 대응을 위해 웹뷰 중심 구조로 전환하여 앱 배포 절차 없는 즉시 배포 체계를 완성하고 운영 유연성을 확보했습니다.",
          },
          {
            title: "모노레포 아키텍처 설계를 통한 개발 생산성 향상",
            detail:
              "Turborepo와 pnpm workspace 기반으로 4개 앱(오퍼월·이벤트·고객센터·멀티미션)과 4개 공용 패키지(UI 컴포넌트 22종의 디자인 시스템 포함)를 분리하여 신규 서비스 구축 기간을 평균 1주에서 1~2일로 단축했습니다.",
          },
          {
            title: "멀티 플랫폼 대응 네이티브 브릿지 계층 구현",
            detail:
              "닫기·광고 참여·앱 설치 확인·네트워크 확인·다이얼로그·푸시 등 8종의 네이티브 메시지를 플랫폼별 브릿지 어댑터로 감싸고, 브릿지 계약을 강제해 구버전 앱에서는 하위 버전으로 폴백하도록 했습니다.",
          },
          {
            title: "BFF 패턴을 활용한 보안 강화",
            detail:
              "Next.js Route Handler 기반 서버 사이드 프록시를 구축해 Access/Refresh 토큰을 서버 세션에서만 관리함으로써 XSS 공격 위험을 근본적으로 차단했습니다.",
          },
          {
            title: "서버 prefetch와 Suspense 스트리밍으로 첫 화면 개선",
            detail:
              "홈·광고 목록·스토어 2종, 총 4개 화면의 데이터 요청을 TanStack Query 서버 prefetch로 옮기고, prefetch를 섹션별 Suspense 경계 안으로 내려 느린 광고 목록이 나머지 화면을 붙잡지 않도록 스트리밍을 복구했습니다.",
          },
          {
            title: "React Compiler 도입과 수동 메모이제이션 정리",
            detail:
              "4개 앱에 React Compiler를 적용하고 useMemo·useCallback 47건 중 38건(81%)을 걷어냈습니다. 컴파일러가 최적화를 포기하는 9건은 컴파일 결과로 직접 확인해 남겨, 성능 저하 없이 코드를 줄였습니다.",
          },
          {
            title: "홈 개편을 위한 백엔드 API 직접 구현",
            detail:
              "FastAPI 기반 오퍼월 API 서버에 코인·부스팅·멀티보상·인기·카테고리별 상위 광고, 인증 배너 2종까지 API 7종을 2주 만에 직접 추가하고, API 서버 릴리스 7회를 프론트엔드 릴리스와 맞물려 내보냈습니다.",
          },
          {
            title: "CHANGELOG 기반 릴리스·버저닝 체계 정립",
            detail:
              "릴리스마다 major·minor·patch 판단 근거를 남기는 CHANGELOG를 릴리스 노트의 정본으로 두고, 첫 정식 버전(v1.0.0) 이후 1년간 48회 릴리스(v4.7.2까지)를 같은 절차로 운영하고 있습니다.",
          },
          {
            title: "next-intl 기반 5개국어 라우팅 구축",
            detail:
              "한국어, 영어, 일본어, 중국어 간체/번체 5개 언어를 동적 세그먼트로 관리하고, 언어별 배너·안내 소재까지 로케일 단위로 분기했습니다.",
          },
          {
            title: "이중 PG 파이프라인 및 결제 검증 로직 구현",
            detail:
              "Danal(국내)과 Eximbay(해외) 2개 PG로 결제를 이원화하고, 결제 준비·주문 생성을 Route Handler 프록시로 감싸 인증 세션이 없는 PG 콜백 구간의 위변조를 검증했습니다.",
          },
        ],
      },
      {
        name: "광고 어드민",
        period: "2026.08 ~ 현재",
        contribution: "기여도 100%",
        summary:
          "레거시 PHP CMS의 내부 관리 기능을 대체하는 Next.js(v16) 기반 광고 운영 어드민(28개 화면)",
        highlights: [
          {
            title: "API 계층 없는 서버 컴포넌트 아키텍처 설계",
            detail:
              "서버 컴포넌트가 DAL을 통해 DB를 직접 조회하고, 쓰기는 Server Actions로만 받도록 계층을 나눴습니다. 세션·권한 검증을 DB 접근 지점 한 곳에 모아 API 서버 없이도 일관된 인가를 보장했습니다.",
          },
          {
            title: "기존 CMS와 DB를 공유하는 점진적 이전",
            detail:
              "레거시 CMS와 같은 Aurora MySQL을 쓰면서 Drizzle ORM은 스키마를 소유하지 않고 DB를 따라가게 구성했습니다. Writer/Reader 커넥션 풀을 분리하고 쿼리 시간 상한(Writer 5초·Reader 10초)을 두어 운영 DB 부하를 통제했습니다.",
          },
          {
            title: "운영 리포트·대시보드 구축",
            detail:
              "일별·월별·시간대별·광고별 리포트 4종과 광고·제휴사 대시보드 2종을 드릴다운·추이 차트·CSV 내보내기와 함께 구현하고, 리워드롭 운영 9개·상품권 상점 7개 화면을 기존 CMS에서 옮겨왔습니다.",
          },
          {
            title: "역할 기반 인가와 감사 로그",
            detail:
              "역할별 접근 제어를 적용하고 로그인과 모든 쓰기 작업에 감사 로그를 남겨, 내부 도구에서도 누가 무엇을 바꿨는지 추적할 수 있게 했습니다.",
          },
          {
            title: "Docker 기반 무중단 배포 파이프라인",
            detail:
              "멀티스테이지 Dockerfile과 Bitbucket Pipelines로 이미지를 빌드하고, EC2 한 대에서 컨테이너 두 개를 교대시키는 롤링 배포로 무중단 배포를 구성했습니다.",
          },
        ],
      },
      {
        name: "회사 브랜드 웹사이트 리뉴얼",
        period: "2026.06 ~ 2026.09",
        contribution: "기여도 100%",
        summary:
          "Next.js(v16) 기반의 자사 3개 서비스, 3개 언어(한국어·영어·중국어), 15개 페이지 브랜드 웹사이트",
        url: "https://ivekorea.com",
        highlights: [
          {
            title:
              "역할 기반 AI 에이전트 하네스 구축을 통한 개발 파이프라인 효율화",
            detail:
              "Next.js 빌더, UI 빌더, i18n/SEO 전문가, QA 엔지니어 등 역할별 AI 에이전트 5종과 맞춤 스킬 13종을 개발 프로세스에 이식하여, 기능 구현부터 QA까지의 병목을 줄이는 DX 환경을 구축했습니다.",
          },
          {
            title:
              "검색엔진 및 AI 에이전트 노출 향상을 위한 SEO/GEO 구조화 설계",
            detail:
              "시맨틱 태그 체계화와 Open Graph, JSON-LD를 적용하고, 다국어 라우트 정의에서 llms.txt를 생성해 구글/네이버와 생성형 AI 검색 모두에 대응했습니다.",
          },
          {
            title: "GSAP/Motion.dev 기반 고성능 인터랙션 구현",
            detail:
              "GSAP ScrollTrigger와 Lenis 스무스 스크롤로 섹션 스냅·핀·스크럽 연출을 구현하고, GPU 가속과 CSS Transform 위주의 레이아웃으로 복잡한 모션에서도 안정적인 60fps를 유지했습니다.",
          },
          {
            title: "Vercel에서 EC2 셀프호스팅으로 이전",
            detail:
              "standalone 빌드와 롤백 스크립트를 갖춘 EC2 배포로 전환하고, 구 사이트 URL 6개를 신규 라우트로 301 리다이렉트하고 광고 인벤토리 검증용 app-ads.txt(387줄)를 그대로 이어받아 기존 검색 유입과 광고 수익 경로를 보존하며 도메인을 컷오버했습니다.",
          },
          {
            title: "문의 전환 추적과 운영 알림 체계",
            detail:
              "문의 폼 접수를 네이버 애널리틱스 전환으로 연결하고, 접수 즉시 Slack으로 알림을 보내되 개발 환경에서는 테스트 채널로만 가도록 분리했습니다.",
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
              "광고주/매체사별로 파편화된 계산 로직을 Zustand 단일 스토어(SSOT)로 통합하여 견적 관련 런타임 버그 전무를 달성했습니다.",
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
      <JsonLd data={portfolioSchema()} />

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

        <SkillBadges skills={SKILLS} />
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
                        <span className="sr-only">(새 탭)</span>
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
