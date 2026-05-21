import type { ReactNode } from "react";

export function Callout({
  label = "노트",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="callout">
      <div className="callout-label">{label}</div>
      <div className="callout-body">{children}</div>
    </div>
  );
}

export function Sidenote({ children }: { children: ReactNode }) {
  return <div className="sidenote">{children}</div>;
}

export const mdxComponents = {
  Callout,
  Sidenote,
};
