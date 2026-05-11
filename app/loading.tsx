export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-headline font-black text-2xl animate-pulse">
          PL
        </div>
        <p className="font-label text-sm font-semibold text-primary tracking-widest uppercase animate-pulse">
          Loading Data...
        </p>
      </div>
    </div>
  );
}
