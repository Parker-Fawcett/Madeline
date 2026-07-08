import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "One More Thing",
};

export default function RevealLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
