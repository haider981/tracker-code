// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";

// import {
//   AlertCircle,
//   Clock,
//   ChevronLeft,
//   ChevronRight,
//   Calendar as CalendarIcon,
//   Users as UsersIcon,
//   Filter as FilterIcon,
//   Pencil,
//   Trash2,
//   Plus,
//   ChevronDown,
//   X as XIcon,
//   Loader2,
// } from "lucide-react";

// /* =================== CONFIG =================== */
// const API_BASE_URL = "http://localhost:5000";

// /* =================== MAIN PAGE =================== */
// export default function AdminEditWorklogEntries() {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [user, setUser] = useState(null);

//   /* ===== Auth (as-is from AdminDashboard) ===== */
//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       setUser({
//         name: decoded.name,
//         email: decoded.email,
//         role: decoded.role,
//         picture:
//           decoded.picture ||
//           `https://ui-avatars.com/api/?name=${encodeURIComponent(
//             decoded.name
//           )}&background=random&color=fff`,
//       });
//       axios.defaults.headers.common.Authorization = `Bearer ${token}`;
//     } catch (e) {
//       console.error("Invalid token:", e);
//       localStorage.removeItem("authToken");
//       navigate("/");
//     }
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     delete axios.defaults.headers.common.Authorization;
//     navigate("/");
//   };

//   /* ===== Edit Worklogs STATE/LOGIC ===== */

//   // Data
//   const [worklogsByDate, setWorklogsByDate] = useState({});
//   const [employees, setEmployees] = useState([]);

//   // Status
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filters: employees
//   const [selectedEmployees, setSelectedEmployees] = useState([]);
//   const [showEmpDropdown, setShowEmpDropdown] = useState(false);
//   const empRef = useOutclick(() => setShowEmpDropdown(false));

//   // Filters: dates
//   const todayISO = stripToISO(new Date());
//   const [datePopoverOpen, setDatePopoverOpen] = useState(false);
//   const [rangeMode, setRangeMode] = useState(true);
//   const [tempStart, setTempStart] = useState(isoNDaysAgo(2));
//   const [tempEnd, setTempEnd] = useState(todayISO);
//   const [activeMonth, setActiveMonth] = useState(() => toMonthKey(new Date(tempEnd)));
//   const [startISO, setStartISO] = useState(isoNDaysAgo(2));
//   const [endISO, setEndISO] = useState(todayISO);
//   const popRef = useOutclick(() => setDatePopoverOpen(false));

//   // Filters: audit statuses (kept for filtering only)
//   const ALL_STATUSES = [
//     "Pending",
//     "Re-Pending",
//     "Approved",
//     "Rejected",
//     "Re-Approved",
//     "Re-Rejected",
//   ];
//   const [showStatusDropdown, setShowStatusDropdown] = useState(false);
//   const statusRef = useOutclick(() => setShowStatusDropdown(false));
//   const [selectedAuditStatuses, setSelectedAuditStatuses] = useState([...ALL_STATUSES]);

//   // Edit / Add modals
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [addModalOpen, setAddModalOpen] = useState(false);
//   const [savingEdit, setSavingEdit] = useState(false);
//   const [savingAdd, setSavingAdd] = useState(false);

//   const [editForm, setEditForm] = useState(initialFormState());
//   const [addForm, setAddForm] = useState(initialFormState());
//   const [formErrors, setFormErrors] = useState({});

//   // Context for add
//   const [addContext, setAddContext] = useState({ dateKey: null, employeeName: null });

//   /* --- Fetch employees --- */
//   useEffect(() => {
//     if (!user) return;
//     fetchEmployees();
//   }, [user]);

//   const fetchEmployees = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.success) {
//         setEmployees(response.data.employees || []);
//       } else {
//         console.error("Failed to fetch employees:", response.data.message);
//       }
//     } catch (err) {
//       console.error("Failed to fetch employees:", err.response?.data?.message || err.message);
//     }
//   };

//   /* --- Fetch worklogs (on filter change) --- */
//   useEffect(() => {
//     if (!user) return;
//     fetchWorklogs();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, startISO, endISO, selectedEmployees, selectedAuditStatuses.length]);

// const fetchWorklogs = async () => {
//   try {
//     setLoading(true);
//     setError(null);
//     const token = localStorage.getItem("authToken");
//     const response = await axios.post(`${API_BASE_URL}/api/admin/worklogs`, {
//       startDate: startISO,
//       endDate: endISO,
//       employees: selectedEmployees,
//     }, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (response.data.success) {
//       setWorklogsByDate(response.data.worklogsByDate || {});
//     } else {
//       throw new Error(response.data.message || "Failed to fetch worklogs");
//     }
//   } catch (err) {
//     console.error(err);
//     setError(`Failed to fetch worklogs: ${err.response?.data?.message || err.message}`);
//   } finally {
//     setLoading(false);
//   }
// };

//   /* --- Derived helpers --- */
//   const sortedDateKeys = useMemo(
//     () => Object.keys(worklogsByDate).sort((a, b) => new Date(b) - new Date(a)),
//     [worklogsByDate]
//   );

//   const groupByEmployee = (items) => {
//     const byEmp = {};
//     for (const row of items) {
//       if (!byEmp[row.employeeName]) byEmp[row.employeeName] = [];
//       byEmp[row.employeeName].push(row);
//     }
//     return Object.fromEntries(
//       Object.keys(byEmp)
//         .sort((a, b) => a.localeCompare(b))
//         .map((k) => [k, byEmp[k]])
//     );
//   };

//   const rowClassForAudit = (status) => {
//     if (status === "Approved" || status === "Re-Approved") return "bg-emerald-50/70";
//     if (status === "Rejected" || status === "Re-Rejected") return "bg-rose-50/70";
//     if (status === "Re-Pending") return "bg-amber-50";
//     if (status === "Pending") return "bg-yellow-50";
//     return "";
//   };

//   const AuditBadge = ({ status }) => {
//     if (status === "Approved")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
//           Approved
//         </span>
//       );
//     if (status === "Rejected")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-medium">
//           Rejected
//         </span>
//       );
//     if (status === "Re-Pending")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 text-amber-800 px-2 py-0.5 text-xs font-medium">
//           Re-Pending
//         </span>
//       );
//     if (status === "Re-Approved")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 text-emerald-800 px-2 py-0.5 text-xs font-medium">
//           Re-Approved
//         </span>
//       );
//     if (status === "Re-Rejected")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-rose-200 text-rose-800 px-2 py-0.5 text-xs font-medium">
//           Re-Rejected
//         </span>
//       );
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 text-yellow-800 px-2 py-0.5 text-xs font-medium">
//         Pending
//       </span>
//     );
//   };

//   /* =================== CRUD: Edit / Delete / Add =================== */
//   const handleOpenEdit = (log, dateKey) => {
//     // prefill form with the selected row
// setEditForm({
// _id: log._id,
// employeeName: log.employeeName || "",
// workMode: log.workMode || "",
// projectName: log.projectName || "",
// task: log.task || "",
// bookElement: log.bookElement || "",
// chapterNo: log.chapterNo ?? "",
// hoursSpent: log.hoursSpent ?? "",
// noOfUnits: log.noOfUnits ?? "",
// unitType: log.unitType || "",
// status: log.status || "",
// dueOn: toISODateOnly(log.dueOn) || dateKey, // ensure yyyy-mm-dd
// details: log.details || "",
// auditStatus: log.auditStatus || "Pending",
// dateKey, // for local state writeback
// });
// setFormErrors({});
// setEditModalOpen(true);
//   };

//   const handleSaveEdit = async () => {
//     const errs = validateForm(editForm, { allowAuditStatus: true });
//     setFormErrors(errs);
//     if (Object.keys(errs).length > 0) return;

//     try {
//       setSavingEdit(true);
//       const response = await axios.put(`${API_BASE_URL}/api/admin/worklogs/${editForm._id}`, {
//         employeeName: editForm.employeeName,
//         workMode: editForm.workMode,
//         projectName: editForm.projectName,
//         task: editForm.task,
//         bookElement: editForm.bookElement,
//         chapterNo: Number(editForm.chapterNo) || 0,
//         hoursSpent: Number(editForm.hoursSpent) || 0,
//         noOfUnits: Number(editForm.noOfUnits) || 0,
//         unitType: editForm.unitType,
//         status: editForm.status,
//         dueOn: editForm.dueOn,
//         details: editForm.details,
//         auditStatus: editForm.auditStatus,
//       });

//       if (response.data.success) {
//         // Optimistic update locally
//         setWorklogsByDate((prev) => {
//           const next = { ...prev };
//           const dk = editForm.dateKey;
//           if (!next[dk]) return next;
//           next[dk] = next[dk].map((r) =>
//             r._id === editForm._id
//               ? {
//                 ...r,
//                 employeeName: editForm.employeeName,
//                 workMode: editForm.workMode,
//                 projectName: editForm.projectName,
//                 task: editForm.task,
//                 bookElement: editForm.bookElement,
//                 chapterNo: Number(editForm.chapterNo) || 0,
//                 hoursSpent: Number(editForm.hoursSpent) || 0,
//                 noOfUnits: Number(editForm.noOfUnits) || 0,
//                 unitType: editForm.unitType,
//                 status: editForm.status,
//                 dueOn: editForm.dueOn,
//                 details: editForm.details,
//                 auditStatus: editForm.auditStatus,
//               }
//               : r
//           );
//           return next;
//         });

//         setEditModalOpen(false);
//       } else {
//         throw new Error(response.data.message || "Failed to save changes");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(`Failed to save changes: ${err.response?.data?.message || err.message}`);
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this entry?")) return;

//     try {
//       const response = await axios.delete(`${API_BASE_URL}/api/admin/worklogs/${id}`);

//       if (response.data.success) {
//         // Remove locally
//         setWorklogsByDate((prev) => {
//           const next = { ...prev };
//           for (const dateKey of Object.keys(next)) {
//             next[dateKey] = next[dateKey].filter((r) => r._id !== id);
//           }
//           return next;
//         });
//       } else {
//         throw new Error(response.data.message || "Failed to delete entry");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(`Failed to delete entry: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const handleOpenAdd = (employeeName, dateKey) => {
//     setAddContext({ dateKey, employeeName });
//     setAddForm({
// _id: undefined,
// employeeName: employeeName || "",
// workMode: "",
// projectName: "",
// task: "",
// bookElement: "",
// chapterNo: "",
// hoursSpent: "",
// noOfUnits: "",
// unitType: "",
// status: "",
// dueOn: dateKey, // default to selected day
// details: "",
// auditStatus: "Pending",
// });
// setFormErrors({});
// setAddModalOpen(true);
//   };

//   const handleSaveAdd = async () => {
//     const errs = validateForm(addForm, { allowAuditStatus: true });
//     setFormErrors(errs);
//     if (Object.keys(errs).length > 0) return;

//     try {
//       setSavingAdd(true);
//       const response = await axios.post(`${API_BASE_URL}/api/admin/worklogs`, {
//         employeeName: addForm.employeeName,
//         workMode: addForm.workMode,
//         projectName: addForm.projectName,
//         task: addForm.task,
//         bookElement: addForm.bookElement,
//         chapterNo: Number(addForm.chapterNo) || 0,
//         hoursSpent: Number(addForm.hoursSpent) || 0,
//         noOfUnits: Number(addForm.noOfUnits) || 0,
//         unitType: addForm.unitType,
//         status: addForm.status,
//         dueOn: addForm.dueOn,
//         details: addForm.details,
//         auditStatus: addForm.auditStatus,
//       });

//       if (response.data.success) {
//         // Inject into local state under the proper dateKey
//         const dk = addContext.dateKey;
//         setWorklogsByDate((prev) => {
//           const next = { ...prev };
//           const createdRow = response.data.worklog || {};
//           if (!next[dk]) next[dk] = [];
//           next[dk] = [...next[dk], createdRow];
//           return next;
//         });

//         setAddModalOpen(false);
//       } else {
//         throw new Error(response.data.message || "Failed to add entry");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(`Failed to add entry: ${err.response?.data?.message || err.message}`);
//     } finally {
//       setSavingAdd(false);
//     }
//   };

//   /* --- Date filter helpers --- */
//   const applyTempDate = () => {
//     if (rangeMode) {
//       const s = tempStart <= tempEnd ? tempStart : tempEnd;
//       const e = tempEnd >= tempStart ? tempEnd : tempStart;
//       setStartISO(s);
//       setEndISO(e);
//     } else {
//       setStartISO(tempEnd);
//       setEndISO(tempEnd);
//     }
//     setDatePopoverOpen(false);
//   };

//   const quickApply = (days) => {
//     setRangeMode(true);
//     const s = isoNDaysAgo(days - 1);
//     setTempStart(s);
//     setTempEnd(todayISO);
//     setActiveMonth(toMonthKey(new Date(todayISO)));
//     setStartISO(s);
//     setEndISO(todayISO);
//   };

//   const labelForFilter = () =>
//     startISO === endISO ? formatISOToHuman(startISO) : `${formatISOToHuman(startISO)} – ${formatISOToHuman(endISO)}`;

//   /* --- Render guards --- */
//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-100">
//         <div className="flex items-center gap-3">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
//           <p>Loading...</p>
//         </div>
//       </div>
//     );
//   }
//   /* =================== LAYOUT (Navbar + Sidebar) =================== */
//   return (
//     <div className="min-h-screen bg-slate-100">
//       {/* Navbar */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
//         <div className="max-w-full mx-auto px-4 sm:px-6">
//           <div className="flex items-center justify-between h-16">
//             {/* Left side */}
//             <div className="flex items-center">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="mr-4 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 lg:hidden"
//               >
//                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               </button>
//               <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
//                 Admin Dashboard <span className="hidden sm:inline">- Edit Worklogs</span>
//               </h1>
//             </div>

//             {/* Right side */}
//             <div className="hidden md:flex items-center space-x-4">
//               <div className="flex items-center space-x-3">
//                 <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-slate-600" />
//                 <div className="text-right">
//                   <div className="text-sm font-medium">{user.name}</div>
//                   <div className="text-xs text-slate-300">{user.email}</div>
//                 </div>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
//               >
//                 Logout
//               </button>
//             </div>

//             {/* Mobile menu button (kept for parity, no dropdown content here) */}
//             <div className="md:hidden">
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
//               >
//                 {!mobileMenuOpen ? (
//                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                   </svg>
//                 ) : (
//                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Sidebar */}
//       {sidebarOpen && (
//         <div className="fixed inset-0 z-40 lg:hidden">
//           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
//           <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl overflow-y-auto">
//            <SidebarLinks navigate={navigate} location={useLocation()} close={() => setSidebarOpen(false)} />
//           </aside>
//         </div>
//       )}
//       <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
//         <SidebarLinks navigate={navigate} location={useLocation()} />
//       </aside>


//       {/* =================== MAIN CONTENT =================== */}
//       <main className="lg:ml-72 pt-20 p-6">
//         <div className="p-3 sm:p-4 lg:p-6 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
//           {/* ===== Filters ===== */}
//           <div className="rounded-xl lg:rounded-2xl shadow-md border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-4 lg:p-5">
//             <div className="flex items-center gap-2 mb-3 lg:mb-4">
//               <FilterIcon className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
//               <h3 className="text-sm lg:text-base font-semibold text-slate-800 tracking-tight">Filters</h3>
//             </div>

//             {/* Filters Row */}
//             <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-wrap lg:items-end lg:gap-6">
//               {/* Date Picker */}
//               <div className="w-full lg:min-w-[280px] lg:w-auto relative" ref={popRef}>
//                 <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Date(s)</label>
//                 <button
//                   onClick={() => setDatePopoverOpen((o) => !o)}
//                   className="w-full border rounded-lg px-3 py-2 flex items-center justify-between hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
//                 >
//                   <span className="flex items-center gap-2 min-w-0 flex-1">
//                     <CalendarIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
//                     <span className="text-xs lg:text-sm font-medium truncate">{labelForFilter()}</span>
//                   </span>
//                   <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{rangeMode ? "Range" : "Single"}</span>
//                 </button>

//                 {datePopoverOpen && (
//                   <div className="absolute z-50 mt-2 w-[340px] right-0 lg:right-auto lg:left-0 rounded-xl border bg-white shadow-xl">
//                     <div className="px-3 py-2 border-b flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => setRangeMode(false)}
//                           className={`text-xs px-2 py-1 rounded ${!rangeMode ? "bg-slate-900 text-white" : "bg-slate-100"}`}
//                         >
//                           Single Day
//                         </button>
//                         <button
//                           onClick={() => setRangeMode(true)}
//                           className={`text-xs px-2 py-1 rounded ${rangeMode ? "bg-slate-900 text-white" : "bg-slate-100"}`}
//                         >
//                           Range
//                         </button>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <button
//                           onClick={() => setActiveMonth(toMonthKey(addMonths(parseMonthKey(activeMonth), -1)))}
//                           className="p-1 hover:bg-slate-100 rounded"
//                           aria-label="Prev month"
//                         >
//                           <ChevronLeft className="w-4 h-4" />
//                         </button>
//                         <div className="text-xs font-medium w-[130px] text-center">{formatMonthKey(activeMonth)}</div>
//                         <button
//                           onClick={() => {
//                             const nextM = addMonths(parseMonthKey(activeMonth), 1);
//                             if (isMonthFullyInFuture(nextM)) return;
//                             setActiveMonth(toMonthKey(nextM));
//                           }}
//                           className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
//                           aria-label="Next month"
//                           disabled={isMonthFullyInFuture(addMonths(parseMonthKey(activeMonth), 1))}
//                         >
//                           <ChevronRight className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>

//                     <CalendarGrid
//                       monthKey={activeMonth}
//                       rangeMode={rangeMode}
//                       tempStart={tempStart}
//                       tempEnd={tempEnd}
//                       onPick={(iso) => {
//                         if (!rangeMode) {
//                           if (iso > todayISO) return;
//                           setTempEnd(iso);
//                           return;
//                         }
//                         if (iso > todayISO) return;
//                         if (!tempStart || (tempStart && tempEnd && tempStart <= tempEnd)) {
//                           setTempStart(iso);
//                           setTempEnd(iso);
//                         } else {
//                           if (iso < tempStart) setTempStart(iso);
//                           else setTempEnd(iso);
//                         }
//                       }}
//                     />

//                     <div className="px-3 py-2 border-t flex flex-wrap items-center gap-2">
//                       <button onClick={() => quickApply(3)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 3 Days</button>
//                       <button onClick={() => quickApply(7)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 7 Days</button>
//                       <button onClick={() => quickApply(15)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 15 Days</button>
//                       <button onClick={() => quickApply(30)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 30 Days</button>
//                       <button
//                         onClick={() => {
//                           setRangeMode(false);
//                           setTempEnd(todayISO);
//                           setActiveMonth(toMonthKey(new Date(todayISO)));
//                           setStartISO(todayISO);
//                           setEndISO(todayISO);
//                           setDatePopoverOpen(false);
//                         }}
//                         className="text-xs px-2 py-1 rounded bg-slate-900 text-white ml-auto"
//                       >
//                         Today
//                       </button>
//                       <button onClick={applyTempDate} className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Apply</button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Employees multi-select */}
//               <div ref={empRef} className="relative w-full lg:min-w-[260px] lg:w-auto">
//                 <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Employees</label>
//                 <button
//                   onClick={() => setShowEmpDropdown((o) => !o)}
//                   className="w-full border rounded-lg px-3 py-2 text-xs lg:text-sm text-left flex justify-between items-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
//                 >
//                   <span className="flex flex-wrap gap-1 min-w-0 flex-1">
//                     {selectedEmployees.length === 0 ? (
//                       <span className="text-slate-600">All employees</span>
//                     ) : (
//                       selectedEmployees.map((name) => (
//                         <span key={name} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
//                           {name}
//                         </span>
//                       ))
//                     )}
//                   </span>
//                   <ChevronDown className={`w-4 h-4 ml-2 transition-transform flex-shrink-0 ${showEmpDropdown ? "rotate-180" : "rotate-0"}`} />
//                 </button>

//                 {showEmpDropdown && (
//                   <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                     <div className="px-3 py-2 text-xs text-slate-500 border-b bg-slate-50 flex items-center gap-2">
//                       <UsersIcon className="w-3.5 h-3.5" />
//                       Select employees
//                     </div>
//                     {employees.map((emp) => (
//                       <label key={emp.id || emp.name} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs lg:text-sm">
//                         <input
//                           type="checkbox"
//                           value={emp.name}
//                           checked={selectedEmployees.includes(emp.name)}
//                           onChange={(e) => {
//                             if (e.target.checked) setSelectedEmployees((p) => [...p, emp.name]);
//                             else setSelectedEmployees((p) => p.filter((n) => n !== emp.name));
//                           }}
//                           className="mr-2"
//                         />
//                         {emp.name}
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Audit Status multi-select */}
//               <div ref={statusRef} className="relative w-full lg:min-w-[260px] lg:w-auto">
//                 <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Audit Status</label>
//                 <button
//                   onClick={() => setShowStatusDropdown((o) => !o)}
//                   className="w-full border rounded-lg px-3 py-2 text-xs lg:text-sm text-left flex justify-between items-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
//                 >
//                   <span className="flex flex-wrap gap-1 min-w-0 flex-1">
//                     {selectedAuditStatuses.length === ALL_STATUSES.length ? (
//                       <span className="text-slate-600">All statuses</span>
//                     ) : selectedAuditStatuses.length === 0 ? (
//                       <span className="text-slate-600">None selected</span>
//                     ) : (
//                       selectedAuditStatuses.map((s) => (
//                         <span key={s} className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full text-xs font-medium">
//                           {s}
//                         </span>
//                       ))
//                     )}
//                   </span>
//                   <ChevronDown className={`w-4 h-4 ml-2 transition-transform flex-shrink-0 ${showStatusDropdown ? "rotate-180" : "rotate-0"}`} />
//                 </button>

//                 {showStatusDropdown && (
//                   <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
//                     <div className="px-3 py-2 text-xs text-slate-500 border-b bg-slate-50 flex items-center justify-between">
//                       <span className="flex items-center gap-2">
//                         <UsersIcon className="w-3.5 h-3.5" />
//                         Select statuses
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <button onClick={() => setSelectedAuditStatuses([...ALL_STATUSES])} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200">Select All</button>
//                         <button onClick={() => setSelectedAuditStatuses([])} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200">Clear</button>
//                       </div>
//                     </div>
//                     {ALL_STATUSES.map((status) => (
//                       <label key={status} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs lg:text-sm">
//                         <input
//                           type="checkbox"
//                           value={status}
//                           checked={selectedAuditStatuses.includes(status)}
//                           onChange={() =>
//                             setSelectedAuditStatuses((prev) =>
//                               prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
//                             )
//                           }
//                           className="mr-2"
//                         />
//                         {status}
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Summary info */}
//               <div className="w-full lg:w-auto text-xs text-slate-700 lg:ml-auto">
//                 <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-sky-100 text-sky-800">
//                   <Clock className="w-3.5 h-3.5 flex-shrink-0" />
//                   <span className="font-medium">Edit & manage entries directly</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ===== States ===== */}
//           {loading && (
//             <div className="flex items-center gap-3 py-6">
//               <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-slate-900" />
//               <span className="text-sm lg:text-base text-slate-800">Loading worklogs…</span>
//             </div>
//           )}

//           {error && (
//             <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
//               <div className="flex items-center">
//                 <AlertCircle className="w-5 h-5 text-rose-500 mr-3" />
//                 <span className="text-rose-700">{error}</span>
//               </div>
//               <button onClick={fetchWorklogs} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-sm self-start sm:ml-auto">
//                 Retry
//               </button>
//             </div>
//           )}

//           {!loading && !error && sortedDateKeys.length === 0 && (
//             <div className="text-center py-8 lg:py-12">
//               <Clock className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-base lg:text-lg font-medium text-slate-900 mb-2">No Worklogs Found</h3>
//               <p className="text-sm lg:text-base text-slate-600">Try changing the date range, employees, or status filters above.</p>
//             </div>
//           )}

//           {/* ===== By Date (desktop + mobile) ===== */}
//           {!loading &&
//             !error &&
//             sortedDateKeys.map((dateKey) => {
//               const allRows = worklogsByDate[dateKey] || [];
//               const filteredRows =
//                 selectedAuditStatuses.length === 0
//                   ? []
//                   : allRows.filter((r) => selectedAuditStatuses.includes(r.auditStatus));
//               if (filteredRows.length === 0) return null;

//               const grouped = groupByEmployee(filteredRows);

//               return (
//                 <section key={dateKey} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//                   <div className="px-4 lg:px-5 py-3 lg:py-4 border-b bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                     <h2 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
//                       <CalendarIcon className="w-4 h-4 text-indigo-600" />
//                       {formatISOToHuman(dateKey)}
//                       <span className="ml-2 rounded-full bg-indigo-100 text-indigo-700 text-[11px] px-2 py-0.5 font-medium">
//                         {filteredRows.length} entries
//                       </span>
//                     </h2>
//                   </div>

//                   {/* Desktop grouped tables */}
//                   <div className="hidden lg:block">
//                     {Object.keys(grouped).map((emp) => {
//                       const rows = grouped[emp];

//                       return (
//                         <div key={emp} className="p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-3">
//                               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
//                                 {emp.split(" ").map((x) => x[0] || "").join("").slice(0, 2).toUpperCase()}
//                               </div>
//                               <div>
//                                 <div className="text-sm font-semibold text-slate-900">{emp}</div>
//                                 <div className="text-xs text-slate-500">
//                                   {rows.length} {rows.length === 1 ? "entry" : "entries"}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="overflow-x-auto rounded-xl border border-slate-200">
//                             <table className="w-full text-sm border-collapse">
//                               <thead>
//                                 <tr className="bg-slate-100 text-slate-700">
//                                   <Th>Work Mode</Th>
//                                   <Th>Project</Th>
//                                   <Th>Task</Th>
//                                   <Th>Book Element</Th>
//                                   <Th>Chapter No</Th>
//                                   <Th>Hours Spent</Th>
//                                   <Th>No. of Units</Th>
//                                   <Th>Unit Type</Th>
//                                   <Th>Status</Th>
//                                   <Th>Due On</Th>
//                                   <Th>Details</Th>
//                                   <Th>Audit Status</Th>
//                                   <Th>Action</Th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {rows.map((log) => (
//                                   <tr key={log._id} className={`${rowClassForAudit(log.auditStatus)} border-t`}>
//                                     <Td>{log.workMode}</Td>
//                                     <Td className="max-w-[260px] truncate" title={log.projectName}>
//                                       {log.projectName}
//                                     </Td>
//                                     <Td>{log.task}</Td>
//                                     <Td>{log.bookElement}</Td>
//                                     <Td>{log.chapterNo}</Td>
//                                     <Td>{log.hoursSpent}</Td>
//                                     <Td>{log.noOfUnits}</Td>
//                                     <Td>{log.unitType}</Td>
//                                     <Td>{log.status}</Td>
//                                     <Td>{formatISOToHuman(log.dueOn)}</Td>
//                                     <Td className="max-w-[220px] whitespace-normal break-words">
//                                       {log.details || "-"}
//                                     </Td>
//                                     <Td>
//                                       <AuditBadge status={log.auditStatus} />
//                                     </Td>
//                                     <Td>
//                                       <div className="flex gap-2">
//                                         <button
//                                           className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md"
//                                           onClick={() => handleOpenEdit(log, dateKey)}
//                                           title="Edit"
//                                         >
//                                           <Pencil size={16} />
//                                         </button>
//                                         <button
//                                           className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-md"
//                                           onClick={() => handleDelete(log._id)}
//                                           title="Delete"
//                                         >
//                                           <Trash2 size={16} />
//                                         </button>
//                                       </div>
//                                     </Td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>

//                           {/* Add Entry CTA for this employee & date */}
//                           <div className="mt-3 flex justify-end">
//                             <button
//                               className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
//                               onClick={() => handleOpenAdd(emp, dateKey)}
//                             >
//                               <Plus className="w-4 h-4" /> Add Entry
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Mobile grouped cards */}
//                   <div className="lg:hidden p-3 sm:p-4 space-y-4 sm:space-y-6">
//                     {Object.keys(grouped).map((emp) => {
//                       const rows = grouped[emp];

//                       return (
//                         <div key={emp} className="rounded-lg border border-slate-200 overflow-hidden">
//                           <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-slate-50/70">
//                             <div className="flex items-center gap-3 min-w-0 flex-1">
//                               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
//                                 {emp.split(" ").map((x) => x[0] || "").join("").slice(0, 2).toUpperCase()}
//                               </div>
//                               <div className="min-w-0 flex-1">
//                                 <div className="text-sm font-semibold text-slate-900 truncate">{emp}</div>
//                                 <div className="text-xs text-slate-500">
//                                   {rows.length} {rows.length === 1 ? "entry" : "entries"}
//                                 </div>
//                               </div>
//                             </div>
//                             <button
//                               className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-xs"
//                               onClick={() => handleOpenAdd(emp, dateKey)}
//                             >
//                               <Plus className="w-4 h-4" />
//                               Add
//                             </button>
//                           </div>

//                           <div className="divide-y">
//                             {rows.map((log) => (
//                               <article key={log._id} className={`p-3 sm:p-4 ${rowClassForAudit(log.auditStatus)}`}>
//                                 <div className="flex items-start justify-between mb-3">
//                                   <div className="min-w-0 flex-1 pr-3">
//                                     <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 truncate" title={log.projectName}>
//                                       {log.projectName}
//                                     </h3>
//                                     <p className="text-xs text-slate-500 mt-0.5">
//                                       {log.task} · {log.bookElement} · Ch {log.chapterNo}
//                                     </p>
//                                   </div>
//                                   <AuditBadge status={log.auditStatus} />
//                                 </div>

//                                 <dl className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-[13px] mb-4">
//                                   <Info label="Work Mode" value={log.workMode} />
//                                   <Info label="Hours" value={log.hoursSpent} />
//                                   <Info label="Units" value={`${log.noOfUnits} ${log.unitType || ""}`} />
//                                   <Info label="Status" value={log.status} />
//                                   <Info label="Due On" value={formatISOToHuman(log.dueOn)} />
//                                   {log.details && (
//                                     <div className="col-span-2">
//                                       <dt className="text-slate-500">Details</dt>
//                                       <dd className="text-slate-800 break-words">{log.details}</dd>
//                                     </div>
//                                   )}
//                                 </dl>

//                                 <div className="flex flex-wrap gap-2">
//                                   <button
//                                     className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-0"
//                                     onClick={() => handleOpenEdit(log, dateKey)}
//                                   >
//                                     <Pencil size={16} />
//                                     <span>Edit</span>
//                                   </button>
//                                   <button
//                                     className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-0"
//                                     onClick={() => handleDelete(log._id)}
//                                   >
//                                     <Trash2 size={16} />
//                                     <span>Delete</span>
//                                   </button>
//                                 </div>
//                               </article>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </section>
//               );
//             })}
//         </div>
//       </main>

//       {/* ======= EDIT MODAL ======= */}
//       {editModalOpen && (
//         <Modal onClose={() => setEditModalOpen(false)} title="Edit Worklog Entry">
//           <WorklogForm
//             form={editForm}
//             setForm={setEditForm}
//             errors={formErrors}
//             setErrors={setFormErrors}
//             employees={employees}
//             allowAuditStatus
//           />
//           <div className="mt-4 flex justify-end gap-2">
//             <button
//               className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-slate-800"
//               onClick={() => setEditModalOpen(false)}
//               disabled={savingEdit}
//             >
//               Cancel
//             </button>
//             <button
//               className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-2"
//               onClick={handleSaveEdit}
//               disabled={savingEdit}
//             >
//               {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
//               Save Changes
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* ======= ADD MODAL ======= */}
//       {addModalOpen && (
//         <Modal onClose={() => setAddModalOpen(false)} title={`Add Entry for ${addContext.employeeName || ""} (${formatISOToHuman(addContext.dateKey || "")})`}>
//           <WorklogForm
//             form={addForm}
//             setForm={setAddForm}
//             errors={formErrors}
//             setErrors={setFormErrors}
//             employees={employees}
//             lockEmployee // since you opened from a specific employee
//             defaultEmployee={addContext.employeeName}
//             defaultDate={addContext.dateKey}
//             allowAuditStatus
//           />
//           <div className="mt-4 flex justify-end gap-2">
//             <button
//               className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-slate-800"
//               onClick={() => setAddModalOpen(false)}
//               disabled={savingAdd}
//             >
//               Cancel
//             </button>
//             <button
//               className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-2"
//               onClick={handleSaveAdd}
//               disabled={savingAdd}
//             >
//               {savingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
//               Create Entry
//             </button>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

// /* =============== SidebarLinks (UNCHANGED from AdminDashboard except labels) =============== */
// /* =================== SIDEBAR =================== */
// function SidebarLinks({ navigate, location, close }) {
//   const [openWorklogs, setOpenWorklogs] = useState(false);
//   const [openProjects, setOpenProjects] = useState(false);

//   // Keep sections open if child page active
//   useEffect(() => {
//     if (location.pathname.includes("worklog")) setOpenWorklogs(true);
//     if (location.pathname.includes("project") || location.pathname.includes("abbreviations"))
//       setOpenProjects(true);
//   }, [location]);

//   const handleNavigation = (path) => {
//     navigate(path);
//     if (close) close();
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
//       <nav className="flex flex-col space-y-2">

//         <button
//           className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${location.pathname === "/admin-dashboard" ? "bg-gray-700" : ""
//             }`}
//           onClick={() => handleNavigation("/admin-dashboard")}
//         >
//           Home
//         </button>

//         {/* Worklogs */}
//         <div>
//           <button
//             className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg transition-colors"
//             onClick={() => setOpenWorklogs(!openWorklogs)}
//           >
//             <span>Worklogs</span>
//             <span className="transition-transform duration-200">
//               {openWorklogs ? "▾" : "▸"}
//             </span>
//           </button>
//           {openWorklogs && (
//             <div className="ml-4 mt-2 flex flex-col space-y-2 animate-fadeIn">
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("approve-worklogs") ? "bg-gray-700" : ""
//                   }`}
//                 onClick={() => handleNavigation("/admin/approve-worklogs")}
//               >
//                 Approve Worklogs
//               </button>
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("edit-worklog-entries") ? "bg-gray-700" : ""
//                   }`}
//                 onClick={() => handleNavigation("/admin/edit-worklog-entries")}
//               >
//                 Edit Worklogs
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Employees */}
//         <button
//           className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${location.pathname.includes("handle-employees") ? "bg-gray-700" : ""
//             }`}
//           onClick={() => handleNavigation("/admin/handle-employees")}
//         >
//           Manage Employees
//         </button>

//         {/* Projects */}
//         <div>
//           <button
//             className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg transition-colors"
//             onClick={() => setOpenProjects(!openProjects)}
//           >
//             <span>Projects</span>
//             <span className="transition-transform duration-200">
//               {openProjects ? "▾" : "▸"}
//             </span>
//           </button>
//           {openProjects && (
//             <div className="ml-4 mt-2 flex flex-col space-y-2 animate-fadeIn">
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-abbreviations") ? "bg-gray-700" : ""
//                   }`}
//                 onClick={() => handleNavigation("/admin/add-abbreviations")}
//               >
//                 Add Abbreviations
//               </button>
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-project") ? "bg-gray-700" : ""
//                   }`}
//                 onClick={() => handleNavigation("/admin/add-project")}
//               >
//                 Add Project
//               </button>
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("project-requests") ? "bg-gray-700" : ""
//                   }`}
//                 onClick={() => handleNavigation("/admin/project-requests")}
//               >
//                 Project Requests
//               </button>
//             </div>
//           )}
//         </div>
//       </nav>
//     </div>
//   );
// }


// /* =================== Small components =================== */
// function Info({ label, value }) {
//   return (
//     <div className="min-w-0">
//       <dt className="text-slate-500 truncate">{label}</dt>
//       <dd className="text-slate-800 break-words">{value ?? "-"}</dd>
//     </div>
//   );
// }
// function Th({ children }) {
//   return <th className="p-2 text-left border-b border-slate-300 first:pl-3">{children}</th>;
// }
// function Td({ children, className = "" }) {
//   return <td className={`p-2 border-t border-slate-200 align-top ${className}`}>{children}</td>;
// }

// /* =================== Modal wrapper =================== */
// function Modal({ children, title, onClose }) {
//   useEffect(() => {
//     const onEsc = (e) => e.key === "Escape" && onClose?.();
//     document.addEventListener("keydown", onEsc);
//     return () => document.removeEventListener("keydown", onEsc);
//   }, [onClose]);

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <div className="relative bg-white w-full max-w-3xl mx-4 rounded-2xl shadow-2xl border border-slate-200">
//         <div className="px-5 py-4 border-b flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
//           <button
//             className="p-2 rounded-md hover:bg-slate-100 text-slate-500"
//             onClick={onClose}
//             aria-label="Close"
//           >
//             <XIcon className="w-5 h-5" />
//           </button>
//         </div>
//         <div className="p-5">{children}</div>
//       </div>
//     </div>
//   );
// }

// /* =================== Worklog Form (used for Add & Edit) =================== */
// function WorklogForm({
//   form,
//   setForm,
//   errors,
//   setErrors,
//   employees,
//   lockEmployee = false,
//   defaultEmployee = "",
//   defaultDate = "",
//   allowAuditStatus = false,
// }) {
//   useEffect(() => {
//     if (lockEmployee && defaultEmployee) {
//       setForm((f) => ({ ...f, employeeName: defaultEmployee }));
//     }
//     if (defaultDate) {
//       setForm((f) => ({ ...f, dueOn: defaultDate }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [lockEmployee, defaultEmployee, defaultDate]);

//   const handleChange = (field, value) => {
//     setForm((f) => ({ ...f, [field]: value }));
//     if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
//   };

//   return (
//     <div className="space-y-4">
//       {/* Section: Assignment */}
//       <div>
//         <h4 className="text-sm font-semibold text-slate-800 mb-2">Assignment</h4>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//           {/* Employee */}
//           <div>
//             <Label>Employee</Label>
//             {lockEmployee ? (
//               <input
//                 type="text"
//                 className="input"
//                 value={form.employeeName || ""}
//                 disabled
//               />
//             ) : (
//               <select
//                 className="input"
//                 value={form.employeeName || ""}
//                 onChange={(e) => handleChange("employeeName", e.target.value)}
//               >
//                 <option value="">Select employee</option>
//                 {employees.map((emp) => (
//                   <option key={emp.id || emp.name} value={emp.name}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </select>
//             )}
//             <ErrorText text={errors.employeeName} />
//           </div>

//           {/* Work Mode */}
//           <div>
//             <Label>Work Mode</Label>
//             <input
//               type="text"
//               className="input"
//               value={form.workMode || ""}
//               onChange={(e) => handleChange("workMode", e.target.value)}
//               placeholder="Remote / Office / Hybrid"
//             />
//             <ErrorText text={errors.workMode} />
//           </div>
//         </div>
//       </div>

//       {/* Section: Work Details */}
//       <div>
//         <h4 className="text-sm font-semibold text-slate-800 mb-2">Work Details</h4>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//           <div>
//             <Label>Project</Label>
//             <input
//               type="text"
//               className="input"
//               value={form.projectName || ""}
//               onChange={(e) => handleChange("projectName", e.target.value)}
//               placeholder="Project name"
//             />
//             <ErrorText text={errors.projectName} />
//           </div>
//           <div>
//             <Label>Task</Label>
//             <input
//               type="text"
//               className="input"
//               value={form.task || ""}
//               onChange={(e) => handleChange("task", e.target.value)}
//               placeholder="Task"
//             />
//             <ErrorText text={errors.task} />
//           </div>
//           <div>
//             <Label>Book Element</Label>
//             <input
//               type="text"
//               className="input"
//               value={form.bookElement || ""}
//               onChange={(e) => handleChange("bookElement", e.target.value)}
//               placeholder="e.g., Appendix, Preface"
//             />
//             <ErrorText text={errors.bookElement} />
//           </div>
//           <div>
//             <Label>Chapter No</Label>
//             <input
//               type="number"
//               className="input"
//               value={form.chapterNo}
//               onChange={(e) => handleChange("chapterNo", e.target.value)}
//               min={0}
//               step={1}
//             />
//             <ErrorText text={errors.chapterNo} />
//           </div>
//           <div>
//             <Label>Hours Spent</Label>
//             <input
//               type="number"
//               className="input"
//               value={form.hoursSpent}
//               onChange={(e) => handleChange("hoursSpent", e.target.value)}
//               min={0}
//               step={0.25}
//             />
//             <ErrorText text={errors.hoursSpent} />
//           </div>
//           <div>
//             <Label>No. of Units</Label>
//             <input
//               type="number"
//               className="input"
//               value={form.noOfUnits}
//               onChange={(e) => handleChange("noOfUnits", e.target.value)}
//               min={0}
//               step={1}
//             />
//             <ErrorText text={errors.noOfUnits} />
//           </div>
//           <div>
//             <Label>Unit Type</Label>
//             <input
//               type="text"
//               className="input"
//               value={form.unitType || ""}
//               onChange={(e) => handleChange("unitType", e.target.value)}
//               placeholder="pages / words / items..."
//             />
//             <ErrorText text={errors.unitType} />
//           </div>
//           <div>
//             <Label>Status</Label>
//             <input
//               type="text"
//               className="input"
//               value={form.status || ""}
//               onChange={(e) => handleChange("status", e.target.value)}
//               placeholder="In Progress / Done"
//             />
//             <ErrorText text={errors.status} />
//           </div>
//           <div>
//             <Label>Due On</Label>
//             <input
//               type="date"
//               className="input"
//               value={toISODateOnly(form.dueOn) || ""}
//               onChange={(e) => handleChange("dueOn", e.target.value)}
//               max={toISODateOnly(new Date())}
//             />
//             <ErrorText text={errors.dueOn} />
//           </div>
//         </div>
//       </div>

//       {/* Section: Notes & Audit */}
//       <div>
//         <h4 className="text-sm font-semibold text-slate-800 mb-2">Notes & Audit</h4>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//           <div className="sm:col-span-2">
//             <Label>Details</Label>
//             <textarea
//               className="input min-h-[90px]"
//               value={form.details || ""}
//               onChange={(e) => handleChange("details", e.target.value)}
//               placeholder="Additional details..."
//             />
//             <ErrorText text={errors.details} />
//           </div>

//           {allowAuditStatus && (
//             <div>
//               <Label>Audit Status</Label>
//               <select
//                 className="input"
//                 value={form.auditStatus || "Pending"}
//                 onChange={(e) => handleChange("auditStatus", e.target.value)}
//               >
//                 {["Pending", "Re-Pending", "Approved", "Rejected", "Re-Approved", "Re-Rejected"].map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//               <ErrorText text={errors.auditStatus} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function Label({ children }) {
//   return <label className="block text-xs font-medium text-slate-700 mb-1">{children}</label>;
// }
// function ErrorText({ text }) {
//   if (!text) return null;
//   return <p className="mt-1 text-xs text-rose-600">{text}</p>;
// }

// /* =================== Calendar Grid =================== */
// function CalendarGrid({ monthKey, rangeMode, tempStart, tempEnd, onPick }) {
//   const monthDate = parseMonthKey(monthKey);
//   const today = stripToISO(new Date());

//   const firstDay = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
//   const startWeekday = firstDay.getUTCDay(); // 0..6
//   const daysInMonth = new Date(
//     Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)
//   ).getUTCDate();

//   const cells = [];
//   for (let i = 0; i < startWeekday; i++) cells.push(null);
//   for (let d = 1; d <= daysInMonth; d++) {
//     const iso = stripToISO(new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), d)));
//     cells.push(iso);
//   }
//   while (cells.length % 7 !== 0) cells.push(null);

//   const isInSelection = (iso) => {
//     if (!iso) return false;
//     if (!rangeMode) return iso === tempEnd;
//     const s = tempStart <= tempEnd ? tempStart : tempEnd;
//     const e = tempEnd >= tempStart ? tempEnd : tempStart;
//     return iso >= s && iso <= e;
//   };

//   return (
//     <div className="px-3 py-2">
//       <div className="grid grid-cols-7 text-[11px] text-slate-500 mb-1">
//         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//           <div key={d} className="text-center py-1">
//             {d}
//           </div>
//         ))}
//       </div>
//       <div className="grid grid-cols-7 gap-2 px-1 pb-2">
//         {cells.map((iso, idx) => {
//           if (!iso) return <div key={idx} className="h-9" />;
//           const disabled = iso > today;
//           const selected = isInSelection(iso);
//           const isToday = iso === today;
//           return (
//             <button
//               key={idx}
//               disabled={disabled}
//               onClick={() => onPick(iso)}
//               className={`h-9 w-9 flex items-center justify-center rounded-full text-sm transition
//                 ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-50"}
//                 ${selected ? "bg-indigo-600 text-white font-semibold" : "bg-white"}
//                 ${isToday ? "ring-1 ring-indigo-400" : ""}`}
//               title={formatISOToHuman(iso)}
//             >
//               {new Date(iso).getUTCDate()}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* =================== Date helpers =================== */
// function stripToISO(d) {
//   const dt = new Date(d);
//   dt.setUTCHours(0, 0, 0, 0);
//   return dt.toISOString().split("T")[0];
// }
// function toISODateOnly(value) {
//   if (!value) return "";
//   const d = new Date(value);
//   if (isNaN(d.getTime())) {
//     // if value is already yyyy-mm-dd
//     return String(value);
//   }
//   return stripToISO(d);
// }
// function isoNDaysAgo(n) {
//   const d = new Date();
//   d.setUTCDate(d.getUTCDate() - n);
//   return stripToISO(d);
// }
// function formatISOToHuman(value) {
//   if (!value) return "-";
//   const d = new Date(value);
//   if (isNaN(d.getTime())) return "-";
//   return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
// }
// function toMonthKey(d) {
//   return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
// }
// function parseMonthKey(key) {
//   const [y, m] = key.split("-").map((v) => parseInt(v, 10));
//   return new Date(Date.UTC(y, m - 1, 1));
// }
// function formatMonthKey(key) {
//   const d = parseMonthKey(key);
//   return d.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
// }
// function addMonths(date, delta) {
//   return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));
// }
// function isMonthFullyInFuture(d) {
//   const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
//   const today = new Date();
//   today.setUTCHours(0, 0, 0, 0);
//   const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
//   return monthStart > today && lastDay > today;
// }

// /* =================== Validation helpers =================== */
// function initialFormState() {
//   return {
//     _id: undefined,
//     employeeName: "",
//     workMode: "",
//     projectName: "",
//     task: "",
//     bookElement: "",
//     chapterNo: "",
//     hoursSpent: "",
//     noOfUnits: "",
//     unitType: "",
//     status: "",
//     dueOn: "",
//     details: "",
//     auditStatus: "Pending",
//   };
// }

// function validateForm(f, { allowAuditStatus = true } = {}) {
//   const errs = {};
//   if (!f.employeeName) errs.employeeName = "Employee is required.";
//   if (!f.workMode) errs.workMode = "Work mode is required.";
//   if (!f.projectName) errs.projectName = "Project is required.";
//   if (!f.task) errs.task = "Task is required.";
//   if (f.chapterNo === "" || f.chapterNo === null || isNaN(Number(f.chapterNo)) || Number(f.chapterNo) < 0) {
//     errs.chapterNo = "Chapter must be a number ≥ 0.";
//   }
//   if (f.hoursSpent === "" || f.hoursSpent === null || isNaN(Number(f.hoursSpent)) || Number(f.hoursSpent) < 0) {
//     errs.hoursSpent = "Hours must be a number ≥ 0.";
//   }
//   if (f.noOfUnits === "" || f.noOfUnits === null || isNaN(Number(f.noOfUnits)) || Number(f.noOfUnits) < 0) {
//     errs.noOfUnits = "Units must be a number ≥ 0.";
//   }
//   if (!f.unitType) errs.unitType = "Unit type is required.";
//   if (!f.status) errs.status = "Status is required.";
//   if (!f.dueOn) errs.dueOn = "Due date is required.";
//   if (allowAuditStatus && !f.auditStatus) errs.auditStatus = "Audit status is required.";
//   return errs;
// }

// /* =================== Outclick hook =================== */
// function useOutclick(onOut) {
//   const ref = useRef(null);
//   useEffect(() => {
//     function onDoc(e) {
//       if (!ref.current) return;
//       if (!ref.current.contains(e.target)) onOut?.();
//     }
//     document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, [onOut]);
//   return ref;
// }

// /* =================== Styles (tailwind shortcuts) =================== */
// /* You can keep these classnames inline; adding small helpers for readability */
// const inputBase =
//   "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700";
// function Input({ ...props }) {
//   return <input className={inputBase} {...props} />;
// }

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import {
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Filter as FilterIcon,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  X as XIcon,
  Loader2,
  Search as SearchIcon,
} from "lucide-react";

/* =================== CONFIG =================== */
const API_BASE_URL = "http://localhost:5000";

/* =================== CONSTANTS =================== */
const WORK_MODES = ["In Office", "WFH", "On Duty", "Half Day", "OT Home", "OT Office", "Night"];
const STATUS = ["In Progress", "Delayed", "Completed", "Not approved"];
const HOURS = [
  "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8",
];
const TASKS = [
  "CMPL-MS", "VRF-MS", "DRF", "TAL", "R1", "R2", "R3", "R4", "CR", "FER", "SET", "FINAL", "MEET",
  "QRY", "Coord", "GLANCE", "Research", "Analysis", "KT", "Interview", "PLAN", "UPL", "COM",
];
const BASE_BOOK_ELEMENTS = [
  "Theory", "Exercise", "Chapter", "Full book", "Mind Map", "Diagram", "Solution", "Booklet",
  "Full Video", "AVLR-VO", "DLR", "Lesson Plan", "Miscellaneous", "AVLR-Ideation", "Marketing",
  "Development", "Recruitment", "References", "Frames", "Papers", "Projects", "Lesson Plan",
];
const BASE_CHAPTER_NUMBERS = [
  "Title", "Syllabus", "Content", "Projects", "Papers", "Miscellaneous", "Appendix", "Full Book",
  ...Array.from({ length: 60 }, (_, i) => String(i + 1)),
];
const UNITS = [
  { label: "pages", value: "pages" },
  { label: "frames", value: "frames" },
  { label: "seconds", value: "seconds" },
  { label: "general", value: "general" },
];
const AUDIT_STATUSES = ["Pending", "Re-Pending", "Approved", "Rejected", "Re-Approved", "Re-Rejected"];

const HOUR_BUCKETS = [
  { id: "ALL", label: "All", test: () => true },
  { id: "LE6", label: "Sum ≤ 6", test: (h) => h <= 6 },
  { id: "LE65", label: "Sum ≤ 6.5", test: (h) => h <= 6.5 },
  { id: "LE7", label: "Sum ≤ 7", test: (h) => h <= 7 },
  { id: "LE75", label: "Sum ≤ 7.5", test: (h) => h <= 7.5 },
  { id: "GT75", label: "Sum > 7.5", test: (h) => h > 7.5 },
];

function Label({ children, className = "" }) {
  return (
    <label className={`block text-xs lg:text-sm font-medium text-slate-700 mb-1 ${className}`}>
      {children}
    </label>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-3 py-2 text-left font-medium ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-3 py-2 border-t border-slate-200 ${className}`}>
      {children}
    </td>
  );
}

function ErrorText({ text }) {
  if (!text) return null;
  return <div className="text-xs text-rose-600 mt-1">{text}</div>;
}

/* =================== MAIN PAGE =================== */
export default function AdminEditWorklogEntries() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  /* ===== Auth (as-is from AdminDashboard) ===== */
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser({
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        team: decoded.team,
        picture:
          decoded.picture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            decoded.name
          )}&background=random&color=fff`,
      });
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.error("Invalid token:", e);
      localStorage.removeItem("authToken");
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common.Authorization;
    navigate("/");
  };

  /* ===== Edit Worklogs STATE/LOGIC ===== */

  // Data
  const [worklogsByDate, setWorklogsByDate] = useState({});
  const [employees, setEmployees] = useState([]);

  // Status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters: employees
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const empRef = useOutclick(() => setShowEmpDropdown(false));

  // Filters: dates
  const todayISO = stripToISO(new Date());
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [rangeMode, setRangeMode] = useState(true);
  const [tempStart, setTempStart] = useState(isoNDaysAgo(2));
  const [tempEnd, setTempEnd] = useState(todayISO);
  const [activeMonth, setActiveMonth] = useState(() => toMonthKey(new Date(tempEnd)));
  const [startISO, setStartISO] = useState(isoNDaysAgo(2));
  const [endISO, setEndISO] = useState(todayISO);
  const popRef = useOutclick(() => setDatePopoverOpen(false));

  // Filters: audit statuses (kept for filtering only)
  const ALL_STATUSES = AUDIT_STATUSES;
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useOutclick(() => setShowStatusDropdown(false));
  const [selectedAuditStatuses, setSelectedAuditStatuses] = useState([...ALL_STATUSES]);

  // Filters: hour bucket
  const [selectedHourBucket, setSelectedHourBucket] = useState("ALL");

  // Edit / Add modals
  const [globalAddOpen, setGlobalAddOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);

  const [editForm, setEditForm] = useState(initialFormState());
  const [addForm, setAddForm] = useState(initialFormState());
  const [formErrors, setFormErrors] = useState({});

  // Context for add
  const [addContext, setAddContext] = useState({ dateKey: null, employeeName: null });

  // Project search
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [searchBy, setSearchBy] = useState("name");
  const suggestRef = useRef(null);

  /* --- Fetch employees --- */
  useEffect(() => {
    if (!user) return;
    fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setEmployees(response.data.employees || []);
      } else {
        console.error("Failed to fetch employees:", response.data.message);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err.response?.data?.message || err.message);
    }
  };

  /* --- Fetch worklogs (on filter change) --- */
  useEffect(() => {
    if (!user) return;
    fetchWorklogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, startISO, endISO, selectedEmployees, selectedAuditStatuses.length, selectedHourBucket]);

  const fetchWorklogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const response = await axios.post(`${API_BASE_URL}/api/admin/worklogs`, {
        startDate: startISO,
        endDate: endISO,
        employees: selectedEmployees,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setWorklogsByDate(response.data.worklogsByDate || {});
      } else {
        throw new Error(response.data.message || "Failed to fetch worklogs");
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch worklogs: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* --- Derived helpers --- */
  const sortedDateKeys = useMemo(
    () => Object.keys(worklogsByDate).sort((a, b) => new Date(b) - new Date(a)),
    [worklogsByDate]
  );

  const groupByEmployee = (items) => {
    const byEmp = {};
    for (const row of items) {
      const empName = row.employeeName || row.name || "Unknown";
      if (!byEmp[empName]) byEmp[empName] = [];
      byEmp[empName].push(row);
    }
    return Object.fromEntries(
      Object.keys(byEmp)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => [k, byEmp[k]])
    );
  };

  const rowClassForAudit = (status) => {
    if (status === "Approved" || status === "Re-Approved") return "bg-emerald-50/70";
    if (status === "Rejected" || status === "Re-Rejected") return "bg-rose-50/70";
    if (status === "Re-Pending") return "bg-amber-50";
    if (status === "Pending") return "bg-yellow-50";
    return "";
  };

  const AuditBadge = ({ status }) => {
    if (status === "Approved")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
          Approved
        </span>
      );
    if (status === "Rejected")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-medium">
          Rejected
        </span>
      );
    if (status === "Re-Pending")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 text-amber-800 px-2 py-0.5 text-xs font-medium">
          Re-Pending
        </span>
      );
    if (status === "Re-Approved")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 text-emerald-800 px-2 py-0.5 text-xs font-medium">
          Re-Approved
        </span>
      );
    if (status === "Re-Rejected")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-200 text-rose-800 px-2 py-0.5 text-xs font-medium">
          Re-Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 text-yellow-800 px-2 py-0.5 text-xs font-medium">
        Pending
      </span>
    );
  };

  /* =================== CRUD: Edit / Delete / Add =================== */
  const handleOpenEdit = (log, dateKey) => {
    // prefill form with the selected row
    setEditForm({
      _id: log._id,
      employeeName: log.employeeName || log.name || "",
      workMode: log.workMode || log.work_mode || "",
      projectName: log.projectName || log.project_name || "",
      task: log.task || "",
      bookElement: log.bookElement || log.book_element || "",
      chapterNumbers: log.chapterNo ? [String(log.chapterNo)] : (log.chapter_number ? log.chapter_number.split(", ").filter(Boolean) : []),
      hoursSpent: log.hoursSpent || log.hours_spent || "",
      noOfUnits: log.noOfUnits || log.number_of_units || "",
      unitType: log.unitType || log.unit_type || "pages",
      status: log.status || "",
      dueOn: toISODateOnly(log.dueOn || log.due_on) || dateKey,
      details: log.details || "",
      auditStatus: log.auditStatus || log.audit_status || "Pending",
      dateKey, // for local state writeback
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    const { invalid, canSubmit, projectValid } = validateAdminEntry(editForm, suggestions);
    const errs = {}; Object.entries(invalid).forEach(([k, v]) => v && (errs[k] = "Required"));
    if (!projectValid) errs.projectValid = "Please choose a valid project.";
    setFormErrors(errs);
    if (!canSubmit || !projectValid) return;

    try {
      setSavingEdit(true);
      const response = await axios.put(`${API_BASE_URL}/api/admin/worklogs/${editForm._id}`, {
        employeeName: editForm.employeeName,
        workMode: editForm.workMode,
        projectName: editForm.projectName,
        task: editForm.task,
        bookElement: editForm.bookElement,
        chapterNumbers: editForm.chapterNumbers.join(", "),
        hoursSpent: Number(editForm.hoursSpent) || 0,
        noOfUnits: Number(editForm.noOfUnits) || 0,
        unitType: editForm.unitType,
        status: editForm.status,
        details: editForm.details,
        auditStatus: editForm.auditStatus,
      });

      if (response.data.success) {
        // Optimistic update locally
        setWorklogsByDate((prev) => {
          const next = { ...prev };
          const dk = editForm.dateKey;
          if (!next[dk]) return next;
          next[dk] = next[dk].map((r) =>
            r._id === editForm._id
              ? {
                ...r,
                employeeName: editForm.employeeName,
                workMode: editForm.workMode,
                projectName: editForm.projectName,
                task: editForm.task,
                bookElement: editForm.bookElement,
                chapterNumbers: editForm.chapterNumbers.join(", "),
                hoursSpent: Number(editForm.hoursSpent) || 0,
                noOfUnits: Number(editForm.noOfUnits) || 0,
                unitType: editForm.unitType,
                status: editForm.status,
                details: editForm.details,
                auditStatus: editForm.auditStatus,
              }
              : r
          );
          return next;
        });

        setEditModalOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to save changes: ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/worklogs/${id}`);

      if (response.data.success) {
        // Remove locally
        setWorklogsByDate((prev) => {
          const next = { ...prev };
          for (const dateKey of Object.keys(next)) {
            next[dateKey] = next[dateKey].filter((r) => r._id !== id);
          }
          return next;
        });
      } else {
        throw new Error(response.data.message || "Failed to delete entry");
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to delete entry: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenAdd = (employeeName, dateKey) => {
    setAddContext({ dateKey, employeeName });
    setAddForm({
      _id: undefined,
      employeeName: employeeName || "",
      date: dateKey, // This is the key fix - set the actual date instead of dateKey as dueOn
      workMode: "",
      projectName: "",
      task: "",
      bookElement: "",
      chapterNumbers: [],
      hoursSpent: "",
      noOfUnits: "",
      unitType: "pages",
      status: "",
      dueOn: dateKey, // Keep this for due date
      details: "",
      team: user.team,
      auditStatus: "Pending",
    });
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleOpenGlobalAdd = () => {
    const todayDate = toISODateOnly(new Date());
    setAddForm({
      _id: undefined,
      employeeName: "",
      date: todayDate, // Add the date field for backend
      workMode: "",
      projectName: "",
      task: "",
      bookElement: "",
      chapterNumbers: [],
      hoursSpent: "",
      noOfUnits: "",
      unitType: "pages",
      status: "",
      dueOn: todayDate,
      details: "",
      team: user.team,
      auditStatus: "Pending",
    });
    setFormErrors({});
    setGlobalAddOpen(true);
  };

  const handleSaveAdd = async (mode = "inline") => {
    const form = addForm;
    const { invalid, canSubmit, projectValid } = validateAdminEntry(form, suggestions);
    const errs = {};
    Object.entries(invalid).forEach(([k, v]) => v && (errs[k] = "Required"));
    if (!projectValid) errs.projectValid = "Please choose a valid project.";
    setFormErrors(errs);
    if (!canSubmit || !projectValid) return;

    try {
      setSavingAdd(true);
      const response = await axios.post(`${API_BASE_URL}/api/admin/worklogs/create`, {
        employeeName: form.employeeName,
        date: mode === "inline" ? addContext.dateKey : form.dueOn, // Use correct date based on mode
        workMode: form.workMode,
        projectName: form.projectName,
        task: form.task,
        bookElement: form.bookElement,
        chapterNumbers: form.chapterNumbers.join(", "),
        hoursSpent: Number(form.hoursSpent) || 0,
        noOfUnits: Number(form.noOfUnits) || 0,
        unitType: form.unitType,
        status: form.status,
        dueOn: form.dueOn,
        details: form.details,
        auditStatus: form.auditStatus,
        team: user.team,
      });

      if (response.data.success) {
        // Inject into local state under the proper dateKey
        const dk = mode === "global" ? toISODateOnly(form.dueOn) : addContext.dateKey;
        setWorklogsByDate((prev) => {
          const next = { ...prev };
          const createdRow = response.data.worklog || {};
          if (!next[dk]) next[dk] = [];
          next[dk] = [...next[dk], createdRow];
          return next;
        });

        if (mode === "inline") setAddModalOpen(false);
        else setGlobalAddOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to add entry");
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to add entry: ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingAdd(false);
    }
  };

  /* --- Project search --- */
  useEffect(() => {
    let active = true;
    const form = editModalOpen ? editForm : (addModalOpen || globalAddOpen) ? addForm : null;
    if (!form) return;
    const q = (form.projectName || "").trim();
    if (!q) { setSuggestions([]); setShowSuggest(false); return; }
    setLoadingSuggestions(true);
    const t = setTimeout(async () => {
      try {
        const token = localStorage.getItem("authToken");
        const { data } = await axios.get(`${API_BASE_URL}/api/projects`, {
          params: { q, by: searchBy },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!active) return;
        const transformed = (data.projects || []).map((p) => ({
          id: p.project_id || p.id || p.code || p.name,
          name: p.project_name || p.name || p.title,
          dueOn: p.due_date ? new Date(p.due_date).toISOString().slice(0, 10) : null,
        }));
        setSuggestions(transformed);
        setShowSuggest(transformed.length > 0);
      } catch {
        setSuggestions([]); setShowSuggest(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(t); setLoadingSuggestions(false); };
  }, [editForm.projectName, addForm.projectName, editModalOpen, addModalOpen, globalAddOpen, searchBy]);

  const selectProjectIntoForm = (p, which = "edit") => {
    const setter = which === "edit" ? setEditForm : setAddForm;
    setter((f) => ({
      ...f,
      projectName: p.name,
      dueOn: f.dueOn || p.dueOn || "",
    }));
    setShowSuggest(false);
  };

  /* --- Date filter helpers --- */
  const applyTempDate = () => {
    if (rangeMode) {
      const s = tempStart <= tempEnd ? tempStart : tempEnd;
      const e = tempEnd >= tempStart ? tempEnd : tempStart;
      setStartISO(s);
      setEndISO(e);
    } else {
      setStartISO(tempEnd);
      setEndISO(tempEnd);
    }
    setDatePopoverOpen(false);
  };

  const quickApply = (days) => {
    setRangeMode(true);
    const s = isoNDaysAgo(days - 1);
    setTempStart(s);
    setTempEnd(todayISO);
    setActiveMonth(toMonthKey(new Date(todayISO)));
    setStartISO(s);
    setEndISO(todayISO);
  };

  const labelForFilter = () =>
    startISO === endISO ? formatISOToHuman(startISO) : `${formatISOToHuman(startISO)} – ${formatISOToHuman(endISO)}`;

  /* --- Render guards --- */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  /* =================== LAYOUT (Navbar + Sidebar) =================== */
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Admin Dashboard <span className="hidden sm:inline">- Edit Worklogs</span>
              </h1>
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-slate-600" />
                <div className="text-right">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-slate-300">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button (kept for parity, no dropdown content here) */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
              >
                {!mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl overflow-y-auto">
            <SidebarLinks navigate={navigate} location={useLocation()} close={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}
      <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
        <SidebarLinks navigate={navigate} location={location} />
      </aside>


      {/* =================== MAIN CONTENT =================== */}
      <main className="lg:ml-72 pt-20 p-6">
        <div className="p-3 sm:p-4 lg:p-6 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
          {/* ===== Filters ===== */}
          <div className="rounded-xl lg:rounded-2xl shadow-md border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <FilterIcon className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
              <h3 className="text-sm lg:text-base font-semibold text-slate-800 tracking-tight">Filters</h3>
            </div>

            {/* Filters Row */}
            <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-wrap lg:items-end lg:gap-6">
              {/* Date Picker */}
              <div className="w-full lg:min-w-[280px] lg:w-auto relative" ref={popRef}>
                <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Date(s)</label>
                <button
                  onClick={() => setDatePopoverOpen((o) => !o)}
                  className="w-full border rounded-lg px-3 py-2 flex items-center justify-between hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
                >
                  <span className="flex items-center gap-2 min-w-0 flex-1">
                    <CalendarIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-xs lg:text-sm font-medium truncate">{labelForFilter()}</span>
                  </span>
                  <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{rangeMode ? "Range" : "Single"}</span>
                </button>

                {datePopoverOpen && (
                  <div className="absolute z-50 mt-2 w-[340px] right-0 lg:right-auto lg:left-0 rounded-xl border bg-white shadow-xl">
                    <div className="px-3 py-2 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRangeMode(false)}
                          className={`text-xs px-2 py-1 rounded ${!rangeMode ? "bg-slate-900 text-white" : "bg-slate-100"}`}
                        >
                          Single Day
                        </button>
                        <button
                          onClick={() => setRangeMode(true)}
                          className={`text-xs px-2 py-1 rounded ${rangeMode ? "bg-slate-900 text-white" : "bg-slate-100"}`}
                        >
                          Range
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveMonth(toMonthKey(addMonths(parseMonthKey(activeMonth), -1)))}
                          className="p-1 hover:bg-slate-100 rounded"
                          aria-label="Prev month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="text-xs font-medium w-[130px] text-center">{formatMonthKey(activeMonth)}</div>
                        <button
                          onClick={() => {
                            const nextM = addMonths(parseMonthKey(activeMonth), 1);
                            if (isMonthFullyInFuture(nextM)) return;
                            setActiveMonth(toMonthKey(nextM));
                          }}
                          className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
                          aria-label="Next month"
                          disabled={isMonthFullyInFuture(addMonths(parseMonthKey(activeMonth), 1))}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <CalendarGrid
                      monthKey={activeMonth}
                      rangeMode={rangeMode}
                      tempStart={tempStart}
                      tempEnd={tempEnd}
                      onPick={(iso) => {
                        if (!rangeMode) {
                          if (iso > todayISO) return;
                          setTempEnd(iso);
                          return;
                        }
                        if (iso > todayISO) return;
                        if (!tempStart || (tempStart && tempEnd && tempStart <= tempEnd)) {
                          setTempStart(iso);
                          setTempEnd(iso);
                        } else {
                          if (iso < tempStart) setTempStart(iso);
                          else setTempEnd(iso);
                        }
                      }}
                    />

                    <div className="px-3 py-2 border-t flex flex-wrap items-center gap-2">
                      <button onClick={() => quickApply(3)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 3 Days</button>
                      <button onClick={() => quickApply(7)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 7 Days</button>
                      <button onClick={() => quickApply(15)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 15 Days</button>
                      <button onClick={() => quickApply(30)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 30 Days</button>
                      <button
                        onClick={() => {
                          setRangeMode(false);
                          setTempEnd(todayISO);
                          setActiveMonth(toMonthKey(new Date(todayISO)));
                          setStartISO(todayISO);
                          setEndISO(todayISO);
                          setDatePopoverOpen(false);
                        }}
                        className="text-xs px-2 py-1 rounded bg-slate-900 text-white ml-auto"
                      >
                        Today
                      </button>
                      <button onClick={applyTempDate} className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Apply</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Employees multi-select */}
              <div ref={empRef} className="relative w-full lg:min-w-[280px] lg:w-auto">
                <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Employees</label>
                <button
                  onClick={() => setShowEmpDropdown((o) => !o)}
                  className="w-full border rounded-lg px-3 py-2 text-xs lg:text-sm text-left flex justify-between items-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
                >
                  <span className="flex flex-wrap gap-1 min-w-0 flex-1">
                    {selectedEmployees.length === 0 ? (
                      <span className="text-slate-600">All employees</span>
                    ) : (
                      selectedEmployees.map((name) => (
                        <span key={name} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {name}
                        </span>
                      ))
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform flex-shrink-0 ${showEmpDropdown ? "rotate-180" : "rotate-0"}`} />
                </button>

                {showEmpDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    <div className="px-3 py-2 text-xs text-slate-500 border-b bg-slate-50 flex items-center gap-2 sticky top-0">
                      <UsersIcon className="w-3.5 h-3.5" />
                      Select employees
                    </div>
                    <div className="p-2 border-b bg-white sticky top-[28px]">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            value={employeeSearch}
                            onChange={(e) => setEmployeeSearch(e.target.value)}
                            placeholder="Search employee…"
                            className="w-full h-8 rounded-lg border px-8 text-xs"
                          />
                          <SearchIcon className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
                        </div>
                        <button
                          className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                          onClick={() => setSelectedEmployees(employees.map((e) => e.name))}
                        >
                          Select All
                        </button>
                        <button
                          className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                          onClick={() => setSelectedEmployees([])}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    {employees
                      .filter((emp) => employeeSearch ? emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) : true)
                      .map((emp) => (
                        <label key={emp.id || emp.name} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs lg:text-sm">
                          <input
                            type="checkbox"
                            value={emp.name}
                            checked={selectedEmployees.includes(emp.name)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedEmployees((p) => [...p, emp.name]);
                              else setSelectedEmployees((p) => p.filter((n) => n !== emp.name));
                            }}
                            className="mr-2"
                          />
                          <span className="truncate">{emp.name}</span>
                        </label>
                      ))}
                  </div>
                )}
              </div>

              {/* Audit Status multi-select */}
              <div ref={statusRef} className="relative w-full lg:min-w-[260px] lg:w-auto">
                <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Audit Status</label>
                <button
                  onClick={() => setShowStatusDropdown((o) => !o)}
                  className="w-full border rounded-lg px-3 py-2 text-xs lg:text-sm text-left flex justify-between items-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
                >
                  <span className="flex flex-wrap gap-1 min-w-0 flex-1">
                    {selectedAuditStatuses.length === ALL_STATUSES.length ? (
                      <span className="text-slate-600">All statuses</span>
                    ) : selectedAuditStatuses.length === 0 ? (
                      <span className="text-slate-600">None selected</span>
                    ) : (
                      selectedAuditStatuses.map((s) => (
                        <span key={s} className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {s}
                        </span>
                      ))
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform flex-shrink-0 ${showStatusDropdown ? "rotate-180" : "rotate-0"}`} />
                </button>

                {showStatusDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    <div className="px-3 py-2 text-xs text-slate-500 border-b bg-slate-50 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <UsersIcon className="w-3.5 h-3.5" />
                        Select statuses
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedAuditStatuses([...ALL_STATUSES])} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200">Select All</button>
                        <button onClick={() => setSelectedAuditStatuses([])} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200">Clear</button>
                      </div>
                    </div>
                    {ALL_STATUSES.map((status) => (
                      <label key={status} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs lg:text-sm">
                        <input
                          type="checkbox"
                          value={status}
                          checked={selectedAuditStatuses.includes(status)}
                          onChange={() =>
                            setSelectedAuditStatuses((prev) =>
                              prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
                            )
                          }
                          className="mr-2"
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Hours bucket */}
              <div className="w-full lg:w-auto">
                <Label>Hours Sum</Label>
                <select
                  className="w-full h-9 rounded-lg border px-3 text-sm bg-white"
                  value={selectedHourBucket}
                  onChange={(e) => setSelectedHourBucket(e.target.value)}
                >
                  {HOUR_BUCKETS.map((h) => <option key={h.id} value={h.id}>{h.label}</option>)}
                </select>
              </div>

              {/* Summary info */}
              <div className="w-full lg:w-auto flex flex-wrap items-center gap-3 lg:ml-auto">
                <div className="text-xs text-slate-700">
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-sky-100 text-sky-800">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">Edit & manage entries directly</span>
                  </div>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                  onClick={handleOpenGlobalAdd}
                >
                  <Plus className="w-4 h-4" /> Global Add Entry
                </button>
              </div>
            </div>
          </div>

          {/* ===== States ===== */}
          {loading && (
            <div className="flex items-center gap-3 py-6">
              <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-slate-900" />
              <span className="text-sm lg:text-base text-slate-800">Loading worklogs…</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-rose-500 mr-3" />
                <span className="text-rose-700">{error}</span>
              </div>
              <button onClick={fetchWorklogs} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-sm self-start sm:ml-auto">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && sortedDateKeys.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <Clock className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base lg:text-lg font-medium text-slate-900 mb-2">No Worklogs Found</h3>
              <p className="text-sm lg:text-base text-slate-600">Try changing the date range, employees, or status filters above.</p>
            </div>
          )}

          {/* ===== By Date (desktop + mobile) ===== */}
          {!loading &&
            !error &&
            sortedDateKeys.map((dateKey) => {
              const allRows = worklogsByDate[dateKey] || [];

              // Filter by audit status
              const filteredByStatus = allRows.filter((r) =>
                selectedAuditStatuses.includes(r.auditStatus || r.audit_status || "Pending")
              );

              // Group by employee and calculate totals
              const grouped = groupByEmployee(filteredByStatus);
              const processed = Object.entries(grouped).map(([emp, logs]) => {
                const total = logs.reduce((acc, r) => acc + Number(r.hoursSpent || r.hours_spent || 0), 0);
                return { emp, logs, total };
              });

              // Filter by hour bucket
              const bucket = HOUR_BUCKETS.find((b) => b.id === selectedHourBucket);
              const filtered = processed.filter((o) => (bucket?.test ?? (() => true))(o.total));

              if (filtered.length === 0) return null;

              return (
                <section key={dateKey} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-4 lg:px-5 py-3 lg:py-4 border-b bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-600" />
                      {formatISOToHuman(dateKey)}
                      <span className="ml-2 rounded-full bg-indigo-100 text-indigo-700 text-[11px] px-2 py-0.5 font-medium">
                        {filtered.reduce((acc, { logs }) => acc + logs.length, 0)} entries
                      </span>
                    </h2>
                  </div>

                  {/* Desktop grouped tables */}
                  <div className="hidden lg:block">
                    {filtered.map(({ emp, logs, total }) => (
                      <div key={emp} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                              {emp.split(" ").map((x) => x[0] || "").join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{emp}</div>
                              <div className="text-xs text-slate-500">
                                {logs.length} {logs.length === 1 ? "entry" : "entries"}
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${total > 7.5 ? "bg-rose-100 text-rose-700" :
                            total >= 7 ? "bg-amber-100 text-amber-700" :
                              "bg-emerald-100 text-emerald-700"
                            }`}>
                            Total Hours: {total}
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700">
                                <Th>Work Mode</Th>
                                <Th>Project</Th>
                                <Th>Task</Th>
                                <Th>Book Element</Th>
                                <Th>Chapters</Th>
                                <Th>Hours Spent</Th>
                                <Th>No. of Units</Th>
                                <Th>Unit Type</Th>
                                <Th>Status</Th>
                                <Th>Due On</Th>
                                <Th>Details</Th>
                                <Th>Audit Status</Th>
                                <Th>Action</Th>
                              </tr>
                            </thead>
                            <tbody>
                              {logs.map((log) => (
                                <tr key={log._id} className={`${rowClassForAudit(log.auditStatus || log.audit_status)} border-t`}>
                                  <Td>{log.workMode || log.work_mode}</Td>
                                  <Td className="max-w-[260px] truncate" title={log.projectName || log.project_name}>
                                    {log.projectName || log.project_name}
                                  </Td>
                                  <Td>{log.task || log.task_name}</Td>
                                  <Td>{log.bookElement || log.book_element}</Td>
                                  <Td>{log.chapterNo || log.chapter_number}</Td>
                                  <Td>{log.hoursSpent || log.hours_spent}</Td>
                                  <Td>{log.noOfUnits || log.number_of_units}</Td>
                                  <Td>{log.unitType || log.unit_type}</Td>
                                  <Td>{log.status}</Td>
                                  <Td>{formatISOToHuman(log.dueOn || log.due_on)}</Td>
                                  <Td className="max-w-[220px] whitespace-normal break-words">
                                    {log.details || "-"}
                                  </Td>
                                  <Td>
                                    <AuditBadge status={log.auditStatus || log.audit_status} />
                                  </Td>
                                  <Td>
                                    <div className="flex gap-2">
                                      <button
                                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md"
                                        onClick={() => handleOpenEdit(log, dateKey)}
                                        title="Edit"
                                      >
                                        <Pencil size={16} />
                                      </button>
                                      <button
                                        className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-md"
                                        onClick={() => handleDelete(log._id)}
                                        title="Delete"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </Td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Add Entry CTA for this employee & date */}
                        <div className="mt-3 flex justify-end">
                          <button
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                            onClick={() => handleOpenAdd(emp, dateKey)}
                          >
                            <Plus className="w-4 h-4" /> Add Entry
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile grouped cards */}
                  <div className="lg:hidden p-3 sm:p-4 space-y-4 sm:space-y-6">
                    {filtered.map(({ emp, logs, total }) => (
                      <div key={emp} className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-slate-50/70">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                              {emp.split(" ").map((x) => x[0] || "").join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-slate-900 truncate">{emp}</div>
                              <div className="text-xs text-slate-500">
                                {logs.length} {logs.length === 1 ? "entry" : "entries"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${total > 7.5 ? "bg-rose-100 text-rose-700" :
                              total >= 7 ? "bg-amber-100 text-amber-700" :
                                "bg-emerald-100 text-emerald-700"
                              }`}>
                              {total}h
                            </span>
                            <button
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-xs"
                              onClick={() => handleOpenAdd(emp, dateKey)}
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                          </div>
                        </div>

                        <div className="divide-y">
                          {logs.map((log) => (
                            <article key={log._id} className={`p-3 sm:p-4 ${rowClassForAudit(log.auditStatus || log.audit_status)}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="min-w-0 flex-1 pr-3">
                                  <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 truncate" title={log.projectName || log.project_name}>
                                    {log.projectName || log.project_name}
                                  </h3>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {log.task || log.task_name} · {log.bookElement || log.book_element} · {log.chapterNo || log.chapter_number}
                                  </p>
                                </div>
                                <AuditBadge status={log.auditStatus || log.audit_status} />
                              </div>

                              <dl className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-[13px] mb-4">
                                <Info label="Work Mode" value={log.workMode || log.work_mode} />
                                <Info label="Hours" value={log.hoursSpent || log.hours_spent} />
                                <Info label="Units" value={`${log.noOfUnits || log.number_of_units} ${log.unitType || log.unit_type || ""}`} />
                                <Info label="Status" value={log.status} />
                                <Info label="Due On" value={formatISOToHuman(log.dueOn || log.due_on)} />
                                {log.details && (
                                  <div className="col-span-2">
                                    <dt className="text-slate-500">Details</dt>
                                    <dd className="text-slate-800 break-words">{log.details}</dd>
                                  </div>
                                )}
                              </dl>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-0"
                                  onClick={() => handleOpenEdit(log, dateKey)}
                                >
                                  <Pencil size={16} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-0"
                                  onClick={() => handleDelete(log._id)}
                                >
                                  <Trash2 size={16} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      </main>

      {/* ======= EDIT MODAL ======= */}
      {editModalOpen && (
        <Modal onClose={() => setEditModalOpen(false)} title="Edit Worklog Entry">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Employee">
                <input type="text" className="w-full h-9 rounded-lg border px-3 text-sm bg-slate-100" value={editForm.employeeName} disabled />
              </Field>
              <Field label="Date">
                <input type="date" className="w-full h-9 rounded-lg border px-3 text-sm" value={editForm.dateKey} onChange={(e) => setEditForm((f) => ({ ...f, dateKey: e.target.value }))} />
              </Field>
            </div>

            <Field label="Work Mode">
              <Select value={editForm.workMode} onChange={(v) => setEditForm((f) => ({ ...f, workMode: v }))} options={["", ...WORK_MODES]} isInvalid={!!formErrors.workMode} />
              <ErrorText text={formErrors.workMode} />
            </Field>

            <Field label="Project Name *">
              <div className="relative" ref={suggestRef}>
                <input
                  type="text"
                  className={`w-full h-9 rounded-lg border px-3 text-sm ${formErrors.projectValid ? "border-rose-500" : ""}`}
                  value={editForm.projectName}
                  onChange={(e) => setEditForm((f) => ({ ...f, projectName: e.target.value }))}
                  placeholder="Type project name…"
                />
                {loadingSuggestions && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-slate-400" />}
                {showSuggest && suggestions.length > 0 && (
                  <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
                    {suggestions.map((s) => (
                      <li key={s.id} onClick={() => selectProjectIntoForm(s, "edit")} className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.id}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ErrorText text={formErrors.projectValid} />
            </Field>

            <Field label="Task">
              <Select value={editForm.task} onChange={(v) => setEditForm((f) => ({ ...f, task: v }))} options={["", ...TASKS]} isInvalid={!!formErrors.task} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Book Element">
                <Select value={editForm.bookElement} onChange={(v) => setEditForm((f) => ({ ...f, bookElement: v }))} options={["", ...BASE_BOOK_ELEMENTS]} isInvalid={!!formErrors.bookElement} />
              </Field>
              <Field label="Chapters">
                <MultiSelectChips value={editForm.chapterNumbers} onChange={(vals) => setEditForm((f) => ({ ...f, chapterNumbers: vals }))} options={BASE_CHAPTER_NUMBERS} isInvalid={!!formErrors.chapterNumbers} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Hours Spent">
                <Select value={editForm.hoursSpent} onChange={(v) => setEditForm((f) => ({ ...f, hoursSpent: v }))} options={["", ...HOURS]} isInvalid={!!formErrors.hoursSpent} />
              </Field>
              <Field label="Units">
                <div className="flex gap-2">
                  <input type="number" className={`w-20 h-9 rounded-lg border px-2 text-sm ${formErrors.noOfUnits ? "border-rose-500" : ""}`} value={editForm.noOfUnits} onChange={(e) => setEditForm((f) => ({ ...f, noOfUnits: e.target.value }))} />
                  <Select value={editForm.unitType} onChange={(v) => setEditForm((f) => ({ ...f, unitType: v }))} options={UNITS} />
                </div>
              </Field>
            </div>

            <Field label="Status">
              <Select value={editForm.status} onChange={(v) => setEditForm((f) => ({ ...f, status: v }))} options={["", ...STATUS]} isInvalid={!!formErrors.status} />
            </Field>

            <Field label="Details / Remarks">
              <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" value={editForm.details} onChange={(e) => setEditForm((f) => ({ ...f, details: e.target.value }))} />
            </Field>

            <Field label="Audit Status">
              <Select value={editForm.auditStatus} onChange={(v) => setEditForm((f) => ({ ...f, auditStatus: v }))} options={AUDIT_STATUSES} />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md text-sm hover:bg-slate-300">Cancel</button>
              <button onClick={handleSaveEdit} disabled={savingEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50">
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======= ADD MODAL ======= */}
      {addModalOpen && (
        <Modal onClose={() => setAddModalOpen(false)} title={`Add Entry for ${addContext.employeeName || ""} (${formatISOToHuman(addContext.dateKey || "")})`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Employee">
                <input type="text" className="w-full h-9 rounded-lg border px-3 text-sm bg-slate-100" value={addForm.employeeName} disabled />
              </Field>
              <Field label="Date">
                <input type="date" className="w-full h-9 rounded-lg border px-3 text-sm" value={addForm.dueOn} onChange={(e) => setAddForm((f) => ({ ...f, dueOn: e.target.value }))} />
              </Field>
            </div>

            <Field label="Work Mode">
              <Select value={addForm.workMode} onChange={(v) => setAddForm((f) => ({ ...f, workMode: v }))} options={["", ...WORK_MODES]} isInvalid={!!formErrors.workMode} />
              <ErrorText text={formErrors.workMode} />
            </Field>

            <Field label="Project Name *">
              <div className="relative" ref={suggestRef}>
                <input
                  type="text"
                  className={`w-full h-9 rounded-lg border px-3 text-sm ${formErrors.projectValid ? "border-rose-500" : ""}`}
                  value={addForm.projectName}
                  onChange={(e) => setAddForm((f) => ({ ...f, projectName: e.target.value }))}
                  placeholder="Type project name…"
                />
                {showSuggest && suggestions.length > 0 && (
                  <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
                    {suggestions.map((s) => (
                      <li key={s.id} onClick={() => selectProjectIntoForm(s, "add")} className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.id}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ErrorText text={formErrors.projectValid} />
            </Field>

            <Field label="Task">
              <Select value={addForm.task} onChange={(v) => setAddForm((f) => ({ ...f, task: v }))} options={["", ...TASKS]} isInvalid={!!formErrors.task} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Book Element">
                <Select value={addForm.bookElement} onChange={(v) => setAddForm((f) => ({ ...f, bookElement: v }))} options={["", ...BASE_BOOK_ELEMENTS]} />
              </Field>
              <Field label="Chapters">
                <MultiSelectChips value={addForm.chapterNumbers} onChange={(vals) => setAddForm((f) => ({ ...f, chapterNumbers: vals }))} options={BASE_CHAPTER_NUMBERS} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Hours Spent">
                <Select value={addForm.hoursSpent} onChange={(v) => setAddForm((f) => ({ ...f, hoursSpent: v }))} options={["", ...HOURS]} />
              </Field>
              <Field label="Units">
                <div className="flex gap-2">
                  <input type="number" className="w-20 h-9 rounded-lg border px-2 text-sm" value={addForm.noOfUnits} onChange={(e) => setAddForm((f) => ({ ...f, noOfUnits: e.target.value }))} />
                  <Select value={addForm.unitType} onChange={(v) => setAddForm((f) => ({ ...f, unitType: v }))} options={UNITS} />
                </div>
              </Field>
            </div>

            <Field label="Status">
              <Select value={addForm.status} onChange={(v) => setAddForm((f) => ({ ...f, status: v }))} options={["", ...STATUS]} />
            </Field>

            <Field label="Details / Remarks">
              <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" value={addForm.details} onChange={(e) => setAddForm((f) => ({ ...f, details: e.target.value }))} />
            </Field>

            <Field label="Audit Status">
              <Select value={addForm.auditStatus} onChange={(v) => setAddForm((f) => ({ ...f, auditStatus: v }))} options={AUDIT_STATUSES} />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md text-sm hover:bg-slate-300">Cancel</button>
              <button onClick={() => handleSaveAdd("inline")} disabled={savingAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50">
                {savingAdd ? "Saving..." : "Add Entry"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======= GLOBAL ADD MODAL ======= */}
      {globalAddOpen && (
        <Modal onClose={() => setGlobalAddOpen(false)} title="Global Add Entry">
          <div className="space-y-4">
            <Field label="Employee">
              <select className="w-full h-9 rounded-lg border px-3 text-sm" value={addForm.employeeName} onChange={(e) => setAddForm((f) => ({ ...f, employeeName: e.target.value }))}>
                <option value="">Select Employee</option>
                {employees.map((emp) => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
              </select>
            </Field>
            <Field label="Date">
              <input type="date" className="w-full h-9 rounded-lg border px-3 text-sm" value={addForm.dueOn} onChange={(e) => setAddForm((f) => ({ ...f, dueOn: e.target.value }))} />
            </Field>
            <Field label="Work Mode">
              <Select value={addForm.workMode} onChange={(v) => setAddForm((f) => ({ ...f, workMode: v }))} options={["", ...WORK_MODES]} />
            </Field>

            <Field label="Project Name *">
              <div className="relative" ref={suggestRef}>
                <input
                  type="text"
                  className="w-full h-9 rounded-lg border px-3 text-sm"
                  value={addForm.projectName}
                  onChange={(e) => setAddForm((f) => ({ ...f, projectName: e.target.value }))}
                  placeholder="Type project name…"
                />
                {showSuggest && suggestions.length > 0 && (
                  <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
                    {suggestions.map((s) => (
                      <li key={s.id} onClick={() => selectProjectIntoForm(s, "add")} className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.id}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Field>

            <Field label="Task">
              <Select value={addForm.task} onChange={(v) => setAddForm((f) => ({ ...f, task: v }))} options={["", ...TASKS]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Book Element">
                <Select value={addForm.bookElement} onChange={(v) => setAddForm((f) => ({ ...f, bookElement: v }))} options={["", ...BASE_BOOK_ELEMENTS]} />
              </Field>
              <Field label="Chapters">
                <MultiSelectChips value={addForm.chapterNumbers} onChange={(vals) => setAddForm((f) => ({ ...f, chapterNumbers: vals }))} options={BASE_CHAPTER_NUMBERS} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Hours Spent">
                <Select value={addForm.hoursSpent} onChange={(v) => setAddForm((f) => ({ ...f, hoursSpent: v }))} options={["", ...HOURS]} />
              </Field>
              <Field label="Units">
                <div className="flex gap-2">
                  <input type="number" className="w-20 h-9 rounded-lg border px-2 text-sm" value={addForm.noOfUnits} onChange={(e) => setAddForm((f) => ({ ...f, noOfUnits: e.target.value }))} />
                  <Select value={addForm.unitType} onChange={(v) => setAddForm((f) => ({ ...f, unitType: v }))} options={UNITS} />
                </div>
              </Field>
            </div>

            <Field label="Status">
              <Select value={addForm.status} onChange={(v) => setAddForm((f) => ({ ...f, status: v }))} options={["", ...STATUS]} />
            </Field>

            <Field label="Details / Remarks">
              <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" value={addForm.details} onChange={(e) => setAddForm((f) => ({ ...f, details: e.target.value }))} />
            </Field>

            <Field label="Audit Status">
              <Select value={addForm.auditStatus} onChange={(v) => setAddForm((f) => ({ ...f, auditStatus: v }))} options={AUDIT_STATUSES} />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setGlobalAddOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md text-sm hover:bg-slate-300">Cancel</button>
              <button onClick={() => handleSaveAdd("global")} disabled={savingAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50">
                {savingAdd ? "Saving..." : "Add Entry"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =============== SidebarLinks (UNCHANGED from AdminDashboard except labels) =============== */
/* =================== SIDEBAR =================== */
function SidebarLinks({ navigate, location, close }) {
  const [openWorklogs, setOpenWorklogs] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);

  // Keep sections open if child page active
  useEffect(() => {
    if (location.pathname.includes("worklog")) setOpenWorklogs(true);
    if (location.pathname.includes("project") || location.pathname.includes("abbreviations"))
      setOpenProjects(true);
  }, [location]);

  const handleNavigation = (path) => {
    navigate(path);
    if (close) close();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
      <nav className="flex flex-col space-y-2">

        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${location.pathname === "/admin-dashboard" ? "bg-gray-700" : ""
            }`}
          onClick={() => handleNavigation("/admin-dashboard")}
        >
          Home
        </button>

        {/* Worklogs */}
        <div>
          <button
            className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg transition-colors"
            onClick={() => setOpenWorklogs(!openWorklogs)}
          >
            <span>Worklogs</span>
            <span className="transition-transform duration-200">
              {openWorklogs ? "▾" : "▸"}
            </span>
          </button>
          {openWorklogs && (
            <div className="ml-4 mt-2 flex flex-col space-y-2 animate-fadeIn">
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("approve-worklogs") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/approve-worklogs")}
              >
                Approve Worklogs
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("edit-worklog-entries") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/edit-worklog-entries")}
              >
                Edit Worklogs
              </button>
            </div>
          )}
        </div>

        {/* Employees */}
        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${location.pathname.includes("handle-employees") ? "bg-gray-700" : ""
            }`}
          onClick={() => handleNavigation("/admin/handle-employees")}
        >
          Manage Employees
        </button>

        {/* Projects */}
        <div>
          <button
            className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg transition-colors"
            onClick={() => setOpenProjects(!openProjects)}
          >
            <span>Projects</span>
            <span className="transition-transform duration-200">
              {openProjects ? "▾" : "▸"}
            </span>
          </button>
          {openProjects && (
            <div className="ml-4 mt-2 flex flex-col space-y-2 animate-fadeIn">
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-abbreviations") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/add-abbreviations")}
              >
                Add Abbreviations
              </button>
              <button
                className={`text-left hover:gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-project") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/add-project")}
              >
                Add Project
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("project-requests") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/project-requests")}
              >
                Project Requests
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

/* =================== Small components =================== */
function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-slate-500 truncate">{label}</dt>
      <dd className="text-slate-800 break-words">{value ?? "-"}</dd>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block mb-1 text-xs font-medium text-slate-800">{label}</span>
      {children}
      {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
    </label>
  );
}

function Select({ value, onChange, options, isInvalid, className = "", ...rest }) {
  return (
    <select
      className={`w-full h-9 text-sm px-2 rounded-2xl border-2 ${isInvalid ? "border-rose-500" : "border-slate-300"} focus:border-indigo-600 ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      {options.map((o, idx) => (
        <option key={idx} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o : (o.label ?? o.value)}
        </option>
      ))}
    </select>
  );
}

/* =================== MultiSelectChips =================== */
function MultiSelectChips({ value = [], onChange, options = [], placeholder = "Select…", isInvalid = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shellRef = useRef(null);
  const inputRef = useRef(null);
  const lastTs = useRef(0);

  useEffect(() => {
    const fn = (e) => { if (shellRef.current && !shellRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const guard = () => { const n = Date.now(); if (n - lastTs.current < 120) return false; lastTs.current = n; return true; };
  const add = (item) => { if (!guard()) return; if (!value.includes(item)) onChange([...value, item]); setQuery(""); setOpen(true); inputRef.current?.focus(); };
  const removeAt = (i) => { if (!guard()) return; const next = value.slice(); next.splice(i, 1); onChange(next); setOpen(true); inputRef.current?.focus(); };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !value.includes(o)).filter((o) => q ? o.toLowerCase().includes(q) : true);
  }, [options, value, query]);

  return (
    <div className="relative" ref={shellRef}>
      <div
        className={`min-h-[44px] w-full rounded-2xl border-2 bg-white px-2 py-1 flex flex-wrap items-center gap-2 cursor-text ${isInvalid ? "border-rose-500" : "border-slate-300"} focus-within:border-indigo-600`}
        onMouseDown={(e) => { if (e.target === e.currentTarget) e.preventDefault(); setOpen(true); inputRef.current?.focus(); }}
        role="combobox" aria-expanded={open}
      >
        {value.map((v, idx) => (
          <span key={`${v}-${idx}`} className="flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-[2px] text-xs">
            {v}
            <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeAt(idx); }} className="ml-1 rounded-full hover:bg-indigo-100 p-[2px] leading-none" aria-label={`Remove ${v}`}>✕</button>
          </span>
        ))}
        <input
          ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Backspace" && query === "" && value.length) removeAt(value.length - 1); }}
          className="flex-1 min-w-[80px] outline-none text-sm px-1 py-1 bg-transparent"
          placeholder={value.length ? "" : placeholder}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-2xl border bg-white shadow-2xl" role="listbox" onMouseDown={(e) => e.preventDefault()}>
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
          ) : filtered.map((opt) => (
            <div key={opt} role="option" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); add(opt); }} className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer">
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== Calendar Grid =================== */
function CalendarGrid({ monthKey, rangeMode, tempStart, tempEnd, onPick }) {
  const monthDate = parseMonthKey(monthKey);
  const today = stripToISO(new Date());

  const firstDay = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const startWeekday = firstDay.getUTCDay(); // 0..6
  const daysInMonth = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)
  ).getUTCDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = stripToISO(new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), d)));
    cells.push(iso);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const isInSelection = (iso) => {
    if (!iso) return false;
    if (!rangeMode) return iso === tempEnd;
    const s = tempStart <= tempEnd ? tempStart : tempEnd;
    const e = tempEnd >= tempStart ? tempEnd : tempStart;
    return iso >= s && iso <= e;
  };

  return (
    <div className="px-3 py-2">
      <div className="grid grid-cols-7 text-[11px] text-slate-500 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 px-1 pb-2">
        {cells.map((iso, idx) => {
          if (!iso) return <div key={idx} className="h-9" />;
          const disabled = iso > today;
          const selected = isInSelection(iso);
          const isToday = iso === today;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onPick(iso)}
              className={`h-9 w-9 flex items-center justify-center rounded-full text-sm transition
                ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-50"}
                ${selected ? "bg-indigo-600 text-white font-semibold" : "bg-white"}
                ${isToday ? "ring-1 ring-indigo-400" : ""}`}
              title={formatISOToHuman(iso)}
            >
              {new Date(iso).getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =================== Date helpers =================== */
function stripToISO(d) {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt.toISOString().split("T")[0];
}
function toISODateOnly(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    // if value is already yyyy-mm-dd
    return String(value);
  }
  return stripToISO(d);
}
function isoNDaysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return stripToISO(d);
}
function formatISOToHuman(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function toMonthKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function parseMonthKey(key) {
  const [y, m] = key.split("-").map((v) => parseInt(v, 10));
  return new Date(Date.UTC(y, m - 1, 1));
}
function formatMonthKey(key) {
  const d = parseMonthKey(key);
  return d.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}
function addMonths(date, delta) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));
}
function isMonthFullyInFuture(d) {
  const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return monthStart > today && lastDay > today;
}

/* =================== Validation helpers =================== */
function initialFormState() {
  return {
    _id: undefined,
    employeeName: "",
    date: "",
    workMode: "",
    projectName: "",
    task: "",
    bookElement: "",
    chapterNumbers: [],
    hoursSpent: "",
    noOfUnits: "",
    unitType: "pages",
    status: "",
    dueOn: "",
    details: "",
    auditStatus: "Pending",
  };
}

const isEmpty = (v) => (Array.isArray(v) ? v.length === 0 : v == null || String(v).trim() === "");
function validateAdminEntry(form, suggestions) {
  const projectValid = (!!form.projectName && String(form.projectName).trim() !== "");
  const required = {
    employeeName: form.employeeName,
    dueOn: form.dueOn,
    workMode: form.workMode,
    projectValid: projectValid ? "ok" : "",
    task: form.task,
    bookElement: form.bookElement,
    chapterNumbers: form.chapterNumbers,
    hoursSpent: form.hoursSpent,
    noOfUnits: form.noOfUnits,
    unitType: form.unitType,
    status: form.status,
    auditStatus: form.auditStatus,
  };
  const invalid = Object.fromEntries(Object.entries(required).map(([k, v]) => [k, isEmpty(v)]));
  return { invalid, canSubmit: Object.values(required).every((v) => !isEmpty(v)), projectValid };
}

/* =================== Outclick hook =================== */
function useOutclick(onOut) {
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onOut?.();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onOut]);
  return ref;
}

/* =================== Modal wrapper =================== */
function Modal({ children, title, onClose, widthClass = "max-w-4xl" }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white w-full ${widthClass} mx-4 rounded-2xl shadow-2xl border border-slate-200`}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}