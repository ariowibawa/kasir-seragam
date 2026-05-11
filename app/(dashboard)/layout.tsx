"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="bg-background text-on-surface antialiased h-screen overflow-hidden flex">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col h-screen relative z-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-0" : "ml-72"
        }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        {children}
      </div>
    </div>
  );
}
