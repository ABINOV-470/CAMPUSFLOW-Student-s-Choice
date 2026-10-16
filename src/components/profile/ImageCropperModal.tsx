import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Upload,
  Trash2,
  Move,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSaveCrop: (croppedDataUrl: string) => void;
  onReplaceFile: (file: File) => void;
  onRemovePhoto: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onSaveCrop,
  onReplaceFile,
  onRemovePhoto,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CROP_BOX_SIZE = 260; // Dimensions of crop viewport in px

  // Reset parameters when image changes or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImgLoaded(false);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      setNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
      setImgLoaded(true);
      drawLivePreview(1, { x: 0, y: 0 });
    }
  };

  const drawLivePreview = useCallback(
    (curScale: number, curPos: { x: number; y: number }) => {
      const canvas = previewCanvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const targetSize = 120;
      canvas.width = targetSize;
      canvas.height = targetSize;

      ctx.clearRect(0, 0, targetSize, targetSize);

      // Create circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Calculate mapping from the crop box (260x260) to the canvas
      const scaleMultiplier = targetSize / CROP_BOX_SIZE;

      // Draw image shifted and scaled
      const baseRatio = Math.max(
        CROP_BOX_SIZE / img.naturalWidth,
        CROP_BOX_SIZE / img.naturalHeight
      );

      const renderW = img.naturalWidth * baseRatio * curScale;
      const renderH = img.naturalHeight * baseRatio * curScale;

      const centerOffsetX = (CROP_BOX_SIZE - renderW) / 2 + curPos.x;
      const centerOffsetY = (CROP_BOX_SIZE - renderH) / 2 + curPos.y;

      ctx.drawImage(
        img,
        centerOffsetX * scaleMultiplier,
        centerOffsetY * scaleMultiplier,
        renderW * scaleMultiplier,
        renderH * scaleMultiplier
      );

      ctx.restore();
    },
    [CROP_BOX_SIZE]
  );

  useEffect(() => {
    if (imgLoaded) {
      drawLivePreview(scale, position);
    }
  }, [scale, position, imgLoaded, drawLivePreview]);

  // Pointer dragging handlers (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Apply soft boundary constraints based on current scale
    const maxBound = (CROP_BOX_SIZE * (scale - 1)) / 2 + 100;
    const clampedX = Math.max(-maxBound, Math.min(maxBound, newX));
    const clampedY = Math.max(-maxBound, Math.min(maxBound, newY));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(3, Math.max(1, scale + delta));
    setScale(newScale);
  };

  const handleResetCrop = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleGenerateFinalCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    // Output high-resolution 400x400 avatar
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 400;
    exportCanvas.height = 400;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scaleFactor = 400 / CROP_BOX_SIZE;
    const baseRatio = Math.max(
      CROP_BOX_SIZE / img.naturalWidth,
      CROP_BOX_SIZE / img.naturalHeight
    );

    const renderW = img.naturalWidth * baseRatio * scale;
    const renderH = img.naturalHeight * baseRatio * scale;

    const centerOffsetX = (CROP_BOX_SIZE - renderW) / 2 + position.x;
    const centerOffsetY = (CROP_BOX_SIZE - renderH) / 2 + position.y;

    ctx.drawImage(
      img,
      centerOffsetX * scaleFactor,
      centerOffsetY * scaleFactor,
      renderW * scaleFactor,
      renderH * scaleFactor
    );

    // Export as high quality webp or jpeg
    const dataUrl = exportCanvas.toDataURL('image/webp', 0.92);
    onSaveCrop(dataUrl);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onReplaceFile(file);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                Crop & Adjust Profile Photo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag to reposition · Zoom in or out to fit your circular avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Interactive Crop Viewport */}
            <div className="flex flex-col items-center gap-2">
              <div
                ref={containerRef}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-inner select-none cursor-grab active:cursor-grabbing border-2 border-indigo-500/40"
                style={{ width: `${CROP_BOX_SIZE}px`, height: `${CROP_BOX_SIZE}px` }}
              >
                {/* Hidden image for measuring */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Source"
                  onLoad={handleImageLoad}
                  className="hidden"
                  crossOrigin="anonymous"
                />

                {/* Rendered transformed image */}
                {imgLoaded && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px)`,
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Crop target"
                      className="max-w-none pointer-events-none select-none transition-transform duration-75"
                      style={{
                        width: `${Math.max(CROP_BOX_SIZE, (naturalSize.width / naturalSize.height) * CROP_BOX_SIZE) * scale}px`,
                        height: `${Math.max(CROP_BOX_SIZE, (naturalSize.height / naturalSize.width) * CROP_BOX_SIZE) * scale}px`,
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}

                {/* Circular Crop Guide Mask Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Subtle 3x3 rule of thirds grid */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                    <div className="border-r border-b border-white"></div>
                    <div className="border-r border-b border-white"></div>
                    <div className="border-b border-white"></div>
                    <div className="border-r border-b border-white"></div>
                    <div className="border-r border-b border-white"></div>
                    <div className="border-b border-white"></div>
                    <div className="border-r border-white"></div>
                    <div className="border-r border-white"></div>
                    <div></div>
                  </div>

                  {/* Circular cutout ring */}
                  <div className="w-[230px] h-[230px] rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] pointer-events-none"></div>
                </div>

                {/* Subtle helper pill */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/90 pointer-events-none flex items-center gap-1 font-medium">
                  <Move className="w-3 h-3 text-indigo-400" />
                  <span>Drag & Pan</span>
                </div>
              </div>
            </div>

            {/* Circular Preview Panel */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 w-full sm:w-48 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Avatar Preview
              </span>
              <div className="relative p-1 rounded-full ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-white dark:ring-offset-slate-900">
                <canvas
                  ref={previewCanvasRef}
                  className="w-24 h-24 rounded-full shadow-md bg-slate-200 dark:bg-slate-700"
                />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Actual appearance across navbar & cards
              </span>
            </div>
          </div>

          {/* Zoom Slider & Quick Adjust Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-indigo-500" />
                <span>Zoom Scale ({scale.toFixed(1)}x)</span>
              </span>
              <button
                type="button"
                onClick={handleResetCrop}
                className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Center</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(1, s - 0.2))}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <button
                type="button"
                onClick={() => setScale((s) => Math.min(3, s + 0.2))}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Row: Replace / Remove buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRemovePhoto();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateFinalCrop}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 active:scale-98 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Apply & Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
