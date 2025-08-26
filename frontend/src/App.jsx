import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css"
import Login from "./components/Login";
import EmployeeDashboard from "./components/EmployeeDashboard";
import SpocDashboard from "./components/SpocDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/spoc-dashboard" element={<SpocDashboard />} />
      </Routes>
    </Router>
  );
}
