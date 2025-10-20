// src/pages/social/demo.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

type Item = { id: string; user: string; ago: string };

const DEFAULT_BG =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop";
const DEFAULT_BRAND = "Instagram";

let _id = 0;
const nextId = () => `${Date.now()}_${_id++}`;

const USERS = [
  "tangfollowviet.ig",
  "tangfollowviet1.ig",
  "tangfollowviet2.ig",
  "tangfollowviet3.ig",
  "tangfollowviet4.ig",
  "tangfollowviet5.ig",
  "tangfollowviet6.ig",
  "tangfollowviet7.ig",
  "tangfollowviet8.ig",
  "tangfollowviet9.ig",
];
const makeItem = (): Item => ({ id: nextId(), user: USERS[Math.floor(Math.random()*USERS.length)], ago: "bây giờ" });

/** Instagram App Icon — bo cong + gradient giống bản gốc hơn */
const InstagramIcon = () => (
  <svg
    viewBox="0 0 100 100"
    aria-hidden="true"
    className="h-11 w-11 shrink-0"
    role="img"
  >
    <defs>
      {/* nền gradient kiểu app icon */}
      <radialGradient id="igRad" cx="65%" cy="15%" r="85%">
        <stop offset="0%" stopColor="#FFF17A" />
        <stop offset="20%" stopColor="#F58529" />
        <stop offset="55%" stopColor="#DD2A7B" />
        <stop offset="85%" stopColor="#8134AF" />
        <stop offset="100%" stopColor="#515BD4" />
      </radialGradient>
      <linearGradient id="igSheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      {/* squircle mask cho icon iOS */}
      <clipPath id="igSquircle">
        <path
          d="M18 0h64c9.9 0 18 8.1 18 18v64c0 9.9-8.1 18-18 18H18C8.1 100 0 91.9 0 82V18C0 8.1 8.1 0 18 0Z"
          // bo cong mềm hơn hình vuông rx
        />
      </clipPath>
    </defs>

    <g clipPath="url(#igSquircle)">
      <rect x="0" y="0" width="100" height="100" fill="url(#igRad)" />
      <rect x="0" y="0" width="100" height="55" fill="url(#igSheen)" />
    </g>

    {/* camera glyph trắng */}
    <g transform="translate(0.5,0.5)">
      <rect
        x="22"
        y="22"
        width="56"
        height="56"
        rx="18"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
      />
      <circle cx="50" cy="50" r="14" fill="none" stroke="#fff" strokeWidth="6" />
      <circle cx="66.5" cy="33.5" r="4.5" fill="#fff" />
    </g>
  </svg>
);

export default function DemoIOSNotificationCenter() {
  const router = useRouter();
  const brand = useMemo(() => {
    const q = router.query.brand;
    return typeof q === "string" && q.trim() ? q.trim() : DEFAULT_BRAND;
  }, [router.query.brand]);

  const bgUrl = useMemo(() => {
    const q = router.query.bg;
    return typeof q === "string" && q.startsWith("http") ? q : DEFAULT_BG;
  }, [router.query.bg]);

  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = window.setInterval(() => {
      setItems((prev) => [makeItem(), ...prev].slice(0, 25));
    }, 1200);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [running]);

  const addOnce = () => setItems((p) => [makeItem(), ...p].slice(0, 25));
  const resetAll = () => setItems([]);

  /** Row: card cao bằng nhau + căn giữa */
  const Row = ({ it }: { it: Item }) => (
    <div className="h-20 px-3 rounded-3xl bg-white/55 dark:bg-slate-900/70 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <InstagramIcon />
        <div className="leading-tight min-w-0">
          {/* dòng 1 */}
          <p className="text-[13px] sm:text-sm text-white font-semibold opacity-90">
            Người mới theo dõi
          </p>
          {/* dòng 2 */}
          <p className="mt-0.5 text-[13px] sm:text-sm text-white truncate">
            <span className="opacity-95">@{it.user}</span>{" "}
            <span className="opacity-90">đã bắt đầu theo dõi bạn.</span>
          </p>
        </div>
      </div>
      <div className="ml-3 text-[11px] sm:text-xs text-white/90 whitespace-nowrap">
        {it.ago}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{brand} — iOS Notifications (demo)</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-black">
        {/* iPhone khung */}
        <div
          className="relative w-96 rounded-3xl border-8 border-black bg-black overflow-hidden shadow-2xl"
          style={{ height: 720 }}
        >
          {/* BG */}
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url("${bgUrl}")`, filter: "blur(2px)" }}
          />
          <div className="absolute inset-0 bg-black/50" />

          {/* Dynamic island giả lập */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3 z-20">
            <div className="h-10 w-40 rounded-full bg-black/90 border border-black/50 shadow-inner flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[11px] text-white/80 font-medium">
                  {/* CN, 19 thg 10 */}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-black/60 ring-1 ring-white/10 block" />
                <span className="h-3 w-3 rounded-full bg-black/60 ring-1 ring-white/10 block" />
              </div>
            </div>
          </div>

          {/* Header list */}
          <div className="absolute inset-x-0 top-16 px-3 z-10">
            <div className="flex items-center justify-between text-white/90 px-1">
              <div className="text-white font-semibold">Instagram</div>
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/15 ring-1 ring-white/15 hover:bg-white/20"
                  title="Ẩn bớt"
                >
                  <span className="text-lg leading-none">⌄</span>
                  <span className="text-sm">Ẩn bớt</span>
                </button>
                <button
                  className="h-8 w-8 rounded-full bg-white/15 ring-1 ring-white/15 hover:bg-white/25 text-lg leading-none"
                  onClick={resetAll}
                  title="Xoá"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="absolute inset-x-0 top-24 bottom-0 px-3 pb-4 overflow-auto">
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="mt-3 text-center text-white/80 text-sm">
                  Chưa có thông báo. Dùng nút bên dưới để mô phỏng.
                </div>
              ) : (
                items.map((it) => <Row key={it.id} it={it} />)
              )}
            </div>

            {/* controls */}
            <div className="mt-4 rounded-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/10 p-3 text-center sticky bottom-0">
              <p className="text-white/90 text-sm">{brand} Notifications (demo)</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setRunning((v) => !v)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white text-slate-900 hover:opacity-90 transition"
                >
                  {running ? "Dừng" : "Bắt đầu"}
                </button>
                <button
                  onClick={resetAll}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 text-white ring-1 ring-white/20 hover:bg-white/25 transition"
                >
                  Reset
                </button>
                <button
                  onClick={addOnce}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-400 text-slate-900 hover:brightness-95 transition"
                >
                  Thêm 1 thông báo
                </button>
              </div>
            </div>
          </div>

          {/* side buttons */}
          <div className="absolute -left-2 top-28 h-10 w-1.5 rounded-r bg-black/80" />
          <div className="absolute -left-2 top-40 h-7 w-1.5 rounded-r bg-black/80" />
          <div className="absolute -right-2 top-36 h-16 w-1.5 rounded-l bg-black/80" />
        </div>
      </div>

      {/* back link */}
      <div className="fixed top-3 left-3">
        <Link
          href="/social/social"
          className="rounded-xl px-3 py-1.5 text-sm font-medium bg-white/80 backdrop-blur ring-1 ring-black/10 hover:opacity-90 transition"
        >
          ← Quay lại bảng giá
        </Link>
      </div>
    </>
  );
}
