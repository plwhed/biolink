export default function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="orb left-[-10%] top-[-5%] h-[400px] w-[400px] bg-pink-400"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="orb left-[40%] top-[35%] h-[320px] w-[320px] bg-fuchsia-400"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="orb bottom-[-10%] right-[-5%] h-[420px] w-[420px] bg-rose-300"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}