"use client";

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
          Uniform Management
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">
            search
          </span>
          <input
            className="input-ledger pl-10 pr-4 py-2 w-64 text-sm font-body"
            placeholder="Quick Search..."
            type="text"
          />
        </div>
        <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:text-primary transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}
