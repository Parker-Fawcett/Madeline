import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Started",
};

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
