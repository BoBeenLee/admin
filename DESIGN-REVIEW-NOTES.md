# 디자인 리뷰 노트 — 2026-04-27

> 데스크톱 어드민(tablet 768 / desktop 1280 / wide 1600 검토 범위)
> 원본 무수정, 개선판은 `*-reviewed.html` 3종으로 분리 보존

## 비교 방법

브라우저에 같은 페이지의 원본·개선판 탭을 동시에 열어 시각 비교하세요:

| 원본 | 개선판 | 핵심 변경 |
|------|--------|-----------|
| `home.html` | [home-reviewed.html](home-reviewed.html) | 데코 아이콘 제거, 그라데이션 아바타 평탄화, 모션 a11y, 한국어 타이포 |
| `leader.html` | [leader-reviewed.html](leader-reviewed.html) | 글래스인글래스 제거, TA 버튼·CTA 평탄화, 툴팁 z-index, 아바타 통일 |
| `member.html` | [member-reviewed.html](member-reviewed.html) | CHECK/LV4 amber 충돌 해소, 아바타 통일, 모션 a11y |

링크 nav는 reviewed 버전끼리 연결되어 있어, 한 개선판에서 다른 개선판으로 이동 가능합니다.

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

## Cross-Page 일관성 (검증됨)

| 항목 | home | leader | member |
|------|------|--------|--------|
| `prefers-reduced-motion` | ✅ | ✅ | ✅ |
| `text-wrap: balance` 글로벌 | ✅ | ✅ | ✅ |
| `tabular-nums` (숫자) | ✅ | ✅ | ✅ |
| 프로필 아바타 평탄 (`bg-brand-600`) | ✅ | ✅ | ✅ |
| `font-feature-settings: ss01,ss02` | ✅ | ✅ | ✅ |

## 확인 권장 시나리오

### 데스크톱 1280
- home: 위젯 4열의 시각 가중치 균형 + 캘린더 우선 인지 확인
- leader: sticky 3단(헤더 60 + 팀탭 44 + 레벨네비 44 ≈ 148px)에서 매트릭스 셀 호버 시 툴팁이 가려지지 않는지
- member: CHECK 섹션 슬레이트 톤 + 알림 배지(red/orange/yellow) 시멘틱 보존 + LV4 행 색상바 충돌 없는지

### Wide 1600
- 3페이지 모두 `max-w-[1600px]` 정책이 자연스러운지

### A11y
- macOS 시스템 환경설정 → 손쉬운 사용 → 디스플레이 → 동작 줄이기 → on
- notice-scroller 정지, 행 호버 translateY 제거, 모달 트랜지션 즉시화 확인

## 미적용 (의도적으로 보류)

- 캘린더 이벤트 색상(blue/emerald/orange) — 시멘틱 인코딩(신규/상담/행사)이라 통일 불가
- 영팀 보라 #9B59B6 / 일팀 파랑 #007BFF — CLAUDE.md 도메인 규칙 토큰
- LV0~4 색상(slate/emerald/blue/purple/amber) — 도메인 규칙 토큰
- 멤버십 5단계 색상(purple/indigo/emerald/orange/slate) — 도메인 규칙 토큰
- 모바일(<768px) 관련 finding (어드민 데스크톱 전용 사용 환경)
- 검색 결과 0건/빈 상태 디자인 — Known Limitations에 따라 Deferred
- 캘린더 월 전환·주간 뷰 — Known Limitations
- `branchstatus.html` / `call.html` / `stats.html` — 본 리뷰 범위 외 (CLAUDE.md 문서화된 3페이지로 한정)

## 참고

- 원본 3종은 git diff에 등장하지 않음 (무수정 보존 검증)
- `docs/PRD-*.md` 무수정 (개선판은 별도 파일이므로 PRD 동기화 불필요)
- 커밋 11건: scaffold 1 + finding 13건 (FINDING-H × 4, FINDING-L × 6, FINDING-M × 3)
