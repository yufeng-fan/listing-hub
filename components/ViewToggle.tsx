"use client";

type Mode = "list" | "map" | "split";
export default function ViewToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const btn = (m: Mode, label: string) => (
    <button
      onClick={() => onChange(m)}
      className={`px-3 py-1 rounded-md border text-sm ${mode === m ? "bg-black text-white" : "bg-white"}`}
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex gap-2">
      {btn("list", "List")}
      {btn("map", "Map")}
      {btn("split", "Split")}
    </div>
  );
}
