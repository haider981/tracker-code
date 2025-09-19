import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ---- Mock data (replace with API later) ----
  const attendance = {
    leave: 8,
    wfh: 12,
    halfleave1: 2,
    halfleave2: 3,
    wfh1: 4,
    wfh2: 3,
  };

  const recentWorklogs = [
    { id: 1, date: "2025-08-22", employee: "Rohan K.", project: "UNI_Sem3_GJU_MacEco_BA_(Eng)_25-26", task: "SET", hours: 4, status: "In Progress" },
    { id: 2, date: "2025-08-22", employee: "Naina S.", project: "UNI_Sem3_KU_MacEco_BA_(Eng)_25-26", task: "COM", hours: 2.5, status: "Completed" },
    { id: 3, date: "2025-08-21", employee: "Arjun M.", project: "GJU_Micro_BSc_(Eng)_25-26", task: "CR2", hours: 3, status: "Delayed" },
    { id: 4, date: "2025-08-21", employee: "Isha T.", project: "KU_Eco_BA_(Eng)_25-26", task: "FER", hours: 1.5, status: "In Progress" },
    { id: 5, date: "2025-08-20", employee: "Ritika P.", project: "StateBoard_Physics_XI", task: "FINAL", hours: 5, status: "Completed" },
  ];

  const upcoming = [
    { id: "p1", name: "UNI_Sem3_GJU_MacEco_BA_(Eng)_25-26", due: "2025-09-02" },
    { id: "p2", name: "UNI_Sem3_KU_MacEco_BA_(Eng)_25-26", due: "2025-09-06" },
    { id: "p3", name: "StateBoard_Physics_XI", due: "2025-09-12" },
    { id: "p4", name: "CBSE_Math_X", due: "2025-09-18" },
  ];

  // 🔑 Check token and set user
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
            <SidebarLinks navigate={navigate} setSidebarOpen={setSidebarOpen} />
          </aside>
        </div>
      )}
      <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
        <SidebarLinks navigate={navigate} />
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 pt-20 p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-slate-100 to-rose-50" />
          <div className="relative max-w-[1700px] mx-auto px-6 py-8 space-y-8">
            {/* Stat cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard title="Employees" value="120" accent="from-indigo-500/30 to-purple-500/30" />
              <StatCard title="Worklog Entries" value="20,000" accent="from-emerald-500/30 to-teal-500/30" />
              <StatCard title="Active Projects" value="150" accent="from-pink-500/30 to-fuchsia-500/30" />
              <StatCard title="Total Working Hours" value="58,000 hrs" accent="from-amber-500/30 to-orange-500/30" />
            </section>

            {/* Attendance + Deadlines */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceCard attendance={attendance} />
              <DeadlinesList items={upcoming} />
            </section>

            {/* Recent Worklogs */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Recent Worklogs</h2>
                <button
                  onClick={() => navigate("/admin/approve-worklogs")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  View all →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2 pr-6">Date</th>
                      <th className="py-2 pr-6">Employee</th>
                      <th className="py-2 pr-6">Project</th>
                      <th className="py-2 pr-6">Task</th>
                      <th className="py-2 pr-6">Hours</th>
                      <th className="py-2 pr-6">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorklogs.map((r, idx) => (
                      <tr key={r.id} className={`border-t ${idx % 2 === 1 ? "bg-slate-50/60" : ""}`}>
                        <td className="py-3 pr-6 whitespace-nowrap">{r.date}</td>
                        <td className="py-3 pr-6 whitespace-nowrap">{r.employee}</td>
                        <td className="py-3 pr-6">{r.project}</td>
                        <td className="py-3 pr-6 whitespace-nowrap">{r.task}</td>
                        <td className="py-3 pr-6 whitespace-nowrap">{r.hours}</td>
                        <td className="py-3 pr-6 whitespace-nowrap">
                          <StatusBadge value={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Collapsible Sidebar Links with auto-open */
function SidebarLinks({ navigate, setSidebarOpen }) {
  const close = () => setSidebarOpen && setSidebarOpen(false);
  const location = useLocation();

  const [openWorklogs, setOpenWorklogs] = useState(location.pathname.includes("worklog"));
  const [openEmployees, setOpenEmployees] = useState(location.pathname.includes("employees"));
  const [openProjects, setOpenProjects] = useState(location.pathname.includes("project") || location.pathname.includes("abbreviations"));

  useEffect(() => {
    if (location.pathname.includes("worklog")) setOpenWorklogs(true);
    if (location.pathname.includes("employees")) setOpenEmployees(true);
    if (location.pathname.includes("project") || location.pathname.includes("abbreviations")) setOpenProjects(true);
  }, [location]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
      <nav className="flex flex-col space-y-2">
        {/* Home */}
        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg ${location.pathname === "/admin-dashboard" ? "bg-gray-700" : ""}`}
          onClick={() => {navigate("/admin-dashboard"); close();}}
        >
          Home
        </button>

        {/* Worklogs */}
        <div>
          <button className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg"
            onClick={() => setOpenWorklogs(!openWorklogs)}>
            <span>Worklogs</span>
            <span>{openWorklogs ? "▾" : "▸"}</span>
          </button>
          {openWorklogs && (
            <div className="ml-4 mt-2 flex flex-col space-y-2">
              <button className={`text-left hover:bg-gray-700 p-2 rounded-lg ${location.pathname.includes("approve-worklogs") ? "bg-gray-700" : ""}`}
                onClick={() => {navigate("/admin/approve-worklogs"); close();}}>
                Approve Worklogs
              </button>
              <button className={`text-left hover:bg-gray-700 p-2 rounded-lg ${location.pathname.includes("edit-worklog-entries") ? "bg-gray-700" : ""}`}
                onClick={() => {navigate("/admin/edit-worklog-entries"); close();}}>
                Edit Worklogs
              </button>
            </div>
          )}
        </div>

        {/* Employees */}
        <div>
          <button className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg"
            onClick={() => setOpenEmployees(!openEmployees)}>
            <span>Employees</span>
            <span>{openEmployees ? "▾" : "▸"}</span>
          </button>
          {openEmployees && (
            <div className="ml-4 mt-2 flex flex-col space-y-2">
              <button className={`text-left hover:bg-gray-700 p-2 rounded-lg ${location.pathname.includes("handle-employees") ? "bg-gray-700" : ""}`}
                onClick={() => {navigate("/admin/handle-employees"); close();}}>
                Handle Employees
              </button>
              <button className={`text-left hover:bg-gray-700 p-2 rounded-lg ${location.pathname.includes("employees-info") ? "bg-gray-700" : ""}`}
                onClick={() => {navigate("/admin/employees-info"); close();}}>
                Employees Info
              </button>
            </div>
          )}
        </div>

        {/* Projects */}
        <div>
          <button className="w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg"
            onClick={() => setOpenProjects(!openProjects)}>
            <span>Projects</span>
            <span>{openProjects ? "▾" : "▸"}</span>
          </button>
          {openProjects && (
            <div className="ml-4 mt-2 flex flex-col space-y-2">
              <button className={`text-left hover:bg-gray-700 p-2 rounded-lg ${location.pathname.includes("add-abbreviations") ? "bg-gray-700" : ""}`}
                onClick={() => {navigate("/admin/add-abbreviations"); close();}}>
                Add Abbreviations
              </button>
              <button className={`text-left hover:bg-gray-700 p-2 rounded-lg ${location.pathname.includes("add-project") ? "bg-gray-700" : ""}`}
                onClick={() => {navigate("/admin/add-project"); close();}}>
                Add Project
              </button>
              <button className={`text-left hover:bg-gray-700 p-2 rounded-lg ${location.pathname.includes("project-requests") ? "bg-gray-700" : ""}`}
                onClick={() => {navigate("/admin/project-requests"); close();}}>
                Project Requests
              </button>
            </div>
          )}
        </div>

        {/* Defaulters */}
        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg ${location.pathname.includes("defaulters-list") ? "bg-gray-700" : ""}`}
          onClick={() => {navigate("/admin/defaulters-list"); close();}}
        >
          Defaulters List
        </button>
      </nav>
    </div>
  );
}

/* ----- Sub Components ----- */
function StatCard({ title, value, accent }) {
  return (
    <div className="relative rounded-2xl p-6 backdrop-blur-xl bg-white/40 border border-white/30 shadow-xl overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-80`} />
      <div className="relative">
        <p className="text-sm font-medium text-slate-700/90">{title}</p>
        <p className="text-4xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function AttendanceCard({ attendance }) {
  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Today's Attendance</h3>
      <div className="grid grid-cols-2 gap-3">
        <AttendanceItem label="Full Day Leave" value={attendance.leave} color="bg-rose-800" />
        <AttendanceItem label="WFH" value={attendance.wfh} color="bg-emerald-600" />
        <AttendanceItem label="1st Half Leave" value={attendance.halfleave1} color="bg-violet-600" />
        <AttendanceItem label="2nd Half Leave" value={attendance.halfleave2} color="bg-red-600" />
        <AttendanceItem label="1st Half WFH" value={attendance.wfh1} color="bg-orange-600" />
        <AttendanceItem label="2nd Half WFH" value={attendance.wfh2} color="bg-blue-600" />
      </div>
      <button
        onClick={() => window.location.assign("/admin/calendar")}
        className="inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Open calendar →
      </button>
    </div>
  );
}

function AttendanceItem({ label, value, color }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/50 border border-white/30 px-4 py-3 shadow">
      <span className="text-sm text-slate-700 font-medium">{label}</span>
      <span className={`text-base font-bold text-white px-2.5 py-1 rounded-full ${color}`}>
        {value}
      </span>
    </div>
  );
}

function DeadlinesList({ items = [] }) {
  const today = new Date();
  const daysLeft = (due) => {
    const d = new Date(due);
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  };
  const tone = (n) =>
    n <= 3
      ? "bg-rose-100 text-rose-700"
      : n <= 7
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Upcoming Deadlines</h3>
      <ul className="space-y-3">
        {items.map((p) => {
          const n = daysLeft(p.due);
          return (
            <li key={p.id} className="flex items-center justify-between rounded-xl bg-white/50 border border-white/30 px-4 py-3 shadow">
              <div>
                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-600">Due {p.due}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tone(n)}`}>{n} days</span>
            </li>
          );
        })}
      </ul>
      <button
        onClick={() => window.location.assign("/admin/projects")}
        className="inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Manage projects →
      </button>
    </div>
  );
}

function StatusBadge({ value }) {
  const map = {
    "Completed": "bg-emerald-100 text-emerald-700",
    "In Progress": "bg-indigo-100 text-indigo-700",
    "Delayed": "bg-rose-100 text-rose-700",
  };
  const cls = map[value] || "bg-slate-100 text-slate-700";
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{value}</span>;
}