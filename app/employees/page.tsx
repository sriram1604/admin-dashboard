"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Search, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight, 
  Mail,
  Phone,
  CreditCard,
  UserCircle,
  Hash,
  X,
  BadgeCheck,
  Calendar,
  Clock,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const employees = useQuery(api.admin.getEmployees);
  const isLoading = employees === undefined;
  
  const filteredEmployees = employees?.filter(emp => {
    const fullName = `${emp.firstname} ${emp.lastname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           emp.phonenumber.includes(searchTerm) ||
           emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <DashboardLayout>
      <div className="section-gap">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Staff Directory</h1>
                <p className="text-white/40 text-lg font-medium leading-relaxed max-w-2xl">
                  Manage and view all registered employees within the Pak Enterprises ecosystem.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                 <div className="relative group w-full sm:w-[320px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search name, phone or id..."
                        className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl px-14 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all w-full text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button 
                    onClick={() => setShowInviteModal(true)}
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Invite Staff</span>
                </button>
            </div>
        </header>

        <div className="table-container shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/3 border-b border-white/10">
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">Employee Profile</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">Contact Channels</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">Role</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] text-center">Status</th>
                            <th className="px-8 py-6 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                             [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-8 py-12 h-20 bg-white/1" />
                                </tr>
                            ))
                        ) : filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-24 text-center">
                                  <div className="max-w-xs mx-auto space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                                      <UserCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-white/20 font-bold text-lg">No staff members found.</p>
                                  </div>
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((emp, index) => (
                                <motion.tr 
                                    key={emp._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="table-row group cursor-pointer"
                                    onClick={() => setSelectedEmployeeId(emp._id)}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden group-hover:scale-110 transition-transform shadow-inner">
                                                {emp.photoUrl ? (
                                                    <img src={emp.photoUrl} alt="" className="w-full h-full object-cover rounded-[14px]" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-white/30 text-xl">
                                                        {emp.firstname.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-black tracking-tight group-hover:text-emerald-400 transition-colors uppercase text-base">
                                                    {emp.firstname} {emp.lastname}
                                                </p>
                                                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase mt-1 tracking-widest">
                                                    <BadgeCheck className="w-3 h-3" />
                                                    Verified Staff
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-white/60 text-sm font-bold">
                                                <Mail className="w-4 h-4 text-emerald-400/50" />
                                                {emp.email || "---"}
                                            </div>
                                            <div className="flex items-center gap-3 text-white/60 text-sm font-bold">
                                                <Phone className="w-4 h-4 text-emerald-400/50" />
                                                {emp.phonenumber}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-white/80 font-bold text-sm bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-fit">
                                            <Briefcase className="w-4 h-4 text-emerald-400/50" />
                                            {emp.role || "Employee"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                         <div className={`mx-auto inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                                            (emp.status === 'active' || !emp.status) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                         }`}>
                                             <div className={`w-1.5 h-1.5 rounded-full ${ (emp.status === 'active' || !emp.status) ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                             <span className="text-[10px] font-black uppercase tracking-widest">{(emp.status || 'Active')}</span>
                                         </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 text-white/20 group-hover:text-emerald-400 transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="px-10 py-8 bg-white/2 border-t border-white/5 flex items-center justify-between">
                <p className="text-white/20 text-sm font-black uppercase tracking-[0.2em]">Total Personnel: <span className="text-white/60">{filteredEmployees.length}</span></p>
                <div className="flex items-center gap-4">
                    <button className="p-3 border border-white/5 rounded-2xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button className="p-3 border border-white/5 rounded-2xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEmployeeId && (
            <EmployeeDetailModal 
                id={selectedEmployeeId} 
                onClose={() => setSelectedEmployeeId(null)} 
            />
        )}
        {showInviteModal && (
            <InviteEmployeeModal 
                onClose={() => setShowInviteModal(false)}
            />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function EmployeeDetailModal({ id, onClose }: { id: string, onClose: () => void }) {
    const details = useQuery(api.admin.getEmployeeDetails, { employeeId: id as any });
    const updateEmployee = useMutation(api.admin.updateEmployee);
    
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);

    // Initialize form when details are loaded or edit mode is entered
    const startEditing = () => {
        if (details) {
            setEditForm({
                firstname: details.firstname,
                lastname: details.lastname,
                email: details.email || "",
                phonenumber: details.phonenumber,
                employeeId: details.employeeId || "",
                role: details.role || "Employee",
                status: details.status || "active",
                joiningDate: details.joiningDate || Date.now(),
                aadharCardnumber: details.aadharCardnumber || "",
            });
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await updateEmployee({
                id: id as any,
                ...editForm
            });
            toast.success("Employee updated successfully!");
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update employee");
        } finally {
            setSubmitting(false);
        }
    };

    if (!details) return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-md">
             <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        </div>
    );

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
                className="w-full max-w-3xl glass rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
                    {!isEditing ? (
                        <button 
                            onClick={startEditing}
                            className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400 transition-all border border-white/5"
                        >
                            <Edit3 className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSave}
                            disabled={submitting}
                            className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/20"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="p-3 rounded-xl bg-white/5 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 z-20 transition-all border border-white/5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cover Image / Visual */}
                <div className="md:w-2/5 bg-[#0d0d0f] relative overflow-hidden flex flex-col items-center justify-center p-10 order-2 md:order-1 border-r border-white/5">
                    <div className="w-40 h-40 rounded-[3rem] bg-linear-to-br from-emerald-500/20 to-blue-500/20 border-2 border-white/10 p-2 relative z-10">
                         {details.photoUrl ? (
                             <img src={details.photoUrl} alt="" className="w-full h-full object-cover rounded-[2.5rem]" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white/20">
                                 {details.firstname.charAt(0)}
                             </div>
                         )}
                         <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl border-4 border-[#0d0d0f]">
                             <ShieldCheck className="text-white w-6 h-6" />
                         </div>
                    </div>

                    <div className="mt-8 text-center relative z-10 w-full">
                        {isEditing ? (
                            <div className="space-y-4 px-6">
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-center font-black uppercase text-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                                    value={editForm.firstname}
                                    onChange={e => setEditForm({...editForm, firstname: e.target.value})}
                                    placeholder="First Name"
                                />
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-center font-black uppercase text-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                                    value={editForm.lastname}
                                    onChange={e => setEditForm({...editForm, lastname: e.target.value})}
                                    placeholder="Last Name"
                                />
                            </div>
                        ) : (
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-4">{details.firstname} {details.lastname}</h2>
                        )}
                        <div className="flex items-center justify-center gap-3 mt-4">
                             {isEditing ? (
                                 <select 
                                    className="bg-[#18181b] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 px-3 py-1.5 rounded-full outline-none"
                                    value={editForm.role}
                                    onChange={e => setEditForm({...editForm, role: e.target.value})}
                                 >
                                     <option value="Employee">Employee</option>
                                     <option value="Manager">Manager</option>
                                     <option value="Admin">Admin</option>
                                 </select>
                             ) : (
                                 <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">{details.role || 'Personnel'}</span>
                             )}
                             
                             {isEditing ? (
                                 <select 
                                    className="bg-[#18181b] border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 px-3 py-1.5 rounded-full outline-none"
                                    value={editForm.status}
                                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                                 >
                                     <option value="active">Active</option>
                                     <option value="inactive">Inactive</option>
                                 </select>
                             ) : (
                                 <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-400">{details.status || 'Active'}</span>
                             )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-10 w-full relative z-10">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center">
                            <p className="text-emerald-400 font-black text-2xl">{details.attendanceSummary.presentDays}</p>
                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Presents</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center">
                            <p className="text-rose-400 font-black text-2xl">{details.attendanceSummary.absentDays}</p>
                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Absents</p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="md:w-3/5 p-12 overflow-y-auto order-1 md:order-2 bg-white/1">
                    <div className="space-y-12">
                         <div className="space-y-6">
                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4">Personal Identifiers</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs font-bold flex items-center gap-2 italic">
                                        <Hash className="w-3.5 h-3.5 text-emerald-400" /> Employee ID
                                    </label>
                                    {isEditing ? (
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-emerald-500/50"
                                            value={editForm.employeeId}
                                            onChange={e => setEditForm({...editForm, employeeId: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-white font-black tracking-tight">{details.employeeId || '---'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs font-bold flex items-center gap-2 italic">
                                        <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Joined Date
                                    </label>
                                    {isEditing ? (
                                        <input 
                                            type="date"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-emerald-500/50"
                                            value={editForm.joiningDate ? new Date(editForm.joiningDate).toISOString().split('T')[0] : ""}
                                            onChange={e => setEditForm({...editForm, joiningDate: new Date(e.target.value).getTime()})}
                                        />
                                    ) : (
                                        <p className="text-white font-black tracking-tight">{details.joiningDate ? format(details.joiningDate, "MMM dd, yyyy") : '---'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs font-bold flex items-center gap-2 italic">
                                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact
                                    </label>
                                    {isEditing ? (
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-emerald-500/50"
                                            value={editForm.phonenumber}
                                            onChange={e => setEditForm({...editForm, phonenumber: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-white font-black tracking-tight">{details.phonenumber}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs font-bold flex items-center gap-2 italic">
                                        <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email
                                    </label>
                                    {isEditing ? (
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-emerald-500/50"
                                            value={editForm.email}
                                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-white font-black tracking-tight break-all uppercase text-sm">{details.email || '---'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs font-bold flex items-center gap-2 italic">
                                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Aadhar Number
                                    </label>
                                    {isEditing ? (
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-emerald-500/50"
                                            value={editForm.aadharCardnumber}
                                            onChange={e => setEditForm({...editForm, aadharCardnumber: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-white font-black tracking-tight uppercase text-sm">{details.aadharCardnumber || '---'}</p>
                                    )}
                                </div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4">Activity Timeline (Latest)</p>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-emerald-500/20 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Last Check-In</p>
                                        <p className="text-white font-bold text-lg">{details.lastCheckIn ? format(details.lastCheckIn, "hh:mm a (MMM dd)") : 'No activity recorded'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-emerald-500/20 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                                        <Clock className="w-6 h-6 rotate-180" />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Last Check-Out</p>
                                        <p className="text-white font-bold text-lg">{details.lastCheckOut ? format(details.lastCheckOut, "hh:mm a (MMM dd)") : '---'}</p>
                                    </div>
                                </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                            <AlertCircle className="w-5 h-5 text-emerald-400" />
                            <p className="text-emerald-400/60 text-xs font-medium italic">Employee data is strictly managed for security and payroll accuracy.</p>
                         </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function InviteEmployeeModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        employeeId: "",
        role: "Employee"
    });
    const [submitting, setSubmitting] = useState(false);
    const createEmployee = useMutation(api.admin.createEmployee);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.employeeId) {
            toast.error("Please fill in all mandatory fields");
            return;
        }

        setSubmitting(true);
        try {
            await createEmployee({
                name: formData.name,
                email: formData.email,
                phonenumber: formData.phone,
                employeeId: formData.employeeId,
                role: formData.role
            });
            toast.success("Employee invited successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to invite employee");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-2xl glass rounded-[3rem] border border-white/10 shadow-3xl overflow-y-auto custom-scrollbar p-12 max-h-[90vh]"
            >
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <UserPlus className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2 uppercase">Invite Personnel</h3>
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Create system access for new staff</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-all">
                        <X className="w-8 h-8" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] px-2 italic">Full Legal Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold tracking-tight"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] px-2 italic">Official Email</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="rahul@company.com"
                                className="w-full bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold tracking-tight"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] px-2 italic">Phone Number</label>
                            <input 
                                type="tel" 
                                required
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="+91 XXXXXXXXXX"
                                className="w-full bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold tracking-tight"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] px-2 italic">Employee ID</label>
                            <input 
                                type="text" 
                                required
                                value={formData.employeeId}
                                onChange={e => setFormData({...formData, employeeId: e.target.value})}
                                placeholder="PK-2026-X"
                                className="w-full bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold tracking-tight"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-3">
                            <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] px-2 italic">Organization Role</label>
                            <select 
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                                className="w-full bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold tracking-tight appearance-none"
                            >
                                <option value="Employee" className="bg-[#18181b]">Employee / Staff</option>
                                <option value="Manager" className="bg-[#18181b]">Department Manager</option>
                                <option value="Admin" className="bg-[#18181b]">System Administrator</option>
                                <option value="Contractor" className="bg-[#18181b]">Contract Worker</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Syncing with Database...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                    <span>Finalize & Create Account</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
