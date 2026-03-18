"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  ExternalLink,
  Eye,
  Calendar,
  Clock,
  FileText,
  User,
  Map,
  X,
  CreditCard,
  UserCircle,
  ArrowUpDown,
  Navigation,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import ExportAttendanceButton from "@/components/ExportAttendanceButton";

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Fetching all attendance records - In a real app we'd paginate on server
  // Fetching all attendance records - In a real app we'd paginate on server
  const attendanceData = useQuery(api.admin.listAttendance, useMemo(() => ({
    paginationOpts: { numItems: 100, cursor: null }, 
  }), []));

  const isLoading = attendanceData === undefined;
  
  // Filtering and Sorting
  const filteredRecords = attendanceData?.page.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         record.employeePhone?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.dateString).getTime();
    const dateB = new Date(b.dateString).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  }) || [];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "present": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "absent": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-white/5 text-white/40 border-white/5";
    }
  };

  return (
    <DashboardLayout>
      <div className="section-gap">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Attendance Logs</h1>
                <p className="text-white/40 text-lg font-medium leading-relaxed max-w-2xl">
                  Real-time monitoring of personnel check-ins and check-outs across all sectors.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                 <div className="relative group w-full sm:w-[320px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Filter by employee name..."
                        className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl px-14 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all w-full text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative w-full sm:w-auto">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <select 
                        className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl pl-14 pr-10 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer w-full text-sm font-bold uppercase tracking-widest transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all" className="bg-[#0d0d0f] text-white py-3">Any Status</option>
                        <option value="present" className="bg-[#0d0d0f] text-white py-3">Present</option>
                        <option value="absent" className="bg-[#0d0d0f] text-white py-3 border-t border-white/10">Absent Only</option>
                    </select>
                </div>

                <button 
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                    <ArrowUpDown className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
                </button>

                <ExportAttendanceButton />
            </div>
        </header>

        {/* Custom scrollable table container */}
        <div className="table-container shadow-2xl relative">
            <div className="overflow-x-auto overflow-y-auto max-h-[700px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-[#111114] border-b border-white/10">
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] min-w-[250px]">Employee</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] min-w-[150px]">Date</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] min-w-[150px]">Check In</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] min-w-[150px]">Check Out</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] text-center min-w-[150px]">Status</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] min-w-[200px]">Location Data</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] min-w-[200px]">Note / Reason</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={7} className="px-8 py-10 bg-white/1" />
                                </tr>
                            ))
                        ) : filteredRecords.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-8 py-24 text-center">
                                  <div className="max-w-xs mx-auto space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                                      <Search className="w-8 h-8" />
                                    </div>
                                    <p className="text-white/20 font-bold text-lg">No records found for this criteria.</p>
                                  </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRecords.map((record, index) => (
                                <motion.tr 
                                    key={record._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedRecord(record)}
                                    className="table-row group border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/2"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-black text-white/40 group-hover:scale-110 transition-transform overflow-hidden">
                                                {record.photoUrl ? (
                                                    <img src={record.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    record.employeeName.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-base tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{record.employeeName}</p>
                                                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5">{record.employeePhone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-white/70 font-bold text-sm">
                                            <Calendar className="w-4 h-4 text-emerald-400" />
                                            <span>{record.dateString}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-white/80 font-bold text-sm">
                                            <Clock className="w-4 h-4 text-emerald-400/40" />
                                            <span>{record.attendanceTime ? format(record.attendanceTime, "hh:mm a") : "--:--"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-white/80 font-bold text-sm">
                                            <Clock className="w-4 h-4 text-rose-400/40 rotate-180" />
                                            <span>{record.checkoutTime ? format(record.checkoutTime, "hh:mm a") : "--:--"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className={`mx-auto inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-sm ${getStatusClass(record.status)}`}>
                                            <div className={`w-2 h-2 rounded-full ${
                                              record.status === 'present' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 
                                              record.status === 'absent' ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]' : 
                                              'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                                            }`} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">{record.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {record.lat && record.long ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-white/80 font-mono text-xs">
                                                    <Navigation className="w-3 h-3 text-emerald-400" />
                                                    <span>{record.lat.toFixed(4)}, {record.long.toFixed(4)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{record.address || record.city || "Location details"}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-white/10 text-xs italic font-medium">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        {record.status === 'absent' && record.reason ? (
                                            <div className="flex items-start gap-2 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 max-w-[250px]">
                                                <FileText className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                                <p className="text-rose-400/80 text-xs font-medium leading-relaxed italic line-clamp-2">
                                                    {record.reason}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-white/10 text-xs font-medium italic">---</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Table Footer */}
            <div className="px-10 py-8 bg-white/2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">
                  Total Displayed Records: <span className="text-white/60">{filteredRecords.length}</span>
                </p>
                <div className="flex items-center gap-6">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest hidden md:block">Scroll for more</p>
                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 bg-emerald-500 rounded-xl text-white font-black text-xs shadow-2xl shadow-emerald-500/40">1</button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <AttendanceDetailModal 
            record={selectedRecord} 
            onClose={() => setSelectedRecord(null)} 
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function AttendanceDetailModal({ record, onClose }: { record: any, onClose: () => void }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "present": return { label: "Present", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case "absent": return { label: "Absent", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
      default: return { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    }
  };

  const config = getStatusConfig(record.status);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl glass rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex flex-col relative max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white z-20 transition-all border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-black text-white/40 overflow-hidden">
              {record.photoUrl ? (
                <img src={record.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                record.employeeName.charAt(0)
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{record.employeeName}</h2>
              <p className="text-white/30 text-xs font-black uppercase tracking-widest">{record.employeePhone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Date</p>
              <div className="flex items-center gap-2 text-white font-bold">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{record.dateString}</span>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Status</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border}`}>
                <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : record.status === 'absent' ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{config.label}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2">Shift Timing</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/2 border border-white/5">
                  <Clock className="w-5 h-5 text-emerald-400/40" />
                  <div>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Check In</p>
                    <p className="text-white font-bold">{record.attendanceTime ? format(record.attendanceTime, "hh:mm a") : "---"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/2 border border-white/5">
                  <Clock className="w-5 h-5 text-rose-400/40 rotate-180" />
                  <div>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Check Out</p>
                    <p className="text-white font-bold">{record.checkoutTime ? format(record.checkoutTime, "hh:mm a") : "---"}</p>
                  </div>
                </div>
              </div>
            </div>

            {record.lat && (
              <div className="space-y-4">
                <p className="text-white/20 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2">Location Intelligence</p>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-white/60 font-medium leading-relaxed">{record.address || record.city || "Location details captured"}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <code className="text-[10px] text-white/20 font-mono">{record.lat.toFixed(6)}, {record.long.toFixed(6)}</code>
                    <a 
                      href={`https://www.google.com/maps?q=${record.lat},${record.long}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                      <Map className="w-3" /> View Map
                    </a>
                  </div>
                </div>
              </div>
            )}

            {record.reason && (
              <div className="space-y-4">
                <p className="text-white/20 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2">Provided Reason</p>
                <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 italic">
                  <p className="text-rose-400/80 font-medium tracking-tight">"{record.reason}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
