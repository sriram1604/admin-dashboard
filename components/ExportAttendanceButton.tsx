"use client";

import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Download, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { format, subDays, subMonths, subYears, startOfToday, endOfToday } from "date-fns";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";

export default function ExportAttendanceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const convex = useConvex();

  const handleExport = async (type: string) => {
    let start = new Date();
    let end = new Date();

    switch (type) {
      case "today":
        start = startOfToday();
        end = endOfToday();
        break;
      case "week":
        start = subDays(new Date(), 7);
        end = new Date();
        break;
      case "month":
        start = subMonths(new Date(), 1);
        end = new Date();
        break;
      case "year":
        start = subYears(new Date(), 1);
        end = new Date();
        break;
      case "custom":
        start = new Date(startDate);
        end = new Date(endDate);
        break;
    }

    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");

    setIsExporting(true);
    setIsOpen(false);

    try {
      const fetchExportData = await convex.query(api.admin.getAttendanceExport, { 
        startDate: startStr, 
        endDate: endStr 
      });

      if (fetchExportData) {
        const data = fetchExportData.map(r => ({
          "Employee Name": r.employeeName,
          "Employee ID": r.employeeIdTag || "N/A",
          "Phone": r.employeePhone || "N/A",
          "Date": r.dateString,
          "Status": r.status,
          "Check In": r.attendanceTime ? format(r.attendanceTime, "hh:mm a") : "---",
          "Check Out": r.checkoutTime ? format(r.checkoutTime, "hh:mm a") : "---",
          "OT (Mins)": r.otDurationMinutes || 0,
          "City": r.city || "N/A",
          "Address": r.address || "N/A",
          "Reason (if absent)": r.reason || "N/A"
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Attendance_${startStr}_to_${endStr}.xlsx`);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Download Excel</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-64 bg-[#111114] border border-white/10 rounded-3xl shadow-2xl z-100 overflow-hidden backdrop-blur-xl"
          >
            <div className="p-2">
              <button
                onClick={() => handleExport("today")}
                className="w-full text-left px-5 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-2xl transition-all flex items-center gap-3 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:shadow-[0_0_8px_#10b981]" />
                <span className="text-xs font-bold uppercase tracking-widest">Today</span>
              </button>
              <button
                onClick={() => handleExport("week")}
                className="w-full text-left px-5 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-2xl transition-all flex items-center gap-3 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:shadow-[0_0_8px_#3b82f6]" />
                <span className="text-xs font-bold uppercase tracking-widest">Last Week</span>
              </button>
              <button
                onClick={() => handleExport("month")}
                className="w-full text-left px-5 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-2xl transition-all flex items-center gap-3 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:shadow-[0_0_8px_#a855f7]" />
                <span className="text-xs font-bold uppercase tracking-widest">Last Month</span>
              </button>
              <button
                onClick={() => handleExport("year")}
                className="w-full text-left px-5 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-2xl transition-all flex items-center gap-3 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:shadow-[0_0_8px_#f59e0b]" />
                <span className="text-xs font-bold uppercase tracking-widest">Last Year</span>
              </button>
              
              <div className="h-px bg-white/5 my-2" />
              
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full text-left px-5 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-2xl transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Custom Range</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDatePicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4 bg-white/2 rounded-2xl mt-2 border border-white/5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-[#0d0d0f] border border-white/5 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-[#0d0d0f] border border-white/5 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                      <button
                        onClick={() => handleExport("custom")}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Export Range
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
