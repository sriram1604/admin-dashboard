"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Send,
  Users,
  User,
  MessageSquare,
  Bell,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  Search,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function SendNotificationPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const employees = useQuery(api.admin.getEmployees);
  const sendBulk = useAction(api.notifications.sendBulkNotification);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !employees) return employees ?? [];
    return employees.filter((e) =>
      `${e.firstname} ${e.lastname}`.toLowerCase().includes(q) ||
      (e.role ?? "").toLowerCase().includes(q)
    );
  }, [employees, search]);

  const allSelected =
    filtered.length > 0 && filtered.every((e) => selectedIds.has(e._id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      filtered.forEach((e) => next.delete(e._id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filtered.forEach((e) => next.add(e._id));
      setSelectedIds(next);
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedEmployees = employees?.filter((e) => selectedIds.has(e._id)) ?? [];

  const handleSend = async () => {
    if (selectedIds.size === 0 || !message.trim()) {
      toast.error("Please select at least one employee and enter a message");
      return;
    }
    setSending(true);
    try {
      await sendBulk({
        employeeIds: Array.from(selectedIds) as any[],
        title: "Admin",
        body: message.trim(),
      });
      toast.success(
        `Notification sent to ${selectedIds.size} employee${selectedIds.size > 1 ? "s" : ""}!`
      );
      setMessage("");
      setSelectedIds(new Set());
      setShowConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const canSend = selectedIds.size > 0 && message.trim().length > 0;

  return (
    <DashboardLayout>
      <div className="section-gap max-w-5xl mx-auto">
        {/* Header */}
        <header className="space-y-2 mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Send Notification
          </h1>
          <p className="text-white/40 text-lg font-medium leading-relaxed">
            Select one or more staff members and blast a push notification.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Employee selector */}
          <div className="glass-card rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

            {/* Section label */}
            <div className="flex items-center justify-between">
              <label className="text-white/20 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Select Recipients
              </label>
              {selectedIds.size > 0 && (
                <span className="text-emerald-400 text-xs font-black uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {selectedIds.size} selected
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-white/20"
              />
            </div>

            {/* Select all row */}
            {filtered.length > 0 && (
              <button
                onClick={toggleAll}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 transition-all group"
              >
                <span className={`transition-colors ${allSelected ? "text-emerald-400" : "text-white/20 group-hover:text-emerald-400"}`}>
                  {allSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </span>
                <span className="text-sm font-bold text-white/50 group-hover:text-white transition-colors">
                  {allSelected ? "Deselect all" : "Select all"}{" "}
                  {search ? "filtered" : ""} ({filtered.length})
                </span>
              </button>
            )}

            {/* Employee list */}
            <div className="flex-1 overflow-y-auto max-h-[360px] custom-scrollbar space-y-1 pr-1">
              {employees === undefined && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                </div>
              )}
              {filtered.map((emp) => {
                const isSelected = selectedIds.has(emp._id);
                return (
                  <motion.button
                    key={emp._id}
                    onClick={() => toggle(emp._id)}
                    layout
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left group ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                        {emp.photoUrl ? (
                          <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-emerald-400">
                            {emp.firstname.charAt(0)}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-[#0f0f0f] flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Name & role */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-white truncate">
                        {emp.firstname} {emp.lastname}
                      </span>
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                        {emp.role || "Personnel"}
                      </span>
                    </div>

                    {/* Checkbox visual */}
                    <span className="ml-auto flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-white/15 group-hover:text-white/30 transition-colors" />
                      )}
                    </span>
                  </motion.button>
                );
              })}
              {employees !== undefined && filtered.length === 0 && (
                <div className="text-center py-10 text-white/20 text-sm font-medium">
                  No employees found
                </div>
              )}
            </div>
          </div>

          {/* Right: Message + Send */}
          <div className="flex flex-col gap-6">
            {/* Selected badges preview */}
            <AnimatePresence>
              {selectedEmployees.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="glass-card rounded-[2rem] p-5 space-y-3"
                >
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                    Recipients
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployees.map((emp) => (
                      <span
                        key={emp._id}
                        className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full pl-1 pr-3 py-1"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] font-black text-emerald-400">
                          {emp.firstname.charAt(0)}
                        </div>
                        <span className="text-emerald-300 text-xs font-bold">
                          {emp.firstname}
                        </span>
                        <button
                          onClick={() => toggle(emp._id)}
                          className="text-white/20 hover:text-white transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message card */}
            <div className="glass-card rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-5 flex-1 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

              <label className="text-white/20 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Notification Message
              </label>

              <textarea
                rows={7}
                placeholder="Type your message here..."
                className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-3xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-base font-medium leading-relaxed resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {/* Character count */}
              <p className="text-white/20 text-xs text-right font-medium">
                {message.length} characters
              </p>

              {/* Send button */}
              <button
                onClick={() => {
                  if (!canSend) {
                    toast.error(
                      selectedIds.size === 0
                        ? "Select at least one employee"
                        : "Enter a message"
                    );
                    return;
                  }
                  setShowConfirm(true);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/10 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>
                  {selectedIds.size > 1
                    ? `Blast to ${selectedIds.size} Employees`
                    : selectedIds.size === 1
                    ? "Send Notification"
                    : "Blast Notification"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Confirm Modal */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="w-full max-w-xl glass rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="overflow-y-auto custom-scrollbar max-h-[90vh] p-10">
                  <header className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">
                        Confirm Broadcast
                      </h3>
                      <p className="text-white/40 font-medium">
                        This will be pushed immediately to {selectedIds.size}{" "}
                        employee{selectedIds.size > 1 ? "s" : ""}.
                      </p>
                    </div>
                  </header>

                  <div className="space-y-5 mb-8">
                    {/* Message preview */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-3">
                        Message Preview
                      </p>
                      <p className="text-emerald-400 font-black text-sm uppercase tracking-wider mb-1">
                        Admin
                      </p>
                      <p className="text-white text-base font-medium italic leading-relaxed">
                        &ldquo;{message}&rdquo;
                      </p>
                    </div>

                    {/* Recipients */}
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                        Recipients ({selectedEmployees.length})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                        {selectedEmployees.map((emp) => (
                          <div
                            key={emp._id}
                            className="flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {emp.photoUrl ? (
                                <img
                                  src={emp.photoUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-emerald-400">
                                  {emp.firstname.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-sm">
                                {emp.firstname} {emp.lastname}
                              </span>
                              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                                {emp.role || "Personnel"}
                              </span>
                            </div>
                            <ChevronRight className="w-3 h-3 text-white/10 ml-auto" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowConfirm(false)}
                      disabled={sending}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Confirm &amp; Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
