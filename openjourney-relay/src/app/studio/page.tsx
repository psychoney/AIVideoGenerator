"use client";

import { PromptBar } from "@/components/prompt-bar";
import { ContentGrid } from "@/components/content-grid";
import { ActivityIcon, BadgeCheckIcon, GaugeIcon, RouterIcon } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

type RelayOptions = {
  provider: string;
  taskMode: string;
  priority: string;
};

export default function Home() {
  const [generateHandler, setGenerateHandler] = useState<
    ((type: "image" | "video", prompt: string, options?: RelayOptions) => void) | null
  >(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleSetGenerator = useCallback((handler: (type: "image" | "video", prompt: string, options?: RelayOptions) => void) => {
    setGenerateHandler(() => handler);
  }, []);

  const handleSetImageToVideo = useCallback(() => {
    // Handler is set up in ContentGrid component
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relay-shell">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_5%,rgba(20,184,166,0.18),transparent_26%),radial-gradient(circle_at_86%_10%,rgba(251,146,60,0.14),transparent_24%),linear-gradient(180deg,#07110f_0%,#0b1110_48%,#11100c_100%)]" />

      <div className="sticky top-0 z-50 border-b border-white/10 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <PromptBar onGenerate={generateHandler || undefined} />
      </div>

      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 pb-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20">
            <p className="mb-2 text-xs font-semibold uppercase text-teal-300">AI Video Relay</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              多模型视频中转站
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              用一个控制台接入 Luma、Runway、Kling、fal.ai 等上游模型，统一提交任务、轮询结果、计算 credits，并返回标准视频 URL。
            </p>
          </div>

          {[
            { icon: RouterIcon, label: "Providers", value: "4 online", tone: "text-teal-300" },
            { icon: GaugeIcon, label: "Avg latency", value: "38s", tone: "text-orange-300" },
            { icon: ActivityIcon, label: "Success rate", value: "98.2%", tone: "text-emerald-300" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20"
            >
              <item.icon className={`mb-5 h-5 w-5 ${item.tone}`} />
              <div className="text-2xl font-semibold">{item.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ContentGrid
            onNewGeneration={handleSetGenerator}
            onImageToVideo={handleSetImageToVideo}
          />

          <aside className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">上游模型状态</h2>
                <BadgeCheckIcon className="h-4 w-4 text-teal-300" />
              </div>
              {[
                ["Luma Ray", "online", "12 credits"],
                ["Runway Gen", "online", "18 credits"],
                ["Kling Video", "busy", "10 credits"],
                ["fal.ai Wan", "online", "6 credits"],
              ].map(([name, status, cost]) => (
                <div key={name} className="flex items-center justify-between border-t border-white/10 py-3 first:border-t-0 first:pt-0">
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-muted-foreground">{cost} / task</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    status === "online" ? "bg-teal-400/10 text-teal-200" : "bg-orange-400/10 text-orange-200"
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
              <h2 className="font-semibold">中转 API 形态</h2>
              <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3 font-mono text-xs leading-6 text-teal-100">
                POST /api/video-tasks<br />
                GET /api/video-tasks/:id<br />
                POST /api/webhooks/:provider
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
