import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Galeries" };

export default function SegmentLayout({ children }: { children: ReactNode }) {
  return children;
}
