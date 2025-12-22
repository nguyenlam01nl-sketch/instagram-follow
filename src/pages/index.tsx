// src/pages/social.tsx
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import LinkModal from "@/components/LinkModal";
import BankQRModal from "@/components/BankQRModal";
import React from "react";
import QuickAdviceButton from "@/components/QuickAdviceButton";

type Row = { label: string; value?: string; g7?: string; g30?: string };
type SectionCommon = { title: string };
type SectionFollowVN = SectionCommon & { kind: "follow_vn"; items: Row[] };
type SectionFollowGL = SectionCommon & { kind: "follow_global"; items: Row[] };
type SectionSimple   = SectionCommon & { kind: "simple"; items: Row[] };
type Section = SectionFollowVN | SectionFollowGL | SectionSimple;

type Platform = {
  key: "instagram" | "tiktok" | "facebook";
  name: string;
  sections: Section[];
  desc?: string;
};

// ========= Instagram Theme =========
const IG_GRADIENT = "from-pink-600 via-fuchsia-600 to-purple-700";
const IG_CARD_BG  = "bg-white/10 ring-1 ring-white/10 backdrop-blur-sm";

// ========= Helpers (bảng giá ×2.5) =========
function formatVnd(n: number) {
  return n.toLocaleString("vi-VN").replace(/,/g, ".") + "đ";
}
/** Nhân chuỗi giá (kể cả khoảng giá a – b). Nếu không có số (VD: "Thương Lượng") thì giữ nguyên. */
function multiplyPriceString(input: string, factor = 2.5): string {
  if (!input) return input;

  const sep = input.includes("–") ? "–" : (input.includes("-") ? "-" : null);
  const clean = (s: string) => {
    const n = parseInt(s.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? n : 0;
  };

  if (!sep) {
    const num = clean(input);
    return num ? formatVnd(Math.round(num * factor)) : input; // không có số -> giữ nguyên
  }

  const [a, b] = input.split(sep);
  const x = clean(a), y = clean(b);
  if (!x || !y) return input; // một trong hai không có số -> giữ nguyên
  return `${formatVnd(Math.round(x * factor))} ${sep} ${formatVnd(Math.round(y * factor))}`;
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
          helper: "Bài viết IG: /p/POST_ID • Reel: /reel/REEL_ID • Story: dán link story nếu có.",
        };
      }
      // like / view
      return {
        placeholder: "https://www.instagram.com/p/POST_ID/",
        helper: "Bài viết IG: /p/POST_ID • Reel: /reel/REEL_ID",
      };
    case "facebook":
      if (need === "follow") {
        return {
          placeholder: "https://facebook.com/USERNAME_OR_ID",
          helper: "Ví dụ: https://facebook.com/kim.lam.123 hoặc https://facebook.com/1000123456789",
        };
      }
      if (need === "comment") {
        return {
          placeholder: "https://www.facebook.com/USER/posts/POST_ID",
          helper: "Bài viết: /posts/POST_ID • Reel: https://www.facebook.com/reel/REEL_ID",
        };
      }
      // like / view
      return {
        placeholder: "https://www.facebook.com/USER/posts/POST_ID",
        helper: "Bài viết: /posts/POST_ID • Reel: https://www.facebook.com/reel/REEL_ID",
      };
    case "tiktok":
      if (need === "follow") {
        return {
          placeholder: "https://www.tiktok.com/@USERNAME",
          helper: "Ví dụ: https://www.tiktok.com/@kimlam",
        };
      }
      // like / view / comment
      return {
        placeholder: "https://www.tiktok.com/@USERNAME/video/VIDEO_ID",
        helper: "Ví dụ: https://www.tiktok.com/@kimlam/video/7423456789012345678",
      };
  }
}

// Suy luận need theo section + label
function inferNeedType(sec: Section, label: string): NeedType {
  if (sec.kind === "follow_vn" || sec.kind === "follow_global") return "follow";
  const lower = label.toLowerCase();
  if (lower.includes("comment")) return "comment";
  if (lower.includes("view")) return "view";
  return "like";
}

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

  // Bấm Order -> hỏi link (có hint theo nền tảng + loại)
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

  // Nhập link -> tạo order + mở VietQR
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
  // 🟣 DATA — 3 bảng đầu (IG / TikTok / FB)
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

  const platforms: Platform[] = [instagram, tiktok, facebook];

  // ===========================
  // 🟣 3 bảng IG theme (Card)
  // ===========================
  const ActionBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button
      {...props}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md bg-white/20 hover:bg-white/30
                  text-[12px] sm:text-[13px] font-medium px-2.5 py-1 transition-all active:scale-95 disabled:opacity-60
                  ${props.className || ""}`}
    >
      Order
    </button>
  );

  const Card: React.FC<{ pf: Platform }> = ({ pf }) => (
    <section className={`rounded-3xl overflow-hidden shadow-xl border border-white/15 bg-gradient-to-r ${IG_GRADIENT} text-white`}>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{pf.name}</h2>
          {pf.desc && <p className="mt-1 text-xs sm:text-sm opacity-90">{pf.desc}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {pf.sections.map((sec, i) => (
            <article key={sec.title + i} className={`rounded-2xl ${IG_CARD_BG} overflow-hidden`}>
              <div className="px-3 sm:px-4 py-2.5 border-b border-white/15">
                <h3 className="font-semibold text-sm sm:text-base">{sec.title}</h3>
              </div>

              {/* bảng cuộn nhẹ trên mobile */}
              <div className="overflow-x-auto">
                {/* 🇻🇳 FOLLOW VN */}
                {sec.kind === "follow_vn" && (
                  <table className="w-full text-[12px] sm:text-[15px] tabular-nums border-collapse min-w-[360px]">
                    <thead className="bg-white/10 font-semibold">
                      <tr>
                        <th className="py-2 px-2 text-left">Follow</th>
                        <th className="py-2 px-2 text-right">BH 7 ngày</th>
                        <th className="py-2 px-2 text-right">BH 1 tháng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items.map((r) => (
                        <tr key={r.label} className="border-b last:border-0 border-white/15">
                          <td className="py-2 px-2 align-middle">{r.label}</td>
                          {/* Giá + Order */}
                          <td className="py-2 px-2 text-right align-middle">
                            <div className="flex items-center justify-end gap-2 flex-nowrap">
                              <span className="whitespace-nowrap">{r.g7 ?? "–"}</span>
                              {/* {r.g7 && (
                                <ActionBtn
                                  onClick={() => handleBuy(pf.key, sec, r.label + " BH7", r.g7!)}
                                  disabled={loading}
                                />
                              )} */}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right align-middle">
                            <div className="flex items-center justify-end gap-2 flex-nowrap">
                              <span className="whitespace-nowrap">{r.g30 ?? "–"}</span>
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

                {/* 🌍 FOLLOW GLOBAL */}
                {sec.kind === "follow_global" && (
                  <table className="w-full text-[13px] sm:text-sm tabular-nums border-collapse min-w-[340px]">
                    <thead className="bg-white/10 font-semibold">
                      <tr>
                        <th className="py-2 px-3 text-left">Follow</th>
                        <th className="py-2 px-3 text-right">Bảo hành 1 tháng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items.map((r) => (
                        <tr key={r.label} className="border-b last:border-0 border-white/15">
                          <td className="py-2 px-3 align-middle">{r.label}</td>
                          <td className="py-2 px-3 text-right align-middle">
                            <div className="flex items-center justify-end gap-2 flex-nowrap">
                              <span className="whitespace-nowrap">{r.g30 ?? r.value ?? "–"}</span>
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

                {/* ❤️ SIMPLE (Likes / Views / Comments) */}
                {sec.kind === "simple" && (
                  <table className="w-full text-[13px] sm:text-sm tabular-nums border-collapse min-w-[320px]">
                    <tbody>
                      {sec.items.map((r) => (
                        <tr key={r.label} className="border-b last:border-0 border-white/15">
                          <td className="py-2 px-3 align-middle">{r.label}</td>
                          <td className="py-2 px-3 text-right align-middle">
                            <div className="flex items-center justify-end gap-2 flex-nowrap">
                              <span className="whitespace-nowrap">{r.value ?? "–"}</span>
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
    </section>
  );

  // ===========================
  // 🟣 3 bảng sau (Dame / Unlock / Tích Xanh) – GIÁ HIỂN THỊ ĐÃ ×2.5
  // ===========================
  type DuoRow = {
    lLabel: string; lPrice: string;
    rLabel?: string; rPrice?: string;
  };
  type DuoBoard = { title: string; rows: DuoRow[] };

  // factor nhân giá
  const CODE_FACTOR = 2.5;
  const mult = (s: string) => multiplyPriceString(s, CODE_FACTOR);

  // ---- RAW (giá gốc) ----
  const rawBoardDameAccount: DuoBoard = {
    title: "DAME ACCOUNT",
    rows: [
      { lLabel: "Dame Tài Khoản Facebook TCN Thường", lPrice: "650.000đ", rLabel: "Dame Tài Khoản Facebook Chuyên Nghiệp", rPrice: "1.500.000đ" },
      { lLabel: "Dame Tài Khoản Facebook Locked", lPrice: "1.500.000đ", rLabel: "Dame Tài Khoản Facebook Không AVT", rPrice: "1.300.000đ" },
      { lLabel: "Dame Fanpage Facebook", lPrice: "3.000.000đ – 10.000.000đ", rLabel: "Dame Group Facebook", rPrice: "3.000.000đ – 10.000.000đ" },
      { lLabel: "Dame Tài Khoản TikTok", lPrice: "6.000.000đ – 30.000.000đ", rLabel: "Dame Video TikTok", rPrice: "3.000.000đ – 6.000.000đ" },
      { lLabel: "Dame Tài Khoản Instagram", lPrice: "1.500.000đ – 4.000.000đ", rLabel: "Dame Tài Khoản Youtube", rPrice: "6.000.000đ – 30.000.000đ" },
      { lLabel: "Dame Video Youtube", lPrice: "2.000.000đ – 5.000.000đ", rLabel: "Dame Tài Khoản Threads", rPrice: "2.500.000đ – 8.000.000đ" },
    ],
  };
  const rawBoardUnlock: DuoBoard = {
    title: "UNLOCK & KHÁNG NGHỊ",
    rows: [
      { lLabel: "Mở Khóa Facebook 956 Chính Chủ", lPrice: "650.000đ", rLabel: "Mở Khóa Facebook 956 Không Chính Chủ", rPrice: "2.500.000đ" },
      { lLabel: "Mở Khóa Facebook 282 Lần Đầu (Có LK Mail)", lPrice: "650.000đ", rLabel: "Mở Khóa Facebook 282 Lần Đầu (Ko Mail)", rPrice: "650.000đ" },
      { lLabel: "Mở Khóa Facebook 282 Lần 2 Trở Lên", lPrice: "2.500.000đ", rLabel: "Vượt Mã 2 Yếu Tố Chính Chủ (2FA)", rPrice: "650.000đ" },
      { lLabel: "Vượt Mã 2 Yếu Tố Ko Chính Chủ (2FA)", lPrice: "1.900.000đ", rLabel: "Mở Khóa FAQ Vô Hiệu Hóa", rPrice: "7.000.000đ – 15.000.000đ" },
      { lLabel: "Kháng Vi Phạm Facebook", lPrice: "1.000.000đ – 4.000.000đ", rLabel: "Lấy Lại Facebook Bị Hack", rPrice: "850.000đ" },
      { lLabel: "Verify Bảo Vệ Tài Khoản Facebook", lPrice: "2.000.000đ – 7.000.000đ", rLabel: "Mở Khóa TikTok Cấm Vĩnh Viễn", rPrice: "3.000.000đ – 9.000.000đ" },
      { lLabel: "Mở Khóa TikTok Die Bản Quyền", lPrice: "40.000.000đ – 90.000.000đ", rLabel: "Mở Khóa TikTok Die 13T", rPrice: "2.000.000đ – 5.000.000đ" },
      { lLabel: "Khiếu Nại Video TikTok", lPrice: "2.000.000đ – 4.000.000đ", rLabel: "Khiếu Nại Live TikTok", rPrice: "2.000.000đ – 4.000.000đ" },
      { lLabel: "Bảo Kê Tài Khoản TikTok", lPrice: "Thương Lượng", rLabel: "Mở Khóa Tài Khoản Instagram", rPrice: "2.000.000đ – 8.500.000đ" },
      { lLabel: "Kháng Nghị Video Youtube", lPrice: "3.000.000đ – 5.000.000đ", rLabel: "Kháng Nghị Bài viết Instagram", rPrice: "900.000đ – 3.000.000đ" },
    ],
  };
  const rawBoardTick: DuoBoard = {
    title: "DỊCH VỤ TÍCH XANH",
    rows: [
      { lLabel: "Lên Tick Xanh Profile Facebook KBH", lPrice: "999.000đ", rLabel: "Lên Tick Xanh Profile Facebook BH", rPrice: "1.850.000đ" },
      { lLabel: "Lên Tick Xanh Profile Facebook Chính Chủ KBH", lPrice: "2.600.000đ", rLabel: "Lên Tick Xanh Profile Facebook Chính Chủ BH", rPrice: "5.500.000đ" },
      { lLabel: "Lên Tick Xanh Profile Instagram KBH", lPrice: "1.300.000đ", rLabel: "Lên Tick Xanh Profile Instagram BH", rPrice: "2.850.000đ" },
      { lLabel: "Lên Tick Xanh Profile Instagram Chính Chủ KBH", lPrice: "3.600.000đ", rLabel: "Lên Tick Xanh Profile Instagram Chính Chủ BH", rPrice: "6.500.000đ" },
    ],
  };

  // ---- GIÁ CODE (đã nhân 2.5×) ----
  const boardDameAccount: DuoBoard = {
    title: rawBoardDameAccount.title,
    rows: rawBoardDameAccount.rows.map(r => ({
      ...r,
      lPrice: mult(r.lPrice),
      rPrice: r.rPrice ? mult(r.rPrice) : undefined,
    })),
  };
  const boardUnlock: DuoBoard = {
    title: rawBoardUnlock.title,
    rows: rawBoardUnlock.rows.map(r => ({
      ...r,
      lPrice: mult(r.lPrice),
      rPrice: r.rPrice ? mult(r.rPrice) : undefined,
    })),
  };
  const boardTick: DuoBoard = {
    title: rawBoardTick.title,
    rows: rawBoardTick.rows.map(r => ({
      ...r,
      lPrice: mult(r.lPrice),
      rPrice: r.rPrice ? mult(r.rPrice) : undefined,
    })),
  };

  const DuoBoardSection: React.FC<DuoBoard> = ({ title, rows }) => {
    return (
      <section className={`rounded-3xl overflow-hidden border border-white/15 shadow-xl bg-gradient-to-br ${IG_GRADIENT} text-white`}>
        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-wide text-fuchsia-200 drop-shadow mb-4">
            {title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {rows.map((r, idx) => (
              <React.Fragment key={idx}>
                {/* Left item */}
                <div className="py-3 border-b border-white/20">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-medium text-[15px] sm:text-base">{r.lLabel}</p>
                    {/* Giá đã nhân 2.5× */}
                    <p className="font-extrabold tabular-nums text-right whitespace-nowrap">{r.lPrice}</p>
                  </div>
                </div>

                {/* Right item */}
                <div className="py-3 border-b border-white/20 md:pl-8">
                  {r.rLabel ? (
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-medium text-[15px] sm:text-base">{r.rLabel}</p>
                      <p className="font-extrabold tabular-nums text-right whitespace-nowrap">{r.rPrice ?? "—"}</p>
                    </div>
                  ) : (
                    <div className="opacity-70 text-sm">—</div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ============== RENDER ==============
  return (
    <>
      <Head>
        <title>nguyenlamsocial.ig — Dịch vụ Follow & Bảng giá</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#E4ECFF] via-[#F6F4FF] to-[#F9FBFF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600" />
              <Link href="/" className="font-bold tracking-tight text-slate-900 dark:text-white">LameaLux</Link>
            </div>
            <nav className="flex items-center gap-3 text-sm sm:gap-4 sm:text-base font-medium text-slate-700 dark:text-slate-200">
              <Link href="/" className="hover:underline">Deals</Link>
              <Link href="/social" className="underline font-semibold">Tăng follow</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <h1 className="text-center text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-600">
            Bảng giá dịch vụ 💬
          </h1>
          <p className="mt-2 text-center text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Tự tin gần 10 năm trong lĩnh vực tăng tương tác mạng xã hội <br />
            Zalo/Call/Sms: 0909 172 556
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              href="/social/demo"
              className="inline-flex items-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 text-sm font-semibold hover:opacity-90 transition"
            >
              Demo hoạt động follow →
            </Link>
          </div>

          {/* ===== 3 bảng IG/TikTok/FB — nằm ĐẦU trang, theme IG ===== */}
          <div className="mt-10 flex flex-col gap-8 sm:gap-10">
            {platforms.map((pf) => (
              <Card key={pf.name} pf={pf} />
            ))}
          </div>

          {/* ===== 3 bảng sau (Dame / Unlock / Tích Xanh) — giá đã ×2.5 ===== */}
          <div className="mt-10 space-y-8">
            <DuoBoardSection {...boardDameAccount} />
            <DuoBoardSection {...boardUnlock} />
            <DuoBoardSection {...boardTick} />
          </div>
          <section id="advice" className="mt-24" />
          <QuickAdviceButton />
          <footer className="py-10 text-center text-xs text-gray-600 dark:text-slate-300">
            © {new Date().getFullYear()} nguyenlamsocial.ig — Follow Service
          </footer>
        </main>
      </div>

      {/* Modal nhập link */}
      {showModal && (
        <LinkModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmLink}
          // 👇👇 Thêm 2 props gợi ý link (nếu LinkModal chưa có, thêm vào file component của bé)
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

      
    </>
  );
}
