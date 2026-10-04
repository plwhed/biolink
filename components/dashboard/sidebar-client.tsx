"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

export default function SidebarClient({ session, avatarUrl, navItems, iconMap }: any) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isContentOpen, setIsContentOpen] = useState(true);

  return (
    <aside className="w-[300px] h-screen sticky top-0 bg-[#0a0a0a] border-r border-[#181818] flex flex-col text-[#ededed] font-sans z-20 rounded-tr-[28px] rounded-br-[28px] overflow-hidden p-[18px_12px]">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 py-2 px-3 pb-5 text-decoration-none">
          <div className="font-bold text-2xl tracking-tighter text-white">
            egirls<span className="text-pink-500">.lol</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden pb-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {/* Main Section */}
          <div className="mt-4 w-full">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors hover:bg-white/5 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 group-hover:text-white transition-colors">
                  {iconMap["grid"]}
                </span>
                <span className="text-lg font-semibold text-white tracking-wide">Main</span>
              </div>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-1 mt-1 ml-6 pl-3 border-l border-[#181818]">
                {navItems
                  .filter((item: any) => item.category === "Main")
                  .map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-lg font-semibold transition-all group ${
                          isActive
                            ? "bg-[#29111d]/20 text-pink-500 border border-transparent"
                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span>{item.label}</span>
                        </div>
                        {item.label === "Settings" && (
                          <span className="text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-full text-white/60">tungtungtest</span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="mt-6 w-full">
            <button
              onClick={() => setIsContentOpen(!isContentOpen)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors hover:bg-white/5 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 group-hover:text-white transition-colors">
                  {iconMap["grid"]}
                </span>
                <span className="text-lg font-semibold text-white tracking-wide">Content</span>
              </div>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isContentOpen ? "rotate-0" : "-rotate-90"}`}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {isContentOpen && (
              <div className="flex flex-col gap-1 mt-1 ml-6 pl-3 border-l border-[#181818]">
                {navItems
                  .filter((item: any) => item.category === "Content")
                  .map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-lg font-semibold transition-all group ${
                          isActive
                            ? "bg-[#29111d]/20 text-pink-500 border border-transparent"
                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        </nav>

        <div className="mt-auto flex flex-col gap-3 pb-4">
          <a href="/sob" target="_blank" className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#29111d]/20 border border-[#29111d]/30 text-pink-500 text-lg font-semibold transition-all hover:bg-[#29111d]/30 hover:border-pink-500/50">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>View Public Profile</span>
          </a>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-[#181818] transition-all hover:bg-white/[0.05] hover:border-[#222]">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#111] border border-white/10 flex items-center justify-center text-white font-bold shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs">{session?.username?.[0]?.toUpperCase() ?? "?"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate text-white">{session?.username ?? "—"}</h3>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
