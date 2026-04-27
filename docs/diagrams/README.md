# 다이어그램 (baoyu-diagram SVG)

> `baoyu-diagram` 스킬로 생성한 다크 테마 SVG 다이어그램 모음
> USER-STORY-{page}.md 문서에서 임베드되어 사용됩니다.

## 목록

| 파일 | 페이지 | 시나리오 | 다이어그램 타입 |
|------|--------|---------|---------------|
| [home-a2-leader-board-flow.svg](./home-a2-leader-board-flow.svg) | `home.html` | A-2 리더 현황 상세 확인 | Flowchart |
| [leader-b2-substitute-workflow.svg](./leader-b2-substitute-workflow.svg) | `leader.html` | B-2 불참→대타 배정 ⭐ | Sequence Diagram |
| [member-c2-check-alert-decomposition.svg](./member-c2-check-alert-decomposition.svg) | `member.html` | C-2 CHECK 알림 분류 + 대응 ⭐ | Structural / Decomposition |

⭐ = 페이지 핵심 워크플로우

## 디자인 시스템

- **배경:** `#0f172a` (slate-900) + 미세 그리드
- **타이포:** JetBrains Mono + Noto Sans KR (한글)
- **색상 의미:**
  - 보라(`#a78bfa`) = Actor (사람)
  - 시안(`#22d3ee`) = UI 컴포넌트 (Process)
  - 파랑(`#60a5fa`) = Highlight / Start-End
  - 에메랄드(`#34d399`) = System / Success / Resolve
  - 앰버(`#fbbf24`) = Decision / Note / Root
  - 주황(`#fb923c`) = External (외부 액터)
  - 로즈(`#fb7185`) = Alert / 분기 (No path)

## Mermaid vs baoyu-diagram

각 USER-STORY 문서에는 **두 가지 시각화**가 함께 제공됩니다:

| 종류 | 테마 | 용도 |
|------|------|------|
| **Mermaid (인라인)** | 라이트 (자동) | 마크다운 내장, 유지보수 용이, GitHub/IDE 자동 렌더링 |
| **baoyu-diagram SVG** | 다크 | 발표·인쇄·공유용 임팩트 있는 비주얼, 한 장 요약 |

## 재생성 방법

`baoyu-diagram` 스킬을 호출하여 동일한 사양으로 재생성할 수 있습니다.
다이어그램 사양은 USER-STORY-{page}.md의 해당 시나리오에 텍스트로 정의되어 있습니다.

## 관련 문서

- [USER-STORY-home.md](../USER-STORY-home.md)
- [USER-STORY-leader.md](../USER-STORY-leader.md)
- [USER-STORY-member.md](../USER-STORY-member.md)
- [USER-SCENARIOS.md](../USER-SCENARIOS.md)
