# my-llm-wiki

**프로젝트를 진행하며 LLM과의 대화로 도달한 문제·해결·열린 질문·쌓인 지식을 모아두는 개인 작업 위키.**

각 항목은 `content/entries/` 안의 MDX 파일 하나이며, Next.js가 이를 웹으로 렌더링한다.
모든 프로젝트에서 참고할 수 있도록 설계됐으며, 루트 규칙은 [C:\Users\USER\.claude\CLAUDE.md](../../.claude/CLAUDE.md)를 따른다.

## Agent 작업 규칙

**루트 규칙 참고:** [C:\Users\USER\.claude\CLAUDE.md](../../.claude/CLAUDE.md) → "Agent 작업 흐름"

요약:
1. **작업 시작 전** — 이 위키의 `content/entries/`에서 비슷한 항목 찾기
2. **작업 중** — 새로운 문제·해결·교훈이 생기면 항목 추가/갱신
3. **작업 완료 후** — 위키 변경사항 커밋 및 푸시 (Vercel이 자동 배포)

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
