"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { to: "/", icon: "dashboard", label: "Dashboard" },
  { to: "/kasir", icon: "payments", label: "Kasir / Pengambilan" },
  { to: "/siswa", icon: "groups", label: "Data Siswa" },
  { to: "/stok", icon: "inventory_2", label: "Stok Seragam" },
  { to: "/kas", icon: "account_balance_wallet", label: "Buku Kas" },
];

const baseClasses =
  "flex items-center gap-3 py-3 px-4 rounded-lg font-body text-sm transition-all duration-150";
const inactiveClasses =
  "text-on-surface-variant hover:bg-surface-container-highest font-medium";
const activeClasses =
  "bg-surface-container-lowest text-primary shadow-sm font-semibold scale-[0.98]";

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <nav
      className={`h-screen w-72 fixed left-0 top-0 overflow-y-auto bg-surface-container-low flex flex-col gap-2 p-6 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <div className="mb-8 px-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-headline font-black text-xl">
          PL
        </div>
        <div>
          <h1 className="text-xl font-black text-primary font-headline tracking-tight">
            PrecisionLoom
          </h1>
          <p className="text-xs text-on-surface-variant font-label">
            Uniform Distribution
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {navItems.map((item) => {
          const isActive =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`${baseClasses} ${
                isActive ? activeClasses : inactiveClasses
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-4 pt-6 border-t ghost-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center font-headline font-bold text-sm">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold font-body text-on-surface">
                Admin Utama
              </span>
              <span className="text-xs text-on-surface-variant font-label">
                admin@sekolah.id
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-error transition-colors p-1"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
