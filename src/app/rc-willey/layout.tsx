import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RC Willey",
};

export default function RCWilleyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
