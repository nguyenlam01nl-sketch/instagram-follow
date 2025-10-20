// src/pages/social.tsx
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import LinkModal from "@/components/LinkModal";
import BankQRModal from "@/components/BankQRModal";
import React from "react";

type Row = { label: string; value?: string; g7?: string; g30?: string };
type SectionCommon = { title: string };
type SectionFollowVN = SectionCommon & { kind: "follow_vn"; items: Row[] };
type SectionFollowGL = SectionCommon & { kind: "follow_global"; items: Row[] };
type SectionSimple   = SectionCommon & { kind: "simple"; items: Row[] };
type Section = SectionFollowVN | SectionFollowGL | SectionSimple;

type Platform = {
  name: string;
  color: string;
  desc?: string;
  sections: Section[];
};

export default function Social() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ label: string; price: string } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{ id: string; amount: number } | null>(null);


  const InlineActivityDemo = () => {
    const demo = [
      "abc vừa follow bạn",
      "minhthu123 đã follow bạn",
      "ngocanh_98 đã follow bạn",
      "trungcute vừa follow bạn",
      "linh.lee đã follow bạn",
    ];
    return (
      <div className="mt-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-3">
        {demo.map((t, i) => (
          <p key={i} className="text-sm text-slate-700 dark:text-slate-200 border-b last:border-0 border-black/5 dark:border-white/10 py-1">
            {t}
          </p>
        ))}
      </div>
    );
  };
  // Bấm Order -> hỏi link
  const handleBuy = (label: string, price: string) => {
    setPendingItem({ label, price });
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
  // 🟣 DATA
  // ===========================
  const instagram: Platform = {
    name: "Instagram 📸",
    color: "from-pink-500 to-purple-600",
    desc: "Tách Follow / Likes / Views — bảo hành linh hoạt 7 ngày hoặc 1 tháng.",
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
    name: "TikTok 🎵",
    color: "from-blue-500 to-cyan-500",
    desc: "Follow / Likes / Views tách ô riêng — dễ đọc, dễ chọn.",
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
    name: "Facebook 📘",
    color: "from-indigo-500 to-blue-600",
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
  // 🟣 COMPONENTS
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

  const Card = ({ pf }: { pf: Platform }) => (
    <section className={`rounded-3xl overflow-hidden shadow-md border border-black/5 dark:border-white/10 bg-gradient-to-r ${pf.color} text-white`}>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{pf.name}</h2>
          {pf.desc && <p className="mt-1 text-xs sm:text-sm opacity-90">{pf.desc}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {pf.sections.map((sec, i) => (
            <article key={sec.title + i} className="rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm overflow-hidden">
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

                          {/* Giá + Order cùng dòng, không wrap */}
                          <td className="py-2 px-2 text-right align-middle">
                            <div className="flex items-center justify-end gap-2 flex-nowrap">
                              <span className="whitespace-nowrap">{r.g7 ?? "–"}</span>
                              {r.g7 && (
                                <ActionBtn onClick={() => handleBuy(r.label + " BH7", r.g7!)} disabled={loading} />
                              )}
                            </div>
                          </td>

                          <td className="py-2 px-2 text-right align-middle">
                            <div className="flex items-center justify-end gap-2 flex-nowrap">
                              <span className="whitespace-nowrap">{r.g30 ?? "–"}</span>
                              {r.g30 && (
                                <ActionBtn onClick={() => handleBuy(r.label + " BH30", r.g30!)} disabled={loading} />
                              )}
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
                              {(r.g30 || r.value) && (
                                <ActionBtn onClick={() => handleBuy(r.label, r.g30 ?? r.value ?? "")} disabled={loading} />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* ❤️ SIMPLE */}
                {sec.kind === "simple" && (
                  <table className="w-full text-[13px] sm:text-sm tabular-nums border-collapse min-w-[320px]">
                    <tbody>
                      {sec.items.map((r) => (
                        <tr key={r.label} className="border-b last:border-0 border-white/15">
                          <td className="py-2 px-3 align-middle">{r.label}</td>
                          <td className="py-2 px-3 text-right align-middle">
                            <div className="flex items-center justify-end gap-2 flex-nowrap">
                              <span className="whitespace-nowrap">{r.value ?? "–"}</span>
                              {r.value && (
                                <ActionBtn onClick={() => handleBuy(r.label, r.value!)} disabled={loading} />
                              )}
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

        <a
          href="https://zalo.me/0909172556"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block w-full rounded-xl bg-white text-slate-900 text-center font-semibold py-2.5 hover:bg-gray-100 transition"
        >
          Liên hệ đặt dịch vụ 📩
        </a>
      </div>
    </section>
  );

  // ===========================
  // 🟣 PAGE
  // ===========================
  return (
    <>
      <Head>
        <title>LameaLux — Dịch vụ Follow & Tương tác</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#E4ECFF] via-[#F6F4FF] to-[#F9FBFF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
          s
          </div>


          <div className="mt-8 sm:mt-10 flex flex-col gap-8 sm:gap-10">
            {platforms.map((pf) => (
              <Card key={pf.name} pf={pf} />
            ))}
          </div>

          <footer className="py-10 text-center text-xs text-gray-600 dark:text-slate-300">
            © {new Date().getFullYear()} LameaLux — Follow Service
          </footer>
        </main>
      </div>

      {/* Modal nhập link */}
      {showModal && (
        <LinkModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmLink}
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
