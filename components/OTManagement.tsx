"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Clock, AlertTriangle, CheckCircle2, UserCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OTManagement() {
  const otStatus = useQuery(api.admin.getTodayOTStatus);
  const updateToNonOT = useMutation(api.admin.updateOTStatusToFalse);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const handleUpdate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateToNonOT({ attendanceId: id as any });
      setConfirmId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update OT status");
    }
  };

  const formatDuration = (startTime: number | undefined) => {
    if (!startTime) return "--:--";
    const diffMins = Math.floor((now - startTime) / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  const formatTime = (time: number | undefined) => {
    if (!time) return "--:--";
    return new Date(time).toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!otStatus) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mt-8 mb-8">
        <div className="glass-card rounded-[3rem] p-10 min-h-[400px] animate-pulse"></div>
        <div className="glass-card rounded-[3rem] p-10 min-h-[400px] animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mt-8 mb-16">
      {/* OT Employees */}
      <div className="glass-card rounded-[3rem] p-8 md:p-10 border border-emerald-500/20 flex flex-col h-full bg-linear-to-br from-emerald-500/5 to-transparent relative overflow-hidden group">
        <div className="absolute top-0 right-[-20px] p-10 opacity-10 blur-xl">
          <Clock className="w-32 h-32 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              OT Employees
            </h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
              {otStatus.ot.length} Active in Overtime
            </p>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 max-h-[500px]">
          {otStatus.ot.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center p-10 opacity-50">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
              <p className="text-white/50 font-bold">No OT employees currently.</p>
            </div>
          ) : (
            otStatus.ot.map((record: any) => (
              <div key={record._id} className="p-5 rounded-3xl bg-black/40 border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold">{record.employeeName}</p>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-white/60 uppercase">
                      {record.employeeIdTag}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-white/40">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> In: {formatTime(record.attendanceTime)}</span>
                    <span className="flex items-center gap-1 text-emerald-400"><AlertTriangle className="w-3 h-3" /> Duration: {formatDuration(record.attendanceTime)}</span>
                  </div>
                </div>

                <div className="relative w-full sm:w-auto flex justify-end">
                  <AnimatePresence mode="wait">
                    {confirmId === record._id ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={(e) => handleUpdate(record._id, e)}
                          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="revoke"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setConfirmId(record._id)}
                        className="px-4 py-2 bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                      >
                        Revoke OT
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Non-OT Employees */}
      <div className="glass-card rounded-[3rem] p-8 md:p-10 border border-blue-500/10 flex flex-col h-full bg-linear-to-br from-blue-500/5 to-transparent relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 blur-xl">
          <UserCheck className="w-32 h-32 text-blue-500" />
        </div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
              Non-OT Employees
            </h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
              {otStatus.nonOt.length} Regular Shift
            </p>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 max-h-[500px]">
          {otStatus.nonOt.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center p-10 opacity-50">
              <UserCheck className="w-12 h-12 text-blue-400 mb-4" />
              <p className="text-white/50 font-bold">No regular shift employees.</p>
            </div>
          ) : (
            otStatus.nonOt.map((record: any) => (
              <div key={record._id} className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold">{record.employeeName}</p>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-white/60 uppercase">
                      {record.employeeIdTag}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-white/40">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> In: {formatTime(record.attendanceTime)}</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                  Standard
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
