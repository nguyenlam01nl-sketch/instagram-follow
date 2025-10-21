"use client";

import React, { useState } from "react";

export default function QuickAdviceButton() {
  const [step, setStep] = useState<"button" | "platform" | "type" | "suggest">("button");
  const [platform, setPlatform] = useState("");
  const [service, setService] = useState("");
  const [open, setOpen] = useState(false);

  const handlePlatformSelect = (p: string) => {
    setPlatform(p);
    setStep("type");
  };

  const handleServiceSelect = (s: string) => {
    setService(s);
    setStep("suggest");
  };

  const resetAll = () => {
    setOpen(false);
    setStep("button");
    setPlatform("");
    setService("");
  };

  const suggestion = () => {
    if (platform === "TikTok" && service === "Follow") return "Gói TikTok Follow Pro – 5.000 follow / lượt 🎯";
    if (platform === "TikTok" && service === "Like") return "Gói TikTok Like Basic – 10.000 lượt thích / lượt 💫";
    if (platform === "Facebook" && service === "Follow") return "Gói Facebook Follow Bền Vững – 2.000 follow / lượt 🌱";
    if (platform === "Facebook" && service === "Like") return "Gói Facebook Like Tự Nhiên – 5.000 like / lượt 👍";
    if (platform === "Instagram" && service === "Follow") return "Gói Instagram Growth Pro – 1.500 follow / lượt 💖";
    if (platform === "Instagram" && service === "Like") return "Gói Instagram Like Boost – 3.000 like / lượt ✨";
    return "";
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-full bg-black px-4 py-3 text-white shadow-lg hover:opacity-90"
      >
        💬 <span className="font-medium hidden sm:inline">Tư vấn nhanh</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <button
              className="absolute right-3 top-3 text-gray-400 hover:text-black"
              onClick={resetAll}
            >
              ✕
            </button>

            {step === "button" && (
              <>
                <h2 className="text-lg font-semibold">
                  Bạn muốn mình giúp chọn gói phù hợp không?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Trả lời 3 câu hỏi nhỏ để mình gợi ý gói tốt nhất cho bé nha 💡
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setStep("platform")}
                    className="flex-1 rounded-xl bg-black text-white py-2 hover:opacity-90"
                  >
                    Có chứ 💬
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex-1 rounded-xl border border-gray-300 py-2 hover:bg-gray-50"
                  >
                    Để sau
                  </button>
                </div>
              </>
            )}

            {step === "platform" && (
              <>
                <h2 className="text-lg font-semibold">Bé đang muốn tăng tương tác ở đâu?</h2>
                <div className="mt-4 flex flex-col gap-2">
                  {["TikTok", "Facebook", "Instagram"].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePlatformSelect(p)}
                      className="rounded-xl border border-gray-300 py-2 hover:bg-gray-100"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "type" && (
              <>
                <h2 className="text-lg font-semibold">
                  Bé muốn tăng {platform} theo kiểu nào?
                </h2>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleServiceSelect("Follow")}
                    className="rounded-xl bg-black text-white py-2 hover:opacity-90"
                  >
                    Tăng Follow 👥
                  </button>
                  <button
                    onClick={() => handleServiceSelect("Like")}
                    className="rounded-xl border border-gray-300 py-2 hover:bg-gray-50"
                  >
                    Tăng Like ❤️
                  </button>
                </div>
              </>
            )}

            {step === "suggest" && (
              <>
                <h2 className="text-lg font-semibold">✨ Gợi ý dành cho bé ✨</h2>
                <p className="mt-3 text-gray-700">{suggestion()}</p>

                <div className="mt-5 flex flex-col gap-2">
                  <button
                    onClick={resetAll}
                    className="rounded-xl border border-gray-300 py-2 hover:bg-gray-50"
                  >
                    Đóng để order trực tiếp trên website
                  </button>

                  <a
                    href="https://zalo.me/0909172556"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#0085ff] text-white py-2 hover:opacity-90 block"
                  >
                    Chat Zalo 💬
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
