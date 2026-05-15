"use client";

import QuickSearch from "./QuickSearch";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export default function Header({ toggleSidebar, isSidebarCollapsed }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md flex justify-between items-center px-10 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 mr-2 rounded-lg hover:bg-surface-container-high transition-colors text-slate-500 dark:text-slate-400 focus:outline-none"
        >
          <span className="material-symbols-outlined">
            {isSidebarCollapsed ? "menu_open" : "menu"}
          </span>
        </button>
        <h2 className="font-headline text-lg font-bold text-primary">
          Manajemen Seragam
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <QuickSearch />
        <NotificationBell />
      </div>
    </header>
  );
}
