// import React, { useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";

// export default function MarkNightShift() {
//     const navigate = useNavigate();
//     const [user, setUser] = useState(null);
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const API_BASE_URL = 'http://localhost:5000/api';

//     // Replace static employees list with dynamic state
//     const [employeesList, setEmployeesList] = useState([]);
//     const [employeesLoading, setEmployeesLoading] = useState(true);

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
//                     `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                         decoded.name
//                     )}&background=random&color=fff`,
//             };
//             setUser(u);
//         } catch (e) {
//             console.error("Invalid token:", e);
//             localStorage.removeItem("authToken");
//             navigate("/");
//         }
//     }, [navigate]);

//     // Fetch employees under this SPOC
//     const fetchEmployeesUnderSpoc = async () => {
//         if (!user) return;

//         setEmployeesLoading(true);
//         try {
//             const token = localStorage.getItem("authToken");
//             const response = await fetch(
//                 `${API_BASE_URL}/shifts/employees-under-spoc?spoc_email=${encodeURIComponent(user.email)}`,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             if (response.ok) {
//                 const data = await response.json();
//                 setEmployeesList(data);
//             } else {
//                 console.error("Failed to fetch employees");
//                 setError("Failed to load employees under your supervision");
//                 setEmployeesList([]);
//             }
//         } catch (error) {
//             console.error("Error fetching employees:", error);
//             setError("Network error while loading employees");
//             setEmployeesList([]);
//         } finally {
//             setEmployeesLoading(false);
//         }
//     };

//     // Fetch employees when user is set
//     useEffect(() => {
//         if (user) {
//             fetchEmployeesUnderSpoc();
//         }
//     }, [user]);

//     const handleLogout = () => {
//         localStorage.removeItem("authToken");
//         navigate("/");
//     };

//     // States
//     const [selectedNightEmployees, setSelectedNightEmployees] = useState([]);
//     const [selectedSundayEmployees, setSelectedSundayEmployees] = useState([]);
//     const [submitted, setSubmitted] = useState(false);

//     // History view states
//     const [selectedHistoryEmployee, setSelectedHistoryEmployee] = useState("All Employees");
//     const [selectedPeriod, setSelectedPeriod] = useState("30");
//     const [historyType, setHistoryType] = useState("night");
//     const [shiftHistory, setShiftHistory] = useState([]);

//     // Fetch shift history
//     const fetchShiftHistory = async () => {
//         if (!user) return;

//         try {
//             const token = localStorage.getItem("authToken");
//             const response = await fetch(
//                 `${API_BASE_URL}/shifts/history?spoc_email=${encodeURIComponent(user.email)}&type=${historyType}`,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             if (response.ok) {
//                 const data = await response.json();
//                 setShiftHistory(data);
//             } else {
//                 console.error("Failed to fetch history");
//                 setShiftHistory([]);
//             }
//         } catch (error) {
//             console.error("Error fetching history:", error);
//             setShiftHistory([]);
//         }
//     };

//     // Fetch history when component mounts or history type changes
//     useEffect(() => {
//         if (user) {
//             fetchShiftHistory();
//         }
//     }, [user, historyType]);

//     // Checkbox change handlers
//     const handleNightCheckbox = (employee) => {
//         setSelectedNightEmployees((prev) =>
//             prev.find(e => e.name === employee.name)
//                 ? prev.filter((e) => e.name !== employee.name)
//                 : [...prev, employee]
//         );
//     };

//     const handleSundayCheckbox = (employee) => {
//         setSelectedSundayEmployees((prev) =>
//             prev.find(e => e.name === employee.name)
//                 ? prev.filter((e) => e.name !== employee.name)
//                 : [...prev, employee]
//         );
//     };

//     const handleSubmit = async () => {
//         if (!user) return;

//         if (selectedNightEmployees.length === 0 && selectedSundayEmployees.length === 0) {
//             setError("Please select at least one employee for night or Sunday shift");
//             return;
//         }

//         setLoading(true);
//         setError("");

//         try {
//             const token = localStorage.getItem("authToken");
//             const response = await fetch(`${API_BASE_URL}/shifts/mark`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     spoc_name: user.name,
//                     spoc_email: user.email,
//                     nightEmployees: selectedNightEmployees,
//                     sundayEmployees: selectedSundayEmployees
//                 })
//             });

//             if (response.ok) {
//                 const result = await response.json();
//                 setSubmitted(true);
//                 // Refresh history
//                 await fetchShiftHistory();
//             } else {
//                 const errorData = await response.json();
//                 setError(errorData.error || "Failed to mark shifts");
//             }
//         } catch (error) {
//             console.error("Error submitting shifts:", error);
//             setError("Network error. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleEdit = () => {
//         setSubmitted(false);
//         setError("");
//     };

//     const getFilteredHistory = () => {
//         if (!shiftHistory.length) return [];

//         const today = new Date();
//         const days = parseInt(selectedPeriod);

//         return shiftHistory
//             .filter((entry) => {
//                 const entryDate = new Date(entry.shift_date);
//                 const diffDays = (today - entryDate) / (1000 * 60 * 60 * 24);
//                 const inPeriod = days ? diffDays <= days : true;

//                 if (!inPeriod) return false;

//                 if (selectedHistoryEmployee !== "All Employees" &&
//                     entry.name !== selectedHistoryEmployee) {
//                     return false;
//                 }

//                 return true;
//             })
//             .reduce((acc, entry) => {
//                 const dateKey = entry.shift_date.split('T')[0];
//                 if (!acc[dateKey]) {
//                     acc[dateKey] = [];
//                 }
//                 acc[dateKey].push(entry.name);
//                 return acc;
//             }, {});
//     };

//     const groupedHistory = getFilteredHistory();

//     return (
//         <div className="flex min-h-screen bg-gray-50">
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
//                                 <span className="hidden sm:inline"> - Mark Night Shifts</span>
//                             </h1>
//                         </div>

//                         {/* Right */}
//                         <div className="hidden md:flex items-center space-x-4">
//                             <div className="flex items-center space-x-3">
//                                 <img
//                                     src={user?.picture}
//                                     alt={user?.name || "User"}
//                                     className="w-8 h-8 rounded-full border-2 border-slate-600"
//                                 />
//                                 <div className="text-right">
//                                     <div className="text-sm font-medium">{user?.name || "..."}</div>
//                                     <div className="text-xs text-slate-300">{user?.email || ""}</div>
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
//                                     <img
//                                         src={user?.picture}
//                                         alt={user?.name || "User"}
//                                         className="w-10 h-10 rounded-full border-2 border-slate-600"
//                                     />
//                                     <div className="ml-3">
//                                         <div className="text-sm font-medium text-white">{user?.name || "..."}</div>
//                                         <div className="text-xs text-slate-300">{user?.email || ""}</div>
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
//                         <div
//                             className="fixed inset-0 bg-black bg-opacity-50"
//                             onClick={() => setSidebarOpen(false)}
//                         />
//                         <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl overflow-y-auto">
//                             <div className="p-6">
//                                 <h2 className="text-xl font-bold mb-8">Menu</h2>
//                                 <nav className="flex flex-col space-y-4">
//                                     <button
//                                         className="hover:bg-gray-700 p-3 rounded-lg text-left"
//                                         onClick={() => {
//                                             navigate("/spoc-dashboard");
//                                             setSidebarOpen(false);
//                                         }}
//                                     >
//                                         Home
//                                     </button>
//                                     <button
//                                         className="hover:bg-gray-700 p-3 rounded-lg text-left"
//                                         onClick={() => {
//                                             navigate("/spoc/approve-worklogs");
//                                             setSidebarOpen(false);
//                                         }}
//                                     >
//                                         Approve Worklogs
//                                     </button>
//                                     <button
//                                         className="hover:bg-gray-700 p-3 rounded-lg text-left"
//                                         onClick={() => {
//                                             navigate("/spoc/add-project");
//                                             setSidebarOpen(false);
//                                         }}
//                                     >
//                                         Add Project
//                                     </button>
//                                     <button
//                                         className="bg-gray-700 p-3 rounded-lg text-left"
//                                         onClick={() => {
//                                             navigate("/spoc/mark-night-shift");
//                                             setSidebarOpen(false);
//                                         }}
//                                     >
//                                         Mark Night Shift
//                                     </button>
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
//                             <button
//                                 className="hover:bg-gray-700 p-3 rounded-lg text-left"
//                                 onClick={() => navigate("/spoc-dashboard")}
//                             >
//                                 Home
//                             </button>
//                             <button
//                                 className="hover:bg-gray-700 p-3 rounded-lg text-left"
//                                 onClick={() => navigate("/spoc/approve-worklogs")}
//                             >
//                                 Approve Worklogs
//                             </button>
//                             <button
//                                 className="hover:bg-gray-700 p-3 rounded-lg text-left"
//                                 onClick={() => navigate("/spoc/add-project")}
//                             >
//                                 Add Project
//                             </button>
//                             <button
//                                 className="bg-gray-700 p-3 rounded-lg text-left"
//                                 onClick={() => navigate("/spoc/mark-night-shift")}
//                             >
//                                 Mark Night Shift
//                             </button>
//                         </nav>
//                     </div>
//                 </aside>

//                 {/* Main Content */}
//                 <main className="flex-1 lg:ml-72 overflow-y-auto">
//                     <div className="p-4 sm:p-6">
//                         {/* Error Display */}
//                         {error && (
//                             <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//                                 {error}
//                             </div>
//                         )}

//                         {/* Main Content Layout */}
//                         <div className="flex flex-col lg:flex-row gap-6">
//                             {/* LEFT SECTION - Employee Selection */}
//                             <div className="bg-white rounded-lg shadow p-4 lg:p-6 flex-1 lg:w-3/5">
//                                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Mark Shifts</h2>

//                                 {/* Loading state for employees */}
//                                 {employeesLoading ? (
//                                     <div className="text-center py-8">
//                                         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                                         <p className="mt-2 text-gray-600">Loading employees...</p>
//                                     </div>
//                                 ) : employeesList.length === 0 ? (
//                                     <div className="text-center py-8">
//                                         <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                                         </svg>
//                                         <p className="mt-2 text-gray-500">No employees found under your supervision</p>
//                                     </div>
//                                 ) : (
//                                     <>
//                                         {/* Desktop Table View */}
//                                         <div className="hidden sm:block overflow-x-auto">
//                                             <table className="w-full text-left border-collapse">
//                                                 <thead>
//                                                     <tr>
//                                                         <th className="p-3 border-b font-semibold bg-gray-100">Name</th>
//                                                         <th className="p-3 border-b font-semibold bg-gray-100 text-center">Night Shift</th>
//                                                         <th className="p-3 border-b font-semibold bg-gray-100 text-center">Sunday Shift</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {employeesList.map((employee, index) => (
//                                                         <tr key={employee.email} className={index % 2 === 0 ? "bg-blue-50" : ""}>
//                                                             <td className="p-3">{employee.name}</td>
//                                                             <td className="p-3 text-center">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     checked={selectedNightEmployees.find(e => e.name === employee.name) ? true : false}
//                                                                     onChange={() => handleNightCheckbox(employee)}
//                                                                     disabled={submitted}
//                                                                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                                                                 />
//                                                             </td>
//                                                             <td className="p-3 text-center">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     checked={selectedSundayEmployees.find(e => e.name === employee.name) ? true : false}
//                                                                     onChange={() => handleSundayCheckbox(employee)}
//                                                                     disabled={submitted}
//                                                                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                                                                 />
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>

//                                         {/* Mobile Card View */}
//                                         <div className="sm:hidden space-y-3">
//                                             {employeesList.map((employee) => (
//                                                 <div key={employee.email} className="border border-gray-200 rounded-lg p-3">
//                                                     <div className="font-medium text-gray-800 mb-3">{employee.name}</div>
//                                                     <div className="flex justify-between items-center">
//                                                         <label className="flex items-center space-x-2">
//                                                             <input
//                                                                 type="checkbox"
//                                                                 checked={selectedNightEmployees.find(e => e.name === employee.name) ? true : false}
//                                                                 onChange={() => handleNightCheckbox(employee)}
//                                                                 disabled={submitted}
//                                                                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                                                             />
//                                                             <span className="text-sm text-gray-600">Night Shift</span>
//                                                         </label>
//                                                         <label className="flex items-center space-x-2">
//                                                             <input
//                                                                 type="checkbox"
//                                                                 checked={selectedSundayEmployees.find(e => e.name === employee.name) ? true : false}
//                                                                 onChange={() => handleSundayCheckbox(employee)}
//                                                                 disabled={submitted}
//                                                                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                                                             />
//                                                             <span className="text-sm text-gray-600">Sunday Shift</span>
//                                                         </label>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         {/* Submit/Edit Button */}
//                                         <div className="mt-6 flex justify-end">
//                                             {!submitted ? (
//                                                 <button
//                                                     className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                                                     onClick={handleSubmit}
//                                                     disabled={loading}
//                                                 >
//                                                     {loading && (
//                                                         <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
//                                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                             <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                                         </svg>
//                                                     )}
//                                                     {loading ? 'Submitting...' : 'SUBMIT'}
//                                                 </button>
//                                             ) : (
//                                                 <button
//                                                     className="w-full sm:w-auto bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
//                                                     onClick={handleEdit}
//                                                 >
//                                                     EDIT
//                                                 </button>
//                                             )}
//                                         </div>

//                                         {/* Success Messages */}
//                                         {submitted && (
//                                             <div className="mt-6 space-y-4">
//                                                 {selectedNightEmployees.length > 0 && (
//                                                     <div className="p-3 rounded bg-green-100 text-green-700 text-sm">
//                                                         Night shift marked and notifications sent ✔
//                                                     </div>
//                                                 )}
//                                                 {selectedSundayEmployees.length > 0 && (
//                                                     <div className="p-3 rounded bg-yellow-100 text-yellow-700 text-sm">
//                                                         Sunday shift marked and notifications sent ✔
//                                                     </div>
//                                                 )}

//                                                 {selectedNightEmployees.length > 0 && (
//                                                     <div>
//                                                         <h3 className="font-semibold text-lg mb-2">Night Shift Tonight</h3>
//                                                         <ul className="list-disc list-inside">
//                                                             {selectedNightEmployees.map((emp) => (
//                                                                 <li key={emp.name}>{emp.name}</li>
//                                                             ))}
//                                                         </ul>
//                                                     </div>
//                                                 )}

//                                                 {selectedSundayEmployees.length > 0 && (
//                                                     <div>
//                                                         <h3 className="font-semibold text-lg mb-2">Sunday Shift This Week</h3>
//                                                         <ul className="list-disc list-inside">
//                                                             {selectedSundayEmployees.map((emp) => (
//                                                                 <li key={emp.name}>{emp.name}</li>
//                                                             ))}
//                                                         </ul>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </>
//                                 )}
//                             </div>

//                             {/* RIGHT SECTION - History */}
//                             <div className="bg-white rounded-lg shadow p-4 lg:p-6 flex-1 lg:w-2/5">
//                                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Shift History</h2>

//                                 {/* Toggle Switch */}
//                                 <div className="flex items-center bg-red-800 rounded-full p-1 w-full mb-4">
//                                     <button
//                                         className={`flex-1 py-2 px-3 rounded-full transition-all text-sm font-medium ${historyType === "night" ? "bg-white text-red-900" : "text-white"
//                                             }`}
//                                         onClick={() => setHistoryType("night")}
//                                     >
//                                         Night Shift
//                                     </button>
//                                     <button
//                                         className={`flex-1 py-2 px-3 rounded-full transition-all text-sm font-medium ${historyType === "sunday" ? "bg-white text-red-900" : "text-white"
//                                             }`}
//                                         onClick={() => setHistoryType("sunday")}
//                                     >
//                                         Sunday Shift
//                                     </button>
//                                 </div>

//                                 {/* Filter Controls */}
//                                 <div className="space-y-3 mb-4">
//                                     <select
//                                         value={selectedHistoryEmployee}
//                                         onChange={(e) => setSelectedHistoryEmployee(e.target.value)}
//                                         className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     >
//                                         <option>All Employees</option>
//                                         {employeesList.map((emp) => (
//                                             <option key={emp.email} value={emp.name}>
//                                                 {emp.name}
//                                             </option>
//                                         ))}
//                                     </select>

//                                     <select
//                                         value={selectedPeriod}
//                                         onChange={(e) => setSelectedPeriod(e.target.value)}
//                                         className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     >
//                                         <option value="7">Last 7 Days</option>
//                                         <option value="15">Last 15 Days</option>
//                                         <option value="30">Last 30 Days</option>
//                                         <option value="">All Time</option>
//                                     </select>
//                                 </div>

//                                 {/* History Display */}
//                                 <div className="max-h-80 overflow-y-auto">
//                                     {Object.keys(groupedHistory).length > 0 ? (
//                                         Object.entries(groupedHistory)
//                                             .sort(([a], [b]) => new Date(b) - new Date(a))
//                                             .map(([date, employees]) => (
//                                                 <div key={date} className="mb-4 p-3 bg-gray-50 rounded-lg">
//                                                     <p className="text-sm font-semibold text-gray-700 mb-2">
//                                                         {new Date(date).toLocaleDateString("en-GB", {
//                                                             day: "numeric",
//                                                             month: "long",
//                                                             year: "numeric",
//                                                         })}
//                                                     </p>
//                                                     <div className="flex flex-wrap gap-2">
//                                                         {employees.map((emp, idx) => (
//                                                             <span
//                                                                 key={idx}
//                                                                 className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                                                             >
//                                                                 {emp}
//                                                             </span>
//                                                         ))}
//                                                     </div>
//                                                 </div>
//                                             ))
//                                     ) : (
//                                         <div className="text-center text-gray-500 py-8">
//                                             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                                             </svg>
//                                             <p className="mt-2 text-sm">No shift history found</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// }


import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function MarkNightShift() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_BASE_URL = 'http://localhost:5000/api';

    // Replace static employees list with dynamic state
    const [employeesList, setEmployeesList] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(true);

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
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        decoded.name
                    )}&background=random&color=fff`,
            };
            setUser(u);
        } catch (e) {
            console.error("Invalid token:", e);
            localStorage.removeItem("authToken");
            navigate("/");
        }
    }, [navigate]);

    // Fetch employees under this SPOC
    const fetchEmployeesUnderSpoc = async () => {
        if (!user) return;
        
        setEmployeesLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(
                `${API_BASE_URL}/shifts/employees-under-spoc?spoc_email=${encodeURIComponent(user.email)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setEmployeesList(data);
            } else {
                console.error("Failed to fetch employees");
                setError("Failed to load employees under your supervision");
                setEmployeesList([]);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            setError("Network error while loading employees");
            setEmployeesList([]);
        } finally {
            setEmployeesLoading(false);
        }
    };

    // Fetch employees when user is set
    useEffect(() => {
        if (user) {
            fetchEmployeesUnderSpoc();
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/");
    };

    // States
    const [selectedNightEmployees, setSelectedNightEmployees] = useState([]);
    const [selectedSundayEmployees, setSelectedSundayEmployees] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success"); // success, error, warning

    // History view states
    const [selectedHistoryEmployee, setSelectedHistoryEmployee] = useState("All Employees");
    const [selectedPeriod, setSelectedPeriod] = useState("30");
    const [historyType, setHistoryType] = useState("night");
    const [shiftHistory, setShiftHistory] = useState([]);

    // Show popup with auto-hide
    const showPopupMessage = (message, type = "success") => {
        setPopupMessage(message);
        setPopupType(type);
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

    // Check for existing shifts before submission
    const checkExistingShifts = async () => {
        if (!user) return { nightExists: false, sundayExists: false };
        
        try {
            const token = localStorage.getItem("authToken");
            const today = new Date().toISOString().split('T')[0];
            
            const response = await fetch(
                `${API_BASE_URL}/shifts/check-existing?spoc_email=${encodeURIComponent(user.email)}&date=${today}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return { nightExists: false, sundayExists: false };
        } catch (error) {
            console.error("Error checking existing shifts:", error);
            return { nightExists: false, sundayExists: false };
        }
    };

    // Fetch shift history
    const fetchShiftHistory = async () => {
        if (!user) return;
        
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(
                `${API_BASE_URL}/shifts/history?spoc_email=${encodeURIComponent(user.email)}&type=${historyType}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setShiftHistory(data);
            } else {
                console.error("Failed to fetch history");
                setShiftHistory([]);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            setShiftHistory([]);
        }
    };

    // Fetch history when component mounts or history type changes
    useEffect(() => {
        if (user) {
            fetchShiftHistory();
        }
    }, [user, historyType]);

    // Checkbox change handlers
    const handleNightCheckbox = (employee) => {
        setSelectedNightEmployees((prev) =>
            prev.find(e => e.name === employee.name)
                ? prev.filter((e) => e.name !== employee.name)
                : [...prev, employee]
        );
    };

    const handleSundayCheckbox = (employee) => {
        setSelectedSundayEmployees((prev) =>
            prev.find(e => e.name === employee.name)
                ? prev.filter((e) => e.name !== employee.name)
                : [...prev, employee]
        );
    };

    // Delete shift entry
    const deleteShiftEntry = async (shiftId) => {
        if (!window.confirm("Are you sure you want to delete this shift entry?")) {
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                showPopupMessage("Shift entry deleted successfully!", "success");
                await fetchShiftHistory(); // Refresh history
            } else {
                const errorData = await response.json();
                showPopupMessage(errorData.error || "Failed to delete shift entry", "error");
            }
        } catch (error) {
            console.error("Error deleting shift:", error);
            showPopupMessage("Network error. Please try again.", "error");
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        
        if (selectedNightEmployees.length === 0 && selectedSundayEmployees.length === 0) {
            showPopupMessage("Please select at least one employee for night or Sunday shift", "error");
            return;
        }

        // Check for existing shifts
        const existingShifts = await checkExistingShifts();
        
        if (selectedNightEmployees.length > 0 && existingShifts.nightExists) {
            showPopupMessage("Night shift has already been marked for today. Please delete existing entries first.", "warning");
            return;
        }
        
        if (selectedSundayEmployees.length > 0 && existingShifts.sundayExists) {
            showPopupMessage("Sunday shift has already been marked for this week. Please delete existing entries first.", "warning");
            return;
        }

        setLoading(true);
        setError("");
        
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/shifts/mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    spoc_name: user.name,
                    spoc_email: user.email,
                    nightEmployees: selectedNightEmployees,
                    sundayEmployees: selectedSundayEmployees
                })
            });

            if (response.ok) {
                const result = await response.json();
                setSubmitted(true);
                showPopupMessage("Shifts marked successfully!", "success");
                // Refresh history
                await fetchShiftHistory();
                // Clear selections after successful submission
                setSelectedNightEmployees([]);
                setSelectedSundayEmployees([]);
            } else {
                const errorData = await response.json();
                showPopupMessage(errorData.error || "Failed to mark shifts", "error");
            }
        } catch (error) {
            console.error("Error submitting shifts:", error);
            showPopupMessage("Network error. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setSubmitted(false);
        setError("");
        setSelectedNightEmployees([]);
        setSelectedSundayEmployees([]);
    };

    const getFilteredHistory = () => {
        if (!shiftHistory.length) return [];
        
        const today = new Date();
        const days = parseInt(selectedPeriod);

        return shiftHistory
            .filter((entry) => {
                const entryDate = new Date(entry.shift_date);
                const diffDays = (today - entryDate) / (1000 * 60 * 60 * 24);
                const inPeriod = days ? diffDays <= days : true;

                if (!inPeriod) return false;

                if (selectedHistoryEmployee !== "All Employees" && 
                    entry.name !== selectedHistoryEmployee) {
                    return false;
                }

                return true;
            })
            .reduce((acc, entry) => {
                const dateKey = entry.shift_date.split('T')[0];
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push({
                    name: entry.name,
                    id: entry.id
                });
                return acc;
            }, {});
    };

    const groupedHistory = getFilteredHistory();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Popup Notification */}
            {showPopup && (
                <div className="fixed top-20 right-4 z-50 max-w-md">
                    <div className={`rounded-lg shadow-lg p-4 ${
                        popupType === 'success' ? 'bg-green-500 text-white' :
                        popupType === 'error' ? 'bg-red-500 text-white' :
                        popupType === 'warning' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
                    }`}>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{popupMessage}</p>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="ml-4 text-lg font-bold hover:opacity-70"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                <span className="hidden sm:inline"> - Mark Night Shifts</span>
                            </h1>
                        </div>

                        {/* Right */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user?.picture}
                                    alt={user?.name || "User"}
                                    className="w-8 h-8 rounded-full border-2 border-slate-600"
                                />
                                <div className="text-right">
                                    <div className="text-sm font-medium">{user?.name || "..."}</div>
                                    <div className="text-xs text-slate-300">{user?.email || ""}</div>
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
                                    <img
                                        src={user?.picture}
                                        alt={user?.name || "User"}
                                        className="w-10 h-10 rounded-full border-2 border-slate-600"
                                    />
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-white">{user?.name || "..."}</div>
                                        <div className="text-xs text-slate-300">{user?.email || ""}</div>
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
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={() => setSidebarOpen(false)}
                        />
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
                                        className="hover:bg-gray-700 p-3 rounded-lg text-left"
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
                                        className="bg-gray-700 p-3 rounded-lg text-left"
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
                                className="hover:bg-gray-700 p-3 rounded-lg text-left"
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
                                className="bg-gray-700 p-3 rounded-lg text-left"
                                onClick={() => navigate("/spoc/mark-night-shift")}
                            >
                                Mark Night Shift
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-72 overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        {/* Error Display */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Main Content Layout */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* LEFT SECTION - Employee Selection */}
                            <div className="bg-white rounded-lg shadow p-4 lg:p-6 flex-1 lg:w-3/5">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Mark Shifts</h2>
                                
                                {/* Loading state for employees */}
                                {employeesLoading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-600">Loading employees...</p>
                                    </div>
                                ) : employeesList.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <p className="mt-2 text-gray-500">No employees found under your supervision</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop Table View */}
                                        <div className="hidden sm:block overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr>
                                                        <th className="p-3 border-b font-semibold bg-gray-100">Name</th>
                                                        <th className="p-3 border-b font-semibold bg-gray-100 text-center">Night Shift</th>
                                                        <th className="p-3 border-b font-semibold bg-gray-100 text-center">Sunday Shift</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {employeesList.map((employee, index) => (
                                                        <tr key={employee.email} className={index % 2 === 0 ? "bg-blue-50" : ""}>
                                                            <td className="p-3">{employee.name}</td>
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedNightEmployees.find(e => e.name === employee.name) ? true : false}
                                                                    onChange={() => handleNightCheckbox(employee)}
                                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedSundayEmployees.find(e => e.name === employee.name) ? true : false}
                                                                    onChange={() => handleSundayCheckbox(employee)}
                                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="sm:hidden space-y-3">
                                            {employeesList.map((employee) => (
                                                <div key={employee.email} className="border border-gray-200 rounded-lg p-3">
                                                    <div className="font-medium text-gray-800 mb-3">{employee.name}</div>
                                                    <div className="flex justify-between items-center">
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedNightEmployees.find(e => e.name === employee.name) ? true : false}
                                                                onChange={() => handleNightCheckbox(employee)}
                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-600">Night Shift</span>
                                                        </label>
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedSundayEmployees.find(e => e.name === employee.name) ? true : false}
                                                                onChange={() => handleSundayCheckbox(employee)}
                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-600">Sunday Shift</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                onClick={handleSubmit}
                                                disabled={loading}
                                            >
                                                {loading && (
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {loading ? 'Submitting...' : 'SUBMIT'}
                                            </button>
                                        </div>

                                        {/* Display selected employees only when submitted */}
                                        {submitted && (selectedNightEmployees.length > 0 || selectedSundayEmployees.length > 0) && (
                                            <div className="mt-6 space-y-4">
                                                {selectedNightEmployees.length > 0 && (
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2">Night Shift Tonight</h3>
                                                        <div className="space-y-2">
                                                            {selectedNightEmployees.map((emp) => (
                                                                <div key={emp.name} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                    <span>{emp.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedSundayEmployees.length > 0 && (
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2">Sunday Shift This Week</h3>
                                                        <div className="space-y-2">
                                                            {selectedSundayEmployees.map((emp) => (
                                                                <div key={emp.name} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                    <span>{emp.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* RIGHT SECTION - Shift History */}
                            <div className="bg-white rounded-lg shadow p-4 lg:p-6 flex-1 lg:w-2/5">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Shift History</h2>
                                
                                {/* History Controls */}
                                <div className="space-y-4 mb-6">
                                    {/* Shift Type Toggle */}
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button
                                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                                historyType === 'night' 
                                                    ? 'bg-blue-600 text-white shadow-sm' 
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                            onClick={() => setHistoryType('night')}
                                        >
                                            Night Shifts
                                        </button>
                                        <button
                                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                                historyType === 'sunday' 
                                                    ? 'bg-blue-600 text-white shadow-sm' 
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                            onClick={() => setHistoryType('sunday')}
                                        >
                                            Sunday Shifts
                                        </button>
                                    </div>

                                    {/* Employee Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Filter by Employee
                                        </label>
                                        <select
                                            value={selectedHistoryEmployee}
                                            onChange={(e) => setSelectedHistoryEmployee(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="All Employees">All Employees</option>
                                            {employeesList.map((emp) => (
                                                <option key={emp.email} value={emp.name}>
                                                    {emp.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Period Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Time Period
                                        </label>
                                        <select
                                            value={selectedPeriod}
                                            onChange={(e) => setSelectedPeriod(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="7">Last 7 days</option>
                                            <option value="30">Last 30 days</option>
                                            <option value="90">Last 90 days</option>
                                            <option value="">All time</option>
                                        </select>
                                    </div>
                                </div>

                                {/* History List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {Object.keys(groupedHistory).length === 0 ? (
                                        <div className="text-center py-8">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="mt-2 text-gray-500">No shift history found</p>
                                        </div>
                                    ) : (
                                        Object.keys(groupedHistory)
                                            .sort((a, b) => new Date(b) - new Date(a))
                                            .map((date) => (
                                                <div key={date} className="border border-gray-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="font-medium text-gray-900">
                                                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </h3>
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {groupedHistory[date].length} employee{groupedHistory[date].length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {groupedHistory[date].map((employee) => (
                                                            <div key={`${date}-${employee.name}`} className="flex justify-between items-center py-1">
                                                                <span className="text-sm text-gray-700">{employee.name}</span>
                                                                <button
                                                                    onClick={() => deleteShiftEntry(employee.id)}
                                                                    className="text-red-600 hover:text-red-800 text-xs p-1 rounded hover:bg-red-50"
                                                                    title="Delete shift entry"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}