"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token in cookie via API
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token }),
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-28 h-28 mx-auto mb-4 flex-shrink-0 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo SMP Al-Azhar"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-3xl font-black text-primary font-headline tracking-tight">SMP Al Azhar</h1>
          <p className="text-sm text-on-surface-variant font-body mt-1">Sistem invetaris seragam</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 ambient-shadow">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-2">Sign In</h2>
          <p className="font-body text-sm text-on-surface-variant mb-8">Enter your credentials to access the dashboard.</p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">mail</span>
                <input
                  id="email"
                  name="email"
                  autoComplete="email"
                  className="w-full bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-3 pl-10 pr-4 rounded-t-md transition-all outline-none"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sekolah.id"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  className="w-full bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-3 pl-10 pr-4 rounded-t-md transition-all outline-none"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3.5 rounded-xl font-headline font-bold text-base shadow-[0_4px_14px_rgba(0,45,127,0.2)] hover:shadow-[0_6px_20px_rgba(0,45,127,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
