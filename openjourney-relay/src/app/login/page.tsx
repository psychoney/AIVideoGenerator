import Link from "next/link";
import { ArrowRightIcon, RouteIcon } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[#0b1110] text-white lg:grid-cols-[0.92fr_1.08fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          src="/sample-videos/video-2.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/sample-images/generated-image-3.png"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,11,0.86),rgba(8,12,11,0.34)),linear-gradient(0deg,rgba(8,12,11,0.92),rgba(8,12,11,0.08))]" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <p className="mb-3 text-xs font-black uppercase text-teal-200">FrameMint Relay</p>
          <h1 className="max-w-xl text-5xl font-black leading-tight">登录后进入 AI 视频制作台</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            这里是 MVP 登录页。后续可以接 Supabase、Clerk、NextAuth 或自建账号系统。
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <Link href="/" className="mb-10 inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-teal-200 via-white to-orange-300 text-[#0d1513]">
              <RouteIcon className="h-5 w-5" />
            </span>
            <span className="font-black">FrameMint</span>
          </Link>

          <h2 className="text-3xl font-black">欢迎回来</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">点击下方按钮模拟登录，进入视频制作页面。</p>

          <div className="mt-8 grid gap-3">
            <input
              className="h-12 rounded-lg border border-white/10 bg-white/[0.07] px-4 text-sm outline-none placeholder:text-white/36"
              placeholder="you@example.com"
              type="email"
            />
            <input
              className="h-12 rounded-lg border border-white/10 bg-white/[0.07] px-4 text-sm outline-none placeholder:text-white/36"
              placeholder="Password"
              type="password"
            />
          </div>

          <Link
            href="/studio"
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-200 via-white to-orange-300 font-black text-[#111815]"
          >
            登录并进入制作台
            <ArrowRightIcon className="h-4 w-4" />
          </Link>

          <p className="mt-5 text-center text-xs text-white/46">
            MVP 阶段暂不校验账号，后端接入后再开启真实登录。
          </p>
        </div>
      </section>
    </main>
  );
}
