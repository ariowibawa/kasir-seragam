"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface StockAlert {
  level: "Stok habis" | "Stok hampir habis" | "Stok sedikit";
  itemName: string;
  size: string;
  remaining: number;
  threshold: number;
}

const levelConfig = {
  "Stok habis": {
    icon: "error",
    dotClass: "bg-error",
    textClass: "text-error",
    bgClass: "bg-error-container/30",
  },
  "Stok hampir habis": {
    icon: "warning",
    dotClass: "bg-error",
    textClass: "text-on-error-container",
    bgClass: "bg-error-container/20",
  },
  "Stok sedikit": {
    icon: "info",
    dotClass: "bg-tertiary",
    textClass: "text-on-tertiary-container",
    bgClass: "bg-tertiary-fixed/20",
  },
};

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch stock alerts
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/stock/alerts");
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();

    // Poll every 60 seconds
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const hasAlerts = alerts.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative ${
          hasAlerts
            ? "bg-error-container/40 text-error hover:bg-error-container/60"
            : "bg-surface-container-low text-on-surface hover:text-primary"
        }`}
        title="Notifikasi Stok"
      >
        <span
          className="material-symbols-outlined"
          style={
            hasAlerts ? { fontVariationSettings: "'FILL' 1" } : undefined
          }
        >
          notifications
        </span>

        {/* Badge */}
        {hasAlerts && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-error text-on-error text-[10px] font-bold shadow-sm animate-pulse">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-xl shadow-lg ambient-shadow border border-outline-variant/20 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/15 bg-surface-container-low/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">
                inventory_2
              </span>
              <h4 className="font-headline text-sm font-bold text-on-surface">
                Notifikasi Stok
              </h4>
            </div>
            {hasAlerts && (
              <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded-full">
                {alerts.length} alert{alerts.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-[24px] animate-spin block mb-2">
                  progress_activity
                </span>
                Memuat notifikasi...
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-[32px] mb-2 block text-tertiary">
                  check_circle
                </span>
                Semua stok dalam kondisi aman
              </div>
            ) : (
              <div className="flex flex-col py-1">
                {alerts.map((alert, idx) => {
                  const config = levelConfig[alert.level];
                  return (
                    <div
                      key={`${alert.itemName}-${alert.size}-${idx}`}
                      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-high/50 transition-colors cursor-default`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dotClass}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-on-surface truncate">
                            {alert.itemName}
                          </span>
                          <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded-md flex-shrink-0">
                            {alert.size}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${config.textClass}`}
                        >
                          {alert.level} — sisa {alert.remaining}/{alert.threshold}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {hasAlerts && (
            <div className="border-t border-outline-variant/15 px-4 py-2.5 bg-surface-container-low/30">
              <Link
                href="/stok"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Lihat semua stok
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
