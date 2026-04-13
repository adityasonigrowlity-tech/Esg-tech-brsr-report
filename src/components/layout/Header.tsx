'use client';

import React from "react";
import Link from "next/link";
import { MessageCircle, Leaf, User, LogOut } from "lucide-react";
import { useAuthorization } from "@/hooks/use-authorization";
import { signOut } from "next-auth/react";


interface HeaderProps {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  yearOptions: string[];
}

export default function Header({
  selectedYear,
  setSelectedYear,
  yearOptions,
}: HeaderProps) {
  const { user, isAuthenticated, isLoading } = useAuthorization();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 w-full">
      <div className="mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Nav */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                ESGtech<span className="text-emerald-600">.ai</span>
              </span>
            </div>

            <nav className="hidden xl:flex items-center gap-8">
              <Link href="#" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Dashboard</Link>
              <Link href="#" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Sites</Link>
              <Link href="#" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">GHG Reports</Link>
              <Link href="#" className="text-sm font-bold text-emerald-600 border-b-2 border-emerald-600 pb-1">BRSR Reports</Link>
              <Link href="#" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Edit Data</Link>
              <Link href="#" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Help</Link>
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            {/* Year selectors grouping */}
            <div className="hidden sm:flex items-center gap-4 bg-gray-50/80 border border-gray-100 rounded-2xl px-5 py-2.5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Current Year</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none cursor-pointer"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Baseline Year</span>
                <select className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none cursor-pointer">
                  <option>None</option>
                  <option>FY 2023-24</option>
                </select>
              </div>
            </div>

            {/* AI Button */}
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#006D43] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/10 hover:bg-[#005a37] transition-all hover:scale-[1.02]">
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Ask AI</span>
            </button>

            <div className="h-6 w-px bg-gray-200"></div>
 
            {/* Auth State */}
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right hidden lg:flex">
                    <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                    <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all group"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/signin" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
                  <Link href="/auth/signup" className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-black rounded-xl hover:bg-emerald-700 shadow-md transition-all">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
