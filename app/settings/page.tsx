"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Settings as SettingsIcon, Shield, Bell, Database, Globe, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const sections = [
    { title: "Security", icon: Shield, desc: "Manage administrative PIN and session timeouts.", status: "Active" },
    { title: "Notifications", icon: Bell, desc: "Configure alerts for late check-ins and overtime.", status: "Configured" },
    { title: "Backend Sync", icon: Database, desc: "Convex deployment and data synchronization status.", status: "Connected" },
    { title: "Global Config", icon: Globe, desc: "Timezone settings and office location parameters.", status: "System" },
    { title: "Automation", icon: Cpu, desc: "Configure cron jobs for daily attendance generation.", status: "Enabled" },
  ];

  return (
    <DashboardLayout>
      <div className="section-gap">
        <header className="flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">System Settings</h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-2xl">
              Configure your environment, security parameters, and communication channels.
            </p>
        </header>

        <div className="space-y-6 md:space-y-8">
            {sections.map((section, index) => (
                <motion.div
                    key={section.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-10 rounded-[3rem] hover:border-white/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8 h-full min-h-[140px]"
                >
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/30 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all border border-white/5 shadow-2xl group-hover:scale-110">
                            <section.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">{section.title}</h3>
                            <p className="text-white/40 text-sm mt-2 font-medium leading-loose max-w-md">{section.desc}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            {section.status}
                        </span>
                        <button className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all border border-white/5 active:scale-95">
                            Manage
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>

        <div className="p-10 md:p-14 rounded-[3.5rem] bg-linear-to-br from-emerald-500/10 via-transparent to-transparent border border-emerald-500/10 relative overflow-hidden group">
            <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-3 text-emerald-400 mb-6 bg-emerald-500/10 w-fit px-4 py-1.5 rounded-full border border-emerald-500/20">
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Protocol</span>
                </div>
                <h4 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Advanced Protection Ecosystem</h4>
                <p className="text-white/40 text-lg leading-relaxed font-medium">
                    The Pak Admin Dashboard utilizes high-level JWT encryption for session integrity. All staff interaction data is processed and stored within Convex's secure cloud infrastructure with real-time replication.
                </p>
            </div>
            {/* Background pattern */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-emerald-500/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </div>
    </DashboardLayout>
  );
}
