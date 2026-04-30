# 하남 지점 어드민

> 어학원(영어/일어) 하남 지점의 멤버, 리더, 출석, 팀 스케줄, 멤버십을 통합 관리하는 어드민 시스템

## 기술 스택

- **언어**: HTML, Vanilla JavaScript, CSS (프레임워크/번들러 없음)
- **스타일**: Tailwind CSS (CDN), Pretendard 폰트
- **아이콘**: Phosphor Icons (unpkg CDN)
- **데이터**: 클라이언트 사이드 Mock 데이터 (백엔드 미연동)
- **구조**: 정적 멀티페이지 HTML (SPA 아님, 각 HTML이 독립 페이지)

## 파일 구조

```
admin/
├── home.html       # 대시보드 & 캘린더 (메인 홈) — 지점장 통합 현황
├── leader.html     # 리더(튜터) 팀 출석부 — 60명 리더 관리
├── member.html     # 멤버(학생) 팀 출석부 — 팀당 150명, 전체 1,500명
└── docs/
    ├── PRD-home.md
    ├── PRD-leader.md
    ├── PRD-member.md
    ├── ONBOARDING.md
    └── USER-SCENARIOS.md
```

## 핵심 도메인 규칙

### 멤버십 등급 (5단계)
| 등급 | 총 세션 | 행 색상 |
|------|---------|---------|
| VVIP | 1,040회 | `bg-purple-50` |
| VIP | 520회 | `bg-indigo-50` |
| A+ | 104회 | `bg-emerald-50` |
| H+ | 52회 | `bg-orange-50` |
| B | 24회 | `bg-slate-50` |

### 리딩 레벨 색상
- LV0=slate, LV1=emerald, LV2=blue, LV3=purple, LV4=amber

### 팀 구조
- 팀 = 언어(영어/일어) + 요일 + 시간(11시/8시)
- 영어 팀: 보라(`#9B59B6`), 일어 팀: 파랑(`#007BFF`)
- 리더 팀: 요일+시간 단위 (영 월 11시), 멤버 팀: 일정+시간 단위 (영어 월수 11시)

### 출석 상태 (5가지)
출석예정, 출석완료, 대타예정, 대타출석완료, 불참

### 캘린더 이벤트 색상
파랑=신규등록, 초록=상담, 주황=행사

## 코딩 패턴 & 컨벤션

### 브랜드 색상 (Tailwind config)
```js
brand: { 50:'#f0f9ff', 100:'#e0f2fe', 500:'#0ea5e9', 600:'#0284c7', 900:'#0c4a6e' }
```

### 공통 UI 패턴 (3페이지 공유)
- **글래스 패널 헤더**: `glass-panel` 클래스, 상단 고정 반투명 블러
- **사이드 네비게이션 드로어**: 햄버거 메뉴 → 오버레이 + 슬라이드 애니메이션
- **프로필 모달**: `openProfileModal(name)` — 통계카드, 상담코멘트, 히스토리 타임라인
- **전화번호 복사**: `copyPhone()` → 클립보드 + 토스트 1.5초
- **메모 인라인 편집**: contenteditable, 포커스아웃 시 자동 저장
- **출석 블록 시각화**: 8블록(리더/주2멤버) 또는 16블록(주4멤버), 호버 툴팁
- **행 호버**: `member-row` 클래스, translateY(-1px) + 그림자

### 반응형 브레이크포인트
- `<640px`: 모바일 (위젯 1열, 드로어 전체 너비, 테이블 가로스크롤)
- `640-1024px`: 태블릿 (위젯/보드 2열)
- `>1024px`: 데스크톱 (위젯 4열, 최대 너비 1600px)

### 데이터 생성
- **leader.html**: `Math.random()` 기반 40~60명 랜덤 생성
- **member.html**: Seeded PRNG (Mulberry32), `hash(teamKey+"_"+level)` → 팀+레벨 동일 시 항상 동일 30명

## 알려진 제약사항 (Known Limitations)

- 백엔드 미연동 — 모든 데이터는 클라이언트 사이드 Mock
- 캘린더 월 전환, 주간 뷰 미구현 (4월 고정)
- SMS/문자 발송 미연동 (`openSmsModal()` 호출만 존재)
- 드래그앤드롭 정렬 미구현 (핸들 UI만 존재)
- 검색 필터링 JS 로직 부분 구현 (leader.html은 미구현)
- 캘린더 모달, 액션 드롭다운 메뉴 미구현

## 수정 시 주의사항

- 각 HTML 파일은 `<script>` 태그 안에 모든 JS가 인라인으로 포함됨 (별도 .js 파일 없음)
- Tailwind CDN 사용 중이므로 `tailwind.config` 변경 시 각 페이지 `<script>` 블록 내에서 수정
- 3페이지 간 사이드 네비게이션 구조가 동일하므로 변경 시 3곳 모두 반영 필요
- Mock 데이터 구조 변경 시 해당 페이지의 렌더링 함수 전체를 확인할 것
- member.html의 Seeded PRNG는 의도적 설계 — 새로고침 시에도 동일 데이터 유지 목적
- **HTML ↔ docs 동기화 필수**: root 단 `*.html` 파일을 수정하면, 반드시 대응하는 `docs/` 문서도 함께 업데이트할 것
  - `home.html` → `docs/PRD-home.md`
  - `leader.html` → `docs/PRD-leader.md`
  - `member.html` → `docs/PRD-member.md`
  - UI 흐름/시나리오가 변경되면 `docs/USER-SCENARIOS.md`, `docs/ONBOARDING.md`도 확인
  - 업데이트 범위: 기능 추가/삭제/변경된 부분의 명세, Mock 데이터 구조, UI 컴포넌트 설명 등

## PRD 문서 참조

기능 요구사항 상세는 `docs/` 디렉토리의 PRD 문서를 참조:
- `docs/PRD-home.md` — 대시보드 캘린더 기능 명세 (위젯, 캘린더, 모달)
- `docs/PRD-leader.md` — 리더 팀 출석부 기능 명세 (팀탭, 현황보드, 불참일정, 테이블)
- `docs/PRD-member.md` — 멤버 팀 출석부 기능 명세 (레벨섹션, CHECK알림, 멤버십)
- `docs/USER-SCENARIOS.md` — 사용자 시나리오 (지점장/매니저 워크플로우)
- `docs/ONBOARDING.md` — 온보딩 가이드 (도메인, 비즈니스 플로우, 용어)

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
