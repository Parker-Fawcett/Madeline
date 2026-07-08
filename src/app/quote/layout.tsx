import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Something You Say",
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
