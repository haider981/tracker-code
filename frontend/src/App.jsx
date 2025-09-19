import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css"
import Login from "./components/Login";
import EmployeeDashboard from "./components/EmployeeDashboard";
import SpocDashboard from "./components/SpocDashboard";
import SpocAddProject from "./components/SpocAddProject";
import SpocApproveWorklogs from "./components/SpocApproveWorklogs";
import MarkNightShift from "./components/MarkNightShift";

import AdminDashboard from "./components/AdminDashboard";
import AdminAddProject from "./components/AdminAddProject";
import AdminAddAbbreviations from "./components/AdminAddAbbreviations";
import AdminProjectRequests from "./components/AdminProjectRequests";
import AdminHandleEmployees from "./components/AdminHandleEmployees";
import AdminEmployeesInfo from "./components/AdminEmployeesInfo";
import AdminApproveWorklogs from "./components/AdminApproveWorklogs";
import AdminEditWorklogEntries from "./components/AdminEditWorklogEntries";
import AdminDefaultersList from "./components/AdminDefaultersList";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/spoc-dashboard" element={<SpocDashboard />} />
        <Route path="/spoc/add-project" element={<SpocAddProject />} />
        <Route path="/spoc/approve-worklogs" element={<SpocApproveWorklogs />} />
        <Route path="/spoc/mark-night-shift" element={<MarkNightShift />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-project" element={<AdminAddProject />} />
        <Route path="/admin/add-abbreviations" element={<AdminAddAbbreviations />} />
        <Route path="/admin/project-requests" element={<AdminProjectRequests />} />
        <Route path="/admin/handle-employees" element={<AdminHandleEmployees />} />
        <Route path="/admin/employees-info" element={<AdminEmployeesInfo />} />
        <Route path="/admin/approve-worklogs" element={<AdminApproveWorklogs />} />
        <Route path="/admin/edit-worklog-entries" element={<AdminEditWorklogEntries />} />
        <Route path="/admin/defaulters-list" element={<AdminDefaultersList />} />

      </Routes>
    </Router>
  );
}