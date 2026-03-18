"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  UserCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", icon: BarChart3, path: "/" },
    { name: "Employees", icon: Users, path: "/employees" },
    { name: "Attendance Records", icon: ClipboardList, path: "/attendance" },
    { name: "Send Notification", icon: UserCircle, path: "/notifications" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed lg:relative z-50 w-[280px] h-screen glass border-r border-white/5 flex flex-col"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <BarChart3 className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">PAK Admin</span>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                        isActive 
                        ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]" 
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-400" : "group-hover:text-white"}`} />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="active-pill"
                          className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-8 pt-0">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 glass border-b border-white/5 px-6 md:px-10 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-all active:scale-90"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="hidden md:block">
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest">Administrator Portal</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-white font-semibold tracking-tight">Pak Administrator</span>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Super User</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center p-0.5 shadow-xl">
               <UserCircle className="w-full h-full text-white/30" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto container-padding">
          <div className="max-w-7xl mx-auto section-gap h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
