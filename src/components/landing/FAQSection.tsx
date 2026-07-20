"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const FAQS = [
  {
    q: "What is Taskivo?",
    a: "Taskivo is a cybernetic productivity platform that gamifies your daily missions. You earn XP for completing missions, lose XP for missing deadlines, and compete against friends in real-time duels.",
  },
  {
    q: "How does the XP system work?",
    a: "Every mission you complete awards XP based on difficulty. Easy missions give a base amount, extreme missions give 4x. Missing a deadline triggers a penalty that deducts XP from your total. Your XP determines your rank and leaderboard position.",
  },
  {
    q: "What are Duels?",
    a: "Duels are head-to-head XP battles. You challenge another agent and set a stake (1–15% of your total XP). Both agents work on missions during the duel period. The agent with the most XP earned wins and takes the loser's stake.",
  },
  {
    q: "How do Guilds work?",
    a: "Guilds are teams of agents competing together. Create or join a guild, and your XP contributes to the guild's total. Climb the guild leaderboard and dominate the global rankings.",
  },
  {
    q: "What is Deep Mode?",
    a: "Deep Mode is an immersive focus state. When activated, all non-essential UI elements dim and blur. Only your active mission remains visible with a neon glow. It's designed to maximize your flow state.",
  },
  {
    q: "Is my data secure?",
    a: "All data is stored in Firebase with industry-standard encryption. Your missions, XP, and profile are tied to your Google account. We never sell or share your personal data.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 px-8">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-[10px] text-[#facc15] font-[family-name:var(--font-mono)] uppercase tracking-[0.4em] mb-3">
              Intel Brief
            </p>
            <h2 className="text-3xl lg:text-5xl font-bold font-[family-name:var(--font-mono)] mb-4">
              <span className="gradient-text-glow">Frequently Asked</span>
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Everything you need to know before initializing your session.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <div
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  background: openIndex === i ? "rgba(15, 20, 35, 0.9)" : "rgba(10, 14, 25, 0.6)",
                  border: `1px solid ${openIndex === i ? "rgba(0, 212, 255, 0.15)" : "rgba(255, 255, 255, 0.03)"}`,
                }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white font-[family-name:var(--font-mono)] pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 shrink-0 transition-transform duration-300 ${
                      openIndex === i ? "rotate-180 text-[#00d4ff]" : ""
                    }`}
                  />
                </button>
                <div className={`faq-content ${openIndex === i ? "open" : ""}`}>
                  <div>
                    <p className="px-5 pb-5 text-xs text-gray-500 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
