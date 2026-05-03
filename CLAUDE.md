# 하남 지점 어드민

> 어학원(영어/일어) 하남 지점의 멤버, 리더, 출석, 팀 스케줄, 멤버십을 통합 관리하는 어드민 시스템

## 기술 스택

- **언어**: HTML, Vanilla JavaScript, CSS (프레임워크/번들러 없음)
- **스타일**: Tailwind CSS (CDN), Pretendard 폰트
- **아이콘**: Phosphor Icons (unpkg CDN)
- **데이터**: 클라이언트 사이드 Mock 데이터 (백엔드 미연동)
- **구조**: 정적 멀티페이지 HTML (SPA 아님, 각 HTML이 독립 페이지)

## 디렉토리 구조

```
admin/
├── *.html              # 페이지: 마크업 + 부트스트랩 <script src> 만
├── partials/
│   └── nav.html        # 사이드 네비 드로어 (runtime fetch)
├── css/
│   └── shared.css      # glass-panel, hide-scrollbar 공통 스타일
└── js/
    ├── shared/
    │   ├── tailwind-config.js   # tailwind.config (7 페이지 공유)
    │   ├── utils.js             # window.copyPhone, window.showToast
    │   ├── drawer.js            # window.loadNav, window.tDrawer (자동 호출)
    │   └── profile-modal.js     # window.showProfileModal, window.closeProfileModal
    └── pages/
        ├── home.js, member.js, leader.js, workdeck.js,
        ├── call.js, branchstatus.js, stats.js
```

### 파일 맵 (어디서 무엇을 찾을지)

| 페이지 | HTML | 페이지 JS |
|--------|------|----------|
| 홈 / 대시보드 캘린더 | home.html | js/pages/home.js |
| 멤버 팀 (출석 블록) | member.html | js/pages/member.js |
| 리더 팀 (매트릭스 뷰) | leader.html | js/pages/leader.js |
| Work Deck | workdeck.html | js/pages/workdeck.js |
| 신규 회신 | call.html | js/pages/call.js |
| Branch Status | branchstatus.html | js/pages/branchstatus.js |
| 통계 / 리포트 | stats.html | js/pages/stats.js |

### 공통 함수 위치

| 함수 / 컴포넌트 | 파일 |
|----------------|------|
| `copyPhone(phone)`, `showToast(msg)` | js/shared/utils.js |
| 사이드 네비 드로어 (마크업 + 핸들러) | partials/nav.html + js/shared/drawer.js |
| `tDrawer(open)` 토글 | js/shared/drawer.js (`window.tDrawer`) |
| 프로필 모달 표시/숨김 | js/shared/profile-modal.js |
| `tailwind.config` (브랜드 컬러, boxShadow) | js/shared/tailwind-config.js |
| `glass-panel`, `hide-scrollbar` | css/shared.css |
| `openProfileModal(name)` 렌더링 | 페이지 JS 인라인 (home/leader/member 각각) |

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

### 브랜드 색상 (js/shared/tailwind-config.js)
```js
brand: { 50:'#f0f9ff', 100:'#e0f2fe', 200:'#bae6fd',
         500:'#0ea5e9', 600:'#0284c7', 700:'#0369a1', 900:'#0c4a6e' }
```
* 200/700 은 workdeck.html 호환을 위해 추가 (다른 페이지는 사용하지 않음)

### 공통 UI 패턴
- **글래스 패널 헤더**: `glass-panel` 클래스 (css/shared.css 단일 정의)
- **사이드 네비 드로어**: `<div id="nav-slot"></div>` 슬롯에 partials/nav.html 가 runtime fetch 로 주입됨
- **햄버거 버튼**: `id="hamburger-btn"` 통일. drawer.js 가 자동 바인딩
  - workdeck.html 만 자체 바인딩 (데스크탑에서 사이드바 토글 / 모바일에서 드로어). nav-slot 에 `data-skip-hamburger="true"` 표시
- **프로필 모달**: 페이지 JS 가 자체 `openProfileModal()` 정의 → 마지막에 `window.showProfileModal()` 호출
  - `closeProfileModal()` 은 모든 페이지에서 공유 (profile-modal.js)
  - 페이지별 DOM/타임라인 차이 때문에 `openProfileModal` 자체는 통합하지 않음
- **전화번호 복사**: `copyPhone(phone)` → 클립보드 + 토스트 1.5초 (utils.js, window 노출)
- **메모 인라인 편집**: contenteditable, 포커스아웃 시 자동 저장
- **출석 블록 시각화**: 8블록(리더/주2멤버) 또는 16블록(주4멤버), 호버 툴팁
- **행 호버**: `member-row` 클래스, translateY(-1px) + 그림자

### 데이터 생성
- **leader.html → js/pages/leader.js**: `Math.random()` 기반 40~60명 랜덤 생성 (매 로드마다 다름)
- **member.html → js/pages/member.js**: Seeded PRNG (Mulberry32), `hash(teamKey+"_"+level)` → 팀+레벨 동일 시 항상 동일 30명 (결정성 유지)

## 로컬 실행

`fetch('partials/nav.html')` 가 `file://` 프로토콜에서 차단되므로 **반드시 정적 서버 경유**로 열어야 사이드 네비가 로드됩니다.

```bash
cd /path/to/admin
python3 -m http.server 8000
# 또는
npx serve .
# 그 후 브라우저에서 http://localhost:8000/home.html
```

## 수정 시 주의사항

- HTML 파일은 마크업 위주 (대부분 600~1300줄). 페이지 로직은 `js/pages/<page>.js` 에 있음.
- Tailwind 브랜드 컬러 / boxShadow 변경 → `js/shared/tailwind-config.js` 한 곳에서.
- 사이드 네비 항목 추가/변경 → `partials/nav.html` 한 곳에서. 활성 링크 강조는 drawer.js 가 `window.location.pathname` 매칭으로 자동 적용 (각 `<a>` 의 `data-nav` 값 사용).
- glass-panel 시각 변경 → `css/shared.css`. 페이지별 미세 차이가 필요하면 페이지 인라인 `<style>` 에서 더 구체적인 셀렉터로 override.
- Mock 데이터는 페이지 JS 안에 그대로 유지. 분리하면 PRNG 시드 결정성이 깨질 수 있음.
- 인라인 `onclick` 이 함수를 호출하므로, 페이지 JS 에서 외부 호출 함수는 `window.X = function...` 으로 명시 노출. 내부 헬퍼는 클로저 안에 유지.

### 보류된 작업 (향후 개선)

- `openProfileModal` 통합: home/leader/member 의 DOM 구조와 타임라인 렌더링이 서로 달라 (member 는 `pm-start-exp-date` 결합 + 아이콘 풍부 타임라인) 단순 통합 불가. 통합하려면 DOM 통일 + 타임라인 렌더 전략 패턴 필요.
- Mock 데이터 분리: 페이지마다 데이터 풀이 다르고 PRNG 시드와 결합되어 있어 `js/data/` 분리는 효과 작음. 향후 진짜로 공유되는 부분(예: VVIP/VIP/A+/H+/B 멤버십 정의)만 선별 추출 가능.
