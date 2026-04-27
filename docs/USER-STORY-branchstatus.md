# USER STORY: 지점 회원·매출 현황 — branchstatus.html

> 페이지별 핵심 유저 스토리 + 시각적 표현
> **연관 문서:** [USER-STORY-call.md](./USER-STORY-call.md) (회신→등록 흐름의 다음 단계) · [USER-STORY-stats.md](./USER-STORY-stats.md) (지점 전사 통계)

---

## 한 줄 요약

> **기준일(자료등록·결제·스터디시작)을 토글해 가며 지점의 방문객·매출·전환·환불을 한 화면에서 풀어내는 회계 친화 대시보드.**

| 항목 | 내용 |
|------|------|
| 주요 Actor | **지점장** (메인) · **매니저** (서브) |
| 진입 경로 | 햄버거 메뉴 → "Branch Status" |
| 핵심 가치 | "기준일 토글로 재무 모드" → "환불 3유형 안전 처리" → "필터 다중조합 코호트" |

---

## 핵심 가치 카드 (3-Up)

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│  📅 기준일 토글       │  💸 환불 3유형        │  🔍 다중 필터 코호트  │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ 자료등록일 / 결제일 / │ 전체 취소 · 부분 취소 │ 상태·멤버십·경로·    │
│ 스터디시작일 토글로   │ · 환불 정산 입금을    │ 결제방식·기간을      │
│ 동일 데이터를 운영    │ 사유 칩 + 자유 입력   │ 다중 조합해 특정     │
│ /재무 두 시점에서.    │ 으로 안전 처리.       │ 코호트만 좁히기.     │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

---

## 페이지 컴포넌트 구조도

```mermaid
graph TD
    Page[branchstatus.html · BRANCH STATUS]
    Page --> Header[헤더<br/>로고 · 지점 라벨 · 프로필]
    Page --> Filt[필터 영역<br/>기준일 셀렉트 · 기간 버튼 · 듀얼 캘린더]
    Page --> KPI[4-KPI 그리드]
    Page --> Tabs[2-탭 차트]
    Page --> Tbl[방문객 테이블 14컬럼]
    Page --> Mod[모달 2종]

    KPI --> KP1[총 방문자]
    KPI --> KP2[멤버 가입률]
    KPI --> KP3[총 매출]
    KPI --> KP4[평균 객단가]

    Tabs --> TA[매출 대시보드<br/>결제방식·멤버십·상태]
    Tabs --> TB[유입 분석<br/>경로별 인원·전환율]

    Mod --> R[환불 처리 모달<br/>3유형 · 사유 칩]
    Mod --> D[회원 상세 모달<br/>5섹션 + 타임라인]

    Tbl -.이름 클릭.-> D
    Tbl -.추가 → 환불.-> R
    Filt -.기준일 변경.-> KPI
    Filt -.기간 변경.-> Tabs

    classDef kpi fill:#dbeafe,stroke:#1d4ed8,color:#0c4a6e
    classDef modal fill:#fef3c7,stroke:#d97706,color:#78350f
    class KP1,KP2,KP3,KP4 kpi
    class R,D modal
```

---

## 핵심 유저 스토리 (5)

### 🟥 P0 · E-1 환불 처리 (3유형) (Hero) ⭐

> **"환불 요청이 들어왔을 때, 결제 정보를 보면서 전체/부분/정산 중 맞는 유형을 골라 사유까지 한 번에 닫고 싶다."**

| 항목 | 내용 |
|------|------|
| Actor | 지점장 |
| 트리거 | 테이블 행 → "추가" 드롭다운 → "환불" |
| 완료 조건 | history·extras 기록 + amount 반영 + 토스트 |

**🎨 baoyu-diagram SVG (다크 테마):**

![E-1 환불 처리 워크플로우](./diagrams/branchstatus-e1-refund-workflow.svg)

**📐 Mermaid (라이트 테마, 인라인):**

```mermaid
flowchart TD
    Start([회원 환불 요청]) --> Click[테이블 추가 → 환불]
    Click --> Open[환불 처리 모달]
    Open --> ShowPay[기존 결제 정보 표시<br/>방식 · 금액 · 일자]
    ShowPay --> Type{환불 유형}

    Type -->|전체 취소| Full[금액 = 결제금액 자동]
    Type -->|부분 취소| Part[부분 금액 입력]
    Type -->|정산 입금| Dep[정산 비용 + 결제일 + 결제방식<br/>+ 환불 금액 + 환불 처리일]

    Full --> Method[환불 방식<br/>카드/계좌/현금/토스]
    Part --> Method
    Method --> Date[환불 처리일 선택]
    Date --> Reason
    Dep --> Reason

    Reason[환불 사유 칩 또는 직접 입력] --> Submit[환불 처리 버튼]
    Submit --> Sys{System}
    Sys --> H1[history += 환불 항목]
    Sys --> H2[extras += 환불 항목]
    Sys --> H3[amount -= 환불 금액]
    H1 --> Render[renderAll · KPI/차트/테이블 갱신]
    H2 --> Render
    H3 --> Render
    Render --> End([토스트 + 모달 닫힘])
```

---

### 🟥 P0 · E-2 기준일 전환으로 재무 모드 분석

> **"같은 회원 데이터라도 결제일 기준으로 보면 이번 달 매출, 시작일 기준으로 보면 운영 부하가 다르게 보인다."**

| 항목 | 내용 |
|------|------|
| Actor | 지점장 |
| 트리거 | 상단 "기준일" 셀렉트 변경 |
| 완료 조건 | KPI·차트·테이블 모두 새 기준일로 리렌더 |

```mermaid
flowchart LR
    Sel[기준일 셀렉트] --> M1{선택}
    M1 -->|자료등록일| R[운영 모드<br/>유입 분석에 적합]
    M1 -->|결제일| P[재무 모드<br/>월 매출 정합성]
    M1 -->|스터디시작일| S[재무 모드<br/>운영 부하·정원 분석]
    P --> Badge[재무 뱃지 표시]
    S --> Badge
    Badge --> Hi[활성 컬럼<br/>황색 강조]
    R --> Filt[기간 + 상태 필터 적용]
    P --> Filt
    S --> Filt
    Filt --> Drop[결제일/시작일 null 인 회원<br/>자동 제외]
    Drop --> Render([renderAll])
```

---

### 🟧 P1 · E-3 KPI → 차트 → 테이블 → 상세 모달 드릴다운

> **"가입률이 떨어진 게 어느 멤버십 등급 때문인지, 그 등급의 누가 환불했는지까지 따라가고 싶다."**

| 항목 | 내용 |
|------|------|
| Actor | 지점장 |
| 트리거 | KPI 카드 → 탭 차트 → 테이블 행 |
| 완료 조건 | 회원 한 명의 전체 히스토리 타임라인 파악 |

```mermaid
graph TD
    K[KPI 4종] --> KK[멤버 가입률 ↓]
    KK --> Tab[매출 대시보드 탭]
    Tab --> Bar[멤버십별 매출 막대]
    Bar --> Pick[특정 등급 클릭/식별]
    Pick --> Filter[멤버십 필터 적용]
    Filter --> Tbl[테이블 좁혀짐]
    Tbl --> Click[회원 이름 클릭]
    Click --> Modal[상세 모달]
    Modal --> S1[기본 정보<br/>상태/언어/멤버십·레벨]
    Modal --> S2[결제 정보<br/>방식/금액/경로]
    Modal --> S3[스터디 현황<br/>참석률 바 + 잔여 횟수]
    Modal --> S4[일정 타임라인<br/>등록·결제·시작·종료]
    Modal --> S5[전체 히스토리<br/>세로 타임라인 + 환불·레벨업]

    classDef kpi fill:#dbeafe,stroke:#1d4ed8,color:#0c4a6e
    classDef detail fill:#ecfdf5,stroke:#059669,color:#064e3b
    class K,KK kpi
    class S1,S2,S3,S4,S5 detail
```

---

### 🟧 P1 · E-4 추가 항목 기록 (등록 / 추가납부)

> **"이미 등록된 회원이 추가 결제하거나 정산 비용을 받았을 때, 한 줄짜리 항목으로 깔끔히 남기고 싶다."**

| 항목 | 내용 |
|------|------|
| Actor | 매니저 |
| 트리거 | 테이블 행 → "추가" 드롭다운 → "등록 / 추가납부" |
| 완료 조건 | extras 배열 누적 + amount 반영 + 차트 갱신 |

```mermaid
flowchart LR
    Row[방문객 행] --> Add[추가 드롭다운]
    Add --> T{유형}
    T -->|등록| Reg[자료 등록 추가<br/>type:'등록']
    T -->|추가납부| Pay[추가 결제<br/>type:'추가납부']
    T -->|환불| Refund[(별도 모달)]
    Reg --> Ext[extras += 항목]
    Pay --> Ext
    Ext --> Hist[history += 변경 이력]
    Hist --> Render([KPI · 차트 · 테이블 갱신])
```

---

### 🟦 P2 · E-5 다중 필터로 특정 코호트 좁히기

> **"이번 달 카카오로 들어와서 카드로 결제한 VVIP만 따로 보고 싶다."**

| 항목 | 내용 |
|------|------|
| Actor | 지점장 |
| 트리거 | 테이블 상단 필터 영역 |
| 완료 조건 | 결과 카운트 우측 갱신 + 행 좁혀짐 |

```mermaid
flowchart LR
    A[검색<br/>id/이름/전화] --> R[필터 적용]
    B[상태 칩<br/>멤버/미가입/디파짓/스텝/환불] --> R
    C[멤버십 셀렉트<br/>VVIP~T] --> R
    D[유입경로 셀렉트<br/>6종] --> R
    E[결제방식 셀렉트<br/>카드/현금/계좌/토스] --> R
    F[기간 버튼<br/>이번달/1주/1달/3달/전체/직접] --> R
    R --> Cnt[결과 카운트 우측 표시]
    R --> Tbl[테이블 행 좁혀짐]
    Cnt --> Done([코호트 분석])
    Tbl --> Done
```

---

## 데이터 흐름 다이어그램

```mermaid
flowchart TD
    Mock[(20명 Mock Visitor<br/>genVisitors)]
    Mock --> Pool[Visitor 풀]
    Pool --> Basis{기준일 모드}
    Basis -->|regDate| FB1[regTime 기준 필터]
    Basis -->|payDate| FB2[payTime 기준 + null 제외]
    Basis -->|startDate| FB3[startTime 기준 + null 제외]

    FB1 --> Period{기간}
    FB2 --> Period
    FB3 --> Period
    Period -->|이번달/1w/1m/3m/all/custom| Range[bsPeriod 적용]

    Range --> Status[다중 상태 필터<br/>Set 기반]
    Status --> Other[멤버십·경로·결제방식·검색]
    Other --> Filtered[filteredVisitors]

    Filtered --> RenderKPI[renderKPIs]
    Filtered --> RenderChart[renderCharts · 5종]
    Filtered --> RenderTbl[renderTable]

    Memo[메모 인라인 편집] -.즉시 반영.-> Pool
    Refund[환불 처리] -.history+extras+amount.-> Pool
    Add[등록/추가납부] -.history+extras.-> Pool
```

---

## 컬러 팔레트 빠른참조

### 회원 상태 (4종 + 환불 뱃지)

| 상태 | 의미 | 색상 |
|------|------|------|
| 멤버 | 정식 가입 | 🟢 emerald `#10b981` |
| 미가입 | 자료 등록만 | ⚪ slate `#94a3b8` |
| 디파짓 | 선예약·계약금 | 🟠 amber `#f59e0b` |
| 스텝 | 진행 중 단계 | 🟣 purple `#8b5cf6` |
| 환불 (뱃지) | history 환불 기록 | 🔴 red `#ef4444` |

### 멤버십 등급 (5종, T = CLAUDE.md의 'B'에 대응)

| 등급 | 총 세션 | 정가 | 비고 |
|------|--------|------|------|
| VVIP | 1,040회 | 3,200,000원 | 최상위 |
| VIP | 520회 | 1,800,000원 | 고관여 |
| A+ | 104회 | 480,000원 | 표준 |
| H+ | 52회 | 260,000원 | 입문 |
| **T** | 24회 | 130,000원 | (= CLAUDE.md의 'B' 등급) |

> ⚠️ branchstatus.html 코드는 'T'로 표기, 글로벌 CLAUDE.md는 'B'로 표기. 의미는 동일 (24회 입문 등급). 향후 통일 권장.

### 유입경로 색상 (6종)

| 경로 | 헥스 |
|------|------|
| 카카오 | `#FBBF24` |
| 네이버 | `#22C55E` |
| 인스타 | `#D946EF` |
| 지인소개 | `#94A3B8` |
| 워크인 | `#F97316` |
| 전화문의 | `#6366F1` |

### 환불 유형 (3종)

| 유형 | 입력 필드 | 사용 시점 |
|------|----------|----------|
| 전체 취소 (full) | 환불 방식 + 처리일 | 결제 직후 전액 환불 |
| 부분 취소 (partial) | 부분 금액 + 방식 + 처리일 | 일부 차감 후 환불 |
| 환불 정산 입금 (deposit) | 정산 비용/결제일/결제방식 + 환불 금액/처리일 | 정산 후 잔액 환불 |

---

## 관련 페이지 링크

- 🔗 [USER-STORY-home.md](./USER-STORY-home.md) — 대시보드 캘린더 (홈)
- 🔗 [USER-STORY-leader.md](./USER-STORY-leader.md) — 리더 팀 출석부
- 🔗 [USER-STORY-member.md](./USER-STORY-member.md) — 멤버 팀 출석부
- 🔗 [USER-STORY-call.md](./USER-STORY-call.md) — 신규 회신 (이전 단계: 회신 → 예약 → 등록)
- 🔗 [USER-STORY-stats.md](./USER-STORY-stats.md) — 지점 전사 KPI 통계
- 🔗 [diagrams/README.md](./diagrams/README.md) — baoyu-diagram SVG 색인
