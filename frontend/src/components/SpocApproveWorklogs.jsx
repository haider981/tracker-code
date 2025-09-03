// import React, { useState, useEffect } from "react";
// import { Check, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode"; // ✅ make sure to install: npm i jwt-decode

// export default function ApproveWorklogs() {
//     const navigate = useNavigate();

//     const [user, setUser] = useState(null);
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//     // ✅ Authentication check
//     useEffect(() => {
//         const token = localStorage.getItem("authToken");
//         if (!token) {
//             navigate("/"); // redirect if no token
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

//     const handleLogout = () => {
//         localStorage.removeItem("authToken");
//         if (window.google?.accounts?.id) {
//             window.google.accounts.id.disableAutoSelect();
//         }
//         navigate("/");
//     };

//     // 🗂️ Mock worklogs data (replace with API later)
//     const worklogsData = {
//         "11-08-2025": [
//             {
//                 id: 1,
//                 employee: "Naveen",
//                 workMode: "In office",
//                 project: "UNI_Sem3_GJU_MacEco_BA_(Eng)_25-26",
//                 task: "COM",
//                 element: "Chapter",
//                 chapterNo: 23,
//                 hours: 4,
//                 units: 231,
//                 unitType: "pages",
//                 status: "In progress",
//                 due: "31 Dec 2025",
//                 details: "abc",
//             },
//             {
//                 id: 2,
//                 employee: "Abishek",
//                 workMode: "In office",
//                 project: "UNI_Sem3_KU_MacEco_BA_(Eng)_25-26",
//                 task: "SET",
//                 element: "Title",
//                 chapterNo: 18,
//                 hours: 2,
//                 units: 12,
//                 unitType: "frames",
//                 status: "Delayed",
//                 due: "31 Dec 2025",
//                 details: "xyz",
//             },
//         ],
//         "10-08-2025": [
//             {
//                 id: 3,
//                 employee: "Mahima",
//                 workMode: "In office",
//                 project: "UNI_Sem3_GJU_MacEco_BA_(Eng)_25-26",
//                 task: "SET",
//                 element: "Chapter",
//                 chapterNo: 23,
//                 hours: 4,
//                 units: 231,
//                 unitType: "pages",
//                 status: "Completed",
//                 due: "31 Dec 2025",
//                 details: "abc",
//             },
//             {
//                 id: 4,
//                 employee: "Geeta",
//                 workMode: "In office",
//                 project: "UNI_Sem3_KU_MacEco_BA_(Eng)_25-26",
//                 task: "SET",
//                 element: "Title",
//                 chapterNo: 18,
//                 hours: 2,
//                 units: 12,
//                 unitType: "seconds",
//                 status: "In progress",
//                 due: "31 Dec 2025",
//                 details: "xyz",
//             },
//         ],
//     };

//     const [rowStatus, setRowStatus] = useState({});

//     useEffect(() => {
//         const saved = localStorage.getItem("worklogStatus");
//         if (saved) {
//             setRowStatus(JSON.parse(saved));
//         }
//     }, []);

//     useEffect(() => {
//         localStorage.setItem("worklogStatus", JSON.stringify(rowStatus));
//     }, [rowStatus]);

//     const handleApprove = (id) => {
//         setRowStatus((prev) => ({ ...prev, [id]: "approved" }));
//     };

//     const handleReject = (id) => {
//         setRowStatus((prev) => ({ ...prev, [id]: "rejected" }));
//     };

//     const getRowColor = (id) => {
//         if (rowStatus[id] === "approved") return "bg-green-100";
//         if (rowStatus[id] === "rejected") return "bg-red-100";
//         return "bg-white";
//     };

//     // ✅ Don’t render anything until auth is loaded
//     if (!user) {
//         return null;
//     }

//     return (
//         <div className="flex min-h-screen">
//             {/* ✅ Navbar */}
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

//                     {/* ✅ Mobile dropdown */}
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

//             {/* ✅ Layout */}
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
//                                     <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/add-project"); setSidebarOpen(false) }}>Add Project</button>
                                    
//                                     <button className="bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/approve-worklogs"); setSidebarOpen(false) }}>Approve Worklogs</button>
//                                     <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/mark-night-shift"); setSidebarOpen(false) }}>Mark Night Shift</button>
//                                     {/* <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/view-analysis"); setSidebarOpen(false) }}>View Analysis</button> */}
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
//                             <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/add-project")}>Add Project</button>
//                             <button className="bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/approve-worklogs")}>Approve Worklogs</button>
//                             <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/mark-night-shift")}>Mark Night Shift</button>
//                             {/* <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/view-analysis")}>View Analysis</button> */}
//                         </nav>
//                     </div>
//                 </aside>
//                 {/* ✅ Main content (responsive) */}
//                 <div className="flex-1 lg:ml-[288px] font-sans">
//                     <div className="p-4 sm:p-6 space-y-8">
//                         {Object.keys(worklogsData).map((date) => (
//                             <div key={date} className="bg-white rounded-lg shadow p-4">
//                                 <h2 className="font-bold text-base sm:text-lg mb-4">{date}</h2>

//                                 {/* ✅ Mobile view: Card layout */}
//                                 <div className="space-y-4 sm:hidden">
//                                     {worklogsData[date].map((log) => (
//                                         <div key={log.id} className={`p-4 border rounded-lg ${getRowColor(log.id)}`}>
//                                             <p><span className="font-semibold">Employee:</span> {log.employee}</p>
//                                             <p><span className="font-semibold">Work Mode:</span> {log.workMode}</p>
//                                             <p><span className="font-semibold">Project:</span> {log.project}</p>
//                                             <p><span className="font-semibold">Task:</span> {log.task}</p>
//                                             <p><span className="font-semibold">Book Element:</span> {log.element}</p>
//                                             <p><span className="font-semibold">Chapter No:</span> {log.chapterNo}</p>
//                                             <p><span className="font-semibold">Hours Spent:</span> {log.hours}</p>
//                                             <p><span className="font-semibold">No. of Units:</span> {log.units}</p>
//                                             <p><span className="font-semibold">Unit Type:</span> {log.unitType}</p>
//                                             <p><span className="font-semibold">Status:</span> {log.status}</p>
//                                             <p><span className="font-semibold">Due On:</span> {log.due}</p>
//                                             <p><span className="font-semibold">Details:</span> {log.details}</p>
//                                             <div className="flex gap-2 mt-2">
//                                                 <button
//                                                     className="bg-green-500 hover:bg-green-600 text-white p-2 rounded flex items-center justify-center"
//                                                     onClick={() => handleApprove(log.id)}
//                                                 >
//                                                     <Check size={18} />
//                                                 </button>
//                                                 <button
//                                                     className="bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center"
//                                                     onClick={() => handleReject(log.id)}
//                                                 >
//                                                     <X size={18} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* ✅ Desktop view: Table layout */}
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
//                                                 <th className="p-2 border">Action</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {worklogsData[date].map((log) => (
//                                                 <tr key={log.id} className={getRowColor(log.id)}>
//                                                     <td className="p-2 border">{log.employee}</td>
//                                                     <td className="p-2 border">{log.workMode}</td>
//                                                     <td className="p-2 border">{log.project}</td>
//                                                     <td className="p-2 border">{log.task}</td>
//                                                     <td className="p-2 border">{log.element}</td>
//                                                     <td className="p-2 border">{log.chapterNo}</td>
//                                                     <td className="p-2 border">{log.hours}</td>
//                                                     <td className="p-2 border">{log.units}</td>
//                                                     <td className="p-2 border">{log.unitType}</td>
//                                                     <td className="p-2 border">{log.status}</td>
//                                                     <td className="p-2 border">{log.due}</td>
//                                                     <td className="p-2 border">{log.details}</td>
//                                                     <td className="p-2 border flex gap-2 justify-center">
//                                                         <button
//                                                             className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
//                                                             onClick={() => handleApprove(log.id)}
//                                                         >
//                                                             <Check size={18} />
//                                                         </button>
//                                                         <button
//                                                             className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
//                                                             onClick={() => handleReject(log.id)}
//                                                         >
//                                                             <X size={18} />
//                                                         </button>
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

import React, { useState, useEffect } from "react";
import { Check, X, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ApproveWorklogs() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [worklogsData, setWorklogsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState({});

    // Backend URL - Change this to match your backend port
    const API_BASE_URL = "http://localhost:5000"; // or whatever port your backend runs on

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const u = {
                name: decoded.name,
                email: decoded.email,
                role: decoded.role,
                picture:
                    decoded.picture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random&color=fff`,
            };
            setUser(u);
        } catch (e) {
            console.error("Invalid token:", e);
            localStorage.removeItem("authToken");
            navigate("/");
        }
    }, [navigate]);

    // Fetch worklogs data for the past 7 days
    useEffect(() => {
        if (user) {
            fetchWorklogs();
        }
    }, [user]);

    const fetchWorklogs = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("No authentication token found");
            }

            console.log("Making request to:", `${API_BASE_URL}/api/spoc/worklogs/pending`);
            console.log("Token exists:", !!token);

            const response = await fetch(`${API_BASE_URL}/api/spoc/worklogs/pending`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log("Response data:", data);

            if (data.success === false) {
                throw new Error(data.message || data.error || "API returned success: false");
            }

            setWorklogsData(data.worklogsByDate || {});
            
            // Log for debugging
            console.log("Worklogs data set:", data.worklogsByDate);
            console.log("Total count:", data.totalCount);
            console.log("Employee count:", data.employeeCount);

        } catch (err) {
            console.error("Error fetching worklogs:", err);
            setError(`Failed to fetch worklogs: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (worklogId, date) => {
        await updateWorklogStatus(worklogId, "Approved", date);
    };

    const handleReject = async (worklogId, date) => {
        await updateWorklogStatus(worklogId, "Rejected", date);
    };

    const updateWorklogStatus = async (worklogId, status, date) => {
        try {
            setUpdating(prev => ({ ...prev, [worklogId]: true }));

            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/api/spoc/worklogs/update-status`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    worklogId,
                    auditStatus: status
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to ${status.toLowerCase()} worklog: ${errorText}`);
            }

            const result = await response.json();
            
            // Update local state
            setWorklogsData(prevData => {
                const newData = { ...prevData };
                if (newData[date]) {
                    newData[date] = newData[date].map(log => 
                        log._id === worklogId 
                            ? { ...log, auditStatus: status }
                            : log
                    );
                }
                return newData;
            });

            console.log(`Worklog ${status.toLowerCase()} successfully`);
        } catch (err) {
            console.error(`Error ${status.toLowerCase()}ing worklog:`, err);
            alert(`Failed to ${status.toLowerCase()} worklog. Please try again.`);
        } finally {
            setUpdating(prev => ({ ...prev, [worklogId]: false }));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        navigate("/");
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Approved":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "Rejected":
                return <XCircle className="w-5 h-5 text-red-600" />;
            case "Pending":
                return <Clock className="w-5 h-5 text-yellow-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    const getRowColor = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-50 border-green-200";
            case "Rejected":
                return "bg-red-50 border-red-200";
            case "Pending":
                return "bg-yellow-50 border-yellow-200";
            default:
                return "bg-white";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Don't render anything until auth is loaded
    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
                <div className="max-w-full mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Left */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="mr-4 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
                            >
                                <span className="sr-only">Toggle sidebar</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                                <span className="block sm:inline">SPOC Dashboard</span>
                                <span className="hidden sm:inline"> - Approve Worklogs</span>
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
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-slate-600" />
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
                                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Layout */}
            <div className="pt-16 flex w-full">
                {/* Mobile sidebar */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
                        <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-8">Menu</h2>
                                <nav className="flex flex-col space-y-4">
                                    <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc-dashboard"); setSidebarOpen(false) }}>Home</button>
                                    <button className="bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/approve-worklogs"); setSidebarOpen(false) }}>Approve Worklogs</button>
                                    <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/add-project"); setSidebarOpen(false) }}>Add Project</button>
                                    <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => { navigate("/spoc/mark-night-shift"); setSidebarOpen(false) }}>Mark Night Shift</button>
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
                            <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc-dashboard")}>Home</button>
                            <button className="bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/approve-worklogs")}>Approve Worklogs</button>
                            <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/add-project")}>Add Project</button>
                            <button className="hover:bg-gray-700 p-3 rounded-lg text-left" onClick={() => navigate("/spoc/mark-night-shift")}>Mark Night Shift</button>
                        </nav>
                    </div>
                </aside>

                {/* Main content (responsive) */}
                <div className="flex-1 lg:ml-[288px] font-sans">
                    <div className="p-4 sm:p-6 space-y-8">
                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                                <span className="ml-3 text-gray-600">Loading worklogs...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                                <span className="text-red-700">{error}</span>
                                <button
                                    onClick={fetchWorklogs}
                                    className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* No Data State */}
                        {!loading && !error && Object.keys(worklogsData).length === 0 && (
                            <div className="text-center py-12">
                                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Worklogs</h3>
                                <p className="text-gray-600">There are no pending worklogs to approve at this time.</p>
                            </div>
                        )}

                        {/* Worklogs Data */}
                        {!loading && !error && Object.keys(worklogsData).map((date) => (
                            <div key={date} className="bg-white rounded-lg shadow p-4">
                                <h2 className="font-bold text-base sm:text-lg mb-4 flex items-center">
                                    {formatDate(date)}
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {worklogsData[date].length} entries
                                    </span>
                                </h2>

                                {/* Mobile view: Card layout */}
                                <div className="space-y-4 sm:hidden">
                                    {worklogsData[date].map((log) => (
                                        <div key={log._id} className={`p-4 border rounded-lg ${getRowColor(log.auditStatus)}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-semibold text-lg">{log.employeeName}</p>
                                                <div className="flex items-center">
                                                    {getStatusIcon(log.auditStatus)}
                                                    <span className="ml-1 text-sm font-medium">{log.auditStatus}</span>
                                                </div>
                                            </div>
                                            <p><span className="font-semibold">Work Mode:</span> {log.workMode}</p>
                                            <p><span className="font-semibold">Project:</span> {log.projectName}</p>
                                            <p><span className="font-semibold">Task:</span> {log.task}</p>
                                            <p><span className="font-semibold">Book Element:</span> {log.bookElement}</p>
                                            <p><span className="font-semibold">Chapter No:</span> {log.chapterNo}</p>
                                            <p><span className="font-semibold">Hours Spent:</span> {log.hoursSpent}</p>
                                            <p><span className="font-semibold">Units:</span> {log.noOfUnits} {log.unitType}</p>
                                            <p><span className="font-semibold">Status:</span> {log.status}</p>
                                            <p><span className="font-semibold">Due On:</span> {formatDate(log.dueOn)}</p>
                                            {log.details && <p><span className="font-semibold">Details:</span> {log.details}</p>}
                                            
                                            {log.auditStatus === "Pending" && (
                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50"
                                                        onClick={() => handleApprove(log._id, date)}
                                                        disabled={updating[log._id]}
                                                    >
                                                        {updating[log._id] ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        ) : (
                                                            <>
                                                                <Check size={18} className="mr-2" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50"
                                                        onClick={() => handleReject(log._id, date)}
                                                        disabled={updating[log._id]}
                                                    >
                                                        {updating[log._id] ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        ) : (
                                                            <>
                                                                <X size={18} className="mr-2" />
                                                                Reject
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop view: Table layout */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2 border">Employee</th>
                                                <th className="p-2 border">Work Mode</th>
                                                <th className="p-2 border">Project</th>
                                                <th className="p-2 border">Task</th>
                                                <th className="p-2 border">Book Element</th>
                                                <th className="p-2 border">Chapter No</th>
                                                <th className="p-2 border">Hours Spent</th>
                                                <th className="p-2 border">No. of Units</th>
                                                <th className="p-2 border">Unit Type</th>
                                                <th className="p-2 border">Status</th>
                                                <th className="p-2 border">Due On</th>
                                                <th className="p-2 border">Details</th>
                                                <th className="p-2 border">Audit Status</th>
                                                <th className="p-2 border">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {worklogsData[date].map((log) => (
                                                <tr key={log._id} className={getRowColor(log.auditStatus)}>
                                                    <td className="p-2 border font-medium">{log.employeeName}</td>
                                                    <td className="p-2 border">{log.workMode}</td>
                                                    <td className="p-2 border">{log.projectName}</td>
                                                    <td className="p-2 border">{log.task}</td>
                                                    <td className="p-2 border">{log.bookElement}</td>
                                                    <td className="p-2 border">{log.chapterNo}</td>
                                                    <td className="p-2 border">{log.hoursSpent}</td>
                                                    <td className="p-2 border">{log.noOfUnits}</td>
                                                    <td className="p-2 border">{log.unitType}</td>
                                                    <td className="p-2 border">{log.status}</td>
                                                    <td className="p-2 border">{formatDate(log.dueOn)}</td>
                                                    <td className="p-2 border">{log.details || "-"}</td>
                                                    <td className="p-2 border">
                                                        <div className="flex items-center">
                                                            {getStatusIcon(log.auditStatus)}
                                                            <span className="ml-1 text-xs font-medium">{log.auditStatus}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2 border">
                                                        {log.auditStatus === "Pending" ? (
                                                            <div className="flex gap-1 justify-center">
                                                                <button
                                                                    className="bg-green-500 hover:bg-green-600 text-white p-1 rounded flex items-center justify-center disabled:opacity-50"
                                                                    onClick={() => handleApprove(log._id, date)}
                                                                    disabled={updating[log._id]}
                                                                    title="Approve"
                                                                >
                                                                    {updating[log._id] ? (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                    ) : (
                                                                        <Check size={16} />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded flex items-center justify-center disabled:opacity-50"
                                                                    onClick={() => handleReject(log._id, date)}
                                                                    disabled={updating[log._id]}
                                                                    title="Reject"
                                                                >
                                                                    {updating[log._id] ? (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                    ) : (
                                                                        <X size={16} />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">
                                                                {log.auditStatus}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}