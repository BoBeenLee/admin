# 디자인 리뷰 노트 — 2026-04-27

> 데스크톱 어드민(tablet 768 / desktop 1280 / wide 1600 검토 범위)
> 원본 6종 무수정, 개선판은 `*-reviewed.html` 6종으로 분리 보존
> 1차(home/leader/member) → 2차(branchstatus/call/stats) 추가 진행

## 비교 방법

브라우저에 같은 페이지의 원본·개선판 탭을 동시에 열어 시각 비교하세요:

| 원본 | 개선판 | 핵심 변경 |
|------|--------|-----------|
| `home.html` | [home-reviewed.html](home-reviewed.html) | 데코 아이콘 제거, 그라데이션 아바타 평탄화, 모션 a11y, 한국어 타이포 |
| `leader.html` | [leader-reviewed.html](leader-reviewed.html) | 글래스인글래스 제거, TA 버튼·CTA 평탄화, 툴팁 z-index, 아바타 통일 |
| `member.html` | [member-reviewed.html](member-reviewed.html) | CHECK/LV4 amber 충돌 해소, 아바타 통일, 모션 a11y |
| `stats.html` | [stats-reviewed.html](stats-reviewed.html) | 8xl 데코 아이콘 4개 제거, indigo→영팀 보라 도메인 정렬, 영문 범례 한글화 |
| `branchstatus.html` | [branchstatus-reviewed.html](branchstatus-reviewed.html) | uppercase 한글 헤더 정리, 컬러 그림자/스프링 이징 → 정중한 ease-out |
| `call.html` | [call-reviewed.html](call-reviewed.html) | 인사이트 카드 데코+group-hover 시그니처 제거, 영문 단어 한글화, 스프링 이징 정리 |

6개 reviewed 파일이 reviewed 버전끼리 nav 링크로 연결되어 한 페이지에서 다른 페이지로 이동 가능합니다.

## 적용된 Findings

### home-reviewed.html (4건)
- **FINDING-H001** (AI Slop): Widget 4의 `text-9xl ph-paper-plane-tilt` 5% opacity 장식 아이콘 제거
- **FINDING-H002** (AI Slop): 프로필 모달 `from-brand-400 to-indigo-500` 그라데이션 아바타 → `bg-brand-600` 단색. 헤더 위젯의 `?background=random` 무작위 색상 아바타 → 브랜드 단색
- **FINDING-H003** (a11y): `@media (prefers-reduced-motion: reduce)` 추가 — notice-scroller 정지, 호버 트랜지션 제거
- **FINDING-H004** (Typography): Pretendard ss01/ss02, h1~h4 `text-wrap: balance` + `word-break: keep-all`, `.font-mono`/숫자에 `tabular-nums`

### leader-reviewed.html (6건)
- **FINDING-L001**: home과 동일한 모션 a11y + 한국어 타이포그래피 (mx-cell·mx-phone에 tabular-nums 추가)
- **FINDING-L002**: 콘텐츠 헤더의 `bg-white/40 backdrop-blur-sm border rounded-2xl shadow-sm` 글래스인글래스 제거 — 이미 sticky 글래스 헤더 위에 있었음
- **FINDING-L003**: "조교 리딩 히스토리" 버튼 6중 nested 시그니처(amber/80, rounded-xl, shadow-md, scale-95, group hover, arrow-translate) → 단일 평면 + focus-visible 아웃라인
- **FINDING-L004**: `.tooltip-text` z-index 50 → 100. sticky 헤더(z-50)와 동일하던 stacking 충돌 해소
- **FINDING-L005**: 프로필 모달 그라데이션 아바타 → `bg-brand-600` (3페이지 통일)
- **FINDING-L006**: 대타 추가 모달 푸터 CTA — `from-amber-500 to-amber-600 + shadow-xl + scale + rotate-90` 6중 시그니처 → `bg-amber-600` 단색 + color-only 상태 + focus-visible

### member-reviewed.html (3건)
- **FINDING-M001**: home/leader와 동일한 모션 a11y + 한국어 타이포그래피
- **FINDING-M002** (가장 큰 시각 충돌 해소): CHECK 섹션 amber 테마(외곽/헤더/필터/카운트/버튼 30+ 클래스) → 슬레이트 평탄화. 경고 아이덴티티는 `ph-warning-circle text-amber-500` 아이콘 한 점에만 응축. 동일 페이지 LV4 행 색상바(orange-50)와 의미 분리됨. JS 템플릿 문자열 5곳도 함께 정리 (resolve 버튼, 카드 컨테이너, 0건 메시지, view 토글 핸들러)
- **FINDING-M003**: 프로필 모달 그라데이션 아바타 → `bg-brand-600` (3페이지 통일)

### stats-reviewed.html (3건)
- **FINDING-S001**: 6페이지 공통 a11y/타이포그래피 (Pretendard ss01/ss02, balance/keep-all, tabular-nums, prefers-reduced-motion). `.stat-card` 호버 translateY 비활성화
- **FINDING-S002** (AI Slop): KPI 4장의 `text-8xl` 데코 아이콘 + `opacity-50` + `group-hover:scale-110` 4곳 일괄 제거. \"예상 매출 달성도\" 카드 indigo-600/indigo-500 → brand-600/brand-500 (팔레트 확산 차단). `▲ 12% / ▼ 2%` 색상 emerald-500/amber-500 → emerald-600/amber-600 (WCAG AA)
- **FINDING-S003** (도메인 정렬): 팀별 분배 차트 영팀 indigo-500 → CLAUDE.md 도메인 토큰 `#9B59B6` 보라(leader/member와 동일), 일팀 blue-500 → `#007BFF`. 범례 \"Engineering / Japanese\" → \"영어 / 일어\" 한글화. uppercase 클래스 + `shadow-indigo-100`/`shadow-blue-100` 컬러 그림자 제거

### branchstatus-reviewed.html (2건)
- **FINDING-B001**: 6페이지 공통 a11y/타이포그래피 + `.bs-table th`의 `text-transform: uppercase` 제거(한국어 헤더 \"성함/연락처/상태/언어/멤버십\"에 효과 없음). letter-spacing: 0.02em으로 대체
- **FINDING-B002**: 어드민 금융 화면에 부적합한 시그니처 정리. \"적용\" 버튼 `shadow-brand-500/20` 컬러 그림자 제거 + focus-visible. 환불 \"확인\" 버튼 `bg-red-500 + shadow-red-500/20` → `bg-red-600` 평면 + active 상태 + focus-visible. 환불/디테일 모달 `cubic-bezier(0.34,1.56,0.64,1)` 스프링 → `cubic-bezier(0.16, 1, 0.3, 1)` 정중한 ease-out-quint

### call-reviewed.html (3건)
- **FINDING-C001**: 6페이지 공통 a11y/타이포그래피 + `.app-table th` uppercase 한글 헤더 정리(branchstatus와 동일 패턴 재출현)
- **FINDING-C002** (AI Slop 시그니처): 인사이트 2장(\"지원 집중 시간대 / 회신 효율 분석\")의 `opacity-[0.03] + group-hover:scale-110 + group-hover:opacity-[0.08]` 6xl 데코 아이콘 제거. uppercase + tracking-widest + italic 본문 평탄화. `group-hover:text-amber-600 / blue-600` 헤더 색상 호버 변경 제거. \"Success 0%\" → \"0% 성공\" 영문 단독 단어 한글화. amber-600/blue-600 → 700 (대비)
- **FINDING-C003**: 3개 모달(input/dup/new-app) 스프링 이징 → 정중한 ease-out (branchstatus와 동일)

## Cross-Page 일관성 (6페이지 검증됨)

| 항목 | home | leader | member | stats | branchstatus | call |
|------|------|--------|--------|-------|--------------|------|
| `prefers-reduced-motion` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `text-wrap: balance` 글로벌 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `word-break: keep-all` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `tabular-nums` (숫자) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 프로필 아바타 평탄 (`bg-brand-600`) | ✅ | ✅ | ✅ | n/a | n/a | n/a |
| `font-feature-settings: ss01,ss02` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8xl/9xl 데코 아이콘 부재 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 그라데이션 아바타 부재 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 한글 테이블 헤더 uppercase 부재 | n/a | n/a | n/a | n/a | ✅ | ✅ |
| 모달 스프링 이징 부재 | n/a | n/a | n/a | n/a | ✅ | ✅ |

## 확인 권장 시나리오

### 데스크톱 1280
- home: 위젯 4열의 시각 가중치 균형 + 캘린더 우선 인지 확인
- leader: sticky 3단(헤더 60 + 팀탭 44 + 레벨네비 44 ≈ 148px)에서 매트릭스 셀 호버 시 툴팁이 가려지지 않는지
- member: CHECK 섹션 슬레이트 톤 + 알림 배지(red/orange/yellow) 시멘틱 보존 + LV4 행 색상바 충돌 없는지
- stats: 4 KPI 카드 평면 처리 + 팀별 분배 차트의 영팀 보라/일팀 파랑이 leader/member와 동일한 hue
- branchstatus: 환불 모달 ease-out 정중한 등장(스프링 없음), 헤더 한글 uppercase 사라짐
- call: 인사이트 카드 데코 6xl 아이콘 사라짐, "0% 성공" 한국어 정렬

### Wide 1600
- 6페이지 모두 max-width 정책이 자연스러운지 (home/leader/member: 1600, branchstatus/call: 1550, stats: 1600)

### A11y
- macOS 시스템 환경설정 → 손쉬운 사용 → 디스플레이 → 동작 줄이기 → on
- 6페이지 모두 모션 정지 검증

## 미적용 (의도적으로 보류)

- 캘린더 이벤트 색상(blue/emerald/orange) — 시멘틱 인코딩(신규/상담/행사)이라 통일 불가
- 영팀 보라 #9B59B6 / 일팀 파랑 #007BFF — CLAUDE.md 도메인 규칙 토큰
- LV0~4 색상(slate/emerald/blue/purple/amber) — 도메인 규칙 토큰
- 멤버십 5단계 색상(purple/indigo/emerald/orange/slate) — 도메인 규칙 토큰
- 재무 모드 amber 강조 (branchstatus `bs-basis-active`) — 금융 시멘틱
- 카카오 채널 amber — 채널 브랜드 컬러
- 환불 액션 red — 위험 시멘틱
- 모바일(<768px) 관련 finding — 어드민 데스크톱 전용 사용 환경
- 검색 결과 0건/캘린더 월 전환 등 — Known Limitations에 따라 Deferred
- "REPLY MANAGEMENT / STATISTICS" 영문 sub-headline — 페이지 타이틀 디자인 패턴(브랜드 톤)으로 의도 가능, 후속 검토

## 참고

- 원본 6종(home/leader/member/branchstatus/call/stats)은 git diff에 등장하지 않음 (무수정 보존 검증)
- `docs/PRD-*.md` 무수정 (개선판은 별도 파일이므로 PRD 동기화 불필요)
- 커밋 22건: scaffold 2(1차+2차) + finding 19건 + notes 1
  - 1차(home/leader/member): FINDING-H × 4, FINDING-L × 6, FINDING-M × 3 = 13건
  - 2차(stats/branchstatus/call): FINDING-S × 3, FINDING-B × 2, FINDING-C × 3 = 8건
