"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DrawableFrame = HTMLImageElement | ImageBitmap;

type EngagementFramePlayerProps = {
  className?: string;
  basePath?: string;
  frameCount?: number;
  fps?: number;
  durationSeconds?: number;
  framePrefix?: string;
  frameNumberPadding?: number;
  fit?: "contain" | "cover";
  alt?: string;
  onLoadComplete?: () => void;
  onLoadError?: (error: Error) => void;
  onLoopComplete?: () => void;
  paused?: boolean;
};

const DEFAULT_FRAME_COUNT = 72;
const DEFAULT_FPS = 24;
const ASPECT_RATIO = 16 / 9;
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const MAX_DEVICE_PIXEL_RATIO = 2;

function getFrameUrl(basePath: string, frameIndex: number, framePrefix: string, frameNumberPadding: number) {
  const normalizedBasePath = basePath.replace(/\/$/, "");
  return `${normalizedBasePath}/${framePrefix}${String(frameIndex + 1).padStart(frameNumberPadding, "0")}.jpg`;
}

function loadImage(url: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.loading = "eager";

    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
    };

    const abort = () => {
      cleanup();
      image.src = "";
      reject(new DOMException("Image preload was aborted.", "AbortError"));
    };

    if (signal.aborted) {
      abort();
      return;
    }

    signal.addEventListener("abort", abort, { once: true });

    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // Some browsers resolve onload before decode is meaningful. The loaded
        // image is still drawable, so continue instead of failing playback.
      } finally {
        signal.removeEventListener("abort", abort);
        cleanup();
        resolve(image);
      }
    };

    image.onerror = () => {
      signal.removeEventListener("abort", abort);
      cleanup();
      reject(new Error(`Failed to preload frame: ${url}`));
    };

    image.src = url;
  });
}

async function loadFrame(url: string, signal: AbortSignal): Promise<DrawableFrame> {
  const image = await loadImage(url, signal);

  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(image);
      image.src = "";
      return bitmap;
    } catch {
      return image;
    }
  }

  return image;
}

function disposeFrame(frame: DrawableFrame) {
  if ("close" in frame) {
    frame.close();
    return;
  }

  frame.src = "";
}

function drawCoverFrame(context: CanvasRenderingContext2D, frame: DrawableFrame, width: number, height: number) {
  const targetRatio = width / height;
  const sourceRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

  if (targetRatio > sourceRatio) {
    const sourceHeight = CANVAS_WIDTH / targetRatio;
    const sourceY = (CANVAS_HEIGHT - sourceHeight) / 2;

    context.drawImage(frame, 0, sourceY, CANVAS_WIDTH, sourceHeight, 0, 0, width, height);
    return;
  }

  const sourceWidth = CANVAS_HEIGHT * targetRatio;
  const sourceX = (CANVAS_WIDTH - sourceWidth) / 2;

  context.drawImage(frame, sourceX, 0, sourceWidth, CANVAS_HEIGHT, 0, 0, width, height);
}

export default function EngagementFramePlayer({
  className,
  basePath = "/engagement-frames",
  frameCount = DEFAULT_FRAME_COUNT,
  fps = DEFAULT_FPS,
  durationSeconds,
  framePrefix = "frame_",
  frameNumberPadding = 4,
  fit = "contain",
  alt = "Engagement animation",
  onLoadComplete,
  onLoadError,
  onLoopComplete,
  paused = false,
}: EngagementFramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const framesRef = useRef<DrawableFrame[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameIndexRef = useRef<number>(0);
  const loopCountRef = useRef<number>(0);
  const renderSizeRef = useRef({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const onLoadCompleteRef = useRef(onLoadComplete);
  const onLoadErrorRef = useRef(onLoadError);
  const onLoopCompleteRef = useRef(onLoopComplete);
  const [isLoaded, setIsLoaded] = useState(false);

  const frameUrls = useMemo(
    () =>
      Array.from({ length: frameCount }, (_, index) =>
        getFrameUrl(basePath, index, framePrefix, frameNumberPadding),
      ),
    [basePath, frameCount, frameNumberPadding, framePrefix],
  );

  useEffect(() => {
    onLoadCompleteRef.current = onLoadComplete;
    onLoadErrorRef.current = onLoadError;
    onLoopCompleteRef.current = onLoopComplete;
  }, [onLoadComplete, onLoadError, onLoopComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      onLoadErrorRef.current?.(new Error("Canvas 2D rendering context is unavailable."));
      return;
    }

    const drawFrame = (frame: DrawableFrame) => {
      const { width, height } = renderSizeRef.current;

      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);

      if (fit === "cover") {
        drawCoverFrame(context, frame, width, height);
        return;
      }

      context.drawImage(frame, 0, 0, width, height);
    };

    const resizeCanvas = () => {
      const width = Math.max(1, container.clientWidth);
      const height =
        fit === "cover" ? Math.max(1, container.clientHeight) : Math.round(width / ASPECT_RATIO);
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      renderSizeRef.current = { width, height };

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      const currentFrame = framesRef.current[frameIndexRef.current];

      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);

      if (currentFrame) {
        drawFrame(currentFrame);
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    resizeCanvas();

    return () => {
      resizeObserver.disconnect();
    };
  }, [fit]);

  useEffect(() => {
    const abortController = new AbortController();

    setIsLoaded(false);
    framesRef.current.forEach(disposeFrame);
    framesRef.current = [];
    frameIndexRef.current = 0;

    Promise.all(frameUrls.map((url) => loadFrame(url, abortController.signal)))
      .then((frames) => {
        if (abortController.signal.aborted) {
          frames.forEach(disposeFrame);
          return;
        }

        framesRef.current = frames;
        setIsLoaded(true);
        onLoadCompleteRef.current?.();
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        onLoadErrorRef.current?.(error instanceof Error ? error : new Error("Failed to preload frames."));
      });

    return () => {
      abortController.abort();
      framesRef.current.forEach(disposeFrame);
      framesRef.current = [];
    };
  }, [frameUrls]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    const frameDuration =
      durationSeconds && durationSeconds > 0 ? (durationSeconds * 1000) / frameCount : 1000 / fps;

    if (!canvas || !context || framesRef.current.length === 0) {
      return;
    }

    const drawCurrentFrame = () => {
      const frame = framesRef.current[frameIndexRef.current];

      if (!frame) {
        return;
      }

      const { width, height } = renderSizeRef.current;

      context.clearRect(0, 0, width, height);

      if (fit === "cover") {
        drawCoverFrame(context, frame, width, height);
        return;
      }

      context.drawImage(frame, 0, 0, width, height);
    };

    const tick = (timestamp: number) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp;
        drawCurrentFrame();
      }

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameDuration) {
        const framesToAdvance = Math.floor(elapsed / frameDuration);
        const newFrameIndex = (frameIndexRef.current + framesToAdvance) % framesRef.current.length;

        // Detect loop completion (when wrapping from last frame to first)
        if (newFrameIndex < frameIndexRef.current && framesToAdvance > 0) {
          loopCountRef.current += 1;
          // Trigger callback on every loop completion
          onLoopCompleteRef.current?.();
        }

        frameIndexRef.current = newFrameIndex;
        lastFrameTimeRef.current += framesToAdvance * frameDuration;
        drawCurrentFrame();
      }

      if (!paused) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = null;
      lastFrameTimeRef.current = 0;
    };
  }, [durationSeconds, fit, fps, frameCount, isLoaded, paused]);

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} suppressHydrationWarning>
      <canvas
        ref={canvasRef}
        aria-label={alt}
        role="img"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
    </div>
  );
}
