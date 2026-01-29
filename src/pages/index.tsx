// src/pages/social.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import LinkModal from "@/components/LinkModal";
import BankQRModal from "@/components/BankQRModal";
import QuickAdviceButton from "@/components/QuickAdviceButton";

type Row = { label: string; value?: string; g7?: string; g30?: string };
type SectionCommon = { title: string };
type SectionFollowVN = SectionCommon & { kind: "follow_vn"; items: Row[] };
type SectionFollowGL = SectionCommon & { kind: "follow_global"; items: Row[] };
type SectionSimple = SectionCommon & { kind: "simple"; items: Row[] };
type Section = SectionFollowVN | SectionFollowGL | SectionSimple;

type Platform = {
  key: "instagram" | "tiktok" | "facebook";
  name: string;
  sections: Section[];
  desc?: string;
};

// ========= Helpers (bảng giá ×2.5) =========
function formatVnd(n: number) {
  return n.toLocaleString("vi-VN").replace(/,/g, ".") + "đ";
}
/** Nhân chuỗi giá (kể cả khoảng giá a – b). Nếu không có số (VD: "Thương Lượng") thì giữ nguyên. */
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
  const x = clean(a),
    y = clean(b);
  if (!x || !y) return input;
  return `${formatVnd(Math.round(x * factor))} ${sep} ${formatVnd(
    Math.round(y * factor)
  )}`;
}

// ========= Link hints =========
type NeedType = "follow" | "like" | "view" | "comment";

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
  if (sec.kind === "follow_vn" || sec.kind === "follow_global") return "follow";
  const lower = label.toLowerCase();
  if (lower.includes("comment")) return "comment";
  if (lower.includes("view")) return "view";
  return "like";
}

// ===========================
// UI helpers (Global, clean)
// ===========================
const cn = (...s: Array<string | undefined | false | null>) =>
  s.filter(Boolean).join(" ");

type Accent = "ig" | "tt" | "fb";
const ACCENTS: Record<
  Accent,
  { grad: string; ring: string; glow: string; badge: string }
> = {
  ig: {
    grad: "from-pink-500 via-fuchsia-500 to-violet-500",
    ring: "ring-fuchsia-500/25",
    glow: "shadow-[0_0_40px_rgba(217,70,239,0.18)]",
    badge: "bg-fuchsia-500/10 ring-fuchsia-500/20 text-fuchsia-200",
  },
  tt: {
    grad: "from-cyan-400 via-sky-500 to-violet-500",
    ring: "ring-cyan-400/25",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.16)]",
    badge: "bg-cyan-400/10 ring-cyan-400/20 text-cyan-100",
  },
  fb: {
    grad: "from-blue-500 via-sky-500 to-indigo-500",
    ring: "ring-blue-500/25",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.16)]",
    badge: "bg-blue-500/10 ring-blue-500/20 text-blue-100",
  },
};

function platformAccent(key: Platform["key"]): Accent {
  if (key === "instagram") return "ig";
  if (key === "tiktok") return "tt";
  return "fb";
}

const Surface = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-3xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-xl",
      "shadow-[0_25px_70px_rgba(0,0,0,0.35)]",
      className
    )}
  >
    {children}
  </div>
);

const AnimatedBorder = ({
  accent,
  children,
  className,
}: {
  accent: Accent;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("relative rounded-3xl p-[1px]", className)}>
    <div
      className={cn(
        "absolute inset-0 rounded-3xl opacity-90 animate-borderSpinSlow",
        `bg-gradient-to-r ${ACCENTS[accent].grad}`
      )}
      style={{ filter: "blur(18px)" }}
    />
    <div className="relative rounded-3xl bg-[#0B1020]/85 ring-1 ring-white/10">
      {children}
    </div>
  </div>
);

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
  const [currentOrder, setCurrentOrder] = useState<{ id: string; amount: number } | null>(null);
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

  // ===========================
  // 🟣 DATA — 3 bảng đầu (IG / TikTok / FB) ✅ GIỮ NGUYÊN CHỮ
  // ===========================
  const instagram: Platform = {
    key: "instagram",
    name: "Instagram 📸",
    desc: "Follow / Likes / Views — BH 7 ngày hoặc 1 tháng.",
    sections: [
      {
        title: "Follow 🇻🇳",
        kind: "follow_vn",
        items: [
          { label: "500 Follow", g7: "50.000 đ", g30: "70.000 đ" },
          { label: "1.000 Follow", g7: "100.000 đ", g30: "140.000 đ" },
          { label: "2.000 Follow", g7: "190.000 đ", g30: "275.000 đ" },
          { label: "3.000 Follow", g7: "280.000 đ", g30: "410.000 đ" },
          { label: "4.000 Follow", g7: "370.000 đ", g30: "540.000 đ" },
          { label: "5.000 Follow", g7: "460.000 đ", g30: "660.000 đ" },
          { label: "10.000 Follow", g7: "900.000 đ", g30: "1.250.000 đ" },
        ],
      },
      {
        title: "Follow 🌍",
        kind: "follow_global",
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

  const tiktok: Platform = {
    key: "tiktok",
    name: "TikTok 🎵",
    desc: "Follow / Likes / Views — tách rõ, dễ chọn.",
    sections: [
      {
        title: "Follow",
        kind: "follow_global",
        items: [
          { label: "100 Follow", value: "15.000 đ" },
          { label: "500 Follow", value: "60.000 đ" },
          { label: "1.000 Follow (Live)", value: "110.000 đ" },
          { label: "2.000 Follow", value: "210.000 đ" },
          { label: "3.000 Follow", value: "300.000 đ" },
          { label: "4.000 Follow", value: "390.000 đ" },
          { label: "5.000 Follow", value: "470.000 đ" },
          { label: "10.000 Follow", value: "800.000 đ" },
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

  const facebook: Platform = {
    key: "facebook",
    name: "Facebook 📘",
    sections: [
      {
        title: "Follow",
        kind: "follow_global",
        items: [
          { label: "500 Follow", value: "50.000 đ" },
          { label: "1.000 Follow", value: "100.000 đ" },
          { label: "2.000 Follow", value: "190.000 đ" },
          { label: "3.000 Follow", value: "280.000 đ" },
          { label: "4.000 Follow", value: "370.000 đ" },
          { label: "5.000 Follow", value: "450.000 đ" },
          { label: "10.000 Follow", value: "850.000 đ" },
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

  // ✅ Order theo bé Kim muốn: IG -> FB -> TikTok
  const platforms: Platform[] = [instagram, facebook, tiktok];

  // ===========================
  // Buttons
  // ===========================
  const ActionBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button
      {...props}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-xl",
        "px-3 py-1.5 text-[12px] sm:text-[13px] font-semibold",
        "bg-white/10 hover:bg-white/15 ring-1 ring-white/15",
        "transition-all duration-200 active:scale-[0.98] disabled:opacity-60",
        "overflow-hidden",
        props.className
      )}
    >
      <span className="relative z-10">Order</span>
      <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] animate-shimmer" />
    </button>
  );

  // ===========================
  // Platform Card (full-width, stacked)
  // ===========================
  const Card: React.FC<{ pf: Platform }> = ({ pf }) => {
    const accent = platformAccent(pf.key);
    return (
      <AnimatedBorder accent={accent} className={cn(ACCENTS[accent].glow, "reveal")}>
        <div className="rounded-3xl overflow-hidden">
          {/* header */}
          <div className="relative px-5 sm:px-7 py-6 border-b border-white/10">
            <div className={cn("absolute inset-0 opacity-70 bg-gradient-to-r", ACCENTS[accent].grad)} />
            <div className="absolute inset-0 bg-[#0B1020]/70" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {pf.name}
                </h2>
                {pf.desc && <p className="mt-1 text-sm sm:text-base text-white/70">{pf.desc}</p>}
              </div>

              <div className="text-right">
                <div className="text-xs sm:text-sm font-semibold text-white/70">Pricing</div>
                <div className="text-xs sm:text-sm text-white/50">
                  {mounted ? new Date().toLocaleDateString("vi-VN") : ""}
                </div>
              </div>
            </div>
          </div>

          {/* sections */}
          <div className="p-4 sm:p-6 md:p-7">
            {/* ✅ giống kiểu của bé: trong 1 platform, các bảng con nằm ngang (2 cột) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {pf.sections.map((sec, i) => (
                <article
                  key={sec.title + i}
                  className={cn(
                    "rounded-2xl overflow-hidden bg-white/[0.04] ring-1 ring-white/10",
                    "hover:bg-white/[0.06] transition-colors"
                  )}
                >
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base tracking-tight text-white/90">
                      {sec.title}
                    </h3>
                    <span
                      className={cn(
                        "text-[11px] font-semibold rounded-full px-2.5 py-1 ring-1",
                        ACCENTS[accent].badge
                      )}
                    >
                      {pf.key.toUpperCase()}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    {/* FOLLOW VN */}
                    {sec.kind === "follow_vn" && (
                      <table className="w-full text-[13px] sm:text-sm tabular-nums border-collapse min-w-[460px]">
                        <thead className="bg-white/5 font-semibold text-white/75 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3 text-left">Follow</th>
                            <th className="py-2.5 px-3 text-right">BH 7 ngày</th>
                            <th className="py-2.5 px-3 text-right">BH 1 tháng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sec.items.map((r, idx) => (
                            <tr
                              key={r.label}
                              className={cn(
                                "border-b last:border-0 border-white/10",
                                idx % 2 ? "bg-white/[0.02]" : "",
                                "hover:bg-white/[0.05] transition-colors"
                              )}
                            >
                              <td className="py-2.5 px-3 align-middle font-medium text-white/90">
                                {r.label}
                              </td>
                              <td className="py-2.5 px-3 text-right align-middle">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="whitespace-nowrap text-white/80">{r.g7 ?? "–"}</span>
                                  {/* {r.g7 && (
                                    <ActionBtn
                                      onClick={() => handleBuy(pf.key, sec, r.label + " BH7", r.g7!)}
                                      disabled={loading}
                                    />
                                  )} */}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right align-middle">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="whitespace-nowrap text-white/80">{r.g30 ?? "–"}</span>
                                  {/* {r.g30 && (
                                    <ActionBtn
                                      onClick={() => handleBuy(pf.key, sec, r.label + " BH30", r.g30!)}
                                      disabled={loading}
                                    />
                                  )} */}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* FOLLOW GLOBAL */}
                    {sec.kind === "follow_global" && (
                      <table className="w-full text-[13px] sm:text-sm tabular-nums border-collapse min-w-[420px]">
                        <thead className="bg-white/5 font-semibold text-white/75 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3 text-left">Follow</th>
                            <th className="py-2.5 px-3 text-right">Bảo hành 1 tháng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sec.items.map((r, idx) => (
                            <tr
                              key={r.label}
                              className={cn(
                                "border-b last:border-0 border-white/10",
                                idx % 2 ? "bg-white/[0.02]" : "",
                                "hover:bg-white/[0.05] transition-colors"
                              )}
                            >
                              <td className="py-2.5 px-3 align-middle font-medium text-white/90">
                                {r.label}
                              </td>
                              <td className="py-2.5 px-3 text-right align-middle">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="whitespace-nowrap text-white/80">
                                    {r.g30 ?? r.value ?? "–"}
                                  </span>
                                  {/* {(r.g30 || r.value) && (
                                    <ActionBtn
                                      onClick={() => handleBuy(pf.key, sec, r.label, r.g30 ?? r.value ?? "")}
                                      disabled={loading}
                                    />
                                  )} */}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* SIMPLE */}
                    {sec.kind === "simple" && (
                      <table className="w-full text-[13px] sm:text-sm tabular-nums border-collapse min-w-[420px]">
                        <thead className="bg-white/5 font-semibold text-white/75 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3 text-left">Dịch vụ</th>
                            <th className="py-2.5 px-3 text-right">Giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sec.items.map((r, idx) => (
                            <tr
                              key={r.label}
                              className={cn(
                                "border-b last:border-0 border-white/10",
                                idx % 2 ? "bg-white/[0.02]" : "",
                                "hover:bg-white/[0.05] transition-colors"
                              )}
                            >
                              <td className="py-2.5 px-3 align-middle font-medium text-white/90">
                                {r.label}
                              </td>
                              <td className="py-2.5 px-3 text-right align-middle">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="whitespace-nowrap text-white/80">{r.value ?? "–"}</span>
                                  {/* {r.value && (
                                    <ActionBtn
                                      onClick={() => handleBuy(pf.key, sec, r.label, r.value!)}
                                      disabled={loading}
                                    />
                                  )} */}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </AnimatedBorder>
    );
  };

  // ===========================
  // 🟣 3 bảng sau (giá ×2.5) — giữ logic + giá
  // ===========================
  type DuoRow = { lLabel: string; lPrice: string; rLabel?: string; rPrice?: string };
  type DuoBoard = { title: string; rows: DuoRow[] };

  const CODE_FACTOR = 2.5;
  const mult = (s: string) => multiplyPriceString(s, CODE_FACTOR);

  const rawBoardDameAccount: DuoBoard = {
    title: "DAME ACCOUNT",
    rows: [
      { lLabel: "Dịch vụ tài khoản Facebook (gói cơ bản)", lPrice: "650.000đ", rLabel: "Dịch vụ tài khoản Facebook (gói nâng cao)", rPrice: "1.500.000đ" },
      { lLabel: "Dịch vụ tài khoản Facebook (case hạn chế/giới hạn)", lPrice: "1.500.000đ", rLabel: "Dịch vụ tài khoản Facebook (case thiếu ảnh/thiết lập)", rPrice: "1.300.000đ" },
      { lLabel: "Dịch vụ Fanpage Facebook (setup/transfer theo quy trình)", lPrice: "3.000.000đ – 10.000.000đ", rLabel: "Dịch vụ Group Facebook (setup theo quy trình)", rPrice: "3.000.000đ – 10.000.000đ" },
      { lLabel: "Dịch vụ tài khoản TikTok (setup/optim)", lPrice: "6.000.000đ – 30.000.000đ", rLabel: "Dịch vụ video TikTok (tối ưu đăng tải)", rPrice: "3.000.000đ – 6.000.000đ" },
      { lLabel: "Dịch vụ tài khoản Instagram (setup/optim)", lPrice: "1.500.000đ – 4.000.000đ", rLabel: "Dịch vụ tài khoản Youtube (setup/optim)", rPrice: "6.000.000đ – 30.000.000đ" },
      { lLabel: "Dịch vụ video Youtube (tối ưu đăng tải)", lPrice: "2.000.000đ – 5.000.000đ", rLabel: "Dịch vụ tài khoản Threads (setup/optim)", rPrice: "2.500.000đ – 8.000.000đ" },
    ],
  };

  const rawBoardUnlock: DuoBoard = {
    title: "UNLOCK & KHÁNG NGHỊ",
    rows: [
      { lLabel: "Hỗ trợ kháng nghị Facebook (case review)", lPrice: "650.000đ", rLabel: "Hỗ trợ kháng nghị Facebook (nâng cao)", rPrice: "2.500.000đ" },
      { lLabel: "Hỗ trợ kháng nghị (có email)", lPrice: "650.000đ", rLabel: "Hỗ trợ kháng nghị (không email)", rPrice: "650.000đ" },
      { lLabel: "Hỗ trợ kháng nghị (vòng 2+)", lPrice: "2.500.000đ", rLabel: "Thiết lập bảo mật tài khoản (2FA/Hardening)", rPrice: "650.000đ" },
      { lLabel: "Hỗ trợ case phức tạp (identity/FAQ)", lPrice: "1.900.000đ", rLabel: "Hỗ trợ case phức tạp (nâng cao)", rPrice: "7.000.000đ – 15.000.000đ" },
      { lLabel: "Hỗ trợ xử lý vi phạm/policy", lPrice: "1.000.000đ – 4.000.000đ", rLabel: "Hỗ trợ khi nghi ngờ bị chiếm quyền (hướng dẫn bảo vệ)", rPrice: "850.000đ" },
      { lLabel: "Gói bảo vệ tài khoản (audit + hardening)", lPrice: "2.000.000đ – 7.000.000đ", rLabel: "Hỗ trợ kháng nghị TikTok (theo quy trình)", rPrice: "3.000.000đ – 9.000.000đ" },
      { lLabel: "Hỗ trợ vấn đề bản quyền (case theo quy trình)", lPrice: "40.000.000đ – 90.000.000đ", rLabel: "Hỗ trợ case liên quan giới hạn độ tuổi", rPrice: "2.000.000đ – 5.000.000đ" },
      { lLabel: "Hỗ trợ khiếu nại video TikTok", lPrice: "2.000.000đ – 4.000.000đ", rLabel: "Hỗ trợ khiếu nại live TikTok", rPrice: "2.000.000đ – 4.000.000đ" },
      { lLabel: "Gói hỗ trợ theo case", lPrice: "Thương Lượng", rLabel: "Hỗ trợ kháng nghị Instagram (theo quy trình)", rPrice: "2.000.000đ – 8.500.000đ" },
      { lLabel: "Hỗ trợ kháng nghị Youtube (theo quy trình)", lPrice: "3.000.000đ – 5.000.000đ", rLabel: "Hỗ trợ kháng nghị bài viết Instagram", rPrice: "900.000đ – 3.000.000đ" },
    ],
  };

  const rawBoardTick: DuoBoard = {
    title: "DỊCH VỤ TÍCH XANH",
    rows: [
      { lLabel: "Dịch vụ Verified Facebook (KBH)", lPrice: "999.000đ", rLabel: "Dịch vụ Verified Facebook (BH)", rPrice: "1.850.000đ" },
      { lLabel: "Dịch vụ Verified Facebook (chính chủ, KBH)", lPrice: "2.600.000đ", rLabel: "Dịch vụ Verified Facebook (chính chủ, BH)", rPrice: "5.500.000đ" },
      { lLabel: "Dịch vụ Verified Instagram (KBH)", lPrice: "1.300.000đ", rLabel: "Dịch vụ Verified Instagram (BH)", rPrice: "2.850.000đ" },
      { lLabel: "Dịch vụ Verified Instagram (chính chủ, KBH)", lPrice: "3.600.000đ", rLabel: "Dịch vụ Verified Instagram (chính chủ, BH)", rPrice: "6.500.000đ" },
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
  const boardUnlock: DuoBoard = {
    title: rawBoardUnlock.title,
    rows: rawBoardUnlock.rows.map((r) => ({
      ...r,
      lPrice: mult(r.lPrice),
      rPrice: r.rPrice ? mult(r.rPrice) : undefined,
    })),
  };
  const boardTick: DuoBoard = {
    title: rawBoardTick.title,
    rows: rawBoardTick.rows.map((r) => ({
      ...r,
      lPrice: mult(r.lPrice),
      rPrice: r.rPrice ? mult(r.rPrice) : undefined,
    })),
  };

  const DuoBoardSection: React.FC<DuoBoard> = ({ title, rows }) => (
    <Surface className="overflow-hidden reveal">
      <div className="relative px-5 sm:px-7 py-5 border-b border-white/10">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_70%_10%,rgba(217,70,239,0.18),transparent_40%),radial-gradient(circle_at_60%_80%,rgba(167,139,250,0.18),transparent_45%)]" />
        <div className="relative flex items-center justify-between gap-4">
          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
          <span className="text-xs font-semibold text-white/60 ring-1 ring-white/10 rounded-full px-2.5 py-1">
            Giá hiển thị đã ×{CODE_FACTOR}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {rows.map((r, idx) => (
            <React.Fragment key={idx}>
              <div className="py-3 border-b border-white/10">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium text-[14px] sm:text-[15px] text-white/90">
                    {r.lLabel}
                  </p>
                  <p className="font-extrabold tabular-nums text-right whitespace-nowrap text-white">
                    {r.lPrice}
                  </p>
                </div>
              </div>

              <div className="py-3 border-b border-white/10 md:pl-8">
                {r.rLabel ? (
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-medium text-[14px] sm:text-[15px] text-white/90">
                      {r.rLabel}
                    </p>
                    <p className="font-extrabold tabular-nums text-right whitespace-nowrap text-white">
                      {r.rPrice ?? "—"}
                    </p>
                  </div>
                ) : (
                  <div className="opacity-70 text-sm">—</div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </Surface>
  );

  // ============== RENDER ==============
  return (
    <>
      <Head>
        <title>            hackfollowuytin.inst
 — Dịch vụ Follow & Bảng giá</title>
      </Head>

      <div className="min-h-screen bg-[#070A12] text-white">
        {/* ✅ Background: chỉ xoay chậm (không bay) */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="absolute inset-0">
            <div className="absolute -inset-[40%] rounded-full bg-[conic-gradient(from_180deg,rgba(34,211,238,0.22),rgba(217,70,239,0.20),rgba(59,130,246,0.18),rgba(167,139,250,0.20),rgba(34,211,238,0.22))] blur-3xl animate-rotateSlow" />
          </div>
          <div className="absolute inset-0 bg-[#070A12]/55" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-violet-500 shadow-[0_0_30px_rgba(217,70,239,0.18)]" />
              <div className="leading-tight">
                <Link href="/" className="font-extrabold tracking-tight text-white">
                  LameaLux
                </Link>
                <div className="text-[11px] font-medium text-white/55">
                  Global pricing • Warranty • Support
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-3 text-sm sm:gap-4 sm:text-base font-semibold text-white/80">
              <Link href="/" className="hover:text-white transition">
                Deals
              </Link>
              <Link href="/social" className="text-white underline underline-offset-4">
                Tăng follow
              </Link>
              <a
                href="tel:0909172556"
                className="hidden sm:inline-flex items-center rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-3 py-1.5 text-sm font-bold transition"
              >
                0909 172 556
              </a>
            </nav>
          </div>
        </header>

        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Hero */}
          <Surface className="overflow-hidden reveal">
            <div className="relative p-6 sm:p-10">
              <div className="relative">
                <h1 className="text-center text-3xl sm:text-5xl font-extrabold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(217,70,239,1),rgba(167,139,250,1),rgba(34,211,238,1))] bg-[length:200%_100%] animate-gradientX">
                    Bảng giá dịch vụ 💬
                  </span>
                </h1>

                <p className="mt-3 text-center text-white/70 text-sm sm:text-base">
                  Tự tin gần 10 năm trong lĩnh vực tăng tương tác mạng xã hội <br />
                  Zalo/Call/Sms: 0909 172 556
                </p>

                <div className="mt-6 flex items-center justify-center gap-2">
                  <Link
                    href="/social/demo"
                    className="relative inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-semibold
                               bg-white/10 hover:bg-white/15 ring-1 ring-white/15 transition overflow-hidden"
                  >
                    <span className="relative z-10">Demo hoạt động follow →</span>
                    <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.20),transparent)] animate-shimmer" />
                  </Link>

                  <a
                    href="tel:0909172556"
                    className="hidden sm:inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-semibold
                               bg-white/10 hover:bg-white/15 ring-1 ring-white/15 transition"
                  >
                    Gọi ngay
                  </a>
                </div>
              </div>
            </div>
          </Surface>

          {/* ✅ Platforms stacked dọc: IG -> FB -> TikTok */}
          <div className="mt-10 space-y-10">
            {platforms.map((pf) => (
              <Card key={pf.key} pf={pf} />
            ))}
          </div>

          {/* 3 bảng sau */}
          <div className="mt-10 space-y-8">
            <DuoBoardSection {...boardDameAccount} />
            <DuoBoardSection {...boardUnlock} />
            <DuoBoardSection {...boardTick} />
          </div>

          <section id="advice" className="mt-24" />
          <QuickAdviceButton />

          <footer className="py-10 text-center text-xs text-white/55">
            © {new Date().getFullYear()}             hackfollowuytin.inst
 — Follow Service
          </footer>
        </main>

        {/* Mobile sticky CTA */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 sm:hidden">
          <div className="rounded-2xl bg-black/40 backdrop-blur-xl ring-1 ring-white/12 px-3 py-2 flex items-center gap-2">
            <Link
              href="/social/demo"
              className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-3 py-2 text-xs font-semibold transition"
            >
              Demo →
            </Link>
            <a
              href="tel:0909172556"
              className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-3 py-2 text-xs font-semibold transition"
            >
              Gọi ngay
            </a>
          </div>
        </div>
      </div>

      {/* Modal nhập link */}
      {showModal && (
        <LinkModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmLink}
          placeholder={pendingItem?.placeholder}
          helperText={pendingItem?.helper}
        />
      )}

      {/* Modal VietQR */}
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

      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes gradientX {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradientX { animation: gradientX 6s ease-in-out infinite; }

        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        .animate-shimmer { animation: shimmer 1.6s ease-in-out infinite; }

        /* chỉ xoay chậm */
        @keyframes rotateSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-rotateSlow { animation: rotateSlow 38s linear infinite; }

        @keyframes borderSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-borderSpinSlow { animation: borderSpinSlow 16s linear infinite; }

        @keyframes fadeUp {
          0% { opacity: 0; transform: translate3d(0, 10px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .reveal { animation: fadeUp 700ms ease-out both; }
      `}</style>
    </>
  );
}
