// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";

// import {
//   Check,
//   X,
//   AlertCircle,
//   Clock,
//   CheckCircle,
//   XCircle,
//   ChevronLeft,
//   ChevronRight,
//   Calendar as CalendarIcon,
//   Users as UsersIcon,
//   Filter as FilterIcon,
//   Pencil,
//   ChevronDown,
// } from "lucide-react";

// /* =================== CONFIG =================== */
// const API_BASE_URL = "http://localhost:5000";

// /* =================== MAIN PAGE =================== */
// export default function AdminApproveWorklogs() {
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

//   /* ===== Approve Worklogs STATE/LOGIC (updated for admin) ===== */

//   // Data
//   const [worklogsByDate, setWorklogsByDate] = useState({});
//   const [employees, setEmployees] = useState([]);

//   // Status
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [updating, setUpdating] = useState({});
//   const [bulkUpdating, setBulkUpdating] = useState({}); // key: `${dateKey}|${emp}`

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

//   // Filters: audit statuses
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

//   // Edit mode for "Change to …" actions
//   const [modifying, setModifying] = useState(null);

//   /* --- Fetch employees --- */
//   useEffect(() => {
//     if (!user) return;
//     const token = localStorage.getItem("authToken");
//     // Updated to use admin endpoint
//     fetch(`${API_BASE_URL}/api/admin/users`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((r) => (r.ok ? r.json() : r.text().then((t) => Promise.reject(new Error(t)))))
//       .then((data) => setEmployees(data.users || []))
//       .catch((err) => console.error("Failed to fetch employees:", err.message));
//   }, [user]);

//   /* --- Fetch worklogs (on filter change) --- */
//   useEffect(() => {
//     if (!user) return;
//     fetchWorklogs();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, startISO, endISO, selectedEmployees, selectedAuditStatuses]);

//   const fetchWorklogs = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = localStorage.getItem("authToken");

//       // Updated to use admin endpoint with proper body structure
//       const res = await fetch(`${API_BASE_URL}/api/admin/worklogs`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           startDate: startISO,
//           endDate: endISO,
//           employees: selectedEmployees.length > 0 ? selectedEmployees : undefined,
//           auditStatus: selectedAuditStatuses.length === ALL_STATUSES.length ? undefined : selectedAuditStatuses,
//         }),
//       });

//       if (!res.ok) throw new Error(await res.text());
//       const data = await res.json();
//       setWorklogsByDate(data.worklogsByDate || {});
//     } catch (err) {
//       console.error(err);
//       setError(`Failed to fetch worklogs: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* --- Derived helpers --- */
//   const sortedDateKeys = useMemo(
//     () => Object.keys(worklogsByDate).sort((a, b) => new Date(b) - new Date(a)),
//     [worklogsByDate]
//   );

//   const withinDplus3 = (dateKey) => {
//     if (!dateKey) return false;
//     const D = new Date(dateKey);
//     const deadline = new Date(D);
//     deadline.setUTCDate(D.getUTCDate() + 3);
//     deadline.setUTCHours(23, 59, 59, 999);
//     return new Date() <= deadline;
//   };
//   const withinDplus5 = (dateKey) => {
//     if (!dateKey) return false;
//     const D = new Date(dateKey);
//     const deadline = new Date(D);
//     deadline.setUTCDate(D.getUTCDate() + 5);
//     deadline.setUTCHours(23, 59, 59, 999);
//     return new Date() <= deadline;
//   };

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

//   const { actionablePendingCount, actionableRePendingCount } = useMemo(() => {
//     let pending = 0;
//     let repending = 0;
//     for (const dateKey of Object.keys(worklogsByDate)) {
//       for (const row of worklogsByDate[dateKey] || []) {
//         if (row.auditStatus === "Pending" && withinDplus3(dateKey)) pending++;
//         if (row.auditStatus === "Re-Pending" && withinDplus5(dateKey)) repending++;
//       }
//     }
//     return { actionablePendingCount: pending, actionableRePendingCount: repending };
//   }, [worklogsByDate]);

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
//           <CheckCircle className="w-4 h-4" /> Approved
//         </span>
//       );
//     if (status === "Rejected")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-medium">
//           <XCircle className="w-4 h-4" /> Rejected
//         </span>
//       );
//     if (status === "Re-Pending")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 text-amber-800 px-2 py-0.5 text-xs font-medium">
//           <Clock className="w-4 h-4" /> Re-Pending
//         </span>
//       );
//     if (status === "Re-Approved")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 text-emerald-800 px-2 py-0.5 text-xs font-medium">
//           <CheckCircle className="w-4 h-4" /> Re-Approved
//         </span>
//       );
//     if (status === "Re-Rejected")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-rose-200 text-rose-800 px-2 py-0.5 text-xs font-medium">
//           <XCircle className="w-4 h-4" /> Re-Rejected
//         </span>
//       );
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 text-yellow-800 px-2 py-0.5 text-xs font-medium">
//         <Clock className="w-4 h-4" /> Pending
//       </span>
//     );
//   };

//   /* --- Updates (single/bulk) --- */
//   const mutateLocalRow = (dateKey, id, auditStatus) => {
//     setWorklogsByDate((prev) => {
//       const next = { ...prev };
//       if (!next[dateKey]) return next;
//       next[dateKey] = next[dateKey].map((r) => (r._id === id ? { ...r, auditStatus } : r));
//       return next;
//     });
//   };

//   const updateWorklogStatus = async (worklogId, status, dateKey, adminComments = "") => {
//     try {
//       setUpdating((p) => ({ ...p, [worklogId]: true }));
//       const token = localStorage.getItem("authToken");

//       // Updated to use admin endpoint
//       const res = await fetch(`${API_BASE_URL}/api/admin/worklogs/update-status`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         body: JSON.stringify({
//           worklogId,
//           auditStatus: status,
//           adminComments: adminComments || undefined
//         }),
//       });

//       if (!res.ok) throw new Error(await res.text());
//       await res.json();
//       mutateLocalRow(dateKey, worklogId, status);
//     } catch (err) {
//       console.error(err);
//       alert(`Failed to ${status.toLowerCase()} worklog. Please try again.`);
//     } finally {
//       setUpdating((p) => ({ ...p, [worklogId]: false }));
//     }
//   };

//   const handleApprove = (id, dateKey) => updateWorklogStatus(id, "Approved", dateKey);
//   const handleReject = (id, dateKey) => {
//     if (!window.confirm("Are you sure you want to reject this entry?")) return;
//     updateWorklogStatus(id, "Rejected", dateKey);
//   };
//   const handleReApprove = (id, dateKey) => updateWorklogStatus(id, "Re-Approved", dateKey);
//   const handleReReject = (id, dateKey) => {
//     if (!window.confirm("Are you sure you want to re-reject this entry?")) return;
//     updateWorklogStatus(id, "Re-Rejected", dateKey);
//   };

//   const handleApproveAll = async (dateKey, employeeName) => {
//     const key = `${dateKey}|${employeeName}`;
//     try {
//       setBulkUpdating((p) => ({ ...p, [key]: true }));
//       const token = localStorage.getItem("authToken");
//       const rows = (worklogsByDate[dateKey] || []).filter(
//         (r) => r.employeeName === employeeName && r.auditStatus === "Pending" && withinDplus3(dateKey)
//       );
//       const ids = rows.map((r) => r._id);
//       if (ids.length === 0) return;

//       // Updated to use admin endpoint
//       const res = await fetch(`${API_BASE_URL}/api/admin/worklogs/bulk-update-status`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         body: JSON.stringify({
//           worklogIds: ids,
//           auditStatus: "Approved",
//           adminComments: `Bulk approved by admin on ${new Date().toISOString().split('T')[0]}`
//         }),
//       });

//       if (!res.ok) throw new Error(await res.text());
//       await res.json();

//       setWorklogsByDate((prev) => {
//         const next = { ...prev };
//         next[dateKey] = next[dateKey].map((row) =>
//           row.employeeName === employeeName && row.auditStatus === "Pending" && withinDplus3(dateKey)
//             ? { ...row, auditStatus: "Approved" }
//             : row
//         );
//         return next;
//       });
//     } catch (err) {
//       console.error(err);
//       alert("Approve All failed. Please try again.");
//     } finally {
//       setBulkUpdating((p) => ({ ...p, [key]: false }));
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
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   /* =================== LAYOUT (Navbar + Sidebar UNCHANGED) =================== */
//   return (
//     <div className="min-h-screen bg-slate-100">
//       {/* Navbar (unchanged) */}
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
//                 Admin Dashboard <span className="hidden sm:inline">- Work Log</span>
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

//       {/* Sidebar (unchanged) */}
//       {sidebarOpen && (
//         <div className="fixed inset-0 z-40 lg:hidden">
//           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
//           <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl overflow-y-auto">
//             <SidebarLinks navigate={navigate} location={useLocation()} close={() => setSidebarOpen(false)} />

//           </aside>
//         </div>
//       )}
//       <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
//         <SidebarLinks navigate={navigate} location={useLocation()} />
//       </aside>


//       {/* =================== MAIN CONTENT (Approve Worklogs FULL) =================== */}
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
//                       <label key={emp._id || emp.name} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs lg:text-sm">
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
//                 <div className="flex flex-col space-y-2 lg:space-y-1 lg:items-end">
//                   <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-amber-100 text-amber-800">
//                     <Clock className="w-3.5 h-3.5 flex-shrink-0" />
//                     <span className="font-medium">{actionableRePendingCount} Re-Pending entries</span>
//                     <span className="opacity-80 hidden lg:inline">Admin can override at any time</span>
//                   </div>
//                   <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-yellow-100 text-yellow-800">
//                     <Clock className="w-3.5 h-3.5 flex-shrink-0" />
//                     <span className="font-medium">{actionablePendingCount} Pending entries</span>
//                     <span className="opacity-80 hidden lg:inline">Admin can override at any time</span>
//                   </div>
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
//                       const pendingCount = rows.filter((r) => r.auditStatus === "Pending").length;
//                       const rePendingCount = rows.filter((r) => r.auditStatus === "Re-Pending").length;
//                       const key = `${dateKey}|${emp}`;
//                       const canApproveAll = pendingCount > 0;

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
//                                   {pendingCount} Pending , {rePendingCount} Re-Pending
//                                 </div>
//                               </div>
//                             </div>

//                             <button
//                               disabled={!canApproveAll || !!bulkUpdating[key]}
//                               onClick={() => handleApproveAll(dateKey, emp)}
//                               className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${canApproveAll ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"
//                                 }`}
//                             >
//                               {bulkUpdating[key] ? (
//                                 <span className="flex items-center gap-2">
//                                   <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
//                                   Approving…
//                                 </span>
//                               ) : (
//                                 <>
//                                   <Check className="w-4 h-4" />
//                                   Approve All (Pending)
//                                 </>
//                               )}
//                             </button>
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
//                                 {rows.map((log) => {
//                                   const isPending = log.auditStatus === "Pending";
//                                   const isRePending = log.auditStatus === "Re-Pending";
//                                   // Admin has override powers - no time restrictions
//                                   const actionable = true;

//                                   return (
//                                     <tr key={log._id} className={`${rowClassForAudit(log.auditStatus)} border-t`}>
//                                       <Td>{log.workMode}</Td>
//                                       <Td className="max-w-[260px] truncate" title={log.projectName}>
//                                         {log.projectName}
//                                       </Td>
//                                       <Td>{log.task}</Td>
//                                       <Td>{log.bookElement}</Td>
//                                       <Td>{log.chapterNo}</Td>
//                                       <Td>{log.hoursSpent}</Td>
//                                       <Td>{log.noOfUnits}</Td>
//                                       <Td>{log.unitType}</Td>
//                                       <Td>{log.status}</Td>
//                                       <Td>{formatISOToHuman(log.dueOn)}</Td>
//                                       <Td className="max-w-[220px] whitespace-normal break-words">
//                                         {log.details || "-"}
//                                       </Td>
//                                       <Td>
//                                         <AuditBadge status={log.auditStatus} />
//                                       </Td>
//                                       <Td>
//                                         {isPending ? (
//                                           <div className="flex gap-2">
//                                             <button
//                                               className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
//                                               onClick={() => handleApprove(log._id, dateKey)}
//                                               disabled={!!updating[log._id]}
//                                             >
//                                               {updating[log._id] ? (
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                               ) : (
//                                                 <Check size={16} />
//                                               )}
//                                             </button>
//                                             <button
//                                               className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
//                                               onClick={() => handleReject(log._id, dateKey)}
//                                               disabled={!!updating[log._id]}
//                                             >
//                                               {updating[log._id] ? (
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                               ) : (
//                                                 <X size={16} />
//                                               )}
//                                             </button>
//                                           </div>
//                                         ) : isRePending ? (
//                                           <div className="flex gap-2">
//                                             <button
//                                               className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
//                                               onClick={() => handleReApprove(log._id, dateKey)}
//                                               disabled={!!updating[log._id]}
//                                             >
//                                               {updating[log._id] ? (
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                               ) : (
//                                                 <Check size={16} />
//                                               )}
//                                             </button>
//                                             <button
//                                               className="inline-flex items-center justify-center bg-rose-700 hover:bg-rose-800 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
//                                               onClick={() => handleReReject(log._id, dateKey)}
//                                               disabled={!!updating[log._id]}
//                                             >
//                                               {updating[log._id] ? (
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                               ) : (
//                                                 <X size={16} />
//                                               )}
//                                             </button>
//                                           </div>
//                                         ) : (
//                                           <>
//                                             {modifying?.id === log._id ? (
//                                               <div className="flex gap-2">
//                                                 {(log.auditStatus === "Approved" || log.auditStatus === "Rejected") && (
//                                                   <>
//                                                     <button
//                                                       onClick={() => updateWorklogStatus(log._id, "Approved", dateKey)}
//                                                       className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm"
//                                                       disabled={!!updating[log._id]}
//                                                     >
//                                                       Approve
//                                                     </button>
//                                                     <button
//                                                       onClick={() => updateWorklogStatus(log._id, "Rejected", dateKey)}
//                                                       className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm"
//                                                       disabled={!!updating[log._id]}
//                                                     >
//                                                       Reject
//                                                     </button>
//                                                   </>
//                                                 )}

//                                                 {(log.auditStatus === "Re-Approved" || log.auditStatus === "Re-Rejected") && (
//                                                   <>
//                                                     <button
//                                                       onClick={() => updateWorklogStatus(log._id, "Re-Approved", dateKey)}
//                                                       className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm"
//                                                       disabled={!!updating[log._id]}
//                                                     >
//                                                       Re-Approve
//                                                     </button>
//                                                     <button
//                                                       onClick={() => updateWorklogStatus(log._id, "Re-Rejected", dateKey)}
//                                                       className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm"
//                                                       disabled={!!updating[log._id]}
//                                                     >
//                                                       Re-Reject
//                                                     </button>
//                                                   </>
//                                                 )}

//                                                 <button
//                                                   onClick={() => setModifying(null)}
//                                                   className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
//                                                 >
//                                                   Cancel
//                                                 </button>
//                                               </div>
//                                             ) : (
//                                               <button
//                                                 className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
//                                                 onClick={() => setModifying({ id: log._id, dateKey })}
//                                               >
//                                                 <Pencil className="w-4 h-4" />
//                                                 Modify
//                                               </button>
//                                             )}
//                                           </>
//                                         )}
//                                       </Td>
//                                     </tr>
//                                   );
//                                 })}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Mobile grouped cards */}
//                   <div className="lg:hidden p-3 sm:p-4 space-y-4 sm:space-y-6">
//                     {Object.keys(grouped).map((emp) => {
//                       const rows = grouped[emp];
//                       const pendingCount = rows.filter((r) => r.auditStatus === "Pending").length;
//                       const rePendingCount = rows.filter((r) => r.auditStatus === "Re-Pending").length;
//                       const key = `${dateKey}|${emp}`;
//                       const canApproveAll = pendingCount > 0;

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
//                                   {pendingCount} pending, {rePendingCount} re-pending
//                                 </div>
//                               </div>
//                             </div>
//                             <button
//                               disabled={!canApproveAll || !!bulkUpdating[key]}
//                               onClick={() => handleApproveAll(dateKey, emp)}
//                               className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium flex-shrink-0 ${canApproveAll ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"
//                                 }`}
//                             >
//                               {bulkUpdating[key] ? (
//                                 <span className="flex items-center gap-1">
//                                   <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
//                                   <span className="hidden sm:inline">Approving…</span>
//                                 </span>
//                               ) : (
//                                 <>
//                                   <Check className="w-3 h-3 sm:w-4 sm:h-4" />
//                                   <span className="hidden sm:inline">Approve All</span>
//                                 </>
//                               )}
//                             </button>
//                           </div>

//                           <div className="divide-y">
//                             {rows.map((log) => {
//                               const isPending = log.auditStatus === "Pending";
//                               const isRePending = log.auditStatus === "Re-Pending";
//                               // Admin has override powers - no time restrictions
//                               const actionable = true;

//                               return (
//                                 <article key={log._id} className={`p-3 sm:p-4 ${rowClassForAudit(log.auditStatus)}`}>
//                                   <div className="flex items-start justify-between mb-3">
//                                     <div className="min-w-0 flex-1 pr-3">
//                                       <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 truncate" title={log.projectName}>
//                                         {log.projectName}
//                                       </h3>
//                                       <p className="text-xs text-slate-500 mt-0.5">
//                                         {log.task} · {log.bookElement} · Ch {log.chapterNo}
//                                       </p>
//                                     </div>
//                                     <AuditBadge status={log.auditStatus} />
//                                   </div>

//                                   <dl className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-[13px] mb-4">
//                                     <Info label="Work Mode" value={log.workMode} />
//                                     <Info label="Hours" value={log.hoursSpent} />
//                                     <Info label="Units" value={`${log.noOfUnits} ${log.unitType || ""}`} />
//                                     <Info label="Status" value={log.status} />
//                                     <Info label="Due On" value={formatISOToHuman(log.dueOn)} />
//                                     {log.details && (
//                                       <div className="col-span-2">
//                                         <dt className="text-slate-500">Details</dt>
//                                         <dd className="text-slate-800 break-words">{log.details}</dd>
//                                       </div>
//                                     )}
//                                   </dl>

//                                   <div className="flex flex-wrap gap-2">
//                                     {isPending ? (
//                                       <>
//                                         <button
//                                           className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 min-w-0"
//                                           onClick={() => handleApprove(log._id, dateKey)}
//                                           disabled={!!updating[log._id]}
//                                         >
//                                           {updating[log._id] ? (
//                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                           ) : (
//                                             <>
//                                               <Check size={16} />
//                                               <span>Approve</span>
//                                             </>
//                                           )}
//                                         </button>
//                                         <button
//                                           className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 min-w-0"
//                                           onClick={() => handleReject(log._id, dateKey)}
//                                           disabled={!!updating[log._id]}
//                                         >
//                                           {updating[log._id] ? (
//                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                           ) : (
//                                             <>
//                                               <X size={16} />
//                                               <span>Reject</span>
//                                             </>
//                                           )}
//                                         </button>
//                                       </>
//                                     ) : isRePending ? (
//                                       <>
//                                         <button
//                                           className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 min-w-0"
//                                           onClick={() => handleReApprove(log._id, dateKey)}
//                                           disabled={!!updating[log._id]}
//                                         >
//                                           {updating[log._id] ? (
//                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                           ) : (
//                                             <>
//                                               <Check size={16} />
//                                               <span>Re-Approve</span>
//                                             </>
//                                           )}
//                                         </button>
//                                         <button
//                                           className="inline-flex items-center gap-1 bg-rose-700 hover:bg-rose-800 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 min-w-0"
//                                           onClick={() => handleReReject(log._id, dateKey)}
//                                           disabled={!!updating[log._id]}
//                                         >
//                                           {updating[log._id] ? (
//                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                           ) : (
//                                             <>
//                                               <X size={16} />
//                                               <span>Re-Reject</span>
//                                             </>
//                                           )}
//                                         </button>
//                                       </>
//                                     ) : (
//                                       <>
//                                         {modifying?.id === log._id ? (
//                                           <div className="w-full space-y-2">
//                                             <div className="flex flex-wrap gap-2">
//                                               {(log.auditStatus === "Approved" || log.auditStatus === "Rejected") && (
//                                                 <>
//                                                   <button
//                                                     onClick={() => updateWorklogStatus(log._id, "Approved", dateKey)}
//                                                     className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-0"
//                                                     disabled={!!updating[log._id]}
//                                                   >
//                                                     Approve
//                                                   </button>
//                                                   <button
//                                                     onClick={() => updateWorklogStatus(log._id, "Rejected", dateKey)}
//                                                     className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-0"
//                                                     disabled={!!updating[log._id]}
//                                                   >
//                                                     Reject
//                                                   </button>
//                                                 </>
//                                               )}

//                                               {(log.auditStatus === "Re-Approved" || log.auditStatus === "Re-Rejected") && (
//                                                 <>
//                                                   <button
//                                                     onClick={() => updateWorklogStatus(log._id, "Re-Approved", dateKey)}
//                                                     className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-0"
//                                                     disabled={!!updating[log._id]}
//                                                   >
//                                                     Re-Approve
//                                                   </button>
//                                                   <button
//                                                     onClick={() => updateWorklogStatus(log._id, "Re-Rejected", dateKey)}
//                                                     className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-0"
//                                                     disabled={!!updating[log._id]}
//                                                   >
//                                                     Re-Reject
//                                                   </button>
//                                                 </>
//                                               )}
//                                             </div>
//                                             <button
//                                               onClick={() => setModifying(null)}
//                                               className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-3 py-2 rounded-lg text-sm w-full"
//                                             >
//                                               Cancel
//                                             </button>
//                                           </div>
//                                         ) : (
//                                           <button
//                                             className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
//                                             onClick={() => setModifying({ id: log._id, dateKey })}
//                                           >
//                                             <Pencil className="w-4 h-4" />
//                                             <span>Modify</span>
//                                           </button>
//                                         )}
//                                       </>
//                                     )}
//                                   </div>
//                                 </article>
//                               );
//                             })}
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
//     </div>
//   );
// }

// /* =============== SidebarLinks (UNCHANGED from AdminDashboard) =============== */
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

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import {
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Filter as FilterIcon,
  Pencil,
  ChevronDown,
} from "lucide-react";

/* =================== CONFIG =================== */
const API_BASE_URL = "http://localhost:5000";

/* =================== MAIN PAGE =================== */
export default function AdminApproveWorklogs() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  /* ===== Auth ===== */
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

  // Data
  const [worklogsByDate, setWorklogsByDate] = useState({});
  const [employees, setEmployees] = useState([]);

  // Status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [bulkUpdating, setBulkUpdating] = useState({});

  // Filters: employees
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

  // Filters: audit statuses
  const ALL_STATUSES = [
    "Pending",
    "Re-Pending",
    "Approved",
    "Rejected",
    "Re-Approved",
    "Re-Rejected",
  ];
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useOutclick(() => setShowStatusDropdown(false));
  const [selectedAuditStatuses, setSelectedAuditStatuses] = useState([...ALL_STATUSES]);

  // Edit mode
  const [modifying, setModifying] = useState(null);

  /* --- Fetch employees --- */
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("authToken");
    fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : r.text().then((t) => Promise.reject(new Error(t)))))
      .then((data) => setEmployees(data.users || []))
      .catch((err) => console.error("Failed to fetch employees:", err.message));
  }, [user]);

  /* --- Fetch worklogs --- */
  useEffect(() => {
    if (!user) return;
    fetchWorklogs();
  }, [user, startISO, endISO, selectedEmployees, selectedAuditStatuses]);

  const fetchWorklogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE_URL}/api/admin/worklogs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startISO,
          endDate: endISO,
          employees: selectedEmployees.length > 0 ? selectedEmployees : undefined,
          auditStatus: selectedAuditStatuses.length === ALL_STATUSES.length ? undefined : selectedAuditStatuses,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setWorklogsByDate(data.worklogsByDate || {});
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch worklogs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* --- Derived helpers --- */
  const sortedDateKeys = useMemo(
    () => Object.keys(worklogsByDate).sort((a, b) => new Date(b) - new Date(a)),
    [worklogsByDate]
  );

  const withinDplus3 = (dateKey) => {
    if (!dateKey) return false;
    const D = new Date(dateKey);
    const deadline = new Date(D);
    deadline.setUTCDate(D.getUTCDate() + 3);
    deadline.setUTCHours(23, 59, 59, 999);
    return new Date() <= deadline;
  };

  const withinDplus5 = (dateKey) => {
    if (!dateKey) return false;
    const D = new Date(dateKey);
    const deadline = new Date(D);
    deadline.setUTCDate(D.getUTCDate() + 5);
    deadline.setUTCHours(23, 59, 59, 999);
    return new Date() <= deadline;
  };

  const groupByEmployee = (items) => {
    const byEmp = {};
    for (const row of items) {
      if (!byEmp[row.employeeName]) byEmp[row.employeeName] = [];
      byEmp[row.employeeName].push(row);
    }
    return Object.fromEntries(
      Object.keys(byEmp)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => [k, byEmp[k]])
    );
  };

  // Calculate total hours for an employee on a specific date
  const calculateTotalHours = (rows) => {
    return rows.reduce((total, row) => total + (parseFloat(row.hoursSpent) || 0), 0);
  };

  // Get background color based on total hours
  const getHoursBgColor = (totalHours) => {
    if (totalHours >= 6.5 && totalHours <= 7.5) return "bg-emerald-100";
    if (totalHours < 6.5) return "bg-red-100";
    if (totalHours > 7.5) return "bg-blue-100";
    return "";
  };

  const { actionablePendingCount, actionableRePendingCount } = useMemo(() => {
    let pending = 0;
    let repending = 0;
    for (const dateKey of Object.keys(worklogsByDate)) {
      for (const row of worklogsByDate[dateKey] || []) {
        if (row.auditStatus === "Pending" && withinDplus3(dateKey)) pending++;
        if (row.auditStatus === "Re-Pending" && withinDplus5(dateKey)) repending++;
      }
    }
    return { actionablePendingCount: pending, actionableRePendingCount: repending };
  }, [worklogsByDate]);

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
          <CheckCircle className="w-4 h-4" /> Approved
        </span>
      );
    if (status === "Rejected")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-medium">
          <XCircle className="w-4 h-4" /> Rejected
        </span>
      );
    if (status === "Re-Pending")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 text-amber-800 px-2 py-0.5 text-xs font-medium">
          <Clock className="w-4 h-4" /> Re-Pending
        </span>
      );
    if (status === "Re-Approved")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 text-emerald-800 px-2 py-0.5 text-xs font-medium">
          <CheckCircle className="w-4 h-4" /> Re-Approved
        </span>
      );
    if (status === "Re-Rejected")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-200 text-rose-800 px-2 py-0.5 text-xs font-medium">
          <XCircle className="w-4 h-4" /> Re-Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 text-yellow-800 px-2 py-0.5 text-xs font-medium">
        <Clock className="w-4 h-4" /> Pending
      </span>
    );
  };

  /* --- Updates --- */
  const mutateLocalRow = (dateKey, id, auditStatus) => {
    setWorklogsByDate((prev) => {
      const next = { ...prev };
      if (!next[dateKey]) return next;
      next[dateKey] = next[dateKey].map((r) => (r._id === id ? { ...r, auditStatus } : r));
      return next;
    });
  };

  const updateWorklogStatus = async (worklogId, status, dateKey, adminComments = "") => {
    try {
      setUpdating((p) => ({ ...p, [worklogId]: true }));
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE_URL}/api/admin/worklogs/update-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          worklogId,
          auditStatus: status,
          adminComments: adminComments || undefined
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      await res.json();
      mutateLocalRow(dateKey, worklogId, status);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${status.toLowerCase()} worklog. Please try again.`);
    } finally {
      setUpdating((p) => ({ ...p, [worklogId]: false }));
    }
  };

  const handleApprove = (id, dateKey) => updateWorklogStatus(id, "Approved", dateKey);
  const handleReject = (id, dateKey) => {
    if (!window.confirm("Are you sure you want to reject this entry?")) return;
    updateWorklogStatus(id, "Rejected", dateKey);
  };
  const handleReApprove = (id, dateKey) => updateWorklogStatus(id, "Re-Approved", dateKey);
  const handleReReject = (id, dateKey) => {
    if (!window.confirm("Are you sure you want to re-reject this entry?")) return;
    updateWorklogStatus(id, "Re-Rejected", dateKey);
  };

  // New handlers for change to approve/reject
  const handleChangeToApprove = (id, dateKey, currentStatus) => {
    const newStatus = currentStatus === "Rejected" ? "Approved" : "Re-Approved";
    updateWorklogStatus(id, newStatus, dateKey);
  };

  const handleChangeToReject = (id, dateKey, currentStatus) => {
    if (!window.confirm("Are you sure you want to reject this entry?")) return;
    const newStatus = currentStatus === "Approved" ? "Rejected" : "Re-Rejected";
    updateWorklogStatus(id, newStatus, dateKey);
  };

  const handleApproveAll = async (dateKey, employeeName) => {
    const key = `${dateKey}|${employeeName}`;
    try {
      setBulkUpdating((p) => ({ ...p, [key]: true }));
      const token = localStorage.getItem("authToken");
      const rows = (worklogsByDate[dateKey] || []).filter(
        (r) => r.employeeName === employeeName && r.auditStatus === "Pending" && withinDplus3(dateKey)
      );
      const ids = rows.map((r) => r._id);
      if (ids.length === 0) return;

      const res = await fetch(`${API_BASE_URL}/api/admin/worklogs/bulk-update-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          worklogIds: ids,
          auditStatus: "Approved",
          adminComments: `Bulk approved by admin on ${new Date().toISOString().split('T')[0]}`
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      await res.json();

      setWorklogsByDate((prev) => {
        const next = { ...prev };
        next[dateKey] = next[dateKey].map((row) =>
          row.employeeName === employeeName && row.auditStatus === "Pending" && withinDplus3(dateKey)
            ? { ...row, auditStatus: "Approved" }
            : row
        );
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("Approve All failed. Please try again.");
    } finally {
      setBulkUpdating((p) => ({ ...p, [key]: false }));
    }
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
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
                Admin Dashboard <span className="hidden sm:inline">- Work Log</span>
              </h1>
            </div>

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
        <SidebarLinks navigate={navigate} location={useLocation()} />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-20 p-6">
        <div className="p-3 sm:p-4 lg:p-6 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
          {/* Filters */}
          <div className="rounded-xl lg:rounded-2xl shadow-md border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <FilterIcon className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
              <h3 className="text-sm lg:text-base font-semibold text-slate-800 tracking-tight">Filters</h3>
            </div>

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
              <div ref={empRef} className="relative w-full lg:min-w-[260px] lg:w-auto">
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
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="px-3 py-2 text-xs text-slate-500 border-b bg-slate-50 flex items-center gap-2">
                      <UsersIcon className="w-3.5 h-3.5" />
                      Select employees
                    </div>
                    {employees.map((emp) => (
                      <label key={emp._id || emp.name} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs lg:text-sm">
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
                        {emp.name}
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
                        <span key={s} className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full text-xs font-medium">
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

              {/* Summary info */}
              <div className="w-full lg:w-auto text-xs text-slate-700 lg:ml-auto">
                <div className="flex flex-col space-y-2 lg:space-y-1 lg:items-end">
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-amber-100 text-amber-800">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">{actionableRePendingCount} Re-Pending entries</span>
                    <span className="opacity-80 hidden lg:inline">Admin can override at any time</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">{actionablePendingCount} Pending entries</span>
                    <span className="opacity-80 hidden lg:inline">Admin can override at any time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* States */}
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

          {/* By Date */}
          {!loading &&
            !error &&
            sortedDateKeys.map((dateKey) => {
              const allRows = worklogsByDate[dateKey] || [];
              const filteredRows =
                selectedAuditStatuses.length === 0
                  ? []
                  : allRows.filter((r) => selectedAuditStatuses.includes(r.auditStatus));
              if (filteredRows.length === 0) return null;

              const grouped = groupByEmployee(filteredRows);

              return (
                <section key={dateKey} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-4 lg:px-5 py-3 lg:py-4 border-b bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-600" />
                      {formatISOToHuman(dateKey)}
                      <span className="ml-2 rounded-full bg-indigo-100 text-indigo-700 text-[11px] px-2 py-0.5 font-medium">
                        {filteredRows.length} entries
                      </span>
                    </h2>
                  </div>

                  {/* Desktop grouped tables */}
                  <div className="hidden lg:block">
                    {Object.keys(grouped).map((emp) => {
                      const rows = grouped[emp];
                      const pendingCount = rows.filter((r) => r.auditStatus === "Pending").length;
                      const rePendingCount = rows.filter((r) => r.auditStatus === "Re-Pending").length;
                      const totalHours = calculateTotalHours(rows);
                      const hoursBgColor = getHoursBgColor(totalHours);
                      const key = `${dateKey}|${emp}`;
                      const canApproveAll = pendingCount > 0;

                      return (
                        <div key={emp} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                                {emp.split(" ").map((x) => x[0] || "").join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{emp}</div>
                                <div className="text-xs text-slate-500">
                                  {pendingCount} Pending , {rePendingCount} Re-Pending
                                </div>
                              </div>
                              <div className={`ml-4 px-3 py-1 rounded-full ${hoursBgColor} text-xs font-medium`}>
                                Total Hours: {totalHours.toFixed(1)}
                              </div>
                            </div>

                            <button
                              disabled={!canApproveAll || !!bulkUpdating[key]}
                              onClick={() => handleApproveAll(dateKey, emp)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${canApproveAll ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                }`}
                            >
                              {bulkUpdating[key] ? (
                                <span className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                  Approving…
                                </span>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Approve All (Pending)
                                </>
                              )}
                            </button>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="bg-slate-100 text-slate-700">
                                  <Th>Work Mode</Th>
                                  <Th>Project</Th>
                                  <Th>Task</Th>
                                  <Th>Book Element</Th>
                                  <Th>Chapter No</Th>
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
                                {rows.map((log) => {
                                  const isPending = log.auditStatus === "Pending";
                                  const isRePending = log.auditStatus === "Re-Pending";
                                  const isApproved = log.auditStatus === "Approved";
                                  const isRejected = log.auditStatus === "Rejected";
                                  const isReApproved = log.auditStatus === "Re-Approved";
                                  const isReRejected = log.auditStatus === "Re-Rejected";

                                  return (
                                    <tr key={log._id} className={`${rowClassForAudit(log.auditStatus)} border-t`}>
                                      <Td>{log.workMode}</Td>
                                      <Td className="max-w-[260px] truncate" title={log.projectName}>
                                        {log.projectName}
                                      </Td>
                                      <Td>{log.task}</Td>
                                      <Td>{log.bookElement}</Td>
                                      <Td>{log.chapterNo}</Td>
                                      <Td>{log.hoursSpent}</Td>
                                      <Td>{log.noOfUnits}</Td>
                                      <Td>{log.unitType}</Td>
                                      <Td>{log.status}</Td>
                                      <Td>{formatISOToHuman(log.dueOn)}</Td>
                                      <Td className="max-w-[220px] whitespace-normal break-words">
                                        {log.details || "-"}
                                      </Td>
                                      <Td>
                                        <AuditBadge status={log.auditStatus} />
                                      </Td>
                                      <Td>
                                        {isPending ? (
                                          <div className="flex gap-2">
                                            <button
                                              className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                              onClick={() => handleApprove(log._id, dateKey)}
                                              disabled={!!updating[log._id]}
                                            >
                                              {updating[log._id] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                              ) : (
                                                <Check size={16} />
                                              )}
                                            </button>
                                            <button
                                              className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                              onClick={() => handleReject(log._id, dateKey)}
                                              disabled={!!updating[log._id]}
                                            >
                                              {updating[log._id] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                              ) : (
                                                <X size={16} />
                                              )}
                                            </button>
                                          </div>
                                        ) : isRePending ? (
                                          <div className="flex gap-2">
                                            <button
                                              className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                              onClick={() => handleReApprove(log._id, dateKey)}
                                              disabled={!!updating[log._id]}
                                            >
                                              {updating[log._id] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                              ) : (
                                                <Check size={16} />
                                              )}
                                            </button>
                                            <button
                                              className="inline-flex items-center justify-center bg-rose-700 hover:bg-rose-800 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                              onClick={() => handleReReject(log._id, dateKey)}
                                              disabled={!!updating[log._id]}
                                            >
                                              {updating[log._id] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                              ) : (
                                                <X size={16} />
                                              )}
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            {modifying?.id === log._id ? (
                                              <div className="flex gap-2">
                                                {(isApproved || isReApproved) && (
                                                  <button
                                                    onClick={() => handleChangeToReject(log._id, dateKey, log.auditStatus)}
                                                    className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1.5 rounded text-xs font-medium"
                                                    disabled={!!updating[log._id]}
                                                  >
                                                    {isReApproved ? "Change to Re-Reject" : "Change to Reject"}
                                                  </button>
                                                )}
                                                {(isRejected || isReRejected) && (
                                                  <button
                                                    onClick={() => handleChangeToApprove(log._id, dateKey, log.auditStatus)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1.5 rounded text-xs font-medium"
                                                    disabled={!!updating[log._id]}
                                                  >
                                                    {isReRejected ? "Change to Re-Approve" : "Change to Approve"}
                                                  </button>
                                                )}
                                                <button
                                                  onClick={() => setModifying(null)}
                                                  className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-2 py-1.5 rounded text-xs font-medium"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1.5 rounded text-xs font-medium"
                                                onClick={() => setModifying({ id: log._id, dateKey })}
                                              >
                                                <Pencil className="w-3 h-3" />
                                              </button>
                                            )}
                                          </>
                                        )}
                                      </Td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile grouped cards */}
                  <div className="lg:hidden p-3 sm:p-4 space-y-4 sm:space-y-6">
                    {Object.keys(grouped).map((emp) => {
                      const rows = grouped[emp];
                      const pendingCount = rows.filter((r) => r.auditStatus === "Pending").length;
                      const rePendingCount = rows.filter((r) => r.auditStatus === "Re-Pending").length;
                      const totalHours = calculateTotalHours(rows);
                      const hoursBgColor = getHoursBgColor(totalHours);
                      const key = `${dateKey}|${emp}`;
                      const canApproveAll = pendingCount > 0;

                      return (
                        <div key={emp} className="rounded-lg border border-slate-200 overflow-hidden">
                          <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-slate-50/70">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                                {emp.split(" ").map((x) => x[0] || "").join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-slate-900 truncate">{emp}</div>
                                <div className="text-xs text-slate-500">
                                  {pendingCount} pending, {rePendingCount} re-pending
                                </div>
                                <div className={`inline-block mt-1 px-2 py-0.5 rounded-full ${hoursBgColor} text-xs font-medium`}>
                                  Total Hours: {totalHours.toFixed(1)}
                                </div>
                              </div>
                            </div>
                            <button
                              disabled={!canApproveAll || !!bulkUpdating[key]}
                              onClick={() => handleApproveAll(dateKey, emp)}
                              className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium flex-shrink-0 ${canApproveAll ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                }`}
                            >
                              {bulkUpdating[key] ? (
                                <span className="flex items-center gap-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                  <span className="hidden sm:inline">Approving…</span>
                                </span>
                              ) : (
                                <>
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">Approve All</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="divide-y">
                            {rows.map((log) => {
                              const isPending = log.auditStatus === "Pending";
                              const isRePending = log.auditStatus === "Re-Pending";
                              const isApproved = log.auditStatus === "Approved";
                              const isRejected = log.auditStatus === "Rejected";
                              const isReApproved = log.auditStatus === "Re-Approved";
                              const isReRejected = log.auditStatus === "Re-Rejected";

                              return (
                                <article key={log._id} className={`p-3 sm:p-4 ${rowClassForAudit(log.auditStatus)}`}>
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="min-w-0 flex-1 pr-3">
                                      <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 truncate" title={log.projectName}>
                                        {log.projectName}
                                      </h3>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {log.task} · {log.bookElement} · Ch {log.chapterNo}
                                      </p>
                                    </div>
                                    <AuditBadge status={log.auditStatus} />
                                  </div>

                                  <dl className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-[13px] mb-4">
                                    <Info label="Work Mode" value={log.workMode} />
                                    <Info label="Hours" value={log.hoursSpent} />
                                    <Info label="Units" value={`${log.noOfUnits} ${log.unitType || ""}`} />
                                    <Info label="Status" value={log.status} />
                                    <Info label="Due On" value={formatISOToHuman(log.dueOn)} />
                                    {log.details && (
                                      <div className="col-span-2">
                                        <dt className="text-slate-500">Details</dt>
                                        <dd className="text-slate-800 break-words">{log.details}</dd>
                                      </div>
                                    )}
                                  </dl>

                                  <div className="flex flex-wrap gap-2">
                                    {isPending ? (
                                      <>
                                        <button
                                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 min-w-0"
                                          onClick={() => handleApprove(log._id, dateKey)}
                                          disabled={!!updating[log._id]}
                                        >
                                          {updating[log._id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          ) : (
                                            <>
                                              <Check size={16} />
                                              <span>Approve</span>
                                            </>
                                          )}
                                        </button>
                                        <button
                                          className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 min-w-0"
                                          onClick={() => handleReject(log._id, dateKey)}
                                          disabled={!!updating[log._id]}
                                        >
                                          {updating[log._id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          ) : (
                                            <>
                                              <X size={16} />
                                              <span>Reject</span>
                                            </>
                                          )}
                                        </button>
                                      </>
                                    ) : isRePending ? (
                                      <>
                                        <button
                                          className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 min-w-0"
                                          onClick={() => handleReApprove(log._id, dateKey)}
                                          disabled={!!updating[log._id]}
                                        >
                                          {updating[log._id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          ) : (
                                            <>
                                              <Check size={16} />
                                              <span>Re-Approve</span>
                                            </>
                                          )}
                                        </button>
                                        <button
                                          className="inline-flex items-center gap-1 bg-rose-700 hover:bg-rose-800 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 min-w-0"
                                          onClick={() => handleReReject(log._id, dateKey)}
                                          disabled={!!updating[log._id]}
                                        >
                                          {updating[log._id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          ) : (
                                            <>
                                              <X size={16} />
                                              <span>Re-Reject</span>
                                            </>
                                          )}
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        {modifying?.id === log._id ? (
                                          <div className="flex gap-2">
                                            {(isApproved || isReApproved) && (
                                              <button
                                                onClick={() => handleChangeToReject(log._id, dateKey, log.auditStatus)}
                                                className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1.5 rounded text-xs font-medium"
                                                disabled={!!updating[log._id]}
                                              >
                                                {isReApproved ? "Change to Re-Reject" : "Change to Reject"}
                                              </button>
                                            )}
                                            {(isRejected || isReRejected) && (
                                              <button
                                                onClick={() => handleChangeToApprove(log._id, dateKey, log.auditStatus)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1.5 rounded text-xs font-medium"
                                                disabled={!!updating[log._id]}
                                              >
                                                {isReRejected ? "Change to Re-Approve" : "Change to Approve"}
                                              </button>
                                            )}
                                            <button
                                              onClick={() => setModifying(null)}
                                              className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-2 py-1.5 rounded text-xs font-medium"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1.5 rounded text-xs font-medium"
                                            onClick={() => setModifying({ id: log._id, dateKey })}
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
        </div>
      </main>
    </div>
  );
}

/* =============== SidebarLinks (UNCHANGED from AdminDashboard) =============== */
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
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-project") ? "bg-gray-700" : ""
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
function Th({ children }) {
  return <th className="p-2 text-left border-b border-slate-300 first:pl-3">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`p-2 border-t border-slate-200 align-top ${className}`}>{children}</td>;
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