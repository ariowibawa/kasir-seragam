"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StudentResult {
  id: number;
  nis: string;
  name: string;
  className: string;
  grade: number;
}

interface UniformResult {
  id: number;
  name: string;
  category: string;
  type: string;
  icon: string | null;
}

interface SearchResults {
  students: StudentResult[];
  uniforms: UniformResult[];
}

export default function QuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ students: [], uniforms: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasResults = results.students.length > 0 || results.uniforms.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults({ students: [], uniforms: [] });
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults({ students: [], uniforms: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const navigateTo = (path: string) => {
    setIsOpen(false);
    setQuery("");
    setResults({ students: [], uniforms: [] });
    router.push(path);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* Search Input */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">
        search
      </span>
      <input
        className="input-ledger pl-10 pr-4 py-2 w-72 text-sm font-body"
        placeholder="Cari siswa atau seragam..."
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => { if (query.trim().length >= 2) setIsOpen(true); }}
      />

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-surface-container-lowest rounded-xl ambient-shadow border border-outline-variant/15 z-[200] overflow-hidden animate-in">
          {loading ? (
            <div className="px-5 py-8 flex flex-col items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
              <span className="text-sm font-body">Mencari...</span>
            </div>
          ) : !hasResults ? (
            <div className="px-5 py-8 flex flex-col items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-outline">search_off</span>
              <span className="text-sm font-body">Tidak ada hasil untuk &quot;{query}&quot;</span>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {/* Students Section */}
              {results.students.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-surface-container-low/60">
                    <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
                      Siswa
                    </span>
                  </div>
                  {results.students.map((s) => (
                    <button
                      key={`s-${s.id}`}
                      className="w-full text-left px-4 py-3 hover:bg-surface-container-high/60 transition-colors flex items-center gap-3 group"
                      onClick={() => navigateTo(`/siswa?search=${encodeURIComponent(s.name)}`)}
                    >
                      <div className="w-9 h-9 rounded-full bg-primary-fixed-dim/30 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {getInitials(s.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-on-surface truncate">{s.name}</div>
                        <div className="text-xs text-on-surface-variant">
                          NIS: {s.nis} &bull; Kelas {s.className}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Uniforms Section */}
              {results.uniforms.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-surface-container-low/60">
                    <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
                      Seragam
                    </span>
                  </div>
                  {results.uniforms.map((u) => (
                    <button
                      key={`u-${u.id}`}
                      className="w-full text-left px-4 py-3 hover:bg-surface-container-high/60 transition-colors flex items-center gap-3 group"
                      onClick={() => navigateTo("/stok")}
                    >
                      <div className="w-9 h-9 rounded-md bg-secondary-container/40 text-on-secondary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">
                          {u.icon || "checkroom"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-on-surface truncate">{u.name}</div>
                        <div className="text-xs text-on-surface-variant">{u.type} &bull; {u.category}</div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
