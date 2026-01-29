// src/components/admin/AdminShell.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string; icon?: string };

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: "📊" },
  { href: "/admin/shopee-links", label: "Quản lý link Shopee", icon: "🛒" },
  { href: "/admin/deals", label: "Deals", icon: "🏷️" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "🧾" },
  { href: "/admin/settings", label: "Cài đặt", icon: "⚙️" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.events]);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0b0f1a]/80 backdrop-blur">
        <div className="h-14 px-4 flex items-center gap-2 border-b border-white/10">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600" />
          <span className="font-bold">            hackfollowuytin.inst</span>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((it) => {
            const active = router.pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition",
                  active ? "bg-white text-slate-900" : "text-white/80 hover:bg-white/10",
                ].join(" ")}
              >
                <span className="text-lg leading-none">{it.icon}</span>
                <span className="text-sm font-medium">{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("adminAuth");
              router.push("/");
            }}
            className="w-full text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Drawer mobile */}
      <div className="md:hidden">
        {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />}
        <aside
          className={[
            "fixed z-50 top-0 left-0 h-full w-72 bg-[#0b0f1a] border-r border-white/10 transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="h-14 px-4 flex items-center gap-2 border-b border-white/10">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600" />
            <span className="font-bold">            hackfollowuytin.inst
</span>
          </div>
          <nav className="p-3 space-y-1">
            {NAV.map((it) => {
              const active = router.pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={[
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition",
                    active ? "bg-white text-slate-900" : "text-white/80 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="text-lg leading-none">{it.icon}</span>
                  <span className="text-sm font-medium">{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between border-b border-white/10 bg-[#0b0f1a]/70 backdrop-blur px-3 md:px-5">
          <button
            type="button"
            className="md:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10"
            onClick={() => setOpen((v) => !v)}
          >
            <span>☰</span>
            <span className="text-sm">Menu</span>
          </button>
          <div className="hidden md:block text-sm text-white/70">
            {NAV.find((n) => router.pathname.startsWith(n.href))?.label || ""}
          </div>
          <Link className="text-xs px-2 py-1 rounded bg-white text-slate-900" href="/social" target="_blank">
            Social page
          </Link>
        </header>

        <main className="relative z-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
