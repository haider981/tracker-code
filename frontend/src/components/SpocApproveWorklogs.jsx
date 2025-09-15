// import React, { useState, useEffect } from "react";
// import { Check, X, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

// export default function ApproveWorklogs() {
//     const navigate = useNavigate();

//     const [user, setUser] = useState(null);
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//     const [worklogsData, setWorklogsData] = useState({});
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [updating, setUpdating] = useState({});

//     // Backend URL - Change this to match your backend port
//     const API_BASE_URL = "http://localhost:5000"; // or whatever port your backend runs on

//     // Authentication check
//     useEffect(() => {
//         const token = localStorage.getItem("authToken");
//         if (!token) {
//             navigate("/");
//             return;
//         }

//         try {
//             const decoded = jwtDecode(token);
//             const u = {
//                 name: decoded.name,
//                 email: decoded.email,
//                 role: decoded.role,
//                 picture:
//                     decoded.picture ||
//                     `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random&color=fff`,
//             };
//             setUser(u);
//         } catch (e) {
//             console.error("Invalid token:", e);
//             localStorage.removeItem("authToken");
//             navigate("/");
//         }
//     }, [navigate]);

//     // Fetch worklogs data for the past 7 days
//     useEffect(() => {
//         if (user) {
//             fetchWorklogs();
//         }
//     }, [user]);

//     const fetchWorklogs = async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const token = localStorage.getItem("authToken");
//             if (!token) {
//                 throw new Error("No authentication token found");
//             }

//             console.log("Making request to:", `${API_BASE_URL}/api/spoc/worklogs/pending`);
//             console.log("Token exists:", !!token);

//             const response = await fetch(`${API_BASE_URL}/api/spoc/worklogs/pending`, {
//                 method: "GET",
//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             });

//             console.log("Response status:", response.status);

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error("Error response:", errorText);
//                 throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//             }

//             const data = await response.json();
//             console.log("Response data:", data);

//             if (data.success === false) {
//                 throw new Error(data.message || data.error || "API returned success: false");
//             }

//             setWorklogsData(data.worklogsByDate || {});
            
//             // Log for debugging
//             console.log("Worklogs data set:", data.worklogsByDate);
//             console.log("Total count:", data.totalCount);
//             console.log("Employee count:", data.employeeCount);

//         } catch (err) {
//             console.error("Error fetching worklogs:", err);
//             setError(`Failed to fetch worklogs: ${err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleApprove = async (worklogId, date) => {
//         await updateWorklogStatus(worklogId, "Approved", date);
//     };

//     const handleReject = async (worklogId, date) => {
//         await updateWorklogStatus(worklogId, "Rejected", date);
//     };

//     const updateWorklogStatus = async (worklogId, status, date) => {
//         try {
//             setUpdating(prev => ({ ...prev, [worklogId]: true }));

//             const token = localStorage.getItem("authToken");
//             const response = await fetch(`${API_BASE_URL}/api/spoc/worklogs/update-status`, {
//                 method: "PUT",
//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     worklogId,
//                     auditStatus: status
//                 }),
//             });

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(`Failed to ${status.toLowerCase()} worklog: ${errorText}`);
//             }

//             const result = await response.json();
            
//             // Update local state
//             setWorklogsData(prevData => {
//                 const newData = { ...prevData };
//                 if (newData[date]) {
//                     newData[date] = newData[date].map(log => 
//                         log._id === worklogId 
//                             ? { ...log, auditStatus: status }
//                             : log
//                     );
//                 }
//                 return newData;
//             });

//             console.log(`Worklog ${status.toLowerCase()} successfully`);
//         } catch (err) {
//             console.error(`Error ${status.toLowerCase()}ing worklog:`, err);
//             alert(`Failed to ${status.toLowerCase()} worklog. Please try again.`);
//         } finally {
//             setUpdating(prev => ({ ...prev, [worklogId]: false }));
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem("authToken");
//         if (window.google?.accounts?.id) {
//             window.google.accounts.id.disableAutoSelect();
//         }
//         navigate("/");
//     };

//     const getStatusIcon = (status) => {
//         switch (status) {
//             case "Approved":
//                 return <CheckCircle className="w-5 h-5 text-green-600" />;
//             case "Rejected":
//                 return <XCircle className="w-5 h-5 text-red-600" />;
//             case "Pending":
//                 return <Clock className="w-5 h-5 text-yellow-600" />;
//             default:
//                 return <AlertCircle className="w-5 h-5 text-gray-600" />;
//         }
//     };

//     const getRowColor = (status) => {
//         switch (status) {
//             case "Approved":
//                 return "bg-green-50 border-green-200";
//             case "Rejected":
//                 return "bg-red-50 border-red-200";
//             case "Pending":
//                 return "bg-yellow-50 border-yellow-200";
//             default:
//                 return "bg-white";
//         }
//     };

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric'
//         });
//     };

//     // Don't render anything until auth is loaded
//     if (!user) {
//         return null;
//     }

//     return (
//         <div className="flex min-h-screen">
//             {/* Navbar */}
//             <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
//                 <div className="max-w-full mx-auto px-4 sm:px-6">
//                     <div className="flex items-center justify-between h-16">
//                         {/* Left */}
//                         <div className="flex items-center">
//                             <button
//                                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                                 className="mr-4 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
//                             >
//                                 <span className="sr-only">Toggle sidebar</span>
//                                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                                 </svg>
//                             </button>
//                             <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
//                                 <span className="block sm:inline">SPOC Dashboard</span>
//                                 <span className="hidden sm:inline"> - Approve Worklogs</span>
//                             </h1>
//                         </div>

//                         {/* Right */}
//                         <div className="hidden md:flex items-center space-x-4">
//                             <div className="flex items-center space-x-3">
//                                 <img
//                                     src={user.picture}
//                                     alt={user.name}
//                                     className="w-8 h-8 rounded-full border-2 border-slate-600"
//                                 />
//                                 <div className="text-right">
//                                     <div className="text-sm font-medium">{user.name}</div>
//                                     <div className="text-xs text-slate-300">{user.email}</div>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={handleLogout}
//                                 className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
//                             >
//                                 Logout
//                             </button>
//                         </div>

//                         {/* Mobile menu button */}
//                         <div className="md:hidden">
//                             <button
//                                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                                 className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
//                             >
//                                 {!mobileMenuOpen ? (
//                                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                                     </svg>
//                                 ) : (
//                                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     {/* Mobile dropdown */}
//                     {mobileMenuOpen && (
//                         <div className="md:hidden border-t border-slate-700">
//                             <div className="px-2 pt-2 pb-3 space-y-1">
//                                 <div className="flex items-center px-3 py-3 bg-slate-800 rounded-lg">
//                                     <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-slate-600" />
//                                     <div className="ml-3">
//                                         <div className="text-sm font-medium text-white">{user.name}</div>
//                                         <div className="text-xs text-slate-300">{user.email}</div>
//                                     </div>
//                                 </div>
//                                 <div className="px-3">
//                                     <button
//                                         onClick={() => {
//                                             handleLogout();
//                                             setMobileMenuOpen(false);
//                                         }}
//                                         className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
//                                     >
//                                         Logout
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </nav>

//             {/* Layout */}
//             <div className="pt-16 flex w-full">
//                 {/* Mobile sidebar */}
//                 {sidebarOpen && (
//                     <div className="fixed inset-0 z-40 lg:hidden">
//                         <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
//                         <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl overflow-y-auto">
//                             <div className="p-6">
//                                 <h2 className="text-xl font-bold mb-8">Menu</h2>
//                                 <nav className="flex flex-col space-y-4">
//                                     <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc-dashboard"); setSidebarOpen(false) }}>Home</button>
//                                     <button className="bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/approve-worklogs"); setSidebarOpen(false) }}>Approve Worklogs</button>
//                                     <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/add-project"); setSidebarOpen(false) }}>Add Project</button>
//                                     <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/mark-night-shift"); setSidebarOpen(false) }}>Mark Night Shift</button>
//                                 </nav>
//                             </div>
//                         </aside>
//                     </div>
//                 )}

//                 {/* Desktop sidebar */}
//                 <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
//                     <div className="p-6">
//                         <h2 className="text-xl font-bold mb-8">Menu</h2>
//                         <nav className="flex flex-col space-y-4">
//                             <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc-dashboard")}>Home</button>
//                             <button className="bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/approve-worklogs")}>Approve Worklogs</button>
//                             <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/add-project")}>Add Project</button>
//                             <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/mark-night-shift")}>Mark Night Shift</button>
//                         </nav>
//                     </div>
//                 </aside>

//                 {/* Main content (responsive) */}
//                 <div className="flex-1 lg:ml-[288px] font-sans">
//                     <div className="p-4 sm:p-6 space-y-8">
//                         {/* Loading State */}
//                         {loading && (
//                             <div className="flex justify-center items-center py-12">
//                                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
//                                 <span className="ml-3 text-gray-600">Loading worklogs...</span>
//                             </div>
//                         )}

//                         {/* Error State */}
//                         {error && (
//                             <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
//                                 <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
//                                 <span className="text-red-700">{error}</span>
//                                 <button
//                                     onClick={fetchWorklogs}
//                                     className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
//                                 >
//                                     Retry
//                                 </button>
//                             </div>
//                         )}

//                         {/* No Data State */}
//                         {!loading && !error && Object.keys(worklogsData).length === 0 && (
//                             <div className="text-center py-12">
//                                 <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                                 <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Worklogs</h3>
//                                 <p className="text-gray-600">There are no pending worklogs to approve at this time.</p>
//                             </div>
//                         )}

//                         {/* Worklogs Data */}
//                         {!loading && !error && Object.keys(worklogsData).map((date) => (
//                             <div key={date} className="bg-white rounded-lg shadow p-4">
//                                 <h2 className="font-bold text-base sm:text-lg mb-4 flex items-center">
//                                     {formatDate(date)}
//                                     <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//                                         {worklogsData[date].length} entries
//                                     </span>
//                                 </h2>

//                                 {/* Mobile view: Card layout */}
//                                 <div className="space-y-4 sm:hidden">
//                                     {worklogsData[date].map((log) => (
//                                         <div key={log._id} className={`p-4 border rounded-lg ${getRowColor(log.auditStatus)}`}>
//                                             <div className="flex justify-between items-start mb-2">
//                                                 <p className="font-semibold text-lg">{log.employeeName}</p>
//                                                 <div className="flex items-center">
//                                                     {getStatusIcon(log.auditStatus)}
//                                                     <span className="ml-1 text-sm font-medium">{log.auditStatus}</span>
//                                                 </div>
//                                             </div>
//                                             <p><span className="font-semibold">Work Mode:</span> {log.workMode}</p>
//                                             <p><span className="font-semibold">Project:</span> {log.projectName}</p>
//                                             <p><span className="font-semibold">Task:</span> {log.task}</p>
//                                             <p><span className="font-semibold">Book Element:</span> {log.bookElement}</p>
//                                             <p><span className="font-semibold">Chapter No:</span> {log.chapterNo}</p>
//                                             <p><span className="font-semibold">Hours Spent:</span> {log.hoursSpent}</p>
//                                             <p><span className="font-semibold">Units:</span> {log.noOfUnits} {log.unitType}</p>
//                                             <p><span className="font-semibold">Status:</span> {log.status}</p>
//                                             <p><span className="font-semibold">Due On:</span> {formatDate(log.dueOn)}</p>
//                                             {log.details && <p><span className="font-semibold">Details:</span> {log.details}</p>}
                                            
//                                             {log.auditStatus === "Pending" && (
//                                                 <div className="flex gap-2 mt-4">
//                                                     <button
//                                                         className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50"
//                                                         onClick={() => handleApprove(log._id, date)}
//                                                         disabled={updating[log._id]}
//                                                     >
//                                                         {updating[log._id] ? (
//                                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                         ) : (
//                                                             <>
//                                                                 <Check size={18} className="mr-2" />
//                                                                 Approve
//                                                             </>
//                                                         )}
//                                                     </button>
//                                                     <button
//                                                         className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50"
//                                                         onClick={() => handleReject(log._id, date)}
//                                                         disabled={updating[log._id]}
//                                                     >
//                                                         {updating[log._id] ? (
//                                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                         ) : (
//                                                             <>
//                                                                 <X size={18} className="mr-2" />
//                                                                 Reject
//                                                             </>
//                                                         )}
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* Desktop view: Table layout */}
//                                 <div className="hidden sm:block overflow-x-auto">
//                                     <table className="w-full border-collapse text-sm">
//                                         <thead>
//                                             <tr className="bg-gray-100">
//                                                 <th className="p-2 border">Employee</th>
//                                                 <th className="p-2 border">Work Mode</th>
//                                                 <th className="p-2 border">Project</th>
//                                                 <th className="p-2 border">Task</th>
//                                                 <th className="p-2 border">Book Element</th>
//                                                 <th className="p-2 border">Chapter No</th>
//                                                 <th className="p-2 border">Hours Spent</th>
//                                                 <th className="p-2 border">No. of Units</th>
//                                                 <th className="p-2 border">Unit Type</th>
//                                                 <th className="p-2 border">Status</th>
//                                                 <th className="p-2 border">Due On</th>
//                                                 <th className="p-2 border">Details</th>
//                                                 <th className="p-2 border">Audit Status</th>
//                                                 <th className="p-2 border">Action</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {worklogsData[date].map((log) => (
//                                                 <tr key={log._id} className={getRowColor(log.auditStatus)}>
//                                                     <td className="p-2 border font-medium">{log.employeeName}</td>
//                                                     <td className="p-2 border">{log.workMode}</td>
//                                                     <td className="p-2 border">{log.projectName}</td>
//                                                     <td className="p-2 border">{log.task}</td>
//                                                     <td className="p-2 border">{log.bookElement}</td>
//                                                     <td className="p-2 border">{log.chapterNo}</td>
//                                                     <td className="p-2 border">{log.hoursSpent}</td>
//                                                     <td className="p-2 border">{log.noOfUnits}</td>
//                                                     <td className="p-2 border">{log.unitType}</td>
//                                                     <td className="p-2 border">{log.status}</td>
//                                                     <td className="p-2 border">{formatDate(log.dueOn)}</td>
//                                                     <td className="p-2 border">{log.details || "-"}</td>
//                                                     <td className="p-2 border">
//                                                         <div className="flex items-center">
//                                                             {getStatusIcon(log.auditStatus)}
//                                                             <span className="ml-1 text-xs font-medium">{log.auditStatus}</span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-2 border">
//                                                         {log.auditStatus === "Pending" ? (
//                                                             <div className="flex gap-1 justify-center">
//                                                                 <button
//                                                                     className="bg-green-500 hover:bg-green-600 text-white p-1 rounded flex items-center justify-center disabled:opacity-50"
//                                                                     onClick={() => handleApprove(log._id, date)}
//                                                                     disabled={updating[log._id]}
//                                                                     title="Approve"
//                                                                 >
//                                                                     {updating[log._id] ? (
//                                                                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                                     ) : (
//                                                                         <Check size={16} />
//                                                                     )}
//                                                                 </button>
//                                                                 <button
//                                                                     className="bg-red-500 hover:bg-red-600 text-white p-1 rounded flex items-center justify-center disabled:opacity-50"
//                                                                     onClick={() => handleReject(log._id, date)}
//                                                                     disabled={updating[log._id]}
//                                                                     title="Reject"
//                                                                 >
//                                                                     {updating[log._id] ? (
//                                                                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                                     ) : (
//                                                                         <X size={16} />
//                                                                     )}
//                                                                 </button>
//                                                             </div>
//                                                         ) : (
//                                                             <span className="text-xs text-gray-500">
//                                                                 {log.auditStatus}
//                                                             </span>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

/**
 * SPOC — Approve Worklogs
 *
 * Features:
 * - Default view: past 3 days (today + previous 2 days). Only those days are actionable.
 * - Calendar popover: single day or continuous range; future dates disabled.
 * - Employee multiselect dropdown (closes on outside click).
 * - Group by date; inside each date, group by employee (own sub-table / card group).
 * - Approve All per employee per date (only pending rows).
 * - Approve: no confirm. Reject: confirm dialog kept.
 * - After decision, row turns green/red immediately. Pencil icon allows changing the decision.
 * - Uniform table borders and improved look & feel.
 *
 * Endpoints used:
 *   POST   /api/spoc/worklogs
 *   PUT    /api/spoc/worklogs/update-status
 *   PUT    /api/spoc/worklogs/bulk-update-status
 *   GET    /api/spoc/employees
 */

// ===================== Config ======================
const API_BASE_URL = "http://localhost:5000";
// ===================================================

export default function ApproveWorklogs() {
    const navigate = useNavigate();
    const [modifying, setModifying] = useState(null);

    // ========== Auth / UI State ==========
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // ========== Data State ==========
    const [worklogsByDate, setWorklogsByDate] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState({}); // { [id]: boolean }
    const [bulkUpdating, setBulkUpdating] = useState({}); // { [`${dateKey}|${employeeName}`]: boolean }

    // ========== Employees ==========
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]); // list of names
    const [showEmpDropdown, setShowEmpDropdown] = useState(false);
    const empRef = useOutclick(() => setShowEmpDropdown(false));

    // ========== Date Filter ==========
    const todayISO = stripToISO(new Date());
    // Default range => past 3 days (today - 2 .. today)
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [rangeMode, setRangeMode] = useState(true);
    const [tempStart, setTempStart] = useState(isoNDaysAgo(2));
    const [tempEnd, setTempEnd] = useState(todayISO);
    const [activeMonth, setActiveMonth] = useState(() => toMonthKey(new Date(tempEnd)));

    const [startISO, setStartISO] = useState(isoNDaysAgo(2));
    const [endISO, setEndISO] = useState(todayISO);

    // =========================
    // Auth check
    // =========================
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
        } catch (e) {
            console.error("Invalid token:", e);
            localStorage.removeItem("authToken");
            navigate("/");
        }
    }, [navigate]);

    // =========================
    // Fetch employees
    // =========================
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem("authToken");
        fetch(`${API_BASE_URL}/api/spoc/employees`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) =>
                r.ok ? r.json() : r.text().then((t) => Promise.reject(new Error(t)))
            )
            .then((data) => setEmployees(data.employees || []))
            .catch((err) => console.error("Failed to fetch employees:", err.message));
    }, [user]);

    // =========================
    // Fetch worklogs when filters change
    // =========================
    useEffect(() => {
        if (!user) return;
        fetchWorklogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, startISO, endISO, selectedEmployees]);

    const fetchWorklogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${API_BASE_URL}/api/spoc/worklogs`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDate: startISO,
                    endDate: endISO,
                    employees: selectedEmployees,
                }),
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(`HTTP ${res.status}: ${t}`);
            }
            const data = await res.json();
            setWorklogsByDate(data.worklogsByDate || {});
        } catch (err) {
            console.error(err);
            setError(`Failed to fetch worklogs: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Derived helpers
    // =========================
    const sortedDateKeys = useMemo(
        () =>
            Object.keys(worklogsByDate).sort(
                (a, b) => new Date(b).getTime() - new Date(a).getTime()
            ),
        [worklogsByDate]
    );

    // Past 3 days are actionable; older are read-only.
    const actionableDateKeys = useMemo(() => {
        const t0 = new Date(stripToISO(new Date())); // today @ 00:00 UTC
        const keys = [];
        for (let i = 0; i < 3; i++) {
            const d = new Date(t0);
            d.setUTCDate(t0.getUTCDate() - i);
            keys.push(stripToISO(d));
        }
        return new Set(keys);
    }, []);

    const isActionableDate = (dateKey) => actionableDateKeys.has(dateKey);

    // Group items by employee for a given dateKey
    const groupByEmployee = (items) => {
        const byEmp = {};
        for (const row of items) {
            if (!byEmp[row.employeeName]) byEmp[row.employeeName] = [];
            byEmp[row.employeeName].push(row);
        }
        // stable ordering
        return Object.fromEntries(
            Object.keys(byEmp)
                .sort((a, b) => a.localeCompare(b))
                .map((k) => [k, byEmp[k]])
        );
    };

    // Row background class for audit status
    const rowClassForAudit = (status) => {
        if (status === "Approved") return "bg-emerald-50/70";
        if (status === "Rejected") return "bg-rose-50/70";
        return ""; // Pending => white
    };

    // Badge (for table view)
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
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">
                <Clock className="w-4 h-4" /> Pending
            </span>
        );
    };

    // =========================
    // Update APIs (single / bulk)
    // =========================
    const mutateLocalRow = (dateKey, id, auditStatus) => {
        setWorklogsByDate((prev) => {
            const next = { ...prev };
            if (!next[dateKey]) return next;
            next[dateKey] = next[dateKey].map((row) =>
                row._id === id ? { ...row, auditStatus } : row
            );
            return next;
        });
    };

    const handleApprove = async (id, dateKey) => {
        // No confirm for approve
        await updateWorklogStatus(id, "Approved", dateKey);
    };
    const handleReject = async (id, dateKey) => {
        if (!window.confirm("Reject this entry?")) return;
        await updateWorklogStatus(id, "Rejected", dateKey);
    };

    const updateWorklogStatus = async (worklogId, status, dateKey) => {
        try {
            setUpdating((p) => ({ ...p, [worklogId]: true }));
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${API_BASE_URL}/api/spoc/worklogs/update-status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ worklogId, auditStatus: status }),
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t);
            }
            await res.json();
            mutateLocalRow(dateKey, worklogId, status);
        } catch (err) {
            console.error(err);
            alert(`Failed to ${status.toLowerCase()} worklog. Please try again.`);
        } finally {
            setUpdating((p) => ({ ...p, [worklogId]: false }));
        }
    };

    const handleApproveAll = async (dateKey, employeeName) => {
        const key = `${dateKey}|${employeeName}`;
        try {
            setBulkUpdating((p) => ({ ...p, [key]: true }));
            const token = localStorage.getItem("authToken");
            const rows = (worklogsByDate[dateKey] || []).filter(
                (r) => r.employeeName === employeeName && r.auditStatus === "Pending"
            );
            const ids = rows.map((r) => r._id);
            if (ids.length === 0) return;

            // Use bulk endpoint (faster)
            const res = await fetch(
                `${API_BASE_URL}/api/spoc/worklogs/bulk-update-status`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ worklogIds: ids, auditStatus: "Approved" }),
                }
            );
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t);
            }
            await res.json();

            // Mutate locally
            setWorklogsByDate((prev) => {
                const next = { ...prev };
                next[dateKey] = next[dateKey].map((row) =>
                    row.employeeName === employeeName && row.auditStatus === "Pending"
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

    // =========================
    // UI helpers
    // =========================
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
        navigate("/");
    };

    const popRef = useOutclick(() => setDatePopoverOpen(false));

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

    const labelForFilter = () => {
        if (startISO === endISO) return formatISOToHuman(startISO);
        return `${formatISOToHuman(startISO)} – ${formatISOToHuman(endISO)}`;
    };

    // =========================
    // Render
    // =========================
    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            {/* ===== Navbar ===== */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
                <div className="max-w-full mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Left */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen((s) => !s)}
                                className="mr-3 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
                            >
                                <span className="sr-only">Toggle sidebar</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                                <span className="block sm:inline">SPOC Dashboard</span>
                                <span className="hidden sm:inline"> — Approve Worklogs</span>
                            </h1>
                        </div>

                        {/* Right */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border-2 border-slate-600"
                                />
                                <div className="text-right">
                                    <div className="text-sm font-medium">{user.name}</div>
                                    <div className="text-xs text-slate-300">{user.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen((m) => !m)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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

                    {/* Mobile dropdown */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-slate-700">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                <div className="flex items-center px-3 py-3 bg-slate-800 rounded-lg">
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full border-2 border-slate-600"
                                    />
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-white">{user.name}</div>
                                        <div className="text-xs text-slate-300">{user.email}</div>
                                    </div>
                                </div>
                                <div className="px-3">
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* ===== Layout ===== */}
            <div className="pt-16 flex w-full">
                {/* Mobile sidebar */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-8">Menu</h2>
                                <nav className="flex flex-col space-y-4">
                                    <button
                                        className="hover:bg-gray-700 p-3 rounded-lg text-left"
                                        onClick={() => {
                                            navigate("/spoc-dashboard");
                                            setSidebarOpen(false);
                                        }}
                                    >
                                        Home
                                    </button>
                                    <button
                                        className="bg-gray-700 p-3 rounded-lg text-left"
                                        onClick={() => {
                                            navigate("/spoc/approve-worklogs");
                                            setSidebarOpen(false);
                                        }}
                                    >
                                        Approve Worklogs
                                    </button>
                                    <button
                                        className="hover:bg-gray-700 p-3 rounded-lg text-left"
                                        onClick={() => {
                                            navigate("/spoc/add-project");
                                            setSidebarOpen(false);
                                        }}
                                    >
                                        Add Project
                                    </button>
                                    <button
                                        className="hover:bg-gray-700 p-3 rounded-lg text-left"
                                        onClick={() => {
                                            navigate("/spoc/mark-night-shift");
                                            setSidebarOpen(false);
                                        }}
                                    >
                                        Mark Night Shift
                                    </button>
                                </nav>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Desktop sidebar */}
                <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-8">Menu</h2>
                        <nav className="flex flex-col space-y-4">
                            <button
                                className="hover:bg-gray-700 p-3 rounded-lg text-left"
                                onClick={() => navigate("/spoc-dashboard")}
                            >
                                Home
                            </button>
                            <button
                                className="bg-gray-700 p-3 rounded-lg text-left"
                                onClick={() => navigate("/spoc/approve-worklogs")}
                            >
                                Approve Worklogs
                            </button>
                            <button
                                className="hover:bg-gray-700 p-3 rounded-lg text-left"
                                onClick={() => navigate("/spoc/add-project")}
                            >
                                Add Project
                            </button>
                            <button
                                className="hover:bg-gray-700 p-3 rounded-lg text-left"
                                onClick={() => navigate("/spoc/mark-night-shift")}
                            >
                                Mark Night Shift
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* ===== Main ===== */}
                <div className="flex-1 lg:ml-[288px] font-sans">
                    <div className="p-4 sm:p-6 space-y-8">
                        {/* ===== Filters ===== */}
                        <div className="rounded-2xl shadow-md border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <FilterIcon className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-base font-semibold text-slate-800 tracking-tight">
                                    Filters
                                </h3>
                            </div>

                            <div className="flex flex-wrap items-end gap-6">
                                {/* Date popover */}
                                <div className="min-w-[280px] relative" ref={popRef}>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Date(s)
                                    </label>
                                    <button
                                        onClick={() => setDatePopoverOpen((o) => !o)}
                                        className="w-full border rounded-lg px-3 py-2 flex items-center justify-between hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
                                    >
                                        <span className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-medium">{labelForFilter()}</span>
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {rangeMode ? "Range" : "Single"}
                                        </span>
                                    </button>

                                    {datePopoverOpen && (
                                        <div className="absolute z-50 mt-2 w-[340px] rounded-xl border bg-white shadow-xl">
                                            <div className="px-3 py-2 border-b flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setRangeMode(false)}
                                                        className={`text-xs px-2 py-1 rounded ${!rangeMode ? "bg-slate-900 text-white" : "bg-slate-100"
                                                            }`}
                                                    >
                                                        Single Day
                                                    </button>
                                                    <button
                                                        onClick={() => setRangeMode(true)}
                                                        className={`text-xs px-2 py-1 rounded ${rangeMode ? "bg-slate-900 text-white" : "bg-slate-100"
                                                            }`}
                                                    >
                                                        Range
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            setActiveMonth(
                                                                toMonthKey(addMonths(parseMonthKey(activeMonth), -1))
                                                            )
                                                        }
                                                        className="p-1 hover:bg-slate-100 rounded"
                                                        aria-label="Prev month"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <div className="text-xs font-medium w-[130px] text-center">
                                                        {formatMonthKey(activeMonth)}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const nextM = addMonths(parseMonthKey(activeMonth), 1);
                                                            if (isMonthFullyInFuture(nextM)) return;
                                                            setActiveMonth(toMonthKey(nextM));
                                                        }}
                                                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
                                                        aria-label="Next month"
                                                        disabled={isMonthFullyInFuture(
                                                            addMonths(parseMonthKey(activeMonth), 1)
                                                        )}
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

                                            {/* Quick ranges */}
                                            <div className="px-3 py-2 border-t flex items-center gap-2">
                                                <button
                                                    onClick={() => quickApply(3)}
                                                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                                >
                                                    Past 3 Days
                                                </button>
                                                <button
                                                    onClick={() => quickApply(7)}
                                                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                                >
                                                    Past 7 Days
                                                </button>
                                                <button
                                                    onClick={() => quickApply(15)}
                                                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                                >
                                                    Past 15 Days
                                                </button>
                                                <button
                                                    onClick={() => quickApply(30)}
                                                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                                >
                                                    Past 30 Days
                                                </button>
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
                                                <button
                                                    onClick={applyTempDate}
                                                    className="text-xs px-2 py-1 rounded bg-indigo-600 text-white"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Employees multi-select */}
                                <div ref={empRef} className="relative min-w-[260px]">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Employees
                                    </label>
                                    <button
                                        onClick={() => setShowEmpDropdown((o) => !o)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm text-slate-700"
                                    >
                                        <span className="flex flex-wrap gap-1">
                                            {selectedEmployees.length === 0 ? (
                                                <span className="text-slate-600">All employees</span>
                                            ) : (
                                                selectedEmployees.map((name) => (
                                                    <span
                                                        key={name}
                                                        className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium"
                                                    >
                                                        {name}
                                                    </span>
                                                ))
                                            )}
                                        </span>
                                        <ChevronDown
                                            className={`w-4 h-4 ml-2 transition-transform ${showEmpDropdown ? "rotate-180" : "rotate-0"
                                                }`}
                                        />
                                    </button>

                                    {showEmpDropdown && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            <div className="px-3 py-2 text-xs text-slate-500 border-b bg-slate-50 flex items-center gap-2">
                                                <UsersIcon className="w-3.5 h-3.5" />
                                                Select employees
                                            </div>
                                            {employees.map((emp) => (
                                                <label
                                                    key={emp.id}
                                                    className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        value={emp.name}
                                                        checked={selectedEmployees.includes(emp.name)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedEmployees([...selectedEmployees, emp.name]);
                                                            } else {
                                                                setSelectedEmployees(
                                                                    selectedEmployees.filter((n) => n !== emp.name)
                                                                );
                                                            }
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    {emp.name}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="text-xs text-slate-600 ml-auto italic">
                                    You can approve or reject the entries within 3 days — the day the entry is submitted by the employee counts as Day 1, followed by 2 additional days.
                                </div>
                            </div>
                        </div>

                        {/* ===== States ===== */}
                        {loading && (
                            <div className="flex items-center gap-3 py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
                                <span className="text-slate-800">Loading worklogs…</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center">
                                <AlertCircle className="w-5 h-5 text-rose-500 mr-3" />
                                <span className="text-rose-700">{error}</span>
                                <button
                                    onClick={fetchWorklogs}
                                    className="ml-auto bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {!loading && !error && sortedDateKeys.length === 0 && (
                            <div className="text-center py-12">
                                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">
                                    No Worklogs Found
                                </h3>
                                <p className="text-slate-600">
                                    Try changing the date range or employees above.
                                </p>
                            </div>
                        )}

                        {/* ===== By Date ===== */}
                        {!loading &&
                            !error &&
                            sortedDateKeys.map((dateKey) => {
                                const items = worklogsByDate[dateKey] || [];
                                const grouped = groupByEmployee(items);
                                const actionable = isActionableDate(dateKey);

                                return (
                                    <section
                                        key={dateKey}
                                        className="bg-white rounded-2xl shadow-sm border border-slate-200"
                                    >
                                        <div className="px-5 py-4 border-b bg-slate-50/70 rounded-t-2xl flex items-center justify-between">
                                            <h2 className="text-[15px] sm:text-base font-semibold text-slate-800 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                                                {formatISOToHuman(dateKey)}
                                                <span className="ml-2 rounded-full bg-indigo-100 text-indigo-700 text-[11px] px-2 py-0.5 font-medium">
                                                    {items.length} entries
                                                </span>
                                            </h2>
                                            <span className="text-xs text-slate-500">
                                                {actionable ? "Actionable" : "View only (older than 3 days)"}
                                            </span>
                                        </div>

                                        {/* Desktop grouped tables */}
                                        <div className="hidden sm:block">
                                            {Object.keys(grouped).map((emp) => {
                                                const rows = grouped[emp];
                                                const pendingCount = rows.filter(
                                                    (r) => r.auditStatus === "Pending"
                                                ).length;
                                                const key = `${dateKey}|${emp}`;
                                                const canApproveAll = actionable && pendingCount > 0;

                                                return (
                                                    <div key={emp} className="p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                                                                    {emp
                                                                        .split(" ")
                                                                        .map((x) => x[0] || "")
                                                                        .join("")
                                                                        .slice(0, 2)
                                                                        .toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-900">
                                                                        {emp}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {pendingCount} pending
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <button
                                                                disabled={!canApproveAll || !!bulkUpdating[key]}
                                                                onClick={() => handleApproveAll(dateKey, emp)}
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
                                                                        <Check className="w-4 h-4" />
                                                                        Approve All
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
                                                                        <Th>Audit</Th>
                                                                        <Th>Action</Th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody >
                                                                    {rows.map((log) => {
                                                                        const canAct =
                                                                            actionable || false; // still disable buttons in Action column if not actionable
                                                                        return (
                                                                            <tr
                                                                                key={log._id}
                                                                                className={`${rowClassForAudit(
                                                                                    log.auditStatus
                                                                                )} border-t`}
                                                                            >
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
                                                                                <Td className="max-w-[220px] truncate" title={log.details || "-"}>
                                                                                    {log.details || "-"}
                                                                                </Td>
                                                                                <Td>
                                                                                    <AuditBadge status={log.auditStatus} />
                                                                                </Td>
                                                                                <Td>
                                                                                    {log.auditStatus === "Pending" ? (
                                                                                        <div className="flex gap-2 justify-left">
                                                                                            <button
                                                                                                className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
                                                                                                onClick={() => handleApprove(log._id, dateKey)}
                                                                                                disabled={!canAct || !!updating[log._id]}
                                                                                                title="Approve"
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
                                                                                                disabled={!canAct || !!updating[log._id]}
                                                                                                title="Reject"
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
                                                                                                    {log.auditStatus !== "Approved" && (
                                                                                                        <button
                                                                                                            onClick={() => updateWorklogStatus(log._id, "Approved", dateKey)}
                                                                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm"
                                                                                                            disabled={!!updating[log._id]}
                                                                                                        >
                                                                                                            Change to Approve
                                                                                                        </button>
                                                                                                    )}
                                                                                                    {log.auditStatus !== "Rejected" && (
                                                                                                        <button
                                                                                                            onClick={() => {
                                                                                                                if (!window.confirm("Reject this entry?")) return;
                                                                                                                updateWorklogStatus(log._id, "Rejected", dateKey);
                                                                                                            }}
                                                                                                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm"
                                                                                                            disabled={!!updating[log._id]}
                                                                                                        >
                                                                                                            Change to Reject
                                                                                                        </button>
                                                                                                    )}
                                                                                                    <button
                                                                                                        onClick={() => setModifying(null)}
                                                                                                        className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
                                                                                                    >
                                                                                                        Cancel
                                                                                                    </button>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <button
                                                                                                    className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
                                                                                                    onClick={() => setModifying({ id: log._id, dateKey })}
                                                                                                    disabled={!actionable}
                                                                                                >
                                                                                                    <Pencil className="w-4 h-4" />
                                                                                                   
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

                                        {/* Mobile cards (grouped by employee) */}
                                        <div className="sm:hidden p-4 space-y-6">
                                            {Object.keys(grouped).map((emp) => {
                                                const rows = grouped[emp];
                                                const pendingCount = rows.filter(
                                                    (r) => r.auditStatus === "Pending"
                                                ).length;
                                                const canApproveAll = actionable && pendingCount > 0;
                                                const key = `${dateKey}|${emp}`;

                                                return (
                                                    <div key={emp} className="rounded-xl border border-slate-200">
                                                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-t-xl">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                                                                    {emp
                                                                        .split(" ")
                                                                        .map((x) => x[0] || "")
                                                                        .join("")
                                                                        .slice(0, 2)
                                                                        .toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-900">
                                                                        {emp}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {pendingCount} pending
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                disabled={!canApproveAll || !!bulkUpdating[key]}
                                                                onClick={() => handleApproveAll(dateKey, emp)}
                                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium mr-1 ${canApproveAll
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
                                                                        <Check className="w-4 h-4" />
                                                                        Approve All
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>

                                                        <div className="divide-y">
                                                            {rows.map((log) => {
                                                                const canAct = actionable;
                                                                return (
                                                                    <article
                                                                        key={log._id}
                                                                        className={`p-4 ${rowClassForAudit(
                                                                            log.auditStatus
                                                                        )}`}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div>
                                                                                <h3 className="text-[15px] font-semibold text-slate-900">
                                                                                    {log.projectName}
                                                                                </h3>
                                                                                <p className="text-xs text-slate-500 mt-0.5">
                                                                                    {log.task} · {log.bookElement} · Ch {log.chapterNo}
                                                                                </p>
                                                                            </div>
                                                                            <AuditBadge status={log.auditStatus} />
                                                                        </div>

                                                                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] mt-3">
                                                                            <Info label="Work Mode" value={log.workMode} />
                                                                            <Info label="Hours" value={log.hoursSpent} />
                                                                            <Info
                                                                                label="Units"
                                                                                value={`${log.noOfUnits} ${log.unitType || ""}`}
                                                                            />
                                                                            <Info label="Status" value={log.status} />
                                                                            <Info label="Due On" value={formatISOToHuman(log.dueOn)} />
                                                                            {log.details && (
                                                                                <div className="col-span-2">
                                                                                    <dt className="text-slate-500">Details</dt>
                                                                                    <dd className="text-slate-800">{log.details}</dd>
                                                                                </div>
                                                                            )}
                                                                        </dl>

                                                                        <div className="flex gap-2 mt-4">
                                                                            {log.auditStatus === "Pending" ? (
                                                                                <>
                                                                                    <button
                                                                                        className="inline-flex items-left gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                                                                                        onClick={() => handleApprove(log._id, dateKey)}
                                                                                        disabled={!canAct || !!updating[log._id]}
                                                                                    >
                                                                                        {updating[log._id] ? (
                                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                                                        ) : (
                                                                                            <>
                                                                                                <Check size={16} />
                                                                                                Approve
                                                                                            </>
                                                                                        )}
                                                                                    </button>
                                                                                    <button
                                                                                        className="inline-flex items-left gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                                                                                        onClick={() => handleReject(log._id, dateKey)}
                                                                                        disabled={!canAct || !!updating[log._id]}
                                                                                    >
                                                                                        {updating[log._id] ? (
                                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                                                        ) : (
                                                                                            <>
                                                                                                <X size={16} />
                                                                                                Reject
                                                                                            </>
                                                                                        )}
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    {modifying?.id === log._id ? (
                                                                                        <div className="flex gap-2">
                                                                                            {log.auditStatus !== "Approved" && (
                                                                                                <button
                                                                                                    onClick={() => updateWorklogStatus(log._id, "Approved", dateKey)}
                                                                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm"
                                                                                                    disabled={!!updating[log._id]}
                                                                                                >
                                                                                                    Change to Approve
                                                                                                </button>
                                                                                            )}
                                                                                            {log.auditStatus !== "Rejected" && (
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        if (!window.confirm("Reject this entry?")) return;
                                                                                                        updateWorklogStatus(log._id, "Rejected", dateKey);
                                                                                                    }}
                                                                                                    className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm"
                                                                                                    disabled={!!updating[log._id]}
                                                                                                >
                                                                                                    Change to Reject
                                                                                                </button>
                                                                                            )}
                                                                                            <button
                                                                                                onClick={() => setModifying(null)}
                                                                                                className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
                                                                                            >
                                                                                                Cancel
                                                                                            </button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <button
                                                                                            className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
                                                                                            onClick={() => setModifying({ id: log._id, dateKey })}
                                                                                            disabled={!actionable}
                                                                                        >
                                                                                            <Pencil className="w-4 h-4" />
                                                                                           
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
                </div>
            </div>
        </div>
    );
}

/* =================== Small components =================== */
function Info({ label, value }) {
    return (
        <div>
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-slate-800">{value ?? "-"}</dd>
        </div>
    );
}
function Th({ children }) {
    return (
        <th className="p-2 text-left border-b border-slate-300 first:pl-3">
            {children}
        </th>
    );
}
function Td({ children, className = "" }) {
    return (
        <td className={`p-2 border-t border-slate-200 align-top ${className}`}>
            {children}
        </td>
    );
}

/* =================== Calendar Grid =================== */
function CalendarGrid({ monthKey, rangeMode, tempStart, tempEnd, onPick }) {
    const monthDate = parseMonthKey(monthKey);
    const today = stripToISO(new Date());

    const firstDay = new Date(
        Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1)
    );
    const startWeekday = firstDay.getUTCDay(); // 0..6
    const daysInMonth = new Date(
        Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)
    ).getUTCDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const iso = stripToISO(
            new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), d))
        );
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
                ${isToday ? "ring-1 ring-indigo-400" : ""}
              `}
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
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
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