export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508]">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />
      </div>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/60">
        Loading...
      </p>
    </div>
  );
}
