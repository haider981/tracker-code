// import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";

// const API_BASE = "http://localhost:5000/api";

// export default function AddEntryRequestEmp() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [tokenExpired, setTokenExpired] = useState(false);

//   const [teamDropdowns, setTeamDropdowns] = useState({
//     bookElements: [],
//     taskNames: [],
//     chapterNumbers: []
//   });
//   const [loadingDropdowns, setLoadingDropdowns] = useState(false);

//   // Form state
//   const [entryDate, setEntryDate] = useState("");
//   const [workMode, setWorkMode] = useState("");
//   const [projectQuery, setProjectQuery] = useState("");
//   const [projectId, setProjectId] = useState("");
//   const [projectName, setProjectName] = useState("");
//   const [task, setTask] = useState("");
//   const [bookElement, setBookElement] = useState("");
//   const [chapterNumber, setChapterNumber] = useState([]);
//   const [hoursSpent, setHoursSpent] = useState("");
//   const [status, setStatus] = useState("");
//   const [unitsCount, setUnitsCount] = useState("");
//   const [unitsType, setUnitsType] = useState("pages");
//   const [dueOn, setDueOn] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [lateReason, setLateReason] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggest, setShowSuggest] = useState(false);
//   const [searchBy, setSearchBy] = useState("name");
//   const [loadingSuggestions, setLoadingSuggestions] = useState(false);
//   const suggestRef = useRef(null);

//   const [pendingRequests, setPendingRequests] = useState([
//     {
//       id: 1,
//       date: "2025-10-10",
//       workMode: "In Office",
//       projectId: "FK_7th_CBSE_SST_FKSST_(Eng)_26-27",
//       projectName: "CBSE Class 7 Social Science",
//       task: "R1",
//       bookElement: "Chapter",
//       chapterNo: "2",
//       hoursSpent: "4",
//       noOfUnits: "25",
//       unitsType: "pages",
//       status: "Completed",
//       dueOn: "2026-03-14",
//       remarks: "",
//       lateReason: "System maintenance prevented entry on time"
//     },
//     {
//       id: 2,
//       date: "2025-10-10",
//       workMode: "In Office",
//       projectId: "FK_7th_CBSE_SST_FKSST_(Eng)_26-27",
//       projectName: "CBSE Class 7 Social Science",
//       task: "CR",
//       bookElement: "Diagram",
//       chapterNo: "1",
//       hoursSpent: "1",
//       noOfUnits: "3",
//       unitsType: "pages",
//       status: "Completed",
//       dueOn: "2026-03-14",
//       remarks: "",
//       lateReason: "Was working on urgent priority task"
//     },
//     {
//       id: 3,
//       date: "2025-10-10",
//       workMode: "In Office",
//       projectId: "FK_7th_CBSE_SST_FKSST_(Eng)_26-27",
//       projectName: "CBSE Class 7 Social Science",
//       task: "DRF",
//       bookElement: "Miscellaneous",
//       chapterNo: "Miscellaneous",
//       hoursSpent: "1",
//       noOfUnits: "1",
//       unitsType: "general",
//       status: "Completed",
//       dueOn: "2026-03-14",
//       remarks: "New social science class 7th tracker and meet with Parijat sir",
//       lateReason: "Forgot to submit on the actual date"
//     }
//   ]);
//   const [pastRequests, setPastRequests] = useState([
//     {
//       id: 4,
//       date: "2025-10-09",
//       workMode: "In Office",
//       projectId: "FK_7th_CBSE_SST_FKSST_(Eng)_26-27",
//       projectName: "CBSE Class 7 Social Science",
//       task: "R1",
//       bookElement: "Theory",
//       chapterNo: "5",
//       hoursSpent: "1.5",
//       noOfUnits: "7",
//       unitsType: "pages",
//       status: "In Progress",
//       dueOn: "2026-03-14",
//       remarks: "",
//       lateReason: "Client meeting ran late",
//       requestStatus: "Approved"
//     },
//     {
//       id: 5,
//       date: "2025-10-08",
//       workMode: "OT Home",
//       projectId: "FK_7th_CBSE_SST_FKSST_(Eng)_26-27",
//       projectName: "CBSE Class 7 Social Science",
//       task: "R1",
//       bookElement: "Theory",
//       chapterNo: "5",
//       hoursSpent: "2",
//       noOfUnits: "20",
//       unitsType: "pages",
//       status: "Completed",
//       dueOn: "2026-03-14",
//       remarks: "",
//       lateReason: "Power outage at office",
//       requestStatus: "Approved"
//     },
//     {
//       id: 6,
//       date: "2025-10-07",
//       workMode: "WFH",
//       projectId: "FK_8th_CBSE_MATH_FKMATH_(Eng)_26-27",
//       projectName: "CBSE Class 8 Mathematics",
//       task: "VRF-MS",
//       bookElement: "Exercise",
//       chapterNo: "3, 4",
//       hoursSpent: "3",
//       noOfUnits: "15",
//       unitsType: "pages",
//       status: "Completed",
//       dueOn: "2026-04-20",
//       remarks: "Verified manuscript for chapters 3 and 4",
//       lateReason: "Was on medical leave",
//       requestStatus: "Rejected"
//     }
//   ]);
//   const [loadingPending, setLoadingPending] = useState(false);
//   const [loadingPast, setLoadingPast] = useState(false);
//   const [submitMsg, setSubmitMsg] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   const checkTokenValidity = useCallback(() => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       setTokenExpired(true);
//       navigate("/");
//       return false;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       const currentTime = Date.now() / 1000;

//       if (decoded.exp < currentTime) {
//         setTokenExpired(true);
//         localStorage.removeItem("authToken");
//         delete axios.defaults.headers.common.Authorization;
//         navigate("/");
//         return false;
//       }
//       return true;
//     } catch (error) {
//       console.error("Token validation error:", error);
//       setTokenExpired(true);
//       localStorage.removeItem("authToken");
//       delete axios.defaults.headers.common.Authorization;
//       navigate("/");
//       return false;
//     }
//   }, [navigate]);

//   const fetchTeamWiseDropdowns = useCallback(async () => {
//     if (!checkTokenValidity()) return;

//     setLoadingDropdowns(true);
//     try {
//       const { data } = await axios.get("/worklogs/team-dropdowns");

//       if (data?.success && data?.dropdowns) {
//         setTeamDropdowns({
//           bookElements: data.dropdowns.bookElements || [],
//           taskNames: data.dropdowns.taskNames || [],
//           chapterNumbers: data.dropdowns.chapterNumbers || []
//         });
//       } else {
//         setTeamDropdowns({
//           bookElements: [],
//           taskNames: [],
//           chapterNumbers: []
//         });
//       }
//     } catch (error) {
//       if (error.response?.status === 401) {
//         checkTokenValidity();
//         return;
//       }
//       console.error("Failed to load team dropdowns:", error);
//       setTeamDropdowns({
//         bookElements: [],
//         taskNames: [],
//         chapterNumbers: []
//       });
//     } finally {
//       setLoadingDropdowns(false);
//     }
//   }, [checkTokenValidity]);

//   const WORK_MODES = ["In Office", "WFH", "On Duty", "Half Day", "OT Home", "OT Office", "Night"];
//   const STATUS = ["In Progress", "Delayed", "Completed", "Not approved"];
//   const HOURS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8"];
//   const UNITS = [
//     { label: "pages", value: "pages" },
//     { label: "frames", value: "frames" },
//     { label: "seconds", value: "seconds" },
//     { label: "general", value: "general" },
//   ];

//   const TASKS = useMemo(() => {
//     if (teamDropdowns.taskNames && teamDropdowns.taskNames.length > 0) {
//       return teamDropdowns.taskNames;
//     }
//     return ["CMPL-MS", "VRF-MS", "DRF", "TAL", "R1", "R2", "R3", "R4", "CR", "FER", "SET", "FINAL", "MEET", "QRY", "Coord", "GLANCE", "Research", "Analysis", "KT", "Interview", "PLAN", "UPL"];
//   }, [teamDropdowns.taskNames]);

//   const BASE_BOOK_ELEMENTS = useMemo(() => {
//     if (teamDropdowns.bookElements && teamDropdowns.bookElements.length > 0) {
//       return teamDropdowns.bookElements;
//     }
//     return ["Theory", "Exercise", "Chapter", "Full book", "Mind Map", "Diagram", "Solution", "Booklet", "Full Video", "AVLR-VO", "DLR", "Lesson Plan", "Miscellaneous", "AVLR-Ideation", "Marketing", "Development", "Recruitment", "References", "Frames", "Papers", "Projects"];
//   }, [teamDropdowns.bookElements]);

//   const BASE_CHAPTER_NUMBERS = useMemo(() => {
//     if (teamDropdowns.chapterNumbers && teamDropdowns.chapterNumbers.length > 0) {
//       return teamDropdowns.chapterNumbers;
//     }
//     return ["Title", "Syllabus", "Content", "Projects", "Papers", "Miscellaneous", "Appendix", "Full Book",
//       ...Array.from({ length: 40 }, (_, i) => String(i + 1))
//     ];
//   }, [teamDropdowns.chapterNumbers]);

//   // Get available dates (past 3 days from yesterday)
//   const getAvailableDates = () => {
//     const dates = [];
//     const today = new Date();
    
//     for (let i = 1; i <= 3; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() - i);
//       dates.push(date.toISOString().slice(0, 10));
//     }
    
//     return dates;
//   };

//   const availableDates = getAvailableDates();

//   const fetchPendingRequests = useCallback(async () => {
//     if (!checkTokenValidity()) return;

//     setLoadingPending(true);
//     try {
//       const { data } = await axios.get("/entry-requests/pending");
//       if (data?.success && Array.isArray(data.requests)) {
//         setPendingRequests(data.requests.map((r) => ({
//           id: r.id,
//           date: r.entry_date ? new Date(r.entry_date).toISOString().slice(0, 10) : "",
//           workMode: r.work_mode,
//           projectId: r.project_id || "",
//           projectName: r.project_name,
//           task: r.task_name,
//           bookElement: r.book_element,
//           chapterNo: r.chapter_number,
//           hoursSpent: r.hours_spent,
//           noOfUnits: r.number_of_units,
//           unitsType: r.unit_type,
//           status: r.status,
//           dueOn: r.due_on ? new Date(r.due_on).toISOString().slice(0, 10) : "",
//           remarks: r.details || "",
//           lateReason: r.late_reason || "",
//         })));
//       } else {
//         setPendingRequests([]);
//       }
//     } catch (err) {
//       if (err.response?.status === 401) {
//         checkTokenValidity();
//         return;
//       }
//       console.error("Failed to load pending requests:", err);
//       // Keep dummy data on error
//     } finally {
//       setLoadingPending(false);
//     }
//   }, [checkTokenValidity]);

//   const fetchPastRequests = useCallback(async () => {
//     if (!checkTokenValidity()) return;

//     setLoadingPast(true);
//     try {
//       const { data } = await axios.get("/entry-requests/past");
//       if (data?.success && Array.isArray(data.requests)) {
//         setPastRequests(data.requests.map((r) => ({
//           id: r.id,
//           date: r.entry_date ? new Date(r.entry_date).toISOString().slice(0, 10) : "",
//           workMode: r.work_mode,
//           projectId: r.project_id || "",
//           projectName: r.project_name,
//           task: r.task_name,
//           bookElement: r.book_element,
//           chapterNo: r.chapter_number,
//           hoursSpent: r.hours_spent,
//           noOfUnits: r.number_of_units,
//           unitsType: r.unit_type,
//           status: r.status,
//           dueOn: r.due_on ? new Date(r.due_on).toISOString().slice(0, 10) : "",
//           remarks: r.details || "",
//           lateReason: r.late_reason || "",
//           requestStatus: r.request_status || "Pending",
//         })));
//       } else {
//         setPastRequests([]);
//       }
//     } catch (err) {
//       if (err.response?.status === 401) {
//         checkTokenValidity();
//         return;
//       }
//       console.error("Failed to load past requests:", err);
//       // Keep dummy data on error
//     } finally {
//       setLoadingPast(false);
//     }
//   }, [checkTokenValidity]);

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     if (!checkTokenValidity()) {
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       const u = {
//         name: decoded.name,
//         email: decoded.email,
//         role: decoded.role,
//         team: decoded.team,
//         sub_team: decoded.sub_team,
//         picture: decoded.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random&color=fff`,
//       };
//       setUser(u);
//       axios.defaults.baseURL = API_BASE;
//       axios.defaults.headers.common.Authorization = `Bearer ${token}`;

//       fetchTeamWiseDropdowns();
//       fetchPendingRequests();
//       fetchPastRequests();
//     } catch (e) {
//       console.error("Invalid token:", e);
//       localStorage.removeItem("authToken");
//       navigate("/");
//     }
//   }, [navigate, checkTokenValidity, fetchTeamWiseDropdowns, fetchPendingRequests, fetchPastRequests]);

//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     if (window.google?.accounts?.id) {
//       window.google.accounts.id.disableAutoSelect();
//     }
//     delete axios.defaults.headers.common.Authorization;
//     navigate("/");
//   };

//   const showFullBook = useMemo(() => ["FER", "FINAL", "COM"].includes(task), [task]);
//   const bookElements = useMemo(() => (showFullBook ? ["Full Book", ...BASE_BOOK_ELEMENTS] : BASE_BOOK_ELEMENTS), [showFullBook, BASE_BOOK_ELEMENTS]);
//   const chapterNumbers = useMemo(
//     () => (showFullBook ? BASE_CHAPTER_NUMBERS : BASE_CHAPTER_NUMBERS.filter((v) => v !== "Full Book")),
//     [showFullBook, BASE_CHAPTER_NUMBERS]
//   );

//   useEffect(() => {
//     let active = true;
//     const q = projectQuery.trim();
//     if (!q) {
//       setSuggestions([]);
//       setShowSuggest(false);
//       return;
//     }

//     if (!checkTokenValidity()) return;

//     setLoadingSuggestions(true);
//     const t = setTimeout(async () => {
//       try {
//         const { data } = await axios.get("/projects", { params: { q, by: searchBy } });
//         if (!active) return;
//         const transformed = (data.projects || []).map((p) => ({
//           id: p.project_id,
//           name: p.project_name,
//           dueOn: p.due_date ? new Date(p.due_date).toISOString().slice(0, 10) : null,
//         }));
//         setSuggestions(transformed);
//         setShowSuggest(transformed.length > 0);
//       } catch (err) {
//         if (err.response?.status === 401) {
//           checkTokenValidity();
//           return;
//         }
//         setSuggestions([]);
//         setShowSuggest(false);
//       } finally {
//         setLoadingSuggestions(false);
//       }
//     }, 300);

//     return () => {
//       active = false;
//       clearTimeout(t);
//       setLoadingSuggestions(false);
//     };
//   }, [projectQuery, searchBy, checkTokenValidity]);

//   useEffect(() => {
//     function onClickOutside(e) {
//       if (!suggestRef.current) return;
//       if (!suggestRef.current.contains(e.target)) setShowSuggest(false);
//     }
//     window.addEventListener("mousedown", onClickOutside);
//     return () => window.removeEventListener("mousedown", onClickOutside);
//   }, []);

//   const selectProject = (p) => {
//     setProjectId(p.id);
//     setProjectName(p.name);
//     setProjectQuery(p.id);
//     if (p.dueOn) setDueOn(p.dueOn);
//     setShowSuggest(false);
//   };

//   const isEmpty = (v) => Array.isArray(v) ? v.length === 0 : (v === null || v === undefined || String(v).trim() === "");

//   const projectValid =
//     (!!projectId && String(projectId).trim() !== "") ||
//     (!!projectName && String(projectName).trim() !== "") ||
//     (!!projectQuery.trim() && suggestions.some(s => s.id === projectQuery.trim()));

//   const required = { entryDate, workMode, projectId: projectValid ? "ok" : "", task, bookElement, chapterNumber, hoursSpent, status, unitsCount, unitsType, lateReason };

//   const invalid = Object.fromEntries(
//     Object.entries(required).map(([k, v]) => [k, isEmpty(v)])
//   );

//   const canSubmitRequest = Object.values(required).every((v) => !isEmpty(v));

//   const clearForm = () => {
//     setEntryDate("");
//     setWorkMode("");
//     setProjectQuery("");
//     setProjectId("");
//     setProjectName("");
//     setTask("");
//     setBookElement("");
//     setChapterNumber([]);
//     setHoursSpent("");
//     setStatus("");
//     setUnitsCount("");
//     setUnitsType("pages");
//     setDueOn("");
//     setRemarks("");
//     setLateReason("");
//     setSubmitMsg(null);
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     if (!canSubmitRequest || !projectValid) return;

//     setSubmitting(true);
//     setSubmitMsg(null);

//     const requestData = {
//       entryDate,
//       workMode,
//       projectId: projectId || projectQuery.trim(),
//       projectName: projectName || projectQuery,
//       task,
//       bookElement,
//       chapterNo: chapterNumber.join(", "),
//       hoursSpent,
//       noOfUnits: Number(unitsCount),
//       unitsType,
//       status,
//       dueOn,
//       remarks,
//       lateReason,
//     };

//     try {
//       const { data } = await axios.post("/entry-requests", requestData);
//       if (data?.success) {
//         setSubmitMsg("Request submitted successfully!");
//         clearForm();
//         await fetchPendingRequests();
//       } else {
//         setSubmitMsg("Failed to submit request. Please try again.");
//       }
//     } catch (error) {
//       if (error.response?.status === 401) {
//         checkTokenValidity();
//         return;
//       }
//       setSubmitMsg(`Submit failed: ${error?.response?.data?.message || error.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-slate-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-slate-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-100 text-slate-900 text-sm">
//       {/* Navbar */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
//         <div className="flex justify-between items-center w-full px-4 sm:px-6 h-16">
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="mr-2 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
//             >
//               <span className="sr-only">Toggle sidebar</span>
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>

//             <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
//               <span className="block sm:inline">Add Entry Request</span>
//             </h1>
//           </div>

//           <div className="hidden md:flex items-center space-x-4">
//             <div className="flex items-center space-x-3">
//               <img
//                 src={user.picture}
//                 alt={user.name}
//                 className="w-8 h-8 rounded-full border-2 border-slate-600"
//               />
//               <div className="text-right">
//                 <div className="text-sm font-medium">{user.name}</div>
//                 <div className="text-xs text-slate-300">{user.email}</div>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
//             >
//               Logout
//             </button>
//           </div>

//           <div className="md:hidden">
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
//             >
//               <span className="sr-only">Open main menu</span>
//               {!mobileMenuOpen ? (
//                 <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               ) : (
//                 <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className="md:hidden border-t border-slate-700">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               <div className="flex items-center px-3 py-3 bg-slate-800 rounded-lg">
//                 <img
//                   src={user.picture}
//                   alt={user.name}
//                   className="w-10 h-10 rounded-full border-2 border-slate-600"
//                 />
//                 <div className="ml-3">
//                   <div className="text-sm font-medium text-white">{user.name}</div>
//                   <div className="text-xs text-slate-300">{user.email}</div>
//                 </div>
//               </div>

//               <div className="px-3">
//                 <button
//                   onClick={() => {
//                     handleLogout();
//                     setMobileMenuOpen(false);
//                   }}
//                   className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Layout Container */}
//       <div className="pt-16 flex">
//         {/* Mobile Sidebar */}
//         {sidebarOpen && (
//           <div className="fixed inset-0 z-40 lg:hidden">
//             <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
//             <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-8">
//                   <h2 className="text-xl font-bold text-white">Menu</h2>
//                   <button
//                     onClick={() => setSidebarOpen(false)}
//                     className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
//                   >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//                 <nav className="flex flex-col space-y-4">
//                   <button
//                     className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
//                     onClick={() => {
//                       navigate("/employee-dashboard");
//                       setSidebarOpen(false);
//                     }}
//                   >
//                     Home
//                   </button>
//                   <button
//                     className="text-left hover:bg-gray-700 p-3 rounded-lg bg-gray-700 transition-colors duration-200 text-white w-full"
//                     onClick={() => {
//                       navigate("/employee/add-entry-request");
//                       setSidebarOpen(false);
//                     }}
//                   >
//                     Add Entry Request
//                   </button>
//                   <button
//                     className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
//                     onClick={() => {
//                       navigate("/employee/notifications");
//                       setSidebarOpen(false);
//                     }}
//                   >
//                     Notifications
//                   </button>
//                 </nav>
//               </div>
//             </aside>
//           </div>
//         )}

//         {/* Desktop Sidebar */}
//         <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
//           <div className="p-6">
//             <div className="mb-8">
//               <h2 className="text-xl font-bold text-white">Menu</h2>
//             </div>
//             <nav className="flex flex-col space-y-4">
//               <button
//                 className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
//                 onClick={() => navigate("/employee-dashboard")}
//               >
//                 Home
//               </button>
//               <button
//                 className="text-left hover:bg-gray-700 p-3 rounded-lg bg-gray-700 transition-colors duration-200 text-white w-full"
//                 onClick={() => navigate("/employee/add-entry-request")}
//               >
//                 Add Entry Request
//               </button>
//               <button
//                 className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
//                 onClick={() => navigate("/employee/notifications")}
//               >
//                 Notifications
//               </button>
//             </nav>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 transition-all duration-300 ease-in-out lg:ml-72 overflow-y-auto">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//             {/* Request Form */}
//             <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
//               <div className="flex items-start justify-between mb-3">
//                 <h2 className="text-base sm:text-lg font-semibold text-slate-800">
//                   New Entry Request
//                 </h2>
//                 <div className="text-right">
//                   <span className="text-xs text-red-600">* required fields</span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 <Field label="Entry Date *">
//                   <Select
//                     value={entryDate}
//                     onChange={setEntryDate}
//                     options={["", ...availableDates]}
//                     labels={{ "": "— Select Date —", ...availableDates.reduce((acc, date) => {
//                       const d = new Date(date);
//                       acc[date] = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//                       return acc;
//                     }, {}) }}
//                     isInvalid={invalid.entryDate}
//                   />
//                 </Field>

//                 <Field label="Work Mode *">
//                   <Select
//                     value={workMode}
//                     onChange={setWorkMode}
//                     options={["", ...WORK_MODES]}
//                     labels={{ "": "— Select —" }}
//                     isInvalid={invalid.workMode}
//                   />
//                 </Field>

//                 <Field label="Project Search *">
//                   <div className="flex gap-2 items-center">
//                     <div className="relative flex-1" ref={suggestRef}>
//                       <input
//                         type="text"
//                         placeholder="Start typing project name or ID…"
//                         className={`w-full h-9 text-sm px-3 rounded-2xl border-2 ${invalid.projectId ? "border-red-500" : "border-slate-300"} focus:border-indigo-600`}
//                         value={projectQuery}
//                         onChange={(e) => {
//                           setProjectQuery(e.target.value);
//                           setProjectId("");
//                           setProjectName("");
//                           if (!e.target.value.trim()) setDueOn("");
//                         }}
//                         onBlur={() => {
//                           const exact = suggestions.find(s => s.id === projectQuery.trim());
//                           if (exact && !projectId) {
//                             selectProject(exact);
//                           }
//                         }}
//                       />
//                       {loadingSuggestions && (
//                         <div className="absolute right-3 top-2">
//                           <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
//                         </div>
//                       )}
//                       {showSuggest && suggestions.length > 0 && (
//                         <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border bg-white shadow-2xl">
//                           {suggestions.map((s) => (
//                             <li
//                               key={s.id}
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 e.stopPropagation();
//                                 selectProject(s);
//                               }}
//                               className="px-4 py-3 text-sm hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0"
//                             >
//                               <div className="font-medium text-slate-900">{s.id}</div>
//                               <div className="text-xs text-slate-600 mt-1">{s.name}</div>
//                               {s.dueOn && <div className="text-xs text-orange-600 mt-1">Due: {s.dueOn}</div>}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                       {showSuggest && suggestions.length === 0 && !loadingSuggestions && projectQuery.trim() && (
//                         <div className="absolute z-20 mt-2 w-full rounded-2xl border bg-white shadow-2xl px-4 py-3 text-sm text-slate-500">
//                           No projects found for "{projectQuery}"
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </Field>

//                 <Field label="Task *">
//                   <Select
//                     value={task}
//                     onChange={setTask}
//                     options={["", ...TASKS]}
//                     labels={{ "": "— Select —" }}
//                     isInvalid={invalid.task}
//                   />
//                 </Field>

//                 <Field label="Book Element *">
//                   <Select
//                     value={bookElement}
//                     onChange={setBookElement}
//                     options={["", ...bookElements]}
//                     labels={{ "": "— Select —" }}
//                     isInvalid={invalid.bookElement}
//                   />
//                 </Field>

//                 <Field label="Chapter No. *">
//                   <MultiSelectChips
//                     value={chapterNumber}
//                     onChange={setChapterNumber}
//                     options={chapterNumbers}
//                     placeholder="Select chapter(s)…"
//                     isInvalid={invalid.chapterNumber}
//                   />
//                 </Field>

//                 <Field label="Hours Spent *">
//                   <Select
//                     value={hoursSpent}
//                     onChange={setHoursSpent}
//                     options={["", ...HOURS]}
//                     labels={{ "": "— Select —" }}
//                     isInvalid={invalid.hoursSpent}
//                   />
//                 </Field>

//                 <Field label="No. of Units *">
//                   <div className="flex gap-2 items-start">
//                     <input
//                       type="number"
//                       className={`flex-1 h-9 text-sm px-3 rounded-2xl border-2 ${invalid.unitsCount ? "border-red-500" : "border-slate-300"
//                         } focus:border-indigo-600`}
//                       placeholder="e.g., 10"
//                       value={unitsCount}
//                       onChange={(e) => setUnitsCount(e.target.value)}
//                     />
//                     <div className="w-28">
//                       <Select
//                         value={unitsType}
//                         onChange={setUnitsType}
//                         options={UNITS.map((u) => u.value)}
//                         labels={UNITS.reduce((m, u) => {
//                           m[u.value] = u.label;
//                           return m;
//                         }, {})}
//                         isInvalid={invalid.unitsType}
//                       />
//                     </div>
//                   </div>
//                 </Field>

//                 <Field label="Status *">
//                   <Select
//                     value={status}
//                     onChange={setStatus}
//                     options={["", ...STATUS]}
//                     labels={{ "": "— Select —" }}
//                     isInvalid={invalid.status}
//                   />
//                 </Field>

//                 <Field label="Due On">
//                   <input
//                     type="date"
//                     className="w-full h-9 text-sm px-3 rounded-2xl border-2 border-slate-300 focus:border-indigo-600"
//                     value={dueOn}
//                     onChange={(e) => setDueOn(e.target.value)}
//                   />
//                   {dueOn && <div className="mt-1 text-xs text-slate-600">Due: {new Date(dueOn).toLocaleDateString()}</div>}
//                 </Field>

//                 <Field label="Details">
//                   <textarea
//                     className="w-full min-h-[140px] text-sm px-3 py-2 rounded-2xl border-2 border-slate-300 focus:border-indigo-600"
//                     value={remarks}
//                     onChange={(e) => setRemarks(e.target.value)}
//                     placeholder="Add any additional notes..."
//                   />
//                 </Field>

//                 <Field label="Reason for Late Entry *">
//                   <textarea
//                     className={`w-full min-h-[140px] text-sm px-3 py-2 rounded-2xl border-2 ${invalid.lateReason ? "border-red-500" : "border-slate-300"} focus:border-indigo-600`}
//                     value={lateReason}
//                     onChange={(e) => setLateReason(e.target.value)}
//                     placeholder="Explain why you're submitting this entry late..."
//                   />
//                 </Field>
//               </div>

//               <div className="mt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={clearForm}
//                   className="w-full sm:w-auto px-4 py-1.5 rounded-2xl border-2 border-slate-300 hover:bg-slate-50 transition-colors"
//                 >
//                   Clear
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={!canSubmitRequest || !projectValid || submitting}
//                   className={`w-full sm:w-auto px-5 py-1.5 rounded-2xl text-white transition-colors ${canSubmitRequest && projectValid && !submitting
//                     ? "bg-indigo-700 hover:bg-indigo-800"
//                     : "bg-slate-400 cursor-not-allowed"
//                     }`}
//                 >
//                   {submitting ? "Submitting..." : "Submit Request"}
//                 </button>
//               </div>
//             </form>

//             {submitMsg && <Feedback message={submitMsg} />}

//             {/* Pending Requests */}
//             <section className="mt-8 space-y-6">
//               {loadingPending ? (
//                 <Feedback message="Loading pending requests..." />
//               ) : pendingRequests.length > 0 ? (
//                 <RequestsBlock
//                   title="Pending Requests"
//                   rows={pendingRequests}
//                   showStatus={false}
//                 />
//               ) : (
//                 <Feedback message="No pending requests." />
//               )}

//               {/* Past Requests */}
//               {loadingPast ? (
//                 <Feedback message="Loading past requests..." />
//               ) : pastRequests.length > 0 ? (
//                 <RequestsBlock
//                   title="Past Approved/Rejected Requests"
//                   rows={pastRequests}
//                   showStatus={true}
//                   subtle
//                 />
//               ) : (
//                 <Feedback message="No past requests found." />
//               )}
//             </section>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <label className="block">
//       <span className="block mb-1 text-xs font-medium text-slate-800">{label}</span>
//       {children}
//     </label>
//   );
// }

// function Select({ value, onChange, options, labels, isInvalid }) {
//   const safeOptions = Array.isArray(options) ? options : [];
//   const labelFor = (o) =>
//     labels && typeof labels === "object" && Object.prototype.hasOwnProperty.call(labels, o) ? labels[o] : o;

//   return (
//     <select
//       className={`w-full h-9 text-sm px-2 rounded-2xl border-2 ${isInvalid ? "border-red-500" : "border-slate-300"
//         } focus:border-indigo-600`}
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//     >
//       {safeOptions.map((o, idx) => (
//         <option key={idx} value={o}>
//           {labelFor(o)}
//         </option>
//       ))}
//     </select>
//   );
// }

// function MultiSelectChips({ value = [], onChange, options = [], placeholder = "Select one or more…", isInvalid = false }) {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const shellRef = useRef(null);
//   const inputRef = useRef(null);
//   const lastActionTs = useRef(0);

//   useEffect(() => {
//     const handleDown = (e) => {
//       if (!shellRef.current) return;
//       if (!shellRef.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handleDown);
//     return () => document.removeEventListener("mousedown", handleDown);
//   }, []);

//   const deduped = useMemo(() => Array.from(new Set(options.map((o) => String(o)))), [options]);
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return deduped.filter((o) => !value.includes(o)).filter((o) => (q ? o.toLowerCase().includes(q) : true));
//   }, [deduped, value, query]);

//   const guardOnce = () => {
//     const now = Date.now();
//     if (now - lastActionTs.current < 120) return false;
//     lastActionTs.current = now;
//     return true;
//   };

//   const addItem = (item) => {
//     if (!guardOnce()) return;
//     if (!value.includes(item)) onChange([...value, item]);
//     setQuery("");
//     setOpen(true);
//     inputRef.current?.focus();
//   };

//   const removeAt = (idx) => {
//     if (!guardOnce()) return;
//     const next = value.slice();
//     next.splice(idx, 1);
//     onChange(next);
//     setOpen(true);
//     inputRef.current?.focus();
//   };

//   return (
//     <div className="relative" ref={shellRef}>
//       <div
//         className={`min-h-[44px] w-full rounded-2xl border-2 bg-white px-2 py-1 flex flex-wrap items-center gap-2 cursor-text ${isInvalid ? "border-red-500" : "border-slate-300"
//           } focus-within:border-indigo-600`}
//         onMouseDown={(e) => {
//           if (e.target === e.currentTarget) e.preventDefault();
//           setOpen(true);
//           inputRef.current?.focus();
//         }}
//         role="combobox"
//         aria-expanded={open}
//       >
//         {value.map((v, idx) => (
//           <span
//             key={`${v}-${idx}`}
//             className="flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-[2px] text-xs"
//           >
//             {v}
//             <button
//               type="button"
//               onMouseDown={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 removeAt(idx);
//               }}
//               className="ml-1 rounded-full hover:bg-indigo-100 p-[2px] leading-none"
//               aria-label={`Remove ${v}`}
//             >
//               ✕
//             </button>
//           </span>
//         ))}
//         <input
//           ref={inputRef}
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           onFocus={() => setOpen(true)}
//           onKeyDown={(e) => {
//             if (e.key === "Backspace" && query === "" && value.length) {
//               removeAt(value.length - 1);
//             }
//           }}
//           className="flex-1 min-w-[80px] outline-none text-sm px-1 py-1 bg-transparent"
//           placeholder={value.length ? "" : placeholder}
//         />
//       </div>
//       {open && (
//         <div
//           className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-2xl border bg-white shadow-2xl"
//           role="listbox"
//           onMouseDown={(e) => e.preventDefault()}
//         >
//           {filtered.length === 0 ? (
//             <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
//           ) : (
//             filtered.map((opt) => (
//               <div
//                 key={opt}
//                 role="option"
//                 onMouseDown={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   addItem(opt);
//                 }}
//                 className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
//               >
//                 {opt}
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function RequestsBlock({ title, rows, showStatus = false, subtle = false }) {
//   const HEADERS = [
//     "Entry Date",
//     "Work Mode",
//     "Project Name",
//     "Task",
//     "Book Element",
//     "Chapter No.",
//     "Hours Spent",
//     "No. of Units",
//     "Unit Type",
//     "Status",
//     "Due On",
//     "Details",
//     "Reason for Late Entry",
//   ];

//   if (showStatus) {
//     HEADERS.push("Request Status");
//   }

//   return (
//     <div className={`rounded-2xl border ${subtle ? "border-slate-200 bg-white" : "border-slate-300 bg-slate-50"} shadow-sm`}>
//       <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
//         <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
//       </div>
//       <div className="overflow-auto">
//         <table className="min-w-full text-left text-xs">
//           <thead className="bg-slate-100 text-slate-900">
//             <tr>
//               {HEADERS.map((h) => (
//                 <th key={h} className="px-3 py-2 font-semibold sticky top-0 bg-slate-100">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r, idx) => (
//               <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
//                 <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
//                 <td className="px-3 py-2 whitespace-nowrap">{r.workMode}</td>
//                 <td className="px-3 py-2 min-w-[14rem]">{r.projectId || r.projectName}</td>
//                 <td className="px-3 py-2">{r.task}</td>
//                 <td className="px-3 py-2">{r.bookElement}</td>
//                 <td className="px-3 py-2">{r.chapterNo}</td>
//                 <td className="px-3 py-2">{r.hoursSpent}</td>
//                 <td className="px-3 py-2">{r.noOfUnits}</td>
//                 <td className="px-3 py-2">{r.unitsType}</td>
//                 <td className="px-3 py-2">{r.status}</td>
//                 <td className="px-3 py-2">{r.dueOn}</td>
//                 <td className="px-3 py-2">{r.remarks}</td>
//                 <td className="px-3 py-2 min-w-[12rem]">{r.lateReason}</td>
//                 {showStatus && (
//                   <td className="px-3 py-2">
//                     <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
//                       r.requestStatus === 'Approved' ? 'bg-green-100 text-green-800' :
//                       r.requestStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
//                       'bg-yellow-100 text-yellow-800'
//                     }`}>
//                       {r.requestStatus}
//                     </span>
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function Feedback({ message }) {
//   const isError = message && (message.includes("Error") || message.includes("Failed") || message.includes("failed"));
//   const isSuccess = message && (message.includes("Successfully") || message.includes("submitted") || message.includes("success"));

//   let bgColor = "bg-blue-50 border-blue-200 text-blue-900";
//   if (isError) bgColor = "bg-red-50 border-red-200 text-red-900";
//   if (isSuccess) bgColor = "bg-emerald-50 border-emerald-200 text-emerald-900";

//   return <div className={`rounded-2xl border px-3 py-2 text-xs ${bgColor} mt-4`}>{message}</div>;
// }

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function AddEntryRequestEmp() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  const [teamDropdowns, setTeamDropdowns] = useState({
    bookElements: [],
    taskNames: [],
    chapterNumbers: []
  });
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Form state
  const [entryDate, setEntryDate] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [projectQuery, setProjectQuery] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [task, setTask] = useState("");
  const [bookElement, setBookElement] = useState("");
  const [chapterNumber, setChapterNumber] = useState([]);
  const [hoursSpent, setHoursSpent] = useState("");
  const [status, setStatus] = useState("");
  const [unitsCount, setUnitsCount] = useState("");
  const [unitsType, setUnitsType] = useState("pages");
  const [dueOn, setDueOn] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lateReason, setLateReason] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [searchBy, setSearchBy] = useState("name");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestRef = useRef(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [pastRequests, setPastRequests] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingPast, setLoadingPast] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const checkTokenValidity = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setTokenExpired(true);
      navigate("/");
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        setTokenExpired(true);
        localStorage.removeItem("authToken");
        delete axios.defaults.headers.common.Authorization;
        navigate("/");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      setTokenExpired(true);
      localStorage.removeItem("authToken");
      delete axios.defaults.headers.common.Authorization;
      navigate("/");
      return false;
    }
  }, [navigate]);

  const fetchTeamWiseDropdowns = useCallback(async () => {
    if (!checkTokenValidity()) return;

    setLoadingDropdowns(true);
    try {
      const { data } = await axios.get("/worklogs/team-dropdowns");

      if (data?.success && data?.dropdowns) {
        setTeamDropdowns({
          bookElements: data.dropdowns.bookElements || [],
          taskNames: data.dropdowns.taskNames || [],
          chapterNumbers: data.dropdowns.chapterNumbers || []
        });
      } else {
        setTeamDropdowns({
          bookElements: [],
          taskNames: [],
          chapterNumbers: []
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        checkTokenValidity();
        return;
      }
      console.error("Failed to load team dropdowns:", error);
      setTeamDropdowns({
        bookElements: [],
        taskNames: [],
        chapterNumbers: []
      });
    } finally {
      setLoadingDropdowns(false);
    }
  }, [checkTokenValidity]);

  const WORK_MODES = ["In Office", "WFH", "On Duty", "Half Day", "OT Home", "OT Office", "Night"];
  const STATUS = ["In Progress", "Delayed", "Completed", "Not approved"];
  const HOURS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8"];
  const UNITS = [
    { label: "pages", value: "pages" },
    { label: "frames", value: "frames" },
    { label: "seconds", value: "seconds" },
    { label: "general", value: "general" },
  ];

  const TASKS = useMemo(() => {
    if (teamDropdowns.taskNames && teamDropdowns.taskNames.length > 0) {
      return teamDropdowns.taskNames;
    }
    return ["CMPL-MS", "VRF-MS", "DRF", "TAL", "R1", "R2", "R3", "R4", "CR", "FER", "SET", "FINAL", "MEET", "QRY", "Coord", "GLANCE", "Research", "Analysis", "KT", "Interview", "PLAN", "UPL"];
  }, [teamDropdowns.taskNames]);

  const BASE_BOOK_ELEMENTS = useMemo(() => {
    if (teamDropdowns.bookElements && teamDropdowns.bookElements.length > 0) {
      return teamDropdowns.bookElements;
    }
    return ["Theory", "Exercise", "Chapter", "Full book", "Mind Map", "Diagram", "Solution", "Booklet", "Full Video", "AVLR-VO", "DLR", "Lesson Plan", "Miscellaneous", "AVLR-Ideation", "Marketing", "Development", "Recruitment", "References", "Frames", "Papers", "Projects"];
  }, [teamDropdowns.bookElements]);

  const BASE_CHAPTER_NUMBERS = useMemo(() => {
    if (teamDropdowns.chapterNumbers && teamDropdowns.chapterNumbers.length > 0) {
      return teamDropdowns.chapterNumbers;
    }
    return ["Title", "Syllabus", "Content", "Projects", "Papers", "Miscellaneous", "Appendix", "Full Book",
      ...Array.from({ length: 40 }, (_, i) => String(i + 1))
    ];
  }, [teamDropdowns.chapterNumbers]);

  // Get available dates (past 3 days from yesterday)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().slice(0, 10));
    }
    
    return dates;
  };

  const availableDates = getAvailableDates();

  // Get min and max dates for calendar
  const getDateRange = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 3);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() - 1);
    
    return {
      min: minDate.toISOString().slice(0, 10),
      max: maxDate.toISOString().slice(0, 10)
    };
  };

  const dateRange = getDateRange();

  const fetchPendingRequests = useCallback(async () => {
    if (!checkTokenValidity()) return;

    setLoadingPending(true);
    try {
      const { data } = await axios.get("/entry-requests/pending");
      if (data?.success && Array.isArray(data.requests)) {
        setPendingRequests(data.requests.map((r) => ({
          id: r.id,
          date: r.entry_date ? new Date(r.entry_date).toISOString().slice(0, 10) : "",
          workMode: r.work_mode,
          projectId: r.project_id || r.project_name,
          projectName: r.project_name,
          task: r.task_name,
          bookElement: r.book_element,
          chapterNo: r.chapter_number,
          hoursSpent: r.hours_spent,
          noOfUnits: r.number_of_units,
          unitsType: r.unit_type,
          status: r.status,
          dueOn: r.due_on ? new Date(r.due_on).toISOString().slice(0, 10) : "",
          remarks: r.details || "",
          lateReason: r.late_reason || "",
        })));
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        checkTokenValidity();
        return;
      }
      console.error("Failed to load pending requests:", err);
      setPendingRequests([]);
    } finally {
      setLoadingPending(false);
    }
  }, [checkTokenValidity]);

  const fetchPastRequests = useCallback(async () => {
    if (!checkTokenValidity()) return;

    setLoadingPast(true);
    try {
      const { data } = await axios.get("/entry-requests/past");
      if (data?.success && Array.isArray(data.requests)) {
        setPastRequests(data.requests.map((r) => ({
          id: r.id,
          date: r.entry_date ? new Date(r.entry_date).toISOString().slice(0, 10) : "",
          workMode: r.work_mode,
          projectId: r.project_id || r.project_name,
          projectName: r.project_name,
          task: r.task_name,
          bookElement: r.book_element,
          chapterNo: r.chapter_number,
          hoursSpent: r.hours_spent,
          noOfUnits: r.number_of_units,
          unitsType: r.unit_type,
          status: r.status,
          dueOn: r.due_on ? new Date(r.due_on).toISOString().slice(0, 10) : "",
          remarks: r.details || "",
          lateReason: r.late_reason || "",
          requestStatus: r.request_status || "Pending",
        })));
      } else {
        setPastRequests([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        checkTokenValidity();
        return;
      }
      console.error("Failed to load past requests:", err);
      setPastRequests([]);
    } finally {
      setLoadingPast(false);
    }
  }, [checkTokenValidity]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    if (!checkTokenValidity()) {
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const u = {
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        team: decoded.team,
        sub_team: decoded.sub_team,
        picture: decoded.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random&color=fff`,
      };
      setUser(u);
      axios.defaults.baseURL = API_BASE;
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      fetchTeamWiseDropdowns();
      fetchPendingRequests();
      fetchPastRequests();
    } catch (e) {
      console.error("Invalid token:", e);
      localStorage.removeItem("authToken");
      navigate("/");
    }
  }, [navigate, checkTokenValidity, fetchTeamWiseDropdowns, fetchPendingRequests, fetchPastRequests]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    delete axios.defaults.headers.common.Authorization;
    navigate("/");
  };

  const showFullBook = useMemo(() => ["FER", "FINAL", "COM"].includes(task), [task]);
  const bookElements = useMemo(() => (showFullBook ? ["Full Book", ...BASE_BOOK_ELEMENTS] : BASE_BOOK_ELEMENTS), [showFullBook, BASE_BOOK_ELEMENTS]);
  const chapterNumbers = useMemo(
    () => (showFullBook ? BASE_CHAPTER_NUMBERS : BASE_CHAPTER_NUMBERS.filter((v) => v !== "Full Book")),
    [showFullBook, BASE_CHAPTER_NUMBERS]
  );

  useEffect(() => {
    let active = true;
    const q = projectQuery.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }

    if (!checkTokenValidity()) return;

    setLoadingSuggestions(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.get("/projects", { params: { q, by: searchBy } });
        if (!active) return;
        const transformed = (data.projects || []).map((p) => ({
          id: p.project_id,
          name: p.project_name,
          dueOn: p.due_date ? new Date(p.due_date).toISOString().slice(0, 10) : null,
        }));
        setSuggestions(transformed);
        setShowSuggest(transformed.length > 0);
      } catch (err) {
        if (err.response?.status === 401) {
          checkTokenValidity();
          return;
        }
        setSuggestions([]);
        setShowSuggest(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(t);
      setLoadingSuggestions(false);
    };
  }, [projectQuery, searchBy, checkTokenValidity]);

  useEffect(() => {
    function onClickOutside(e) {
      if (!suggestRef.current) return;
      if (!suggestRef.current.contains(e.target)) setShowSuggest(false);
    }
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectProject = (p) => {
    setProjectId(p.id);
    setProjectName(p.name);
    setProjectQuery(p.id);
    if (p.dueOn) setDueOn(p.dueOn);
    setShowSuggest(false);
  };

  const isEmpty = (v) => Array.isArray(v) ? v.length === 0 : (v === null || v === undefined || String(v).trim() === "");

  const projectValid =
    (!!projectId && String(projectId).trim() !== "") ||
    (!!projectName && String(projectName).trim() !== "") ||
    (!!projectQuery.trim() && suggestions.some(s => s.id === projectQuery.trim()));

  const required = { entryDate, workMode, projectId: projectValid ? "ok" : "", task, bookElement, chapterNumber, hoursSpent, status, unitsCount, unitsType, lateReason };

  const invalid = Object.fromEntries(
    Object.entries(required).map(([k, v]) => [k, isEmpty(v)])
  );

  const canSubmitRequest = Object.values(required).every((v) => !isEmpty(v));

  const clearForm = () => {
    setEntryDate("");
    setWorkMode("");
    setProjectQuery("");
    setProjectId("");
    setProjectName("");
    setTask("");
    setBookElement("");
    setChapterNumber([]);
    setHoursSpent("");
    setStatus("");
    setUnitsCount("");
    setUnitsType("pages");
    setDueOn("");
    setRemarks("");
    setLateReason("");
    setSubmitMsg(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitRequest || !projectValid) {
      setSubmitMsg("Please fill all required fields (*) with valid data.");
      return;
    }

    setSubmitting(true);
    setSubmitMsg(null);

    const requestData = {
      entryDate,
      workMode,
      projectId: projectId || projectQuery.trim(),
      projectName: projectName || projectQuery,
      task,
      bookElement,
      chapterNo: chapterNumber.join(", "),
      hoursSpent,
      noOfUnits: Number(unitsCount),
      unitsType,
      status,
      dueOn: dueOn || null,
      remarks: remarks || null,
      lateReason,
    };

    try {
      const { data } = await axios.post("/entry-requests", requestData);
      if (data?.success) {
        setSubmitMsg("Request submitted successfully! Pending SPOC approval.");
        clearForm();
        await fetchPendingRequests();
      } else {
        setSubmitMsg("Failed to submit request. Please try again.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        checkTokenValidity();
        return;
      }
      setSubmitMsg(`Submit failed: ${error?.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 text-sm">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 h-16">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
            >
              <span className="sr-only">Toggle sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              <span className="block sm:inline">Employee Dashboard - Missing Entry Request</span>
            </h1>
          </div>

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

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

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
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Layout Container */}
      <div className="pt-16 flex">
        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="flex flex-col space-y-4">
                  <button
                    className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                    onClick={() => {
                      navigate("/employee-dashboard");
                      setSidebarOpen(false);
                    }}
                  >
                    Home
                  </button>
                  <button
                    className="text-left hover:bg-gray-700 p-3 rounded-lg bg-gray-700 transition-colors duration-200 text-white w-full"
                    onClick={() => {
                      navigate("/employee/add-entry-request");
                      setSidebarOpen(false);
                    }}
                  >
                    Missing Entry Request
                  </button>
                  <button
                    className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                    onClick={() => {
                      navigate("/employee/notifications");
                      setSidebarOpen(false);
                    }}
                  >
                    Notifications
                  </button>
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white">Menu</h2>
            </div>
            <nav className="flex flex-col space-y-4">
              <button
                className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                onClick={() => navigate("/employee-dashboard")}
              >
                Home
              </button>
              <button
                className="text-left hover:bg-gray-700 p-3 rounded-lg bg-gray-700 transition-colors duration-200 text-white w-full"
                onClick={() => navigate("/employee/add-entry-request")}
              >
                Missing Entry Request
              </button>
              <button
                className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                onClick={() => navigate("/employee/notifications")}
              >
                Notifications
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 ease-in-out lg:ml-72 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Info Banner */}
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Late Entry Submission</p>
                  <p>You can submit entries for the past 3 days. Please provide a valid reason for the late submission. Your request will be reviewed by your SPOC.</p>
                </div>
              </div>
            </div>

            {/* Request Form */}
            <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                  Missing Entry Request
                </h2>
                <div className="text-right">
                  <span className="text-xs text-red-600">* required fields</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Entry Date *">
                  <input
                    type="date"
                    className={`w-full h-9 text-sm px-3 rounded-2xl border-2 ${invalid.entryDate ? "border-red-500" : "border-slate-300"} focus:border-indigo-600`}
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    min={dateRange.min}
                    max={dateRange.max}
                  />
                  <div className="mt-1 text-xs text-slate-600">
                    Select a date from {new Date(dateRange.min).toLocaleDateString()} to {new Date(dateRange.max).toLocaleDateString()}
                  </div>
                </Field>

                <Field label="Work Mode *">
                  <Select
                    value={workMode}
                    onChange={setWorkMode}
                    options={["", ...WORK_MODES]}
                    labels={{ "": "— Select —" }}
                    isInvalid={invalid.workMode}
                  />
                </Field>

                <Field label="Project Search *">
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1" ref={suggestRef}>
                      <input
                        type="text"
                        placeholder="Start typing project name or ID…"
                        className={`w-full h-9 text-sm px-3 rounded-2xl border-2 ${invalid.projectId ? "border-red-500" : "border-slate-300"} focus:border-indigo-600`}
                        value={projectQuery}
                        onChange={(e) => {
                          setProjectQuery(e.target.value);
                          setProjectId("");
                          setProjectName("");
                          if (!e.target.value.trim()) setDueOn("");
                        }}
                        onBlur={() => {
                          const exact = suggestions.find(s => s.id === projectQuery.trim());
                          if (exact && !projectId) {
                            selectProject(exact);
                          }
                        }}
                      />
                      {loadingSuggestions && (
                        <div className="absolute right-3 top-2">
                          <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      {showSuggest && suggestions.length > 0 && (
                        <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border bg-white shadow-2xl">
                          {suggestions.map((s) => (
                            <li
                              key={s.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                selectProject(s);
                              }}
                              className="px-4 py-3 text-sm hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-900">{s.id}</div>
                              <div className="text-xs text-slate-600 mt-1">{s.name}</div>
                              {s.dueOn && <div className="text-xs text-orange-600 mt-1">Due: {s.dueOn}</div>}
                            </li>
                          ))}
                        </ul>
                      )}
                      {showSuggest && suggestions.length === 0 && !loadingSuggestions && projectQuery.trim() && (
                        <div className="absolute z-20 mt-2 w-full rounded-2xl border bg-white shadow-2xl px-4 py-3 text-sm text-slate-500">
                          No projects found for "{projectQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                </Field>

                <Field label="Task *">
                  <Select
                    value={task}
                    onChange={setTask}
                    options={["", ...TASKS]}
                    labels={{ "": "— Select —" }}
                    isInvalid={invalid.task}
                  />
                </Field>

                <Field label="Book Element *">
                  <Select
                    value={bookElement}
                    onChange={setBookElement}
                    options={["", ...bookElements]}
                    labels={{ "": "— Select —" }}
                    isInvalid={invalid.bookElement}
                  />
                </Field>

                <Field label="Chapter No. *">
                  <MultiSelectChips
                    value={chapterNumber}
                    onChange={setChapterNumber}
                    options={chapterNumbers}
                    placeholder="Select chapter(s)…"
                    isInvalid={invalid.chapterNumber}
                  />
                </Field>

                <Field label="Hours Spent *">
                  <Select
                    value={hoursSpent}
                    onChange={setHoursSpent}
                    options={["", ...HOURS]}
                    labels={{ "": "— Select —" }}
                    isInvalid={invalid.hoursSpent}
                  />
                </Field>

                <Field label="No. of Units *">
                  <div className="flex gap-2 items-start">
                    <input
                      type="number"
                      className={`flex-1 h-9 text-sm px-3 rounded-2xl border-2 ${invalid.unitsCount ? "border-red-500" : "border-slate-300"
                        } focus:border-indigo-600`}
                      placeholder="e.g., 10"
                      value={unitsCount}
                      onChange={(e) => setUnitsCount(e.target.value)}
                    />
                    <div className="w-28">
                      <Select
                        value={unitsType}
                        onChange={setUnitsType}
                        options={UNITS.map((u) => u.value)}
                        labels={UNITS.reduce((m, u) => {
                          m[u.value] = u.label;
                          return m;
                        }, {})}
                        isInvalid={invalid.unitsType}
                      />
                    </div>
                  </div>
                </Field>

                <Field label="Status *">
                  <Select
                    value={status}
                    onChange={setStatus}
                    options={["", ...STATUS]}
                    labels={{ "": "— Select —" }}
                    isInvalid={invalid.status}
                  />
                </Field>

                <Field label="Due On">
                  <input
                    type="date"
                    className="w-full h-9 text-sm px-3 rounded-2xl border-2 border-slate-300 focus:border-indigo-600"
                    value={dueOn}
                    onChange={(e) => setDueOn(e.target.value)}
                  />
                  {dueOn && <div className="mt-1 text-xs text-slate-600">Due: {new Date(dueOn).toLocaleDateString()}</div>}
                </Field>

                <Field label="Details">
                  <textarea
                    className="w-full min-h-[140px] text-sm px-3 py-2 rounded-2xl border-2 border-slate-300 focus:border-indigo-600"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any additional notes..."
                  />
                </Field>

                <Field label="Reason for Late Entry *">
                  <textarea
                    className={`w-full min-h-[140px] text-sm px-3 py-2 rounded-2xl border-2 ${invalid.lateReason ? "border-red-500" : "border-slate-300"} focus:border-indigo-600`}
                    value={lateReason}
                    onChange={(e) => setLateReason(e.target.value)}
                    placeholder="Explain why you're submitting this entry late..."
                  />
                </Field>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={clearForm}
                  className="w-full sm:w-auto px-4 py-1.5 rounded-2xl border-2 border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={!canSubmitRequest || !projectValid || submitting}
                  className={`w-full sm:w-auto px-5 py-1.5 rounded-2xl text-white transition-colors ${canSubmitRequest && projectValid && !submitting
                    ? "bg-indigo-700 hover:bg-indigo-800"
                    : "bg-slate-400 cursor-not-allowed"
                    }`}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>

            {submitMsg && <Feedback message={submitMsg} />}

            {/* Pending Requests */}
            <section className="mt-8 space-y-6">
              {loadingPending ? (
                <Feedback message="Loading pending requests..." />
              ) : pendingRequests.length > 0 ? (
                <RequestsBlock
                  title={`Pending Requests (${pendingRequests.length})`}
                  rows={pendingRequests}
                  showStatus={false}
                />
              ) : (
                <Feedback message="No pending requests." />
              )}

              {/* Past Requests */}
              {loadingPast ? (
                <Feedback message="Loading past requests..." />
              ) : pastRequests.length > 0 ? (
                <RequestsBlock
                  title={`Past Requests (${pastRequests.length})`}
                  rows={pastRequests}
                  showStatus={true}
                  subtle
                />
              ) : null}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block mb-1 text-xs font-medium text-slate-800">{label}</span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options, labels, isInvalid }) {
  const safeOptions = Array.isArray(options) ? options : [];
  const labelFor = (o) =>
    labels && typeof labels === "object" && Object.prototype.hasOwnProperty.call(labels, o) ? labels[o] : o;

  return (
    <select
      className={`w-full h-9 text-sm px-2 rounded-2xl border-2 ${isInvalid ? "border-red-500" : "border-slate-300"
        } focus:border-indigo-600`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {safeOptions.map((o, idx) => (
        <option key={idx} value={o}>
          {labelFor(o)}
        </option>
      ))}
    </select>
  );
}

function MultiSelectChips({ value = [], onChange, options = [], placeholder = "Select one or more…", isInvalid = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shellRef = useRef(null);
  const inputRef = useRef(null);
  const lastActionTs = useRef(0);

  useEffect(() => {
    const handleDown = (e) => {
      if (!shellRef.current) return;
      if (!shellRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, []);

  const deduped = useMemo(() => Array.from(new Set(options.map((o) => String(o)))), [options]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deduped.filter((o) => !value.includes(o)).filter((o) => (q ? o.toLowerCase().includes(q) : true));
  }, [deduped, value, query]);

  const guardOnce = () => {
    const now = Date.now();
    if (now - lastActionTs.current < 120) return false;
    lastActionTs.current = now;
    return true;
  };

  const addItem = (item) => {
    if (!guardOnce()) return;
    if (!value.includes(item)) onChange([...value, item]);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  const removeAt = (idx) => {
    if (!guardOnce()) return;
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={shellRef}>
      <div
        className={`min-h-[44px] w-full rounded-2xl border-2 bg-white px-2 py-1 flex flex-wrap items-center gap-2 cursor-text ${isInvalid ? "border-red-500" : "border-slate-300"
          } focus-within:border-indigo-600`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) e.preventDefault();
          setOpen(true);
          inputRef.current?.focus();
        }}
        role="combobox"
        aria-expanded={open}
      >
        {value.map((v, idx) => (
          <span
            key={`${v}-${idx}`}
            className="flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-[2px] text-xs"
          >
            {v}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeAt(idx);
              }}
              className="ml-1 rounded-full hover:bg-indigo-100 p-[2px] leading-none"
              aria-label={`Remove ${v}`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && query === "" && value.length) {
              removeAt(value.length - 1);
            }
          }}
          className="flex-1 min-w-[80px] outline-none text-sm px-1 py-1 bg-transparent"
          placeholder={value.length ? "" : placeholder}
        />
      </div>
      {open && (
        <div
          className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-2xl border bg-white shadow-2xl"
          role="listbox"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                role="option"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(opt);
                }}
                className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function RequestsBlock({ title, rows, showStatus = false, subtle = false }) {
  const HEADERS = [
    "Entry Date",
    "Work Mode",
    "Project Name", // Changed from "Project Name" to "Project ID"
    "Task",
    "Book Element",
    "Chapter No.",
    "Hours Spent",
    "No. of Units",
    "Unit Type",
    "Status",
    "Due On",
    "Details",
    "Reason for Late Entry",
  ];

  if (showStatus) {
    HEADERS.push("Request Status");
  }

  return (
    <div className={`rounded-2xl border ${subtle ? "border-slate-200 bg-white" : "border-slate-300 bg-slate-50"} shadow-sm`}>
      <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} className="px-3 py-2 font-semibold sticky top-0 bg-slate-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.workMode}</td>
                <td className="px-3 py-2 min-w-[14rem]">{r.projectId}</td> {/* Display projectId */}
                <td className="px-3 py-2">{r.task}</td>
                <td className="px-3 py-2">{r.bookElement}</td>
                <td className="px-3 py-2">{r.chapterNo}</td>
                <td className="px-3 py-2">{r.hoursSpent}</td>
                <td className="px-3 py-2">{r.noOfUnits}</td>
                <td className="px-3 py-2">{r.unitsType}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.dueOn}</td>
                <td className="px-3 py-2">{r.remarks}</td>
                <td className="px-3 py-2 min-w-[12rem]">{r.lateReason}</td>
                {showStatus && (
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      r.requestStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                      r.requestStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {r.requestStatus}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Feedback({ message }) {
  const isError = message && (message.includes("Error") || message.includes("Failed") || message.includes("failed"));
  const isSuccess = message && (message.includes("Successfully") || message.includes("submitted") || message.includes("success"));

  let bgColor = "bg-blue-50 border-blue-200 text-blue-900";
  if (isError) bgColor = "bg-red-50 border-red-200 text-red-900";
  if (isSuccess) bgColor = "bg-emerald-50 border-emerald-200 text-emerald-900";

  return <div className={`rounded-2xl border px-3 py-2 text-xs ${bgColor} mt-4`}>{message}</div>;
}