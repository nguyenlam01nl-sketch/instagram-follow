// src/pages/social.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import LinkModal from "@/components/LinkModal";
import BankQRModal from "@/components/BankQRModal";
import QuickAdviceButton from "@/components/QuickAdviceButton";

type Row = { label: string; value?: string; g30?: string };
type SectionCommon = { title: string };
type SectionFollow = SectionCommon & { kind: "follow"; items: Row[] };
type SectionSimple = SectionCommon & { kind: "simple"; items: Row[] };
type Section = SectionFollow | SectionSimple;

type Platform = {
  key: "instagram" | "tiktok" | "facebook";
  name: string;
  sections: Section[];
  desc?: string;
};

type NeedType = "follow" | "like" | "view" | "comment";

const cn = (...s: Array<string | undefined | false | null>) =>
  s.filter(Boolean).join(" ");

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN").replace(/,/g, ".") + "đ";
}

function multiplyPriceString(input: string, factor = 2.5): string {
  if (!input) return input;

  const sep = input.includes("–") ? "–" : input.includes("-") ? "-" : null;
  const clean = (s: string) => {
    const n = parseInt(s.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? n : 0;
  };

  if (!sep) {
    const num = clean(input);
    return num ? formatVnd(Math.round(num * factor)) : input;
  }

  const [a, b] = input.split(sep);
  const x = clean(a);
  const y = clean(b);
  if (!x || !y) return input;

  return `${formatVnd(Math.round(x * factor))} ${sep} ${formatVnd(
    Math.round(y * factor)
  )}`;
}

function getLinkHint(platform: Platform["key"], need: NeedType) {
  switch (platform) {
    case "instagram":
      if (need === "follow") {
        return {
          placeholder: "https://instagram.com/USERNAME",
          helper: "Ví dụ: https://instagram.com/kimlam • Chỉ cần link profile IG.",
        };
      }
      if (need === "comment") {
        return {
          placeholder: "https://www.instagram.com/p/POST_ID/",
          helper:
            "Bài viết IG: /p/POST_ID • Reel: /reel/REEL_ID • Story: dán link story nếu có.",
        };
      }
      return {
        placeholder: "https://www.instagram.com/p/POST_ID/",
        helper: "Bài viết IG: /p/POST_ID • Reel: /reel/REEL_ID",
      };

    case "facebook":
      if (need === "follow") {
        return {
          placeholder: "https://facebook.com/USERNAME_OR_ID",
          helper:
            "Ví dụ: https://facebook.com/kim.lam.123 hoặc https://facebook.com/1000123456789",
        };
      }
      if (need === "comment") {
        return {
          placeholder: "https://www.facebook.com/USER/posts/POST_ID",
          helper:
            "Bài viết: /posts/POST_ID • Reel: https://www.facebook.com/reel/REEL_ID",
        };
      }
      return {
        placeholder: "https://www.facebook.com/USER/posts/POST_ID",
        helper:
          "Bài viết: /posts/POST_ID • Reel: https://www.facebook.com/reel/REEL_ID",
      };

    case "tiktok":
      if (need === "follow") {
        return {
          placeholder: "https://www.tiktok.com/@USERNAME",
          helper: "Ví dụ: https://www.tiktok.com/@kimlam",
        };
      }
      return {
        placeholder: "https://www.tiktok.com/@USERNAME/video/VIDEO_ID",
        helper:
          "Ví dụ: https://www.tiktok.com/@kimlam/video/7423456789012345678",
      };
  }
}

function inferNeedType(sec: Section, label: string): NeedType {
  if (sec.kind === "follow") return "follow";
  const lower = label.toLowerCase();
  if (lower.includes("comment")) return "comment";
  if (lower.includes("view")) return "view";
  return "like";
}

type Accent = "ig" | "tt" | "fb";

const ACCENTS: Record<
  Accent,
  {
    chip: string;
    glow: string;
    border: string;
    soft: string;
    icon: string;
  }
> = {
  ig: {
    chip: "from-pink-500 via-fuchsia-500 to-violet-500",
    glow: "shadow-[0_16px_50px_rgba(217,70,239,0.18)]",
    border: "border-fuchsia-400/20",
    soft: "bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.20),transparent_35%)]",
    icon: "📸",
  },
  tt: {
    chip: "from-cyan-400 via-sky-500 to-violet-500",
    glow: "shadow-[0_16px_50px_rgba(34,211,238,0.16)]",
    border: "border-cyan-300/20",
    soft: "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_35%)]",
    icon: "🎵",
  },
  fb: {
    chip: "from-blue-500 via-sky-500 to-indigo-500",
    glow: "shadow-[0_16px_50px_rgba(59,130,246,0.16)]",
    border: "border-blue-300/20",
    soft: "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_35%)]",
    icon: "📘",
  },
};

function platformAccent(key: Platform["key"]): Accent {
  if (key === "instagram") return "ig";
  if (key === "tiktok") return "tt";
  return "fb";
}

const IOSGlass = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-2xl",
      "shadow-[0_20px_80px_rgba(0,0,0,0.32)]",
      className
    )}
  >
    {children}
  </div>
);

const PricePill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[12px] sm:text-[13px] font-semibold text-white/90 tabular-nums">
    {children}
  </span>
);

type DuoRow = {
  lLabel: string;
  lPrice: string;
  rLabel?: string;
  rPrice?: string;
};

type DuoBoard = {
  title: string;
  rows: DuoRow[];
};

export default function Social() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingItem, setPendingItem] = useState<{
    label: string;
    price: string;
    placeholder?: string;
    helper?: string;
  } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{
    id: string;
    amount: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleBuy = (
    platform: Platform["key"],
    sec: Section,
    label: string,
    price: string
  ) => {
    const need = inferNeedType(sec, label);
    const { placeholder, helper } = getLinkHint(platform, need);
    setPendingItem({ label, price, placeholder, helper });
    setShowModal(true);
  };

  const handleConfirmLink = async (targetUrl: string) => {
    if (!pendingItem) return;
    const { label, price } = pendingItem;

    try {
      setLoading(true);
      setShowModal(false);

      const cleanPrice = parseInt(price.replace(/\D/g, ""), 10);

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_code: label,
          price_vnd: cleanPrice,
          target_url: targetUrl,
          payment_method: "bank_transfer",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData?.error || "Tạo đơn thất bại");

      setCurrentOrder({ id: orderData.order_id, amount: cleanPrice });
      setShowQR(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
      setPendingItem(null);
    }
  };

  const instagram: Platform = {
    key: "instagram",
    name: "Instagram",
    desc: "Follow / Likes / Views — giao diện gọn kiểu iOS.",
    sections: [
      {
        title: "Follow 🇻🇳",
        kind: "follow",
        items: [
          { label: "500 Follow", g30: "70.000 đ" },
          { label: "1.000 Follow", g30: "140.000 đ" },
          { label: "2.000 Follow", g30: "275.000 đ" },
          { label: "3.000 Follow", g30: "410.000 đ" },
          { label: "4.000 Follow", g30: "540.000 đ" },
          { label: "5.000 Follow", g30: "660.000 đ" },
          { label: "10.000 Follow", g30: "1.250.000 đ" },
        ],
      },
      {
        title: "Follow 🌍",
        kind: "follow",
        items: [
          { label: "500 Follow", g30: "100.000 đ" },
          { label: "1.000 Follow", g30: "190.000 đ" },
          { label: "2.000 Follow", g30: "370.000 đ" },
          { label: "3.000 Follow", g30: "550.000 đ" },
          { label: "4.000 Follow", g30: "730.000 đ" },
          { label: "5.000 Follow", g30: "900.000 đ" },
          { label: "10.000 Follow", g30: "1.700.000 đ" },
        ],
      },
      {
        title: "Likes",
        kind: "simple",
        items: [
          { label: "100 Likes 🇻🇳", value: "10.000 đ" },
          { label: "500 Likes 🇻🇳", value: "45.000 đ" },
          { label: "1.000 Likes 🇻🇳", value: "80.000 đ" },
          { label: "5.000 Likes 🇻🇳", value: "350.000 đ" },
          { label: "200 Likes 🌍", value: "10.000 đ" },
          { label: "2.000 Likes 🌍", value: "80.000 đ" },
        ],
      },
      {
        title: "Views / Comments",
        kind: "simple",
        items: [
          { label: "10 Comments 🇻🇳", value: "15.000 đ" },
          { label: "1.000 View reels 🇻🇳", value: "30.000 đ" },
        ],
      },
    ],
  };

  const facebook: Platform = {
    key: "facebook",
    name: "Facebook",
    desc: "Follow / Likes / Views — card gọn, dễ bấm.",
    sections: [
      {
        title: "Follow",
        kind: "follow",
        items: [
          { label: "500 Follow", g30: "50.000 đ" },
          { label: "1.000 Follow", g30: "100.000 đ" },
          { label: "2.000 Follow", g30: "190.000 đ" },
          { label: "3.000 Follow", g30: "280.000 đ" },
          { label: "4.000 Follow", g30: "370.000 đ" },
          { label: "5.000 Follow", g30: "450.000 đ" },
          { label: "10.000 Follow", g30: "850.000 đ" },
        ],
      },
      {
        title: "Likes",
        kind: "simple",
        items: [
          { label: "100 Likes", value: "10.000 đ" },
          { label: "500 Likes", value: "45.000 đ" },
          { label: "1.000 Likes", value: "80.000 đ" },
          { label: "2.000 Likes", value: "150.000 đ" },
          { label: "5.000 Likes", value: "350.000 đ" },
        ],
      },
      {
        title: "Views / Comments",
        kind: "simple",
        items: [
          { label: "10 Comments", value: "15.000 đ" },
          { label: "1.000 View reels", value: "40.000 đ" },
          { label: "1.000 View story", value: "100.000 đ" },
        ],
      },
    ],
  };

  const tiktok: Platform = {
    key: "tiktok",
    name: "TikTok",
    desc: "Follow / Likes / Views — gọn nhẹ cho mobile.",
    sections: [
      {
        title: "Follow",
        kind: "follow",
        items: [
          { label: "100 Follow", g30: "15.000 đ" },
          { label: "500 Follow", g30: "60.000 đ" },
          { label: "1.000 Follow (Live)", g30: "110.000 đ" },
          { label: "2.000 Follow", g30: "210.000 đ" },
          { label: "3.000 Follow", g30: "300.000 đ" },
          { label: "4.000 Follow", g30: "390.000 đ" },
          { label: "5.000 Follow", g30: "470.000 đ" },
          { label: "10.000 Follow", g30: "800.000 đ" },
        ],
      },
      {
        title: "Views",
        kind: "simple",
        items: [
          { label: "1.000 View video", value: "10.000 đ" },
          { label: "10.000 View video", value: "70.000 đ" },
        ],
      },
      {
        title: "Likes",
        kind: "simple",
        items: [
          { label: "100 Like", value: "10.000 đ" },
          { label: "1.000 Like", value: "80.000 đ" },
        ],
      },
    ],
  };

  const platforms: Platform[] = [instagram, facebook, tiktok];

  const PlatformCard: React.FC<{ pf: Platform }> = ({ pf }) => {
    const accent = platformAccent(pf.key);

    return (
      <IOSGlass
        className={cn(
          "overflow-hidden border",
          ACCENTS[accent].border,
          ACCENTS[accent].glow
        )}
      >
        <div className={cn("relative", ACCENTS[accent].soft)}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]" />
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-2xl text-lg",
                      "bg-gradient-to-br text-white shadow-lg",
                      ACCENTS[accent].chip
                    )}
                  >
                    {ACCENTS[accent].icon}
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {pf.name}
                    </h2>
                    {pf.desc && (
                      <p className="mt-0.5 text-xs sm:text-sm text-white/65">
                        {pf.desc}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                  Pricing
                </div>
                <div className="mt-1 text-[12px] text-white/65">
                  {mounted ? new Date().toLocaleDateString("vi-VN") : ""}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {pf.sections.map((sec, i) => (
                <IOSGlass
                  key={sec.title + i}
                  className="overflow-hidden border border-white/8 bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                    <h3 className="text-sm sm:text-[15px] font-semibold text-white/92">
                      {sec.title}
                    </h3>

                    <span
                      className={cn(
                        "rounded-full bg-gradient-to-r px-2.5 py-1 text-[10px] font-bold text-white",
                        ACCENTS[accent].chip
                      )}
                    >
                      {pf.key.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="space-y-2">
                      {sec.items.map((r) => {
                        const price =
                          sec.kind === "follow" ? r.g30 ?? "—" : r.value ?? "—";

                        return (
                          <div
                            key={r.label}
                            className={cn(
                              "rounded-2xl border border-white/8 bg-white/[0.04]",
                              "px-3 py-3 sm:px-4"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm sm:text-[15px] font-medium leading-5 text-white/92">
                                  {r.label}
                                </p>
                                <p className="mt-1 text-[11px] sm:text-xs text-white/45">
                                  {sec.kind === "follow"
                                    ? "Bảo hành 1 tháng"
                                    : "Dịch vụ"}
                                </p>
                              </div>

                              <div className="shrink-0 flex items-center gap-2 self-center">
                                <PricePill>{price}</PricePill>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </IOSGlass>
              ))}
            </div>
          </div>
        </div>
      </IOSGlass>
    );
  };

  const CODE_FACTOR = 2.5;
  const mult = (s: string) => multiplyPriceString(s, CODE_FACTOR);

  const rawBoardDameAccount: DuoBoard = {
    title: "DAME ACCOUNT",
    rows: [
      {
        lLabel: "Dịch vụ xoá Facebook người khác",
        lPrice: "1.500.000đ",
      },
      {
        lLabel: "Dịch vụ xoá Tiktok người khác",
        lPrice: "1.300.000đ",
      },
    ],
  };

  const boardDameAccount: DuoBoard = {
    title: rawBoardDameAccount.title,
    rows: rawBoardDameAccount.rows.map((r) => ({
      ...r,
      lPrice: mult(r.lPrice),
      rPrice: r.rPrice ? mult(r.rPrice) : undefined,
    })),
  };

 const DuoBoardSection: React.FC<DuoBoard> = ({ title, rows }) => (
  <IOSGlass className="overflow-hidden border border-white/10">
    <div className="border-b border-white/8 px-4 py-4 sm:px-6">
      <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
        {title}
      </h2>
    </div>

    <div className="p-3 sm:p-5">
      <div className="grid grid-cols-1 gap-3">
        {rows.map((r, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/8 bg-white/[0.04] p-4"
          >
            <p className="text-sm sm:text-[15px] font-medium text-white/90">
              {r.lLabel}
            </p>
            <div className="mt-3">
              <PricePill>{r.lPrice}</PricePill>
            </div>
          </div>
        ))}
      </div>
    </div>
  </IOSGlass>
);

  return (
    <>
      <Head>
        <title>hackfollowuytin.inst — Dịch vụ Follow & Bảng giá</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <div className="min-h-screen overflow-x-hidden bg-[#070B14] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_bottom,rgba(99,102,241,0.14),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:22px_22px]" />
          <div className="absolute inset-0 bg-[#070B14]/55" />
        </div>

        <header className="sticky top-0 z-30 border-b border-white/8 bg-black/20 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[16px] bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-violet-500 shadow-[0_12px_30px_rgba(217,70,239,0.25)]" />

              <div className="leading-tight">
                <Link href="/" className="text-sm sm:text-base font-bold tracking-tight text-white">
                  LameaLux
                </Link>
                <div className="text-[11px] text-white/50">
                  Global pricing • Support
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-white/75">
              <Link
                href="/"
                className="rounded-full px-2.5 py-1.5 hover:bg-white/8 hover:text-white transition"
              >
                Deals
              </Link>
              <Link
                href="/social"
                className="rounded-full bg-white/10 px-3 py-1.5 text-white"
              >
                Tăng follow
              </Link>
              <a
                href="tel:0909172556"
                className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-semibold text-white transition hover:bg-white/15"
              >
                0909 172 556
              </a>
            </nav>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8">
          <IOSGlass className="overflow-hidden border border-white/10">
            <div className="relative p-5 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
              <div className="relative">
                <h1 className="text-center text-2xl sm:text-5xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">
                    Bảng giá dịch vụ 💬
                  </span>
                </h1>

                <p className="mt-3 text-center text-sm sm:text-base leading-6 text-white/68">
                  Tự tin gần 10 năm trong lĩnh vực tăng tương tác mạng xã hội
                  <br className="hidden sm:block" />
                  Zalo / Call / SMS: 0909 172 556
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <a
                    href="tel:0909172556"
                    className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Gọi ngay
                  </a>
                </div>
              </div>
            </div>
          </IOSGlass>

          <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
            {platforms.map((pf) => (
              <PlatformCard key={pf.key} pf={pf} />
            ))}
          </div>

          <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
            <DuoBoardSection {...boardDameAccount} />
          </div>

          <section id="advice" className="mt-20" />
          <QuickAdviceButton />

          <footer className="py-10 text-center text-xs text-white/45">
            © {new Date().getFullYear()} hackfollowuytin.inst — Follow Service
          </footer>
        </main>

        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-[360px] -translate-x-1/2 sm:hidden">
          <div className="flex items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-black/30 p-2 backdrop-blur-2xl">
            <Link
              href="/social/demo"
              className="flex-1 rounded-full border border-white/10 bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white"
            >
              Demo →
            </Link>
            <a
              href="tel:0909172556"
              className="flex-1 rounded-full border border-white/10 bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white"
            >
              Gọi ngay
            </a>
          </div>
        </div>
      </div>

      {showModal && (
        <LinkModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmLink}
          placeholder={pendingItem?.placeholder}
          helperText={pendingItem?.helper}
        />
      )}

      {showQR && currentOrder && (
        <BankQRModal
          open={showQR}
          orderId={currentOrder.id}
          amountVnd={currentOrder.amount}
          onClose={() => setShowQR(false)}
          onConfirmed={() => {
            fetch(`/api/orders/${currentOrder.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "paid_pending_verify" }),
            }).catch(() => {});
            setShowQR(false);
          }}
        />
      )}
    </>
  );
}