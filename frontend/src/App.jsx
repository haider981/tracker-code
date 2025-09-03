import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css"
import Login from "./components/Login";
import EmployeeDashboard from "./components/EmployeeDashboard";
import SpocDashboard from "./components/SpocDashboard";
import SpocAddProject from "./components/SpocAddProject";
import SpocApproveWorklogs from "./components/SpocApproveWorklogs";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/spoc-dashboard" element={<SpocDashboard />} />
        <Route path="/spoc/add-project" element={<SpocAddProject />} />
        <Route path="/spoc/approve-worklogs" element={<SpocApproveWorklogs />} />
      </Routes>
    </Router>
  );
}
