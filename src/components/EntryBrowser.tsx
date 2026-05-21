"use client";

import { useState } from "react";
import Link from "next/link";
import type { EntryMeta, Difficulty, Status } from "@/lib/content";

export interface CardData extends EntryMeta {
  num: string;
}

type DiffFilter = "all" | "1" | "2" | "3";
type StatusFilter = "all" | Status;

const STATUS_TEXT: Record<Status, string> = {
  solved: "해결됨",
  wip: "진행 중",
  open: "열린 문제",
};
const DIFF_TEXT: Record<Difficulty, string> = { 1: "초급", 2: "중급", 3: "고급" };

export default function EntryBrowser({ entries }: { entries: CardData[] }) {
  const [diff, setDiff] = useState<DiffFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const diffCount = (d: Difficulty) => entries.filter((e) => e.difficulty === d).length;

  const visible = entries.filter((e) => {
    const matchDiff = diff === "all" || String(e.difficulty) === diff;
    const matchStatus = status === "all" || e.status === status;
    return matchDiff && matchStatus;
  });

  return (
    <>
      <div className="filters">
        <span className="filters-label">난이도</span>
        {(["all", "1", "2", "3"] as DiffFilter[]).map((d) => (
          <button
            key={d}
            className={`chip${diff === d ? " is-active" : ""}`}
            onClick={() => setDiff(d)}
          >
            {d === "all" ? "전체" : DIFF_TEXT[Number(d) as Difficulty]}{" "}
            <span className="count">
              {d === "all" ? entries.length : diffCount(Number(d) as Difficulty)}
            </span>
          </button>
        ))}

        <span className="filters-label" style={{ marginLeft: 18 }}>
          상태
        </span>
        {(["all", "solved", "wip", "open"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            className={`chip${status === s ? " is-active" : ""}`}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "전체" : STATUS_TEXT[s as Status]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">조건에 맞는 항목이 없습니다.</div>
      ) : (
        <div className="card-grid">
          {visible.map((e) => (
            <Link
              key={e.slug}
              className="card"
              href={`/entry/${e.slug}`}
            >
              <div className="card-head">
                <span className="card-num">№ {e.num}</span>
                <span className={`diff diff-${e.difficulty}`}>
                  {DIFF_TEXT[e.difficulty]}
                </span>
              </div>
              <h3 className="card-title">{e.title}</h3>
              <p className="card-tldr">{e.tldr}</p>
              <div className="card-foot">
                <div className="card-tags">
                  {e.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <span className={`status-dot status-${e.status}`}>
                  {STATUS_TEXT[e.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
