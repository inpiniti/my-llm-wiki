import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { getStats } from "@/lib/content";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--ff-serif",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--ff-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LLM 위키 — 프로젝트 작업 노트",
  description:
    "프로젝트를 진행하며 LLM과의 대화로 도달한 문제·해결·열린 질문·쌓인 지식을 모아두는 개인 작업 노트.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stats = getStats();
  return (
    <html lang="ko" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <header className="site-nav">
          <div className="site-nav-inner">
            <Link href="/" className="brand">
              <span className="mark">LLM 위키</span>
              <span className="mark-sub">a working notebook</span>
            </Link>
            <div className="nav-meta">
              <span>
                <b>{stats.total}</b> 항목
              </span>
              <span>
                v.<b>0.1</b>
              </span>
              <span>2026.05</span>
            </div>
          </div>
        </header>
        <main id="app">{children}</main>
      </body>
    </html>
  );
}
