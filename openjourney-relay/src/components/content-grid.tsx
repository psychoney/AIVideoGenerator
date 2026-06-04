"use client";

import { useState, useEffect } from "react";
import { ImageGrid } from "@/components/image-grid";
import { VideoGrid } from "@/components/video-grid";
import { LoadingGrid } from "@/components/loading-grid";
import { ApiKeyDialog } from "@/components/api-key-dialog";
import { FocusedMediaView } from "@/components/focused-media-view";
import { motion } from "framer-motion";

interface ImageGeneration {
  id: string;
  prompt: string;
  images: Array<{
    url: string;
    imageBytes?: string;
    isSample?: boolean;
  }>;
  timestamp: Date;
  isLoading: boolean;
  relay?: RelayMeta;
}

interface VideoGeneration {
  id: string;
  prompt: string;
  videos: string[];
  timestamp: Date;
  isLoading: boolean;
  sourceImage?: string;
  relay?: RelayMeta;
}

interface LoadingGeneration {
  id: string;
  prompt: string;
  type: "image" | "video";
  timestamp: Date;
  isLoading: true;
  sourceImage?: string;
  relay?: RelayMeta;
}

type Generation = ImageGeneration | VideoGeneration | LoadingGeneration;

type RelayOptions = {
  provider: string;
  taskMode: string;
  priority: string;
};

type RelayMeta = {
  provider: string;
  taskMode: string;
  priority: string;
  credits: number;
  status: "queued" | "routing" | "running" | "succeeded";
  jobId: string;
};

// Sample data for demonstration with real generated content
const createSampleGenerations = (): Generation[] => [
  // Video generation (most recent)
  {
    id: "sample-video-1",
    prompt: "智能手表电商广告，清晨厨房自然光，镜头缓慢推进，突出健康监测和长续航",
    videos: [
      "/sample-videos/video-1.mp4",
      "/sample-videos/video-2.mp4"
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    isLoading: false,
    relay: {
      provider: "Luma Ray",
      taskMode: "image-to-video",
      priority: "quality",
      credits: 12,
      status: "succeeded",
      jobId: "relay_luma_8f29"
    }
  } as VideoGeneration,
  // Image generation 
  {
    id: "sample-image-1",
    prompt: "用于视频任务的参考图资产：产品主图、场景图和封面候选",
    images: [
      { url: "/sample-images/generated-image-1.png", isSample: true },
      { url: "/sample-images/generated-image-2.png", isSample: true }, 
      { url: "/sample-images/generated-image-3.png", isSample: true },
      { url: "/sample-images/generated-image-4.png", isSample: true }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isLoading: false,
    relay: {
      provider: "fal.ai Wan",
      taskMode: "asset-prep",
      priority: "cost",
      credits: 3,
      status: "succeeded",
      jobId: "relay_fal_21a7"
    }
  } as ImageGeneration
];

export function ContentGrid({ 
  onNewGeneration,
  onImageToVideo 
}: { 
  onNewGeneration?: (handler: (type: "image" | "video", prompt: string, options?: RelayOptions) => void) => void;
  onImageToVideo?: (handler: (imageUrl: string, imageBytes: string, prompt: string) => void) => void;
}) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [focusedView, setFocusedView] = useState<{
    isOpen: boolean;
    mediaItems: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      prompt: string;
      timestamp: Date;
      sourceImage?: string;
    }>;
    initialIndex: number;
  }>({ isOpen: false, mediaItems: [], initialIndex: 0 });

  // Initialize with sample data after mount to avoid hydration issues
  useEffect(() => {
    setGenerations(createSampleGenerations());
  }, []);

  // Helper function to gather all media items from generations
  const getAllMediaItems = () => {
    const mediaItems: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      prompt: string;
      timestamp: Date;
      sourceImage?: string;
    }> = [];

    generations.forEach((generation) => {
      if (!generation.isLoading) {
        if ('images' in generation) {
          // Image generation
          generation.images.forEach((image, index) => {
            mediaItems.push({
              id: `${generation.id}-img-${index}`,
              type: 'image',
              url: image.url,
              prompt: generation.prompt,
              timestamp: generation.timestamp,
            });
          });
        } else if ('videos' in generation) {
          // Video generation
          generation.videos.forEach((video, index) => {
            mediaItems.push({
              id: `${generation.id}-vid-${index}`,
              type: 'video',
              url: video,
              prompt: generation.prompt,
              timestamp: generation.timestamp,
              sourceImage: generation.sourceImage,
            });
          });
        }
      }
    });

    // Sort by timestamp (newest first)
    return mediaItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Function to open focused view
  const openFocusedView = (generationId: string, itemIndex: number) => {
    const allMediaItems = getAllMediaItems();
    
    // Find the specific item index in the global list
    let globalIndex = 0;
    for (let i = 0; i < generations.length; i++) {
      const gen = generations[i];
      if (gen.isLoading) continue;
      
      if (gen.id === generationId) {
        globalIndex += itemIndex;
        break;
      }
      
      if ('images' in gen) {
        globalIndex += gen.images.length;
      } else if ('videos' in gen) {
        globalIndex += gen.videos.length;
      }
    }

    setFocusedView({
      isOpen: true,
      mediaItems: allMediaItems,
      initialIndex: globalIndex,
    });
  };

  const handleNewGeneration = async (type: "image" | "video", prompt: string, options?: RelayOptions) => {
    const relay = createRelayMeta(options, type);
    const loadingGeneration: LoadingGeneration = {
      id: `loading-${Date.now()}`,
      prompt,
      type,
      timestamp: new Date(),
      isLoading: true,
      relay: { ...relay, status: "routing" }
    };

    setGenerations(prev => [loadingGeneration, ...prev]);

    await wait(1900);

    if (type === "image") {
      const completedGeneration: ImageGeneration = {
        id: loadingGeneration.id,
        prompt: loadingGeneration.prompt,
        images: [
          { url: "/sample-images/generated-image-1.png", isSample: true },
          { url: "/sample-images/generated-image-2.png", isSample: true },
          { url: "/sample-images/generated-image-3.png", isSample: true },
          { url: "/sample-images/generated-image-4.png", isSample: true }
        ],
        timestamp: loadingGeneration.timestamp,
        isLoading: false,
        relay: { ...relay, status: "succeeded" }
      };

      setGenerations(prev => prev.map(gen => 
        gen.id === loadingGeneration.id ? completedGeneration : gen
      ));
    } else {
      const completedGeneration: VideoGeneration = {
        id: loadingGeneration.id,
        prompt: loadingGeneration.prompt,
        videos: ["/sample-videos/video-1.mp4", "/sample-videos/video-2.mp4"],
        timestamp: loadingGeneration.timestamp,
        isLoading: false,
        relay: { ...relay, status: "succeeded" }
      };

      setGenerations(prev => prev.map(gen => 
        gen.id === loadingGeneration.id ? completedGeneration : gen
      ));
    }
  };

  const createRelayMeta = (options: RelayOptions | undefined, type: "image" | "video"): RelayMeta => {
    const providerMap: Record<string, string> = {
      auto: "Auto route",
      luma: "Luma Ray",
      runway: "Runway Gen",
      kling: "Kling Video",
      fal: "fal.ai Wan"
    };
    const provider = providerMap[options?.provider || "auto"] || "Auto route";
    const taskMode = options?.taskMode || (type === "video" ? "text-to-video" : "asset-prep");
    const priority = options?.priority || "cost";
    const creditBase = type === "video" ? 12 : 3;
    const priorityMultiplier = priority === "quality" ? 1.5 : priority === "speed" ? 1.25 : 1;

    return {
      provider,
      taskMode,
      priority,
      credits: Math.ceil(creditBase * priorityMultiplier),
      status: "queued",
      jobId: `relay_${Date.now().toString(36)}`
    };
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleImageToVideo = async (imageUrl: string, imageBytes: string, prompt: string) => {
    const relay = createRelayMeta({
      provider: "auto",
      taskMode: "image-to-video",
      priority: "quality"
    }, "video");
    
    const loadingGeneration: LoadingGeneration = {
      id: `video-loading-${Date.now()}`,
      prompt: `${prompt} - image to video relay`,
      type: "video",
      timestamp: new Date(),
      isLoading: true,
      sourceImage: imageUrl,
      relay: { ...relay, status: "routing" }
    };

    setGenerations(prev => [loadingGeneration, ...prev]);
    await wait(1900);

    const completedGeneration: VideoGeneration = {
      id: loadingGeneration.id,
      prompt: loadingGeneration.prompt,
      videos: ["/sample-videos/video-1.mp4", "/sample-videos/video-2.mp4"],
      timestamp: loadingGeneration.timestamp,
      isLoading: false,
      sourceImage: imageUrl,
      relay: { ...relay, status: "succeeded" }
    };

    setGenerations(prev => prev.map(gen => 
      gen.id === loadingGeneration.id ? completedGeneration : gen
    ));
  };

  // Use useEffect to avoid setState during render
  useEffect(() => {
    if (onNewGeneration) {
      onNewGeneration(handleNewGeneration);
    }
    if (onImageToVideo) {
      onImageToVideo(handleImageToVideo);
    }
  }, [onNewGeneration, onImageToVideo]);

  return (
    <>
      <div className="space-y-8">
      {generations.map((generation) => (
        <motion.div
          key={generation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {generation.isLoading ? (
            <LoadingGrid 
              prompt={generation.prompt}
              type={"type" in generation ? generation.type : "image"}
              sourceImage={"sourceImage" in generation ? generation.sourceImage : undefined}
              relay={"relay" in generation ? generation.relay : undefined}
            />
          ) : "images" in generation ? (
            <ImageGrid 
              generation={generation}
              onImageToVideo={handleImageToVideo}
              onViewFullscreen={openFocusedView}
            />
          ) : (
            <VideoGrid 
              generation={generation} 
              onViewFullscreen={openFocusedView}
            />
          )}
        </motion.div>
      ))}
      
      {generations.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Ready to create something amazing?</h3>
          <p className="text-muted-foreground">
            Use the prompt bar above to generate your first image or video.
          </p>
        </div>
      )}
    </div>

      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        onApiKeySaved={() => {
          console.log('Google Gemini API key saved successfully');
          // Trigger a custom event to notify settings dropdown to refresh
          window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
        }}
      />

      <FocusedMediaView
        isOpen={focusedView.isOpen}
        onClose={() => setFocusedView(prev => ({ ...prev, isOpen: false }))}
        mediaItems={focusedView.mediaItems}
        initialIndex={focusedView.initialIndex}
        onImageToVideo={handleImageToVideo}
      />
    </>
  );
} 
