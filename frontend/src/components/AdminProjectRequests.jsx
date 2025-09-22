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
//   ChevronDown,
//   FileText,
//   Eye,
//   Trash2,
//   Edit,
// } from "lucide-react";

// /* =================== CONFIG =================== */
// const API_BASE_URL = "http://localhost:5000";

// /* =================== MAIN PAGE =================== */
// export default function AdminProjectRequests() {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [user, setUser] = useState(null);

//   /* ===== Auth ===== */
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

//   /* ===== Project Requests STATE/LOGIC ===== */

//   // Data
//   const [projects, setProjects] = useState([]);
//   const [filterOptions, setFilterOptions] = useState({
//     segments: [],
//     boards: [],
//     mediums: [],
//     classes: []
//   });

//   // Status
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [updating, setUpdating] = useState({});
//   const [bulkUpdating, setBulkUpdating] = useState(false);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProjects, setTotalProjects] = useState(0);

//   // Summary stats
//   const [summary, setSummary] = useState({
//     total: 0,
//     pending: 0,
//     approved: 0,
//     rejected: 0
//   });

//   // Filters
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [selectedSegment, setSelectedSegment] = useState('');
//   const [selectedBoard, setSelectedBoard] = useState('');
//   const [selectedMedium, setSelectedMedium] = useState('');

//   // Date filters
//   const todayISO = stripToISO(new Date());
//   const [datePopoverOpen, setDatePopoverOpen] = useState(false);
//   const [rangeMode, setRangeMode] = useState(true);
//   const [tempStart, setTempStart] = useState('');
//   const [tempEnd, setTempEnd] = useState('');
//   const [activeMonth, setActiveMonth] = useState(() => toMonthKey(new Date()));
//   const [startISO, setStartISO] = useState('');
//   const [endISO, setEndISO] = useState('');
//   const popRef = useOutclick(() => setDatePopoverOpen(false));

//   // Dropdowns
//   const [showStatusDropdown, setShowStatusDropdown] = useState(false);
//   const [showSegmentDropdown, setShowSegmentDropdown] = useState(false);
//   const [showBoardDropdown, setShowBoardDropdown] = useState(false);
//   const [showMediumDropdown, setShowMediumDropdown] = useState(false);
//   const statusRef = useOutclick(() => setShowStatusDropdown(false));
//   const segmentRef = useOutclick(() => setShowSegmentDropdown(false));
//   const boardRef = useOutclick(() => setShowBoardDropdown(false));
//   const mediumRef = useOutclick(() => setShowMediumDropdown(false));

//   // Selection for bulk actions
//   const [selectedProjects, setSelectedProjects] = useState([]);

//   // View mode
//   const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

//   // Project details modal
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);

//   // Bulk action confirmation
//   const [bulkAction, setBulkAction] = useState(null);
//   const [showBulkModal, setShowBulkModal] = useState(false);
//   const [bulkComments, setBulkComments] = useState('');

//   /* --- Fetch filter options --- */
//   useEffect(() => {
//     if (!user) return;
//     fetchFilterOptions();
//   }, [user]);

//   const fetchFilterOptions = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await fetch(`${API_BASE_URL}/api/admin/projects/filter-options`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) throw new Error(await response.text());
//       const data = await response.json();
//       setFilterOptions(data.filterOptions);
//     } catch (err) {
//       console.error("Failed to fetch filter options:", err.message);
//     }
//   };

//   /* --- Fetch projects --- */
//   useEffect(() => {
//     if (!user) return;
//     fetchProjects();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, currentPage, selectedStatus, selectedSegment, selectedBoard, selectedMedium, startISO, endISO]);

//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = localStorage.getItem("authToken");

//       const body = {
//         page: currentPage,
//         limit: 10,
//         status: selectedStatus,
//         ...(selectedSegment && { segment: selectedSegment }),
//         ...(selectedBoard && { board: selectedBoard }),
//         ...(selectedMedium && { medium: selectedMedium }),
//         ...(startISO && { startDate: startISO }),
//         ...(endISO && { endDate: endISO }),
//       };

//       const response = await fetch(`${API_BASE_URL}/api/admin/projects/requests`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });

//       if (!response.ok) throw new Error(await response.text());
//       const data = await response.json();

//       setProjects(data.projects);
//       setTotalPages(data.totalPages);
//       setTotalProjects(data.totalProjects);
//       setSummary(data.summary);
//     } catch (err) {
//       console.error(err);
//       setError(`Failed to fetch projects: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* --- Single project actions --- */
//   const updateProjectStatus = async (projectId, status, comments = '') => {
//     try {
//       setUpdating((p) => ({ ...p, [projectId]: true }));
//       const token = localStorage.getItem("authToken");

//       const response = await fetch(`${API_BASE_URL}/api/admin/projects/update-status`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ 
//           projectId, 
//           status,
//           adminComments: comments
//         }),
//       });

//       if (!response.ok) throw new Error(await response.text());
//       await response.json();

//       // Refresh projects
//       fetchProjects();
//     } catch (err) {
//       console.error(err);
//       alert(`Failed to ${status.toLowerCase()} project. Please try again.`);
//     } finally {
//       setUpdating((p) => ({ ...p, [projectId]: false }));
//     }
//   };

//   const handleApprove = (id) => updateProjectStatus(id, "Approved");
//   const handleReject = (id) => {
//     const comments = prompt("Enter rejection reason (optional):");
//     if (comments !== null) { // Only proceed if user didn't cancel
//       updateProjectStatus(id, "Rejected", comments);
//     }
//   };

//   /* --- Bulk actions --- */
//   const handleBulkAction = async () => {
//     if (!bulkAction || selectedProjects.length === 0) return;

//     try {
//       setBulkUpdating(true);
//       const token = localStorage.getItem("authToken");

//       const response = await fetch(`${API_BASE_URL}/api/admin/projects/bulk-update-status`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           projectIds: selectedProjects,
//           status: bulkAction,
//           adminComments: bulkComments || `Bulk ${bulkAction.toLowerCase()} by admin`
//         }),
//       });

//       if (!response.ok) throw new Error(await response.text());
//       await response.json();

//       // Reset selections and refresh
//       setSelectedProjects([]);
//       setShowBulkModal(false);
//       setBulkAction(null);
//       setBulkComments('');
//       fetchProjects();

//     } catch (err) {
//       console.error(err);
//       alert(`Bulk ${bulkAction.toLowerCase()} failed. Please try again.`);
//     } finally {
//       setBulkUpdating(false);
//     }
//   };

//   /* --- Project details --- */
//   const fetchProjectDetails = async (projectId) => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await fetch(`${API_BASE_URL}/api/admin/projects/details/${projectId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) throw new Error(await response.text());
//       const data = await response.json();
//       setSelectedProject(data.project);
//       setShowDetailsModal(true);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch project details");
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

//   const clearDateFilter = () => {
//     setStartISO('');
//     setEndISO('');
//     setTempStart('');
//     setTempEnd('');
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

//   const labelForDateFilter = () => {
//     if (!startISO && !endISO) return "All dates";
//     if (startISO === endISO) return formatISOToHuman(startISO);
//     return `${formatISOToHuman(startISO)} – ${formatISOToHuman(endISO)}`;
//   };

//   /* --- Selection helpers --- */
//   const handleSelectAll = (checked) => {
//     if (checked) {
//       setSelectedProjects(projects.map(p => p._id));
//     } else {
//       setSelectedProjects([]);
//     }
//   };

//   const handleSelectProject = (projectId, checked) => {
//     if (checked) {
//       setSelectedProjects(prev => [...prev, projectId]);
//     } else {
//       setSelectedProjects(prev => prev.filter(id => id !== projectId));
//     }
//   };

//   /* --- Status badge component --- */
//   const StatusBadge = ({ status }) => {
//     if (status === "Approved")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
//           <CheckCircle className="w-3 h-3" /> Approved
//         </span>
//       );
//     if (status === "Rejected")
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-medium">
//           <XCircle className="w-3 h-3" /> Rejected
//         </span>
//       );
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 text-yellow-800 px-2 py-0.5 text-xs font-medium">
//         <Clock className="w-3 h-3" /> In Review
//       </span>
//     );
//   };

//   /* --- Render guards --- */
//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-100">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-100">
//       {/* Navbar */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
//         <div className="max-w-full mx-auto px-4 sm:px-6">
//           <div className="flex items-center justify-between h-16">
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
//                 Admin Dashboard <span className="hidden sm:inline">- Project Requests</span>
//               </h1>
//             </div>

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

//             <div className="md:hidden">
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
//               >
//                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
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
//             <SidebarLinks navigate={navigate} setSidebarOpen={setSidebarOpen} />
//           </aside>
//         </div>
//       )}
//       <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
//         <SidebarLinks navigate={navigate} />
//       </aside>

//       {/* Main Content */}
//       <main className="lg:ml-72 pt-20 p-6">
//         <div className="p-3 sm:p-4 lg:p-6 space-y-6 lg:space-y-8 max-w-full overflow-hidden">

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
//             <SummaryCard
//               title="Total Projects"
//               value={summary.total}
//               icon={<FileText className="w-5 h-5" />}
//               bgColor="bg-blue-50"
//               textColor="text-blue-700"
//               iconColor="text-blue-600"
//             />
//             <SummaryCard
//               title="Pending Review"
//               value={summary.pending}
//               icon={<Clock className="w-5 h-5" />}
//               bgColor="bg-yellow-50"
//               textColor="text-yellow-700"
//               iconColor="text-yellow-600"
//             />
//             <SummaryCard
//               title="Approved"
//               value={summary.approved}
//               icon={<CheckCircle className="w-5 h-5" />}
//               bgColor="bg-emerald-50"
//               textColor="text-emerald-700"
//               iconColor="text-emerald-600"
//             />
//             <SummaryCard
//               title="Rejected"
//               value={summary.rejected}
//               icon={<XCircle className="w-5 h-5" />}
//               bgColor="bg-rose-50"
//               textColor="text-rose-700"
//               iconColor="text-rose-600"
//             />
//           </div>

//           {/* Filters */}
//           <div className="rounded-xl lg:rounded-2xl shadow-md border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-4 lg:p-5">
//             <div className="flex items-center gap-2 mb-3 lg:mb-4">
//               <FilterIcon className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
//               <h3 className="text-sm lg:text-base font-semibold text-slate-800 tracking-tight">Filters</h3>
//             </div>

//             <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-wrap lg:items-end lg:gap-6">

//               {/* Status Filter */}
//               <div ref={statusRef} className="relative w-full lg:min-w-[200px] lg:w-auto">
//                 <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Status</label>
//                 <button
//                   onClick={() => setShowStatusDropdown(!showStatusDropdown)}
//                   className="w-full border rounded-lg px-3 py-2 text-xs lg:text-sm text-left flex justify-between items-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
//                 >
//                   <span className="truncate">
//                     {selectedStatus === 'all' ? 'All Statuses' : 
//                      selectedStatus === 'pending' ? 'Pending Review' :
//                      selectedStatus === 'approved' ? 'Approved' : 'Rejected'}
//                   </span>
//                   <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
//                 </button>

//                 {showStatusDropdown && (
//                   <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg">
//                     {[
//                       { value: 'all', label: 'All Statuses' },
//                       { value: 'pending', label: 'Pending Review' },
//                       { value: 'approved', label: 'Approved' },
//                       { value: 'rejected', label: 'Rejected' }
//                     ].map((option) => (
//                       <button
//                         key={option.value}
//                         onClick={() => {
//                           setSelectedStatus(option.value);
//                           setShowStatusDropdown(false);
//                           setCurrentPage(1);
//                         }}
//                         className={`w-full text-left px-3 py-2 text-xs lg:text-sm hover:bg-slate-50 ${
//                           selectedStatus === option.value ? 'bg-indigo-50 text-indigo-700' : ''
//                         }`}
//                       >
//                         {option.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Segment Filter */}
//               <div ref={segmentRef} className="relative w-full lg:min-w-[180px] lg:w-auto">
//                 <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Segment</label>
//                 <button
//                   onClick={() => setShowSegmentDropdown(!showSegmentDropdown)}
//                   className="w-full border rounded-lg px-3 py-2 text-xs lg:text-sm text-left flex justify-between items-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
//                 >
//                   <span className="truncate">{selectedSegment || 'All Segments'}</span>
//                   <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showSegmentDropdown ? "rotate-180" : ""}`} />
//                 </button>

//                 {showSegmentDropdown && (
//                   <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                     <button
//                       onClick={() => {
//                         setSelectedSegment('');
//                         setShowSegmentDropdown(false);
//                         setCurrentPage(1);
//                       }}
//                       className={`w-full text-left px-3 py-2 text-xs lg:text-sm hover:bg-slate-50 ${
//                         !selectedSegment ? 'bg-indigo-50 text-indigo-700' : ''
//                       }`}
//                     >
//                       All Segments
//                     </button>
//                     {filterOptions.segments.map((segment) => (
//                       <button
//                         key={segment}
//                         onClick={() => {
//                           setSelectedSegment(segment);
//                           setShowSegmentDropdown(false);
//                           setCurrentPage(1);
//                         }}
//                         className={`w-full text-left px-3 py-2 text-xs lg:text-sm hover:bg-slate-50 ${
//                           selectedSegment === segment ? 'bg-indigo-50 text-indigo-700' : ''
//                         }`}
//                       >
//                         {segment}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Date Filter */}
//               <div className="w-full lg:min-w-[280px] lg:w-auto relative" ref={popRef}>
//                 <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Date Range</label>
//                 <button
//                   onClick={() => setDatePopoverOpen(!datePopoverOpen)}
//                   className="w-full border rounded-lg px-3 py-2 flex items-center justify-between hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
//                 >
//                   <span className="flex items-center gap-2 min-w-0 flex-1">
//                     <CalendarIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
//                     <span className="text-xs lg:text-sm font-medium truncate">{labelForDateFilter()}</span>
//                   </span>
//                   <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${datePopoverOpen ? "rotate-180" : ""}`} />
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
//                       <button onClick={() => quickApply(7)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 7 Days</button>
//                       <button onClick={() => quickApply(30)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 30 Days</button>
//                       <button onClick={() => quickApply(90)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Past 3 Months</button>
//                       <button onClick={clearDateFilter} className="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 ml-auto">Clear</button>
//                       <button onClick={applyTempDate} className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Apply</button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Bulk Actions & View Toggle */}
//           {projects.length > 0 && (
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg border border-slate-200 p-4">
//               <div className="flex items-center gap-4">
//                 <label className="flex items-center gap-2 text-sm">
//                   <input
//                     type="checkbox"
//                     checked={selectedProjects.length === projects.length && projects.length > 0}
//                     onChange={(e) => handleSelectAll(e.target.checked)}
//                     className="rounded"
//                   />
//                   Select All ({selectedProjects.length} selected)
//                 </label>

//                 {selectedProjects.length > 0 && (
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => {
//                         setBulkAction('Approved');
//                         setShowBulkModal(true);
//                       }}
//                       className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm"
//                     >
//                       <Check className="w-4 h-4" />
//                       Approve Selected
//                     </button>
//                     <button
//                       onClick={() => {
//                         setBulkAction('Rejected');
//                         setShowBulkModal(true);
//                       }}
//                       className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-sm"
//                     >
//                       <X className="w-4 h-4" />
//                       Reject Selected
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
//                   className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm"
//                 >
//                   {viewMode === 'cards' ? 'Table View' : 'Card View'}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Loading State */}
//           {loading && (
//             <div className="flex items-center gap-3 py-6">
//               <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-slate-900" />
//               <span className="text-sm lg:text-base text-slate-800">Loading projects…</span>
//             </div>
//           )}

//           {/* Error State */}
//           {error && (
//             <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
//               <div className="flex items-center">
//                 <AlertCircle className="w-5 h-5 text-rose-500 mr-3" />
//                 <span className="text-rose-700">{error}</span>
//               </div>
//               <button onClick={fetchProjects} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-sm self-start sm:ml-auto">
//                 Retry
//               </button>
//             </div>
//           )}

//           {/* Empty State */}
//           {!loading && !error && projects.length === 0 && (
//             <div className="text-center py-8 lg:py-12">
//               <FileText className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-base lg:text-lg font-medium text-slate-900 mb-2">No Projects Found</h3>
//               <p className="text-sm lg:text-base text-slate-600">Try adjusting your filters to see more results.</p>
//             </div>
//           )}

//           {/* Projects Display */}
//           {!loading && !error && projects.length > 0 && (
//             <>
//               {viewMode === 'cards' ? (
//                 <ProjectCards
//                   projects={projects}
//                   selectedProjects={selectedProjects}
//                   onSelectProject={handleSelectProject}
//                   onViewDetails={fetchProjectDetails}
//                   onApprove={handleApprove}
//                   onReject={handleReject}
//                   updating={updating}
//                   StatusBadge={StatusBadge}
//                 />
//               ) : (
//                 <ProjectsTable
//                   projects={projects}
//                   selectedProjects={selectedProjects}
//                   onSelectProject={handleSelectProject}
//                   onSelectAll={handleSelectAll}
//                   onViewDetails={fetchProjectDetails}
//                   onApprove={handleApprove}
//                   onReject={handleReject}
//                   updating={updating}
//                   StatusBadge={StatusBadge}
//                 />
//               )}
//             </>
//           )}

//           {/* Pagination */}
//           {!loading && !error && totalPages > 1 && (
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//             />
//           )}
//         </div>
//       </main>

//       {/* Project Details Modal */}
//       {showDetailsModal && selectedProject && (
//         <ProjectDetailsModal
//           project={selectedProject}
//           onClose={() => {
//             setShowDetailsModal(false);
//             setSelectedProject(null);
//           }}
//           onApprove={handleApprove}
//           onReject={handleReject}
//           updating={updating}
//           StatusBadge={StatusBadge}
//         />
//       )}

//       {/* Bulk Action Confirmation Modal */}
//       {showBulkModal && bulkAction && (
//         <BulkActionModal
//           action={bulkAction}
//           count={selectedProjects.length}
//           comments={bulkComments}
//           onCommentsChange={setBulkComments}
//           onConfirm={handleBulkAction}
//           onCancel={() => {
//             setShowBulkModal(false);
//             setBulkAction(null);
//             setBulkComments('');
//           }}
//           loading={bulkUpdating}
//         />
//       )}
//     </div>
//   );
// }

// /* =================== COMPONENT FUNCTIONS =================== */

// // Summary Card Component
// function SummaryCard({ title, value, icon, bgColor, textColor, iconColor }) {
//   return (
//     <div className={`${bgColor} rounded-xl p-4 lg:p-5`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-xs lg:text-sm font-medium text-slate-600 mb-1">{title}</p>
//           <p className={`text-2xl lg:text-3xl font-bold ${textColor}`}>{value}</p>
//         </div>
//         <div className={`${iconColor}`}>
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Project Cards Component
// function ProjectCards({ projects, selectedProjects, onSelectProject, onViewDetails, onApprove, onReject, updating, StatusBadge }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
//       {projects.map((project) => (
//         <ProjectCard
//           key={project._id}
//           project={project}
//           isSelected={selectedProjects.includes(project._id)}
//           onSelect={(checked) => onSelectProject(project._id, checked)}
//           onViewDetails={() => onViewDetails(project._id)}
//           onApprove={() => onApprove(project._id)}
//           onReject={() => onReject(project._id)}
//           isUpdating={updating[project._id]}
//           StatusBadge={StatusBadge}
//         />
//       ))}
//     </div>
//   );
// }

// // Individual Project Card
// function ProjectCard({ project, isSelected, onSelect, onViewDetails, onApprove, onReject, isUpdating, StatusBadge }) {
//   const isPending = project.adminStatus === 'In Review';

//   return (
//     <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
//       <div className="p-4 lg:p-5">
//         {/* Header with checkbox and status */}
//         <div className="flex items-start justify-between mb-3">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={isSelected}
//               onChange={(e) => onSelect(e.target.checked)}
//               className="rounded"
//             />
//             <span className="text-xs text-slate-500">Select</span>
//           </label>
//           <StatusBadge status={project.adminStatus} />
//         </div>

//         {/* Project Info */}
//         <div className="mb-4">
//           <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2" title={project.projectName}>
//             {project.projectName}
//           </h3>

//           <div className="space-y-2 text-sm text-slate-600">
//             <div className="flex justify-between">
//               <span className="text-slate-500">Project ID:</span>
//               <span className="font-mono text-xs">{project.projectId}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Segment:</span>
//               <span>{project.segment}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Board:</span>
//               <span className="truncate ml-2">{project.board}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Medium:</span>
//               <span>{project.medium}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Class:</span>
//               <span>{project.class}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Due Date:</span>
//               <span>{formatISOToHuman(project.dueDate)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-slate-500">Created By:</span>
//               <span className="truncate ml-2">{project.createdBy?.name}</span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col gap-2">
//           <button
//             onClick={onViewDetails}
//             className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm"
//           >
//             <Eye className="w-4 h-4" />
//             View Details
//           </button>

//           {isPending && (
//             <div className="flex gap-2">
//               <button
//                 onClick={onApprove}
//                 disabled={isUpdating}
//                 className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
//               >
//                 {isUpdating ? (
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                 ) : (
//                   <>
//                     <Check className="w-4 h-4" />
//                     Approve
//                   </>
//                 )}
//               </button>
//               <button
//                 onClick={onReject}
//                 disabled={isUpdating}
//                 className="flex-1 inline-flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
//               >
//                 {isUpdating ? (
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                 ) : (
//                   <>
//                     <X className="w-4 h-4" />
//                     Reject
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Projects Table Component
// function ProjectsTable({ projects, selectedProjects, onSelectProject, onSelectAll, onViewDetails, onApprove, onReject, updating, StatusBadge }) {
//   return (
//     <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-slate-50 border-b border-slate-200">
//             <tr>
//               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                 <input
//                   type="checkbox"
//                   checked={selectedProjects.length === projects.length && projects.length > 0}
//                   onChange={(e) => onSelectAll(e.target.checked)}
//                   className="rounded"
//                 />
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created By</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-200">
//             {projects.map((project) => (
//               <ProjectTableRow
//                 key={project._id}
//                 project={project}
//                 isSelected={selectedProjects.includes(project._id)}
//                 onSelect={(checked) => onSelectProject(project._id, checked)}
//                 onViewDetails={() => onViewDetails(project._id)}
//                 onApprove={() => onApprove(project._id)}
//                 onReject={() => onReject(project._id)}
//                 isUpdating={updating[project._id]}
//                 StatusBadge={StatusBadge}
//               />
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // Individual Table Row
// function ProjectTableRow({ project, isSelected, onSelect, onViewDetails, onApprove, onReject, isUpdating, StatusBadge }) {
//   const isPending = project.adminStatus === 'In Review';

//   return (
//     <tr className="hover:bg-slate-50">
//       <td className="px-4 py-3">
//         <input
//           type="checkbox"
//           checked={isSelected}
//           onChange={(e) => onSelect(e.target.checked)}
//           className="rounded"
//         />
//       </td>
//       <td className="px-4 py-3">
//         <div>
//           <div className="font-medium text-slate-900 truncate max-w-[200px]" title={project.projectName}>
//             {project.projectName}
//           </div>
//           <div className="text-xs text-slate-500 font-mono">{project.projectId}</div>
//         </div>
//       </td>
//       <td className="px-4 py-3">
//         <div className="text-sm text-slate-600">
//           <div>{project.segment} • {project.board}</div>
//           <div className="text-xs text-slate-500">{project.medium} • {project.class}</div>
//           <div className="text-xs text-slate-500">Due: {formatISOToHuman(project.dueDate)}</div>
//         </div>
//       </td>
//       <td className="px-4 py-3">
//         <div className="text-sm text-slate-900">{project.createdBy?.name}</div>
//         <div className="text-xs text-slate-500">{project.createdBy?.email}</div>
//       </td>
//       <td className="px-4 py-3">
//         <StatusBadge status={project.adminStatus} />
//       </td>
//       <td className="px-4 py-3">
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onViewDetails}
//             className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg"
//             title="View Details"
//           >
//             <Eye className="w-4 h-4" />
//           </button>

//           {isPending && (
//             <>
//               <button
//                 onClick={onApprove}
//                 disabled={isUpdating}
//                 className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg disabled:opacity-50"
//                 title="Approve"
//               >
//                 {isUpdating ? (
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                 ) : (
//                   <Check className="w-4 h-4" />
//                 )}
//               </button>
//               <button
//                 onClick={onReject}
//                 disabled={isUpdating}
//                 className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg disabled:opacity-50"
//                 title="Reject"
//               >
//                 {isUpdating ? (
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                 ) : (
//                   <X className="w-4 h-4" />
//                 )}
//               </button>
//             </>
//           )}
//         </div>
//       </td>
//     </tr>
//   );
// }

// // Pagination Component
// function Pagination({ currentPage, totalPages, onPageChange }) {
//   const pages = [];
//   const maxVisiblePages = 5;

//   let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//   let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//   if (endPage - startPage < maxVisiblePages - 1) {
//     startPage = Math.max(1, endPage - maxVisiblePages + 1);
//   }

//   for (let i = startPage; i <= endPage; i++) {
//     pages.push(i);
//   }

//   return (
//     <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
//       <div className="text-sm text-slate-600">
//         Page {currentPage} of {totalPages}
//       </div>

//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="inline-flex items-center px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <ChevronLeft className="w-4 h-4 mr-1" />
//           Previous
//         </button>

//         {pages.map((page) => (
//           <button
//             key={page}
//             onClick={() => onPageChange(page)}
//             className={`px-3 py-2 text-sm rounded-lg ${
//               page === currentPage
//                 ? 'bg-indigo-600 text-white'
//                 : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
//             }`}
//           >
//             {page}
//           </button>
//         ))}

//         <button
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="inline-flex items-center px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Next
//           <ChevronRight className="w-4 h-4 ml-1" />
//         </button>
//       </div>
//     </div>
//   );
// }

// // Project Details Modal
// function ProjectDetailsModal({ project, onClose, onApprove, onReject, updating, StatusBadge }) {
//   const isPending = project.adminStatus === 'In Review';

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//         <div className="p-6">
//           {/* Header */}
//           <div className="flex items-start justify-between mb-6">
//             <div>
//               <h2 className="text-xl font-bold text-slate-900 mb-2">{project.projectName}</h2>
//               <StatusBadge status={project.adminStatus} />
//             </div>
//             <button
//               onClick={onClose}
//               className="text-slate-400 hover:text-slate-600 p-2"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Project Details */}
//           <div className="space-y-6">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Project ID</label>
//                 <div className="text-sm text-slate-900 font-mono">{project.projectId}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Segment</label>
//                 <div className="text-sm text-slate-900">{project.segment}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Board</label>
//                 <div className="text-sm text-slate-900">{project.board}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Medium</label>
//                 <div className="text-sm text-slate-900">{project.medium}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Class/Semester</label>
//                 <div className="text-sm text-slate-900">{project.class}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
//                 <div className="text-sm text-slate-900">{project.subject}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Series/Author</label>
//                 <div className="text-sm text-slate-900">{project.seriesAuthor}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
//                 <div className="text-sm text-slate-900">{project.session}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
//                 <div className="text-sm text-slate-900">{formatISOToHuman(project.dueDate)}</div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Created Date</label>
//                 <div className="text-sm text-slate-900">{formatISOToHuman(project.createdAt)}</div>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Created By</label>
//               <div className="text-sm text-slate-900">
//                 {project.createdBy?.name} ({project.createdBy?.email})
//               </div>
//             </div>

//             {project.adminComments && (
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Admin Comments</label>
//                 <div className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg">
//                   {project.adminComments}
//                 </div>
//               </div>
//             )}

//             {project.approvedBy && (
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Reviewed By</label>
//                 <div className="text-sm text-slate-900">
//                   {project.approvedBy?.name} ({project.approvedBy?.email})
//                 </div>
//                 {project.reviewedAt && (
//                   <div className="text-xs text-slate-500 mt-1">
//                     on {formatISOToHuman(project.reviewedAt)}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Actions */}
//           {isPending && (
//             <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
//               <button
//                 onClick={() => {
//                   onApprove(project._id);
//                   onClose();
//                 }}
//                 disabled={updating[project._id]}
//                 className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
//               >
//                 {updating[project._id] ? (
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                 ) : (
//                   <>
//                     <Check className="w-4 h-4" />
//                     Approve Project
//                   </>
//                 )}
//               </button>
//               <button
//                 onClick={() => {
//                   onReject(project._id);
//                   onClose();
//                 }}
//                 disabled={updating[project._id]}
//                 className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
//               >
//                 {updating[project._id] ? (
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                 ) : (
//                   <>
//                     <X className="w-4 h-4" />
//                     Reject Project
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Bulk Action Modal
// function BulkActionModal({ action, count, comments, onCommentsChange, onConfirm, onCancel, loading }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <div className="bg-white rounded-xl max-w-md w-full">
//         <div className="p-6">
//           <h3 className="text-lg font-bold text-slate-900 mb-4">
//             {action} {count} Project{count > 1 ? 's' : ''}
//           </h3>

//           <p className="text-slate-600 mb-4">
//             Are you sure you want to {action.toLowerCase()} {count} project{count > 1 ? 's' : ''}?
//             This action cannot be undone.
//           </p>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-slate-700 mb-2">
//               Comments (optional)
//             </label>
//             <textarea
//               value={comments}
//               onChange={(e) => onCommentsChange(e.target.value)}
//               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//               rows={3}
//               placeholder={`Add a comment for this bulk ${action.toLowerCase()} action...`}
//             />
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={onCancel}
//               disabled={loading}
//               className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={onConfirm}
//               disabled={loading}
//               className={`flex-1 inline-flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg disabled:opacity-50 ${
//                 action === 'Approved' 
//                   ? 'bg-emerald-600 hover:bg-emerald-700' 
//                   : 'bg-rose-600 hover:bg-rose-700'
//               }`}
//             >
//               {loading ? (
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//               ) : (
//                 <>
//                   {action === 'Approved' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
//                   {action} {count} Project{count > 1 ? 's' : ''}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =============== SidebarLinks (UNCHANGED from AdminApproveWorklogs) =============== */
// function SidebarLinks({ navigate, setSidebarOpen }) {
//   const close = () => setSidebarOpen && setSidebarOpen(false);
//   const location = useLocation();

//   // Auto-open menus based on current route
//   const [openWorklogs, setOpenWorklogs] = useState(location.pathname.includes("worklog"));
//   const [openEmployees, setOpenEmployees] = useState(location.pathname.includes("employees"));
//   const [openProjects, setOpenProjects] = useState(
//     location.pathname.includes("project") || location.pathname.includes("abbreviations")
//   );

//   useEffect(() => {
//     if (location.pathname.includes("worklog")) setOpenWorklogs(true);
//     if (location.pathname.includes("employees")) setOpenEmployees(true);
//     if (location.pathname.includes("project") || location.pathname.includes("abbreviations")) setOpenProjects(true);
//   }, [location]);

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
//       <nav className="flex flex-col space-y-2">
//         {/* Home */}
//         <button
//           className={`text-left hover:bg-gray-700 p-3 rounded-lg ${location.pathname === "/admin-dashboard" ? "bg-gray-700" : ""}`}
//           onClick={() => {
//             navigate("/admin-dashboard");
//             close();
//           }}
//         >
//           Home
//         </button>

//         {/* Worklogs */}
//         <div>
//           <button
//             className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg"
//             onClick={() => setOpenWorklogs(!openWorklogs)}
//           >
//             <span>Worklogs</span>
//             <span>{openWorklogs ? "▾" : "▸"}</span>
//           </button>
//           {openWorklogs && (
//             <div className="ml-4 mt-2 flex flex-col space-y-2">
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg ${
//                   location.pathname.includes("approve-worklogs") ? "bg-gray-700" : ""
//                 }`}
//                 onClick={() => {
//                   navigate("/admin/approve-worklogs");
//                   close();
//                 }}
//               >
//                 Approve Worklogs
//               </button>
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg ${
//                   location.pathname.includes("edit-worklog-entries") ? "bg-gray-700" : ""
//                 }`}
//                 onClick={() => {
//                   navigate("/admin/edit-worklog-entries");
//                   close();
//                 }}
//               >
//                 Edit Worklogs
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Employees */}
//         <div>
//           <button
//             className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg"
//             onClick={() => setOpenEmployees(!openEmployees)}
//           >
//             <span>Employees</span>
//             <span>{openEmployees ? "▾" : "▸"}</span>
//           </button>
//           {openEmployees && (
//             <div className="ml-4 mt-2 flex flex-col space-y-2">
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg ${
//                   location.pathname.includes("handle-employees") ? "bg-gray-700" : ""
//                 }`}
//                 onClick={() => {
//                   navigate("/admin/handle-employees");
//                   close();
//                 }}
//               >
//                 Handle Employees
//               </button>
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg ${
//                   location.pathname.includes("employees-info") ? "bg-gray-700" : ""
//                 }`}
//                 onClick={() => {
//                   navigate("/admin/employees-info");
//                   close();
//                 }}
//               >
//                 Employees Info
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Projects */}
//         <div>
//           <button
//             className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg"
//             onClick={() => setOpenProjects(!openProjects)}
//           >
//             <span>Projects</span>
//             <span>{openProjects ? "▾" : "▸"}</span>
//           </button>
//           {openProjects && (
//             <div className="ml-4 mt-2 flex flex-col space-y-2">
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg ${
//                   location.pathname.includes("add-abbreviations") ? "bg-gray-700" : ""
//                 }`}
//                 onClick={() => {
//                   navigate("/admin/add-abbreviations");
//                   close();
//                 }}
//               >
//                 Add Abbreviations
//               </button>
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg ${
//                   location.pathname.includes("add-project") ? "bg-gray-700" : ""
//                 }`}
//                 onClick={() => {
//                   navigate("/admin/add-project");
//                   close();
//                 }}
//               >
//                 Add Project
//               </button>
//               <button
//                 className={`text-left hover:bg-gray-700 p-2 rounded-lg ${
//                   location.pathname.includes("project-requests") ? "bg-gray-700" : ""
//                 }`}
//                 onClick={() => {
//                   navigate("/admin/project-requests");
//                   close();
//                 }}
//               >
//                 Project Requests
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Defaulters */}
//         <button
//           className={`text-left hover:bg-gray-700 p-3 rounded-lg ${
//             location.pathname.includes("defaulters-list") ? "bg-gray-700" : ""
//           }`}
//           onClick={() => {
//             navigate("/admin/defaulters-list");
//             close();
//           }}
//         >
//           Defaulters List
//         </button>
//       </nav>
//     </div>
//   );
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

// /* =================== Date Helper Functions =================== */
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

// /* =================== Custom Hook - useOutclick =================== */
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
  FileText,
  Eye,
} from "lucide-react";

/* =================== CONFIG =================== */
const API_BASE_URL = "http://localhost:5000";

/* =================== MAIN PAGE =================== */
export default function AdminProjectRequests() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [modify, setModify] = useState(null);

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

  /* ===== Project Requests STATE/LOGIC ===== */

  // Data
  const [projectsByDate, setProjectsByDate] = useState({});
  const [spocs, setSpocs] = useState([]);

  // Status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [bulkUpdating, setBulkUpdating] = useState({});

  // Filters: SPOC users
  const [selectedSpocs, setSelectedSpocs] = useState([]);
  const [showSpocDropdown, setShowSpocDropdown] = useState(false);
  const spocRef = useOutclick(() => setShowSpocDropdown(false));

  // Filters: dates
  const todayISO = stripToISO(new Date());
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [rangeMode, setRangeMode] = useState(true);
  const [tempStart, setTempStart] = useState(isoNDaysAgo(30));
  const [tempEnd, setTempEnd] = useState(todayISO);
  const [activeMonth, setActiveMonth] = useState(() => toMonthKey(new Date(tempEnd)));
  const [startISO, setStartISO] = useState(isoNDaysAgo(30));
  const [endISO, setEndISO] = useState(todayISO);
  const popRef = useOutclick(() => setDatePopoverOpen(false));

  // Filters: audit statuses
  const ALL_STATUSES = [
    "In Review",
    "Approved",
    "Rejected",
  ];
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useOutclick(() => setShowStatusDropdown(false));
  const [selectedAuditStatuses, setSelectedAuditStatuses] = useState([...ALL_STATUSES]);

  // Edit mode for "Change to …" actions
  const [modifying, setModifying] = useState(null);

  /* --- Fetch SPOCs --- */
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("authToken");
    fetch(`${API_BASE_URL}/api/admin/projects/spocs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : r.text().then((t) => Promise.reject(new Error(t)))))
      .then((data) => setSpocs(data.spocs || []))
      .catch((err) => console.error("Failed to fetch SPOCs:", err.message));
  }, [user]);

  /* --- Fetch projects (on filter change) --- */
  useEffect(() => {
    if (!user) return;
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, startISO, endISO, selectedSpocs, selectedAuditStatuses]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE_URL}/api/admin/projects/requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startISO,
          endDate: endISO,
          spocs: selectedSpocs.length > 0 ? selectedSpocs : undefined,
          auditStatus: selectedAuditStatuses.length === ALL_STATUSES.length ? undefined : selectedAuditStatuses,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProjectsByDate(data.projectsByDate || {});
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch projects: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* --- Derived helpers --- */
  const sortedDateKeys = useMemo(
    () => Object.keys(projectsByDate).sort((a, b) => new Date(b) - new Date(a)),
    [projectsByDate]
  );


  const groupBySpoc = (items) => {
    const bySpoc = {};
    for (const row of items) {
      if (!bySpoc[row.spocName]) bySpoc[row.spocName] = [];
      bySpoc[row.spocName].push(row);
    }
    return Object.fromEntries(
      Object.keys(bySpoc)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => [k, bySpoc[k]])
    );
  };

  const { inReviewCount, approvedCount, rejectedCount } = useMemo(() => {
    let inReview = 0;
    let approved = 0;
    let rejected = 0;
    for (const dateKey of Object.keys(projectsByDate)) {
      for (const row of projectsByDate[dateKey] || []) {
        if (row.auditStatus === "In Review") inReview++;
        if (row.auditStatus === "Approved") approved++;
        if (row.auditStatus === "Rejected") rejected++;
      }
    }
    return { inReviewCount: inReview, approvedCount: approved, rejectedCount: rejected };
  }, [projectsByDate]);

  const rowClassForAudit = (status) => {
    if (status === "Approved") return "bg-emerald-50/70";
    if (status === "Rejected") return "bg-rose-50/70";
    if (status === "In Review") return "bg-yellow-50";
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
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 text-yellow-800 px-2 py-0.5 text-xs font-medium">
        <Clock className="w-4 h-4" /> In Review
      </span>
    );
  };

  /* --- Updates (single/bulk) --- */
  const mutateLocalRow = (dateKey, projectId, auditStatus) => {
    setProjectsByDate((prev) => {
      const next = { ...prev };
      if (!next[dateKey]) return next;
      next[dateKey] = next[dateKey].map((r) =>
        r.project_id === projectId ? { ...r, auditStatus } : r
      );
      return next;
    });
  };


  const updateProjectStatus = async (projectId, status, dateKey, adminComments = "") => {
    try {
      setUpdating((p) => ({ ...p, [projectId]: true }));
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE_URL}/api/admin/projects/update-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          auditStatus: status,
          adminComments: adminComments || undefined
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      await res.json();
      mutateLocalRow(dateKey, projectId, status);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${status.toLowerCase()} project. Please try again.`);
    } finally {
      setUpdating((p) => ({ ...p, [projectId]: false }));
    }
  };

  const handleReject = (id, dateKey) => {
    const confirmed = window.confirm("Are you sure you want to reject this request?");
    if (confirmed) {
      updateProjectStatus(id, "Rejected", dateKey);
    }
  };

  const handleApprove = (id, dateKey) => {
    updateProjectStatus(id, "Approved", dateKey);
  };


  const handleApproveAll = async (dateKey, spocName) => {
    const key = `${dateKey}|${spocName}`;
    try {
      setBulkUpdating((p) => ({ ...p, [key]: true }));
      const token = localStorage.getItem("authToken");
      const rows = (projectsByDate[dateKey] || []).filter(
        (r) => r.spocName === spocName && r.auditStatus === "In Review"
      );
      const ids = rows.map((r) => r.project_id);
      if (ids.length === 0) return;

      const res = await fetch(`${API_BASE_URL}/api/admin/projects/bulk-update-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          projectIds: ids,
          auditStatus: "Approved",
          adminComments: `Bulk approved by admin on ${new Date().toISOString().split('T')[0]}`
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      await res.json();

      setProjectsByDate((prev) => {
        const next = { ...prev };
        next[dateKey] = next[dateKey].map((row) =>
          row.spocName === spocName && row.auditStatus === "In Review"
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

  /* --- Render guards --- */
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
                Admin Dashboard <span className="hidden sm:inline">- Project Requests</span>
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
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
            <SidebarLinks navigate={navigate} setSidebarOpen={setSidebarOpen} />
          </aside>
        </div>
      )}
      <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
        <SidebarLinks navigate={navigate} />
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
                  onClick={() => setDatePopoverOpen(!datePopoverOpen)}
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

              {/* SPOCs multi-select */}
              <div ref={spocRef} className="relative w-full lg:min-w-[260px] lg:w-auto">
                <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">SPOCs</label>
                <button
                  onClick={() => setShowSpocDropdown(!showSpocDropdown)}
                  className="w-full border rounded-lg px-3 py-2 text-xs lg:text-sm text-left flex justify-between items-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
                >
                  <span className="flex flex-wrap gap-1 min-w-0 flex-1">
                    {selectedSpocs.length === 0 ? (
                      <span className="text-slate-600">All SPOCs</span>
                    ) : (
                      selectedSpocs.map((name) => (
                        <span key={name} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {name}
                        </span>
                      ))
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform flex-shrink-0 ${showSpocDropdown ? "rotate-180" : "rotate-0"}`} />
                </button>

                {showSpocDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="px-3 py-2 text-xs text-slate-500 border-b bg-slate-50 flex items-center gap-2">
                      <UsersIcon className="w-3.5 h-3.5" />
                      Select SPOCs
                    </div>
                    {spocs.map((spoc) => (
                      <label key={spoc._id || spoc.name} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs lg:text-sm">
                        <input
                          type="checkbox"
                          value={spoc.name}
                          checked={selectedSpocs.includes(spoc.name)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSpocs((p) => [...p, spoc.name]);
                            else setSelectedSpocs((p) => p.filter((n) => n !== spoc.name));
                          }}
                          className="mr-2"
                        />
                        {spoc.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit Status multi-select */}
              <div ref={statusRef} className="relative w-full lg:min-w-[260px] lg:w-auto">
                <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1">Audit Status</label>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
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
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">{approvedCount} Approved</span>
                    <span className="opacity-80 hidden lg:inline">Already accepted</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-rose-100 text-rose-800">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">{rejectedCount} Rejected</span>
                    <span className="opacity-80 hidden lg:inline">Declined projects</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== States ===== */}
          {loading && (
            <div className="flex items-center gap-3 py-6">
              <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-slate-900" />
              <span className="text-sm lg:text-base text-slate-800">Loading projects…</span>
            </div>
          )}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-rose-500 mr-3" />
                <span className="text-rose-700">{error}</span>
              </div>
              <button
                onClick={fetchProjects}
                className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-sm self-start sm:ml-auto"
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && sortedDateKeys.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <Clock className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base lg:text-lg font-medium text-slate-900 mb-2">No Projects Found</h3>
              <p className="text-sm lg:text-base text-slate-600">
                Try changing the date range, SPOCs, or status filters above.
              </p>
            </div>
          )}

          {/* ===== Projects grouped by Date ===== */}
          {!loading &&
            !error &&
            sortedDateKeys.map((dateKey) => {
              const allRows = projectsByDate[dateKey] || [];
              const filteredRows =
                selectedAuditStatuses.length === 0
                  ? []
                  : allRows.filter((r) => selectedAuditStatuses.includes(r.auditStatus));

              if (filteredRows.length === 0) return null;
              const grouped = groupBySpoc(filteredRows);

              return (
                <section
                  key={dateKey}
                  className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="px-4 lg:px-5 py-3 lg:py-4 border-b bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-600" />
                      {formatISOToHuman(dateKey)}
                      <span className="ml-2 rounded-full bg-indigo-100 text-indigo-700 text-[11px] px-2 py-0.5 font-medium">
                        {filteredRows.length} entries
                      </span>
                    </h2>
                  </div>

                  {/* Group by SPOC */}
                  {Object.keys(grouped).map((spoc) => {
                    const rows = grouped[spoc];
                    const inReview = rows.filter((r) => r.auditStatus === "In Review").length;
                    const key = `${dateKey}|${spoc}`;
                    const canApproveAll = inReview > 0;

                    return (
                      <div key={spoc} className="p-4 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                              {spoc
                                .split(" ")
                                .map((x) => x[0] || "")
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{spoc}</div>
                              <div className="text-xs text-slate-500">{inReview} In Review</div>
                            </div>
                          </div>
                          <button
                            disabled={!canApproveAll || !!bulkUpdating[key]}
                            onClick={() => handleApproveAll(dateKey, spoc)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${canApproveAll
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-200 text-slate-500 cursor-not-allowed"
                              }`}
                          >
                            {bulkUpdating[key] ? (
                              <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                Approving…
                              </span>
                            ) : (
                              <>
                                <Check className="w-4 h-4" /> Approve All
                              </>
                            )}
                          </button>
                        </div>

                        {/* Table of projects */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700">
                                <th className="p-2 text-left">Project ID</th>
                                <th className="p-2 text-left">Project Name</th>
                                <th className="p-2 text-left">Start Date</th>
                                <th className="p-2 text-left">Due Date</th>
                                <th className="p-2 text-left">Spoc Name</th>
                                <th className="p-2 text-left">Spoc Email</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((proj) => (
                                <tr
                                  key={proj.project_id}
                                  className={`${rowClassForAudit(proj.auditStatus)} border-t`}
                                >
                                  <td className="p-2">{proj.project_id}</td>
                                  <td className="p-2">{proj.project_name}</td>
                                  <td className="p-2">{formatISOToHuman(proj.start_date)}</td>
                                  <td className="p-2">{formatISOToHuman(proj.due_date)}</td>
                                  <td className="p-2">{proj.spocName}</td>
                                  <td className="p-2">{proj.email}</td>
                                  <td className="p-2">
                                    <AuditBadge status={proj.auditStatus} />
                                  </td>
                                  <td className="p-2 flex gap-2">
                                    {proj.auditStatus === "In Review" ? (
                                      <>
                                        {/* Approve button */}
                                        <button
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                          disabled={!!updating[proj.project_id]}
                                          onClick={async () => {
                                            await handleApprove(proj.project_id, dateKey); // wait until API + state update finishes
                                            setModify(null);
                                          }}
                                        >
                                          {updating[proj.project_id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          ) : (
                                            <Check size={16} />
                                          )}
                                        </button>

                                        {/* Reject button */}
                                        <button
                                          className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                          disabled={!!updating[proj.project_id]}
                                          onClick={async () => {
                                            await handleReject(proj.project_id, dateKey);
                                            setModify(null);
                                          }}
                                        >
                                          {updating[proj.project_id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          ) : (
                                            <X size={16} />
                                          )}
                                        </button>
                                      </>
                                    ) : modify === proj.project_id ? (
                                      // When Modify clicked → show Approve/Reject again
                                      <>
                                        {/* Approve inside Modify */}
                                        <button
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                          disabled={!!updating[proj.project_id]}
                                          onClick={async () => {
                                            await handleApprove(proj.project_id, dateKey);
                                            setModify(null);
                                          }}
                                        >
                                          {updating[proj.project_id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          ) : (
                                            <Check size={16} />
                                          )}
                                        </button>

                                        {/* Reject inside Modify */}
                                        <button
                                          className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                          disabled={!!updating[proj.project_id]}
                                          onClick={async () => {
                                            await handleReject(proj.project_id, dateKey);
                                            setModify(null);
                                          }}
                                        >
                                          {updating[proj.project_id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          ) : (
                                            <X size={16} />
                                          )}
                                        </button>

                                        {/* Cancel button */}
                                        <button
                                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2.5 py-1.5 rounded-md"
                                          onClick={() => setModify(null)}
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      // Default → show Modify button
                                      <button
                                        className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
                                        onClick={() => setModify(proj.project_id)}
                                      >
                                        <Pencil className="w-4 h-4" />
                                        Modify
                                      </button>

                                    )}
                                  </td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </section>
              );
            })}
        </div>
      </main>
    </div>
  );
}

/* =============== SidebarLinks (same as in AdminDashboard) =============== */
function SidebarLinks({ navigate, setSidebarOpen }) {
  const close = () => setSidebarOpen && setSidebarOpen(false);
  const location = useLocation();
  const [openWorklogs, setOpenWorklogs] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("worklog")) setOpenWorklogs(true);
    if (location.pathname.includes("project") || location.pathname.includes("abbreviations"))
      setOpenProjects(true);
  }, [location]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
      <nav className="flex flex-col space-y-2">

        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${location.pathname === "/admin-dashboard" ? "bg-gray-700" : ""
            }`}
          onClick={() => { navigate("/admin-dashboard"); close(); }}
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
            <span>{openWorklogs ? "▾" : "▸"}</span>
          </button>
          {openWorklogs && (
            <div className="ml-4 mt-2 flex flex-col space-y-2">
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("approve-worklogs") ? "bg-gray-700" : ""
                  }`}
                onClick={() => { navigate("/admin/approve-worklogs"); close(); }}
              >
                Approve Worklogs
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("edit-worklog-entries") ? "bg-gray-700" : ""
                  }`}
                onClick={() => { navigate("/admin/edit-worklog-entries"); close(); }}
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
          onClick={() => { navigate("/admin/handle-employees"); close(); }}
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
            <span>{openProjects ? "▾" : "▸"}</span>
          </button>
          {openProjects && (
            <div className="ml-4 mt-2 flex flex-col space-y-2">
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-abbreviations") ? "bg-gray-700" : ""
                  }`}
                onClick={() => { navigate("/admin/add-abbreviations"); close(); }}
              >
                Add Abbreviations
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-project") ? "bg-gray-700" : ""
                  }`}
                onClick={() => { navigate("/admin/add-project"); close(); }}
              >
                Add Project
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("project-requests") ? "bg-gray-700" : ""
                  }`}
                onClick={() => { navigate("/admin/project-requests"); close(); }}
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


/* =================== Calendar + Helpers (reuse from your snippet) =================== */
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
function CalendarGrid({ monthKey, rangeMode, tempStart, tempEnd, onPick }) {
  const monthDate = parseMonthKey(monthKey);
  const today = stripToISO(new Date());
  const firstDay = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const startWeekday = firstDay.getUTCDay();
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
