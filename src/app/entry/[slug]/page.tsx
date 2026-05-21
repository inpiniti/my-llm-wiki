import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import {
  getAllEntries,
  getEntry,
  difficultyLabel,
  statusLabel,
} from "@/lib/content";
import { mdxComponents } from "@/components/mdx";

export function generateStaticParams() {
  return getAllEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  return { title: `${entry.title} — LLM 위키`, description: entry.tldr };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const all = getAllEntries();
  const idx = all.findIndex((e) => e.slug === slug);
  const num = String(idx + 1).padStart(2, "0");
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const related = (entry.related ?? [])
    .map((s) => all.find((e) => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <article>
      <div className="entry">
        <Link href="/" className="entry-back">
          전체 목록으로
        </Link>

        <header className="entry-head">
          <div className="entry-meta-top">
            <span>№ {num}</span>
            <span className={`diff diff-${entry.difficulty}`}>
              {difficultyLabel(entry.difficulty)}
            </span>
            <span className={`status-dot status-${entry.status}`}>
              {statusLabel(entry.status)}
            </span>
          </div>
          <h1>{entry.title}</h1>
          {entry.tldr && <p className="entry-tldr">{entry.tldr}</p>}

          <div className="entry-meta-grid">
            {entry.project && (
              <div>
                <span className="label">관련 프로젝트</span>
                <span className="value">{entry.project}</span>
              </div>
            )}
            {entry.date && (
              <div>
                <span className="label">시점</span>
                <span className="value">{entry.date}</span>
              </div>
            )}
            {entry.impact && (
              <div>
                <span className="label">영향</span>
                <span className="value">{entry.impact}</span>
              </div>
            )}
            {entry.decision && (
              <div>
                <span className="label">최종 결정</span>
                <span className="value">{entry.decision}</span>
              </div>
            )}
          </div>
        </header>

        <div className="entry-body">
          <MDXRemote
            source={entry.body}
            components={mdxComponents}
            options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
          />

          {related.length > 0 && (
            <div className="entry-footer">
              <div>
                <h4>연결된 항목</h4>
                <ul>
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/entry/${r.slug}`}>{r.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <nav className="entry-nav">
            {prev ? (
              <Link href={`/entry/${prev.slug}`} className="prev">
                <span className="label">← 이전</span>
                {prev.title}
              </Link>
            ) : (
              <Link href="/" className="prev">
                <span className="label">← 목록으로</span>
                전체 위키
              </Link>
            )}
            {next && (
              <Link href={`/entry/${next.slug}`} className="next">
                <span className="label">다음 →</span>
                {next.title}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </article>
  );
}
