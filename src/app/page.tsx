import { getAllEntries, getStats } from "@/lib/content";
import EntryBrowser, { type CardData } from "@/components/EntryBrowser";

export default function HomePage() {
  const entries = getAllEntries();
  const stats = getStats();

  const cards: CardData[] = entries.map((e, i) => ({
    ...e,
    body: undefined as never, // 카드엔 본문 불필요
    num: String(i + 1).padStart(2, "0"),
  }));

  return (
    <section>
      <div className="hero">
        <div className="hero-eyebrow">개인 작업 노트 · 프로젝트와 함께 자라는 위키</div>
        <h1>
          LLM과 일하며 배운 것들을
          <br />
          <em>다시 꺼내 쓸 수 있게</em> 정리한다.
        </h1>
        <p className="lede">
          이 위키는 모델을 설명하기 위한 교과서가 아니다. 내가 진행 중인 프로젝트에서 마주친 문제와,
          LLM과의 대화를 통해 도달한 해결, 그리고 아직 풀리지 않은 의문들을 모아두는 노트다.
          각 항목은 무엇을·왜·어떻게 해결했는지, 그리고 무엇이 남았는지를 기록한다.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <b>{stats.total}</b>
            <span>항목</span>
          </div>
          <div className="stat">
            <b>{stats.solved}</b>
            <span>해결됨</span>
          </div>
          <div className="stat">
            <b>{stats.wip}</b>
            <span>진행 중</span>
          </div>
          <div className="stat">
            <b>{stats.open}</b>
            <span>열린 문제</span>
          </div>
        </div>
      </div>

      <EntryBrowser entries={cards} />
    </section>
  );
}
