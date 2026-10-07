"use client";

import MediaLibrary from "@/components/MediaLibrary";

export default function MediaPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Media</h1>
      <p className="mb-4 text-sm text-slate-500">
        Upload images, copy their URL, or delete them. Images are stored on the media server - the blog&apos;s featured image and article images use the same library.
      </p>
      <MediaLibrary />
    </div>
  );
}
