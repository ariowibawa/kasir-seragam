import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center flex flex-col items-center">
        <span className="material-symbols-outlined text-[100px] text-primary mb-6">
          location_off
        </span>
        <h2 className="font-headline text-4xl font-black text-on-surface mb-4 tracking-tight">
          Page Not Found
        </h2>
        <p className="font-body text-base text-on-surface-variant mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label font-bold text-base shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
