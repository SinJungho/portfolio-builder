"use client";

import { Plus, Bell, Search } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">내 포트폴리오</h1>
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 w-80 group focus-within:border-gray-900 transition-colors">
          <Search className="w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
          <input 
            type="text" 
            placeholder="포트폴리오 검색..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-200">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-bold">새 포트폴리오 만들기</span>
        </button>
      </div>
    </header>
  );
}
