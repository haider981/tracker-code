// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

// export default function SpocDashboard() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   // Check authentication and decode user info
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
//         picture: decoded.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random&color=fff`
//       });
//     } catch (error) {
//       console.error("Invalid token:", error);
//       localStorage.removeItem("authToken");
//       navigate("/");
//     }
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     if (window.google && window.google.accounts && window.google.accounts.id) {
//       window.google.accounts.id.disableAutoSelect();
//     }
//     navigate("/");
//   };

//   if (!user) {
//     return <div className="min-h-screen bg-slate-100 flex items-center justify-center">
//       <div className="text-center">Loading...</div>
//     </div>;
//   }

//   return (
//     <div className="min-h-screen bg-slate-100 text-slate-900 text-sm">
//       {/* Fixed Navbar */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 sm:px-6 py-4 shadow-lg">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           {/* Left side - Title */}
//           <div className="flex flex-col">
//             <h1 className="text-lg sm:text-xl font-semibold tracking-tight">SPOC Dashboard - Work Log</h1>
//             <p className="text-xs opacity-90 hidden sm:block">Manage and review employee work log entries</p>
//           </div>

//           {/* Right side - User Info */}
//           <div className="flex items-center gap-3">
//             <div className="hidden sm:flex items-center gap-3">
//               <img 
//                 src={user.picture} 
//                 alt={user.name}
//                 className="w-10 h-10 rounded-full border-2 border-slate-600"
//               />
//               <div className="text-right">
//                 <div className="text-sm font-medium">Welcome, {user.name}</div>
//               </div>
//             </div>

//             {/* Mobile user info */}
//             <div className="sm:hidden flex items-center gap-2">
//               <img 
//                 src={user.picture} 
//                 alt={user.name}
//                 className="w-8 h-8 rounded-full border-2 border-slate-600"
//               />
//               <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ml-2"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content - Add proper padding-top to account for fixed navbar */}
//       <main className="pt-24 pb-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
//             <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">SPOC Dashboard Content</h2>
//             <p className="text-slate-600">
//               This is where you can manage and review employee work log entries.
//             </p>
//             {/* Add your SPOC dashboard content here */}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

// Constants moved to the top
const WORK_MODES = ["Leave", "In Office", "WFH", "On Duty", "Half Day", "OT Home", "OT Office", "Night"]
const STATUS = ["In Progress", "Delayed", "Completed"]
const HOURS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8"]
const TASKS = ["COM", "CR1", "CR2", "CR3", "CR4", "SET", "FER", "FINAL", "Coord", "Meet"]
const BASE_BOOK_ELEMENTS = [
  "Chapter",
  "Mind Map",
  "Title",
  "Diagram",
  "Solution",
  "Illustration",
  "Papers",
  "Lesson Plan",
  "Miscellaneous",
  "Projects",
  "Booklet",
]
const BASE_CHAPTER_NUMBERS = [
  "Papers",
  "Full Book",
  "Miscellaneous",
  "Projects",
  "Unit 1",
  "Unit 2",
  "Unit 3",
  "Unit 4",
  "Unit 5",
  ...Array.from({ length: 40 }, (_, i) => String(i + 1)),
]
const UNIT_TYPES = [
  { label: "pages", value: "pages" },
  { label: "frames", value: "frames" },
  { label: "seconds", value: "seconds" },
]

const PAST_ROWS = [
  {
    workMode: "In office",
    projectName: "UNI_Sem3_GJU_MacEco_BA_(Eng)_25-26",
    task: "SET",
    bookElement: "Chapter",
    chapterNo: "23",
    hoursSpent: 4,
    noOfUnits: 231,
    unitType: "pages",
    status: "In progress",
    dueOn: "31 Dec 2025",
    remarks: "abc",
    auditStatus: "Pending",
  },
  {
    workMode: "In office",
    projectName: "UNI_Sem3_KU_MacEco_BA_(Eng)_25-26",
    task: "SET",
    bookElement: "Chapter",
    chapterNo: "18",
    hoursSpent: 2,
    noOfUnits: 12,
    unitType: "frames",
    status: "Not approved",
    dueOn: "31 Dec 2025",
    remarks: "xyz",
    auditStatus: "Pending",
  },
]

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
)

const Select = ({ value, onChange, options, labels = {}, isInvalid = false }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full h-9 text-sm px-3 rounded-2xl border-2 ${
      isInvalid ? "border-red-500" : "border-slate-300"
    } focus:border-indigo-600 bg-white`}
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {labels[option] || option}
      </option>
    ))}
  </select>
)

const MultiSelectChips = ({ value, onChange, options, placeholder, isInvalid = false }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (option) => {
    const newValue = value.includes(option) ? value.filter((v) => v !== option) : [...value, option]
    onChange(newValue)
  }

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[36px] text-sm px-3 py-1 rounded-2xl border-2 ${
          isInvalid ? "border-red-500" : "border-slate-300"
        } focus:border-indigo-600 bg-white cursor-pointer flex flex-wrap gap-1 items-center`}
      >
        {value.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          value.map((item) => (
            <span key={item} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
              {item}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleOption(item)
                }}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-slate-300 rounded-2xl shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                value.includes(option) ? "bg-indigo-100 text-indigo-800" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const DataBlock = ({ title, rows, hideEdit = true, subtle = false, showAudit = false }) => (
  <div className={`bg-white rounded-2xl shadow p-4 sm:p-6 border border-slate-200 ${subtle ? "opacity-90" : ""}`}>
    <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
    {rows.length === 0 ? (
      <p className="text-slate-500 text-center py-8">No entries found</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2">Work Mode</th>
              <th className="text-left py-2 px-2">Project</th>
              <th className="text-left py-2 px-2">Task</th>
              <th className="text-left py-2 px-2">Element</th>
              <th className="text-left py-2 px-2">Chapter</th>
              <th className="text-left py-2 px-2">Hours</th>
              <th className="text-left py-2 px-2">Units</th>
              <th className="text-left py-2 px-2">Status</th>
              {showAudit && <th className="text-left py-2 px-2">Audit</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-slate-100">
                <td className="py-2 px-2">{row.workMode}</td>
                <td className="py-2 px-2 max-w-[200px] truncate">{row.projectName}</td>
                <td className="py-2 px-2">{row.task}</td>
                <td className="py-2 px-2">{row.bookElement}</td>
                <td className="py-2 px-2">{row.chapterNo}</td>
                <td className="py-2 px-2">{row.hoursSpent}</td>
                <td className="py-2 px-2">
                  {row.noOfUnits} {row.unitType}
                </td>
                <td className="py-2 px-2">{row.status}</td>
                {showAudit && <td className="py-2 px-2">{row.auditStatus}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)

const Feedback = ({ message }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
    <p className="text-blue-800 text-sm">{message}</p>
  </div>
)

export default function SpocDashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [workMode, setWorkMode] = useState("")
  const [projectQuery, setProjectQuery] = useState("")
  const [projectId, setProjectId] = useState(null)
  const [task, setTask] = useState("")
  const [bookElement, setBookElement] = useState("")
  const [chapterNumber, setChapterNumber] = useState([])
  const [hoursSpent, setHoursSpent] = useState("")
  const [status, setStatus] = useState("")
  const [unitsCount, setUnitsCount] = useState("")
  const [unitsType, setUnitsType] = useState("pages")
  const [dueOn, setDueOn] = useState("")
  const [remarks, setRemarks] = useState("")

  const [suggestions, setSuggestions] = useState([])
  const [showSuggest, setShowSuggest] = useState(false)
  const suggestRef = useRef(null)

  const [todayRows, setTodayRows] = useState([])
  const [pastRows, setPastRows] = useState(PAST_ROWS)
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/")
      return
    }

    try {
      const decoded = jwtDecode(token)
      setUser({
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        picture:
          decoded.picture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random&color=fff`,
      })
    } catch (error) {
      console.error("Invalid token:", error)
      localStorage.removeItem("authToken")
      navigate("/")
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect()
    }
    navigate("/")
  }

  useEffect(() => {
    const t = setTimeout(() => {
      const q = projectQuery.trim()
      if (!q) {
        setSuggestions([])
        return
      }
      const today = new Date()
      const dd = (n) => new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10)

      setSuggestions([
        {
          id: "p1",
          name: `UNI_Sem3_GJU_MacEco_BA_(Eng)_25-26 — ${q}`.slice(0, 60),
          dueDate: dd(142),
        },
        {
          id: "p2",
          name: `UNI_Sem3_KU_MacEco_BA_(Eng)_25-26 — ${q}`.slice(0, 60),
          dueDate: dd(135),
        },
      ])
      setShowSuggest(true)
    }, 200)
    return () => clearTimeout(t)
  }, [projectQuery])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!suggestRef.current) return
      if (!suggestRef.current.contains(e.target)) setShowSuggest(false)
    }
    window.addEventListener("mousedown", onClickOutside)
    return () => window.removeEventListener("mousedown", onClickOutside)
  }, [])

  const selectProject = (p) => {
    setProjectId(p.id)
    setProjectQuery(p.name)
    setDueOn(p.dueDate)
    setShowSuggest(false)
  }

  const showFullBook = useMemo(() => ["FER", "FINAL", "COM"].includes(task), [task])

  const bookElements = useMemo(
    () => (showFullBook ? ["Full Book", ...BASE_BOOK_ELEMENTS] : BASE_BOOK_ELEMENTS),
    [showFullBook],
  )

  const chapterNumbers = useMemo(
    () => (showFullBook ? BASE_CHAPTER_NUMBERS : BASE_CHAPTER_NUMBERS.filter((v) => v !== "Full Book")),
    [showFullBook],
  )

  const required = {
    workMode,
    projectQuery,
    task,
    bookElement,
    chapterNumber,
    hoursSpent,
    status,
    unitsCount,
    unitsType,
  }
  const isEmpty = (v) => (v == null ? true : Array.isArray(v) ? v.length === 0 : String(v).trim() === "")
  const invalid = Object.keys(required).reduce((acc, k) => ({ ...acc, [k]: isEmpty(required[k]) }), {})
  const canSubmit = Object.values(required).every((v) => !isEmpty(v))

  const clearForm = () => {
    setWorkMode("")
    setProjectQuery("")
    setProjectId(null)
    setTask("")
    setBookElement("")
    setChapterNumber([])
    setHoursSpent("")
    setStatus("")
    setUnitsCount("")
    setUnitsType("pages")
    setDueOn("")
    setRemarks("")
    setSubmitMsg(null)
  }

  const addRow = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const row = {
      workMode,
      projectName: projectQuery,
      task,
      bookElement,
      chapterNo: Array.isArray(chapterNumber) ? chapterNumber.join(", ") : chapterNumber,
      hoursSpent,
      noOfUnits: unitsCount,
      unitType: unitsType,
      status,
      dueOn,
      remarks,
    }
    setTodayRows((prev) => [...prev, row])
    clearForm()
  }

  async function submitTodaysWorklog() {
    if (todayRows.length === 0) return
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      const iso = new Date().toISOString().slice(0, 10)
      setPastRows((prev) => [
        ...todayRows.map((r) => ({
          ...r,
          _storedOn: iso,
          auditStatus: r.auditStatus ?? "Pending",
        })),
        ...prev,
      ])
      setTodayRows([])
      setSubmitMsg("Your recent entries have been submitted.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 text-sm">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 sm:px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">SPOC Dashboard - Work Log</h1>
            <p className="text-xs opacity-90 hidden sm:block">Manage and review employee work log entries</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <img
                src={user.picture || "/placeholder.svg"}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-slate-600"
              />
              <div className="text-right">
                <div className="text-sm font-medium">Welcome, {user.name}</div>
              </div>
            </div>
            <div className="sm:hidden flex items-center gap-2">
              <img
                src={user.picture || "/placeholder.svg"}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-slate-600"
              />
              <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content (padded for navbar) */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
            {/* Sidebar */}
            <aside className="bg-white rounded-2xl shadow p-4 h-fit border border-slate-200">
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/spoc/add-project")}
                  className="w-full rounded-xl border border-slate-300 hover:border-indigo-500 px-3 py-2 text-sm text-slate-800 hover:bg-indigo-50"
                >
                  Add Project
                </button>
                <button
                  onClick={() => navigate("/spoc/mark-night-shift")}
                  className="w-full rounded-xl border border-slate-300 hover:border-indigo-500 px-3 py-2 text-sm text-slate-800 hover:bg-indigo-50"
                >
                  Mark Night Shift
                </button>
                <button
                  onClick={() => navigate("/spoc/approve-worklogs")}
                  className="w-full rounded-xl border border-slate-300 hover:border-indigo-500 px-3 py-2 text-sm text-slate-800 hover:bg-indigo-50"
                >
                  Approve Worklogs
                </button>
                <button
                  onClick={() => navigate("/spoc/view-analysis")}
                  className="w-full rounded-xl border border-slate-300 hover:border-indigo-500 px-3 py-2 text-sm text-slate-800 hover:bg-indigo-50"
                >
                  View Analysis
                </button>
              </div>
            </aside>

            {/* Main Worklog Section */}
            <div className="w-full">
              <div className="mx-auto w-full max-w-[1200px] xl:max-w-[1400px]">
                {/* New Entry */}
                <form onSubmit={addRow} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-800">New Entry</h2>
                    <span className="text-xs text-red-600">* required fields</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Work Mode *">
                      <Select
                        value={workMode}
                        onChange={setWorkMode}
                        options={["", ...WORK_MODES]}
                        labels={{ "": "— Select —" }}
                        isInvalid={invalid.workMode}
                      />
                    </Field>

                    <Field label="Project Name *">
                      <div className="relative" ref={suggestRef}>
                        <input
                          type="text"
                          placeholder="Start typing…"
                          className={`w-full h-9 text-sm px-3 rounded-2xl border-2 ${invalid.projectQuery ? "border-red-500" : "border-slate-300"} focus:border-indigo-600`}
                          value={projectQuery}
                          onChange={(e) => {
                            setProjectQuery(e.target.value)
                            setProjectId(null)
                            setDueOn("")
                          }}
                        />
                        {showSuggest && suggestions.length > 0 && (
                          <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border bg-white shadow-2xl">
                            {suggestions.map((s) => (
                              <li
                                key={s.id}
                                onClick={() => selectProject(s)}
                                className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                              >
                                <div className="font-medium">{s.name}</div>
                                <div className="text-xs text-slate-600">Due on {s.dueDate}</div>
                              </li>
                            ))}
                          </ul>
                        )}
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
                        placeholder="Select one or more…"
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
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          className={`flex-1 h-9 text-sm px-3 rounded-2xl border-2 ${invalid.unitsCount ? "border-red-500" : "border-slate-300"} focus:border-indigo-600`}
                          placeholder="e.g., 10"
                          value={unitsCount}
                          onChange={(e) => setUnitsCount(e.target.value)}
                        />
                        <div className="w-20">
                          <Select
                            value={unitsType}
                            onChange={setUnitsType}
                            options={UNIT_TYPES.map((u) => u.value)}
                            labels={UNIT_TYPES.reduce((m, u) => {
                              m[u.value] = u.label
                              return m
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
                    </Field>

                    <Field label="Details">
                      <textarea
                        className="w-full min-h-[160px] text-sm px-3 py-2 rounded-2xl border-2 border-slate-300"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add any details (optional)…"
                      />
                    </Field>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={clearForm}
                      className="px-4 py-1.5 rounded-2xl border-2 border-slate-300"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`px-5 py-1.5 rounded-2xl text-white ${canSubmit ? "bg-indigo-700 hover:bg-indigo-800" : "bg-slate-400 cursor-not-allowed"}`}
                    >
                      Add this entry in Today&apos;s Worklog
                    </button>
                  </div>
                </form>

                {/* Today / Submit / Past */}
                <section className="mt-8 space-y-6">
                  {todayRows.length > 0 ? (
                    <DataBlock title="Today&apos;s Worklog" rows={todayRows} hideEdit={false} />
                  ) : (
                    <Feedback message={submitMsg ?? "No entries for today yet."} />
                  )}

                  <div className="flex items-center justify-center">
                    <button
                      onClick={submitTodaysWorklog}
                      disabled={submitting || todayRows.length === 0}
                      className="px-5 py-1.5 rounded-2xl text-white bg-emerald-700 disabled:opacity-60 hover:bg-emerald-800"
                    >
                      {submitting ? "Submitting…" : "Submit Today's Worklog"}
                    </button>
                  </div>

                  <DataBlock title="Past 7 Days Worklog" rows={pastRows} subtle hideEdit showAudit />
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



