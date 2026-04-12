"use client";

import { useCallback, useRef, useState } from "react";
import { ListingImage } from "@/types/listing";
import { deleteListingImage } from "@/lib/services/listings";

export type ImageItem = ListingImage & { file?: File };

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploader({
  images,
  onChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type))
      return `"${file.name}" is not a supported image format (JPEG, PNG, WebP).`;
    if (file.size > MAX_FILE_SIZE)
      return `"${file.name}" exceeds the 10 MB file size limit.`;
    return null;
  };

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      for (const f of files) {
        const err = validateFile(f);
        if (err) {
          setError(err);
          return;
        }
      }

      setError(null);

      const startOrder = images.length;
      const newItems: ImageItem[] = files.map((file, i) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          id: crypto.randomUUID(),
          original_url: previewUrl,
          thumbnail_url: previewUrl,
          path: "",
          width: 0,
          height: 0,
          order: startOrder + i,
          uploaded_at: "",
          file,
        };
      });

      onChange([...images, ...newItems]);
    },
    [images, onChange],
  );

  const handleRemove = async (img: ImageItem) => {
    if (img.file) {
      URL.revokeObjectURL(img.original_url);
    } else {
      await deleteListingImage(img.original_url);
    }
    const next = images
      .filter((i) => i.id !== img.id)
      .map((i, idx) => ({ ...i, order: idx }));
    onChange(next);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, idx) => ({ ...img, order: idx })));
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-[#1a1a2e] bg-[#1a1a2e]/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <>
          <p className="font-dm text-sm text-gray-600 font-medium">
            Drop images here or click to browse
          </p>
          <p className="font-dm text-xs text-gray-400 mt-1">
            JPEG, PNG, or WebP up to 10 MB
          </p>
        </>
      </div>

      {error && (
        <p className="font-dm text-sm text-red-500 font-medium">{error}</p>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img
                src={img.original_url}
                alt={`Upload ${idx + 1}`}
                className="w-full h-28 object-cover"
              />
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 font-dm text-[10px] font-semibold bg-[#1a1a2e] text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    className="w-7 h-7 rounded-full bg-white text-gray-700 text-xs font-bold flex items-center justify-center hover:bg-gray-100 border-none cursor-pointer"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    className="w-7 h-7 rounded-full bg-white text-gray-700 text-xs font-bold flex items-center justify-center hover:bg-gray-100 border-none cursor-pointer"
                    title="Move right"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(img)}
                  className="w-7 h-7 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600 border-none cursor-pointer"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
