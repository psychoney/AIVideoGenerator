"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, RouteIcon, SparklesIcon, VideoIcon, WandSparklesIcon } from "lucide-react";
import { SettingsDropdown } from "@/components/settings-dropdown";

interface PromptBarProps {
  onGenerate?: (
    type: "image" | "video",
    prompt: string,
    options?: {
      provider: string;
      taskMode: string;
      priority: string;
    }
  ) => void;
}

export function PromptBar({ onGenerate }: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [provider, setProvider] = useState("auto");
  const [taskMode, setTaskMode] = useState("image-to-video");
  const [priority, setPriority] = useState("cost");

  const handleGenerate = (type: "image" | "video") => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Call the parent handler to add new generation
    if (onGenerate) {
      onGenerate(type, prompt.trim(), { provider, taskMode, priority });
    }
    
    // Clear the prompt
    setPrompt("");
    
    // Reset generating state
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate("video");
    }
  };

  return (
    <div className="w-full py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="flex min-w-fit items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-teal-300 via-cyan-100 to-orange-300 text-slate-950 shadow-lg shadow-teal-500/20">
                <RouteIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-bold leading-none sm:text-lg">FrameMint Relay</div>
                <div className="mt-1 text-xs text-muted-foreground">AI video gateway</div>
              </div>
            </div>

            <div className="relative w-full flex-1">
              <Input
                placeholder="描述你要生成的视频，或粘贴上游 API 的 prompt 请求..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 border-white/10 bg-white/[0.065] pr-2 text-base shadow-inner shadow-black/10 sm:pr-72"
                disabled={isGenerating}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleGenerate("video")}
                  disabled={!prompt.trim() || isGenerating}
                  className="h-8 bg-teal-300 text-slate-950 hover:bg-teal-200"
                >
                  <VideoIcon className="mr-1 h-4 w-4" />
                  Create task
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerate("image")}
                  disabled={!prompt.trim() || isGenerating}
                  className="h-8 border-white/10 bg-white/5"
                >
                  <ImageIcon className="mr-1 h-4 w-4" />
                  Asset
                </Button>
                <SettingsDropdown />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              上游模型
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                className="h-10 rounded-md border border-white/10 bg-white/[0.065] px-3 text-sm text-foreground outline-none"
              >
                <option value="auto">自动路由</option>
                <option value="luma">Luma Ray</option>
                <option value="runway">Runway Gen</option>
                <option value="kling">Kling Video</option>
                <option value="fal">fal.ai Wan</option>
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              任务类型
              <select
                value={taskMode}
                onChange={(event) => setTaskMode(event.target.value)}
                className="h-10 rounded-md border border-white/10 bg-white/[0.065] px-3 text-sm text-foreground outline-none"
              >
                <option value="image-to-video">Image to Video</option>
                <option value="text-to-video">Text to Video</option>
                <option value="extend-video">Extend Video</option>
                <option value="avatar-video">Avatar Video</option>
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              路由策略
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="h-10 rounded-md border border-white/10 bg-white/[0.065] px-3 text-sm text-foreground outline-none"
              >
                <option value="cost">成本优先</option>
                <option value="quality">质量优先</option>
                <option value="speed">速度优先</option>
              </select>
            </label>

            <div className="hidden items-end gap-2 md:flex">
              <Badge variant="outline" className="h-10 gap-2 border-teal-300/25 bg-teal-300/10 px-3 text-teal-100">
                <SparklesIcon className="h-3.5 w-3.5" />
                1 API
              </Badge>
              <Badge variant="outline" className="h-10 gap-2 border-orange-300/25 bg-orange-300/10 px-3 text-orange-100">
                <WandSparklesIcon className="h-3.5 w-3.5" />
                credits
              </Badge>
            </div>
          </div>

          <div className="flex gap-3 sm:hidden">
            <Button
              onClick={() => handleGenerate("video")}
              disabled={!prompt.trim() || isGenerating}
              className="h-10 flex-1 bg-teal-300 text-slate-950 hover:bg-teal-200"
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Create task
            </Button>
            <Button
              variant="outline"
              onClick={() => handleGenerate("image")}
              disabled={!prompt.trim() || isGenerating}
              className="h-10 flex-1 border-white/10 bg-white/5"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Asset
            </Button>
            <SettingsDropdown />
          </div>
        </div>
      </div>
    </div>
  );
} 
