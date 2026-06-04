import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  RouteIcon,
  SparklesIcon,
} from "lucide-react";

const promptIdeas = [
  "Product launch",
  "Webinar invite",
  "Success story",
  "Tutorial",
  "Industry update",
  "Sales outreach",
];

const models = ["Veo", "Kling", "Luma", "Runway", "Wan", "PixVerse"];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f4f1] text-[#272727]">
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <header className="mx-auto flex max-w-[1380px] items-center justify-between rounded-full border border-[#dededa] bg-white/78 px-7 py-5 shadow-sm backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#272727] text-white">
              <RouteIcon className="h-5 w-5" />
            </span>
            <span className="text-3xl font-black tracking-[-0.04em]">MINT</span>
          </Link>

          <nav className="hidden items-center gap-8 text-[15px] font-semibold text-[#2f2f2f] md:flex">
            {["Product", "Use Cases", "AI", "APIs", "Resources"].map((item) => (
              <a key={item} className="inline-flex items-center gap-1" href={item === "APIs" ? "#models" : "#workflow"}>
                {item}
                <ChevronDownIcon className="h-3.5 w-3.5 text-[#8a8a87]" />
              </a>
            ))}
            <a href="#pricing">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-[15px] font-bold sm:block">
              Login
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#242424] px-5 py-3 text-[15px] font-black text-white shadow-sm transition hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1380px] border-b border-[#dededa] px-2 py-7">
          <div className="flex items-center gap-4 text-sm font-bold text-[#686866]">
            <Link href="/">Home</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span>AI Tools</span>
            <ChevronRightIcon className="h-4 w-4" />
            <span>AI Video</span>
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-14 pt-10 sm:px-8 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_20%,rgba(185,255,76,0.18),transparent_22%),radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.9),transparent_22%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d4d4cf] bg-white px-4 py-2 text-sm font-black text-[#424240] shadow-sm">
            <SparklesIcon className="h-4 w-4 text-[#6a55ff]" />
            AI video relay
          </div>
          <h1 className="mx-auto max-w-5xl text-[56px] font-black uppercase leading-[0.9] tracking-[-0.07em] text-[#2d2d2d] sm:text-[92px] lg:text-[118px]">
            AI Video Generator
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl font-medium leading-7 text-[#696966] sm:text-2xl">
            Generate videos from text, scripts, or images using multiple AI models. Complete with visuals, avatars, subtitles, and a unified relay API.
          </p>

          <div className="mx-auto mt-9 max-w-[720px] rounded-[28px] border border-[#d5d5d0] bg-white p-4 text-left shadow-[0_24px_80px_rgba(30,30,30,0.12)]">
            <div className="min-h-20 px-1 pt-1 text-lg font-medium text-[#7b7b78]">
              Describe a topic or paste a script
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-[20px] bg-[#f7f7f4] p-2 sm:flex-row sm:items-center">
              <button className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#686866] shadow-sm" aria-label="Previous prompt">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex-1 text-base font-black text-[#4a4a48]">
                Try: Product launch
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="rounded-full px-3 py-2 text-sm font-black text-[#474745]">Auto</span>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a8ff3e] px-6 py-3 text-base font-black text-[#202020] transition hover:-translate-y-0.5"
                >
                  Make with AI
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-2 text-sm font-semibold text-[#686866]">
            {promptIdeas.map((idea) => (
              <Link key={idea} href="/login" className="rounded-full border border-[#d8d8d2] bg-white px-4 py-2 hover:border-[#b8b8b2]">
                Try: {idea}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[26px]">
          <Image
            src="/landing-video-examples.png"
            alt="AI video example thumbnails"
            width={1792}
            height={1024}
            className="w-full"
            priority
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-[3.4%]">
            {["Ad", "Tutorial", "Promo", "Story", "Product Review"].map((label) => (
              <span key={label} className="rounded-lg bg-white px-3 py-2 text-sm font-black text-[#3e3e3b] shadow-sm">
                {label}
              </span>
            ))}
          </div>
          <Link
            href="/login"
            className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-x-1/2 hover:-translate-y-0.5"
          >
            Start with an example
            <PlayIcon className="h-4 w-4 fill-white" />
          </Link>
        </div>
      </section>

      <section id="models" className="bg-white px-5 py-18 sm:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-black uppercase text-[#6d55ff]">Model hub</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            AI video models for every need
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#696966]">
            Switch between generation models based on your project requirements and budget. The relay keeps one clean workflow while routing tasks to the best provider.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {models.map((model) => (
              <span key={model} className="rounded-full border border-[#dfdfda] bg-[#f6f6f2] px-5 py-3 text-base font-black">
                {model}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-5 py-18 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {[
            ["Step 1", "Describe your video", "Write a prompt, paste a script, or choose one of the starter examples."],
            ["Step 2", "Choose a model", "Use Auto or select a provider based on quality, speed, credits, and output type."],
            ["Step 3", "Export or keep creating", "Login to open the studio, generate the video, then add subtitles and brand assets."],
          ].map(([step, title, text]) => (
            <article key={step} className="rounded-[24px] border border-[#dcdcd6] bg-white p-7 shadow-sm">
              <div className="mb-12 inline-flex rounded-full bg-[#f1f1ed] px-4 py-2 text-sm font-black text-[#76766f]">{step}</div>
              <h3 className="text-2xl font-black tracking-[-0.03em]">{title}</h3>
              <p className="mt-4 text-base leading-7 text-[#696966]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="px-5 pb-18 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-[32px] bg-[#242424] p-8 text-white sm:p-10 lg:flex-row">
          <div>
            <p className="text-sm font-black uppercase text-[#a8ff3e]">Credits</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              One credit system for many AI video models.
            </h2>
          </div>
          <Link
            href="/login"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-black text-[#242424]"
          >
            Start creating
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#dededa] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm font-semibold text-[#777772] sm:flex-row">
          <span>FrameMint Relay</span>
          <span className="inline-flex items-center gap-2">
            <BadgeCheckIcon className="h-4 w-4" />
            Showcase homepage, studio after login
          </span>
        </div>
      </footer>
    </main>
  );
}
