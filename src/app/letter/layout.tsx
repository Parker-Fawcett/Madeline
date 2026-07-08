import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Letter",
};

export default function LetterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
