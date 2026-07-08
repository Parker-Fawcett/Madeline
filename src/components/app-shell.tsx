"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUnlocked } from "@/lib/storage";
import { NavBar } from "./nav-bar";
import { PageTransition } from "./page-transition";

const fullscreenRoutes = ["/home"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/";
  const isFullscreen = fullscreenRoutes.includes(pathname);

  useEffect(() => {
    if (isLoginPage) return;
    if (!getUnlocked()) {
      router.replace("/");
    }
  }, [isLoginPage, router]);

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div
      className="mx-auto min-h-screen max-w-lg px-4"
      style={{
        paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <PageTransition>{children}</PageTransition>
      {!isLoginPage && <NavBar />}
    </div>
  );
}
