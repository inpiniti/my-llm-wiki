# my-llm-wiki

프로젝트를 진행하며 LLM과의 대화로 도달한 **문제·해결·열린 질문·쌓인 지식**을 모아두는 개인 작업 위키.
각 항목은 `content/entries/` 안의 MDX 파일 하나이며, Next.js가 이를 웹으로 렌더링한다.

## Agent 작업 규칙

작업을 시작하기 전에 **이 위키를 먼저 참고한다.**

1. 관련 작업을 시작하기 전, `content/entries/`에서 비슷한 주제의 항목이 있는지 확인한다.
   - 같은 문제를 이미 해결했다면 그 항목의 **해결** 섹션을 따른다.
   - `status: open`(열린 문제)인 항목은 아직 미해결이니, 그 맥락 위에서 작업한다.
2. 작업 중 새로 알게 된 비자명한 문제·해결·교훈이 생기면, 해당 항목을 갱신하거나
   `_TEMPLATE.mdx`를 복사해 새 항목을 만든다.
   - 해결되면 `status`를 `solved`로 바꾼다.
3. 항목 본문에 코드의 *현재 줄 번호/호출자* 같은 휘발성 정보는 적지 않는다 — 원인과 교훈을 적는다.

## 구조

```
content/entries/*.mdx     항목 = 파일 하나. 단일 진실 공급원 (사람·agent 공용)
content/entries/_TEMPLATE.mdx   새 항목 템플릿 ('_' 시작 파일은 목록에서 제외)
src/lib/content.ts        MDX frontmatter를 읽어 목록/통계 생성
src/app/page.tsx          홈 (히어로 + 필터 + 카드 그리드)
src/app/entry/[slug]/     항목 상세 (MDX 렌더)
src/components/mdx.tsx     본문용 커스텀 컴포넌트 (Callout, Sidenote)
```

## frontmatter 스키마

| 필드 | 필수 | 값 |
|------|------|-----|
| `title` | ✓ | 항목 제목 |
| `tldr` | ✓ | 한두 문장 요약 (카드/헤더 노출) |
| `status` | ✓ | `solved` \| `wip` \| `open` |
| `difficulty` | ✓ | `1` \| `2` \| `3` (초·중·고급) |
| `tags` | ✓ | 문자열 배열 |
| `project` | | 관련 프로젝트 |
| `date` | | 발견/작성일 (YYYY-MM-DD) |
| `impact` | | 영향 한 줄 |
| `decision` | | 최종 결정 한 줄 |
| `related` | | 연결 항목 slug 배열 |
| `order` | | 정렬·번호 우선값 (없으면 date 최신순) |

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 정적 생성 (각 항목 페이지 prerender)
```
