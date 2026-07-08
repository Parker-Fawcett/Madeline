import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memories",
};

export default function MemoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
