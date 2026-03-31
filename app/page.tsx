"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, UserCheck, UserX, Clock, Calendar, Download, ExternalLink, MessageSquareQuote, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import OTManagement from "@/components/OTManagement";

export default function Home() {
  const stats = useQuery(api.admin.getDashboardStats);

  const statCards = [
    { 
      label: "Total Employees", 
      value: stats?.totalEmployees ?? "...", 
      icon: Users, 
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20"
    },
    { 
      label: "Present Today", 
      value: stats?.presentToday ?? "...", 
      icon: UserCheck, 
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20"
    },
    { 
      label: "Absent Today", 
      value: stats?.absentToday ?? "...", 
      icon: UserX, 
      color: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/20"
    },
    { 
      label: "Pending Verification", 
      value: stats?.pendingToday ?? "...", 
      icon: Clock, 
      color: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20"
    },
  ];

  return (
    <DashboardLayout>
      <div className="section-gap">
        <header className="flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">Overview Dashboard</h1>
            <div className="flex items-center gap-3 text-white/40 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest leading-none">
                  Monitoring: <span className="text-emerald-400">{stats?.dateString || "..." }</span> (IST)
                </span>
            </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] group hover:border-white/20 transition-all relative overflow-hidden"
            >
                <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${stat.color} flex items-center justify-center mb-6 shadow-2xl ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon className="text-white w-7 h-7" />
                    </div>
                    <p className="text-white/40 font-bold text-xs uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className="text-5xl font-black text-white tracking-tighter">{stat.value}</p>
                </div>
                
                {/* Decorative background circle */}
                <div className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-linear-to-br ${stat.color} opacity-5 blur-3xl group-hover:opacity-15 transition-opacity duration-700`} />
            </motion.div>
          ))}
        </div>

        <OTManagement />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            {/* APK Download Section */}
            <div className="lg:col-span-2 glass-card rounded-[3rem] p-10 md:p-14 min-h-[450px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative z-10 max-w-lg">
                    <div className="w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                         <Download className="w-12 h-12 text-blue-400" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight tracking-tight">Access via Mobile App</h3>
                    <p className="text-white/40 mb-10 text-lg leading-relaxed">
                      Download the latest <b>PAK Enterprises APK</b> to manage attendance on the go. Optimized for real-time tracking and field operations.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <a 
                        href="http://pakenterprisesapk.vercel.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 group/btn"
                      >
                          <Download className="w-6 h-6 group-hover/btn:translate-y-1 transition-transform" />
                          <span>Download APK Now</span>
                      </a>
                      <a 
                        href="http://pakenterprisesapk.vercel.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 active:scale-95 flex items-center justify-center gap-3"
                      >
                          <ExternalLink className="w-6 h-6" />
                          <span>Release Notes</span>
                      </a>
                    </div>
                </div>
            </div>

            {/* Absent Employee Reasons Section */}
            <div className="glass-card rounded-[3rem] p-10 border border-white/5 flex flex-col h-[450px] overflow-hidden">
                <div className="flex items-center justify-between mb-10 shrink-0">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight">Absent Reasons</h3>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Recent Submissions</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]" />
                </div>
                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0 pb-4">
                    <AbentReasonsList />
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AbentReasonsList() {
    const reasons = useQuery(api.admin.getAbsentReasons);

    if (!reasons) return (
        <div className="space-y-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-3xl bg-white/5 animate-pulse" />
            ))}
        </div>
    );

    if (reasons.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <MessageSquareQuote className="w-12 h-12 text-white/5 mb-4" />
            <p className="text-white/20 font-bold">No absence reasons reported today.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {reasons.map((record: any) => (
                <AbsentReasonCard key={record._id} record={record} />
            ))}
        </div>
    );
}

function AbsentReasonCard({ record }: { record: any }) {
    const [isMessaging, setIsMessaging] = useState(false);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const sendNotification = useMutation(api.admin.insertNotification);

    const handleSend = async () => {
        if (!message.trim()) return;
        setIsSending(true);
        try {
            await sendNotification({
                employeeId: record.employeeId,
                title: "Message from Admin",
                body: message.trim(),
            });
            setMessage("");
            setIsMessaging(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-6 rounded-3xl bg-white/3 border border-white/5 flex flex-col gap-4 hover:bg-white/6 transition-all cursor-default group">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                    {record.employeePhoto ? (
                        <img src={record.employeePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white/20 text-xs">
                            {record.employeeName.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-black text-sm uppercase tracking-tight group-hover:text-rose-400 transition-colors truncate">{record.employeeName}</p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsMessaging(!isMessaging)}
                                className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/10 outline-none"
                                title="Send Message"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] ml-1" />
                        </div>
                    </div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5">{record.dateString}</p>
                    <p className="text-white/50 text-sm mt-3 leading-relaxed font-medium italic line-clamp-3">"{record.reason}"</p>
                </div>
            </div>

            {/* Messaging Input Area */}
            {isMessaging && (
                <div className="pl-14 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 focus-within:border-white/30 transition-colors">
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Message ${record.employeeName.split(' ')[0]}...`}
                            className="bg-transparent border-none outline-none text-sm text-white px-2 flex-1 placeholder:text-white/20 min-w-0"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!message.trim() || isSending}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
