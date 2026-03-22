"use client";

export default function ImageGallery({ urls }: { urls: string[] }) {
  if (!urls?.length) {
    return (
      <div className="h-64 bg-slate-100 grid place-items-center rounded-lg">
        No images
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      <img
        src={urls[0]}
        alt="primary"
        className="col-span-3 h-72 w-full object-cover rounded-lg"
      />
      {urls.slice(1, 4).map((u, i) => (
        <img
          key={i}
          src={u}
          alt={`img-${i}`}
          className="h-32 w-full object-cover rounded"
        />
      ))}
    </div>
  );
}
