export function CustomPreview() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-[16%] top-[20%] h-4 w-9 rounded-full bg-pink-400/40" />
      <div className="absolute right-[14%] top-[32%] h-2.5 w-12 rounded-full bg-white/25" />
      <div className="absolute bottom-[26%] left-[30%] h-4 w-16 rounded bg-white/10" />
      <div className="absolute bottom-[44%] right-[24%] h-4 w-10 rounded bg-white/10" />
      <div className="absolute bottom-[16%] right-[20%] h-3 w-8 rounded-full bg-emerald-400/30" />
    </div>
  );
}
