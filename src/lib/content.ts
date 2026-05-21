import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Status = "solved" | "wip" | "open";
export type Difficulty = 1 | 2 | 3;

export interface EntryMeta {
  slug: string;
  title: string;
  tldr: string;
  status: Status;
  difficulty: Difficulty;
  tags: string[];
  project?: string;
  /** 발견 시점 / 작성일 */
  date?: string;
  /** 영향 */
  impact?: string;
  /** 최종 결정 */
  decision?: string;
  /** 연결된 항목 (slug 배열) */
  related?: string[];
  /** 정렬·표시용 번호. 없으면 날짜순 인덱스로 자동 부여 */
  order?: number;
}

export interface Entry extends EntryMeta {
  /** raw MDX 본문 (frontmatter 제거됨) */
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "entries");

const STATUS_LABEL: Record<Status, string> = {
  solved: "해결됨",
  wip: "진행 중",
  open: "열린 문제",
};

const DIFF_LABEL: Record<Difficulty, string> = {
  1: "초급",
  2: "중급",
  3: "고급",
};

export function statusLabel(s: Status): string {
  return STATUS_LABEL[s] ?? s;
}

export function difficultyLabel(d: Difficulty): string {
  return DIFF_LABEL[d] ?? String(d);
}

function listFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));
}

/** YAML이 무인용 날짜를 Date로 파싱하는 경우가 있어 문자열로 정규화 */
function toDateString(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/**
 * gray-matter가 YAML 예외를 던지면 (예: 인용 없는 값에 `콜론 ` 포함) 빌드 전체가
 * 죽는다. 그걸 막기 위한 관용 파서. 우리 frontmatter는 한 줄 `key: value` 형식이라
 * 줄 단위로 느슨하게 파싱한다.
 */
function parseFrontmatterLenient(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };
  const [, fm, content] = m;
  const data: Record<string, unknown> = {};
  for (const line of fm.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const ci = line.indexOf(":");
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim();
    if (!key) continue;
    const unquote = (s: string) => s.replace(/^["']|["']$/g, "");
    const rawVal = line.slice(ci + 1).trim();
    if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
      const inner = rawVal.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(",").map((s) => unquote(s.trim()))
        : [];
    } else {
      const v = unquote(rawVal);
      data[key] = /^\d+$/.test(v) ? Number(v) : v;
    }
  }
  return { data, content };
}

function parseFile(file: string): Entry {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
  // gray-matter의 data는 any. 관용 파서 폴백과 호환되도록 동일하게 둔다.
  let data: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data;
    content = parsed.content;
  } catch (err) {
    console.warn(
      `[content] frontmatter 파싱 실패 → 관용 파서로 폴백: ${file}`,
      (err as Error).message
    );
    const parsed = parseFrontmatterLenient(raw);
    data = parsed.data;
    content = parsed.content;
  }
  return {
    slug,
    title: data.title ?? slug,
    tldr: data.tldr ?? "",
    status: (data.status ?? "open") as Status,
    difficulty: (data.difficulty ?? 2) as Difficulty,
    tags: data.tags ?? [],
    project: data.project,
    date: toDateString(data.date),
    impact: data.impact,
    decision: data.decision,
    related: data.related ?? [],
    order: data.order,
    body: content,
  };
}

let cache: Entry[] | null = null;

export function getAllEntries(): Entry[] {
  if (cache) return cache;
  const entries = listFiles().map(parseFile);
  // order가 있으면 우선, 없으면 date 내림차순(최신 우선)
  entries.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    return (b.date ?? "").localeCompare(a.date ?? "");
  });
  cache = entries;
  return entries;
}

export function getEntry(slug: string): Entry | undefined {
  return getAllEntries().find((e) => e.slug === slug);
}

export function getEntryNumber(slug: string): string {
  const all = getAllEntries();
  const idx = all.findIndex((e) => e.slug === slug);
  return String(idx + 1).padStart(2, "0");
}

export interface Stats {
  total: number;
  solved: number;
  wip: number;
  open: number;
}

export function getStats(): Stats {
  const all = getAllEntries();
  return {
    total: all.length,
    solved: all.filter((e) => e.status === "solved").length,
    wip: all.filter((e) => e.status === "wip").length,
    open: all.filter((e) => e.status === "open").length,
  };
}
