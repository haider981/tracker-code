import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Filter as FilterIcon,
  Plus,
  Trash2,
  Search,
  X as XIcon,
  Edit3,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

/* =================== MAIN PAGE =================== */
export default function AdminHandleEmployees() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Employees State
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add Employee Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    spoc_name: "",
    spoc_email: "",
    team: "",
    role: "Employee",
  });

  // Edit Employee Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  // Success/Error messages
  const [successMessage, setSuccessMessage] = useState("");

  /* ------------------ AUTH ------------------ */
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

  /* ------------------ FETCH EMPLOYEES ------------------ */
  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/admin/user", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data); // Debug log

      // Handle different response structures
      let employeesArray = [];
      if (Array.isArray(data)) {
        employeesArray = data;
      } else if (data && Array.isArray(data.users)) {
        employeesArray = data.users;
      } else if (data && Array.isArray(data.data)) {
        employeesArray = data.data;
      } else if (data && typeof data === 'object') {
        // If it's an object but not an array, wrap it
        employeesArray = [data];
      }

      console.log("Processed employees:", employeesArray); // Debug log
      setEmployees(employeesArray);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to fetch employees. Please try again.");
      setEmployees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  /* ------------------ FILTER ------------------ */
  useEffect(() => {
    // Ensure employees is always an array
    if (!Array.isArray(employees)) {
      console.warn("employees is not an array:", employees);
      setFilteredEmployees([]);
      return;
    }

    let filtered = [...employees]; // Create a copy

    if (teamFilter) {
      const normalizedFilter = teamFilter.toLowerCase().replace(/_/g, " ").trim();

      filtered = filtered.filter((emp) => {
        if (!emp || !emp.team) return false;

        const normalizedTeam = emp.team.toLowerCase().replace(/_/g, " ").trim();
        return normalizedTeam.includes(normalizedFilter);
      });
    }



    if (searchQuery) {
      filtered = filtered.filter(
        (emp) => {
          if (!emp) return false;
          const name = emp.name || "";
          const email = emp.email || "";
          return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());
        }
      );
    }

    console.log("Filtered employees:", filtered); // Debug log
    setFilteredEmployees(filtered);
  }, [teamFilter, searchQuery, employees]);

  /* ------------------ ADD ------------------ */
  const handleAdd = async () => {
    // Validation
    if (!newEmployee.name || !newEmployee.email || !newEmployee.team) {
      setError("Please fill in all required fields (Name, Email, Team)");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployee.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const saved = await res.json();
      setEmployees((prev) => [...prev, saved]);
      setAddModalOpen(false);
      setNewEmployee({
        name: "",
        email: "",
        spoc_name: "",
        spoc_email: "",
        team: "",
        role: "Employee",
      });
      setSuccessMessage("Employee added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error adding employee:", err);
      setError(err.message || "Failed to add employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ EDIT ------------------ */
  const handleEdit = (employee) => {
    setEditEmployee({ ...employee });
    setEditModalOpen(true);
    setError("");
  };

  const handleSaveEdit = async () => {
    // Validation
    if (!editEmployee.name || !editEmployee.email || !editEmployee.team) {
      setError("Please fill in all required fields (Name, Email, Team)");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmployee.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const empId = editEmployee.id || editEmployee._id;
      const res = await fetch(
        `http://localhost:5000/api/admin/users/${empId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(editEmployee),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const updated = await res.json();
      setEmployees((prev) =>
        prev.map((emp) => {
          const currentId = emp.id || emp._id;
          const updatedId = updated.id || updated._id;
          return currentId === updatedId ? updated : emp;
        })
      );
      setEditModalOpen(false);
      setEditEmployee(null);
      setSuccessMessage("Employee updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(err.message || "Failed to update employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ DELETE ------------------ */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee?"))
      return;

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      setEmployees((prev) => prev.filter((emp) => {
        const empId = emp.id || emp._id;
        return empId !== id;
      }));
      setSuccessMessage("Employee deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(err.message || "Failed to delete employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ LOGOUT ------------------ */
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  /* ------------------ CLEAR MESSAGES ------------------ */
  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <Navbar
        user={user}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
            <SidebarLinks
              navigate={navigate}
              location={location}
              close={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}
      <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
        <SidebarLinks navigate={navigate} location={location} />
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 pt-20 p-6">
        <div className="space-y-6">
          {/* Success/Error Messages */}
          {(successMessage || error) && (
            <MessageAlert
              message={successMessage || error}
              type={successMessage ? "success" : "error"}
              onClose={clearMessages}
            />
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-slate-600">Processing...</span>
            </div>
          )}

          {/* Filters */}
          <Filters
            teamFilter={teamFilter}
            setTeamFilter={setTeamFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setAddModalOpen={setAddModalOpen}
            onRefresh={fetchEmployees}
            loading={loading}
          />

          {/* Employees Table */}
          <EmployeesTable
            filteredEmployees={filteredEmployees}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            loading={loading}
          />
        </div>
      </main>

      {/* Add Employee Modal */}
      {addModalOpen && (
        <Modal onClose={() => setAddModalOpen(false)} title="Add Employee">
          <EmployeeForm
            employee={newEmployee}
            setEmployee={setNewEmployee}
            onSubmit={handleAdd}
            onCancel={() => setAddModalOpen(false)}
            loading={loading}
            error={error}
            setError={setError}
          />
        </Modal>
      )}

      {/* Edit Employee Modal */}
      {editModalOpen && editEmployee && (
        <Modal onClose={() => setEditModalOpen(false)} title="Edit Employee">
          <EmployeeForm
            employee={editEmployee}
            setEmployee={setEditEmployee}
            onSubmit={handleSaveEdit}
            onCancel={() => setEditModalOpen(false)}
            isEdit
            loading={loading}
            error={error}
            setError={setError}
          />
        </Modal>
      )}
    </div>
  );
}

/* =================== COMPONENTS =================== */
function MessageAlert({ message, type, onClose }) {
  return (
    <div className={`rounded-lg p-4 flex items-center justify-between ${type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
      }`}>
      <div className="flex items-center">
        {type === "success" ? (
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
        )}
        <p className={`text-sm font-medium ${type === "success" ? "text-green-800" : "text-red-800"
          }`}>
          {message}
        </p>
      </div>
      <button onClick={onClose} className={`${type === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"
        }`}>
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

function Navbar({ user, handleLogout, mobileMenuOpen, setMobileMenuOpen, sidebarOpen, setSidebarOpen }) {
  return (
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
            <h1 className="text-lg sm:text-xl font-semibold">Admin Dashboard - Employees</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-slate-600" />
            <div className="text-right">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-slate-300">{user.email}</div>
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

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700">
            <div className="px-3 py-3 bg-slate-800 flex items-center rounded-lg">
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-slate-600" />
              <div className="ml-3">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-slate-slate-300">{user.email}</div>
              </div>
            </div>
            <div className="px-3 py-3">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Filters({ teamFilter, setTeamFilter, searchQuery, setSearchQuery, setAddModalOpen, onRefresh, loading }) {
  return (
    <div className="rounded-xl shadow-md border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FilterIcon className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">TEAM</label>
          <div className="flex items-center border rounded-lg bg-white px-3 py-2 shadow-sm w-full">
            <Search className="w-4 h-4 text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Search by team..."
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">EMPLOYEE</label>
          <div className="flex items-center border rounded-lg bg-white px-3 py-2 shadow-sm w-full">
            <Search className="w-4 h-4 text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 sm:self-end">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeesTable({ filteredEmployees, handleDelete, handleEdit, loading }) {
  // Ensure filteredEmployees is always an array
  const safeEmployees = Array.isArray(filteredEmployees) ? filteredEmployees : [];

  if (loading && safeEmployees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-slate-600">Loading employees...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Spoc Name</Th>
              <Th>Spoc Email</Th>
              <Th>Team</Th>
              <Th>Role</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {safeEmployees.map((emp, index) => {
              // Ensure emp is an object and has an id
              if (!emp || typeof emp !== 'object') {
                console.warn(`Invalid employee at index ${index}:`, emp);
                return null;
              }
              const empId = emp.id || emp._id || index; // Fallback to index if no id

              return (
                <tr key={empId} className="border-t hover:bg-slate-50">
                  <Td>{emp.name || "N/A"}</Td>
                  <Td>{emp.email || "N/A"}</Td>
                  <Td>{emp.spoc_name || "N/A"}</Td>
                  <Td>{emp.spoc_email || "N/A"}</Td>
                  <Td>{emp.team || "N/A"}</Td>
                  <Td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.role === "ADMIN"
                      ? "bg-red-100 text-red-800"
                      : emp.role === "Spoc"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                      }`}>
                      {emp.role || "Employee"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-3 py-1 rounded-md"
                        onClick={() => handleEdit(emp)}
                        disabled={loading}
                        title="Edit Employee"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-3 py-1 rounded-md"
                        onClick={() => handleDelete(empId)}
                        disabled={loading}
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden divide-y divide-slate-200">
        {safeEmployees.map((emp, index) => {
          // Ensure emp is an object and has an id
          if (!emp || typeof emp !== 'object') {
            console.warn(`Invalid employee at index ${index}:`, emp);
            return null;
          }
          const empId = emp.id || emp._id || index; // Fallback to index if no id

          return (
            <div key={empId} className="p-4">
              <p className="font-semibold text-slate-800">{emp.name || "N/A"}</p>
              <p className="text-sm text-slate-600">{emp.email || "N/A"}</p>
              <p className="mt-1 text-sm">
                <span className="font-medium">Spoc:</span> {emp.spoc_name || "N/A"}
                {emp.spoc_email && ` (${emp.spoc_email})`}
              </p>
              <p className="text-sm"><span className="font-medium">Team:</span> {emp.team || "N/A"}</p>
              <p className="text-sm">
                <span className="font-medium">Role:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${emp.role === "ADMIN"
                  ? "bg-red-100 text-red-800"
                  : emp.role === "Spoc"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                  }`}>
                  {emp.role || "Employee"}
                </span>
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-3 py-1 rounded-md text-sm"
                  onClick={() => handleEdit(emp)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-3 py-1 rounded-md text-sm"
                  onClick={() => handleDelete(empId)}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        {safeEmployees.length === 0 && !loading && (
          <p className="text-center text-slate-500 py-6">No employees found.</p>
        )}
      </div>
    </div>
  );
}

function EmployeeForm({ employee, setEmployee, onSubmit, onCancel, isEdit, loading, error, setError }) {
  const roles = ["Employee", "ADMIN", "Spoc"];

  const handleInputChange = (field, value) => {
    setEmployee({ ...employee, [field]: value });
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["name", "email", "spoc_name", "spoc_email", "team"].map((field) => (
          <div key={field}>
            <label className="block text-xs font-medium text-slate-700 mb-1 capitalize">
              {field.replace("_", " ")}
              {(field === "name" || field === "email" || field === "team") && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type={field === "email" || field === "spoc_email" ? "email" : "text"}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={employee[field] || ""}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={field === "email" || field === "spoc_email" ? "example@company.com" : ""}
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Role <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={employee.role || "Employee"}
            onChange={(e) => handleInputChange("role", e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-slate-800 disabled:bg-gray-100"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white flex items-center gap-2"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          {isEdit ? "Save Changes" : "Add Employee"}
        </button>
      </div>
    </div>
  );
}

function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}

function Td({ children }) {
  return <td className="px-4 py-3">{children}</td>;
}

/* =================== SIDEBAR =================== */
function SidebarLinks({ navigate, location, close }) {
  const [openWorklogs, setOpenWorklogs] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);

  // Keep sections open if child page active
  useEffect(() => {
    if (location.pathname.includes("worklog")) setOpenWorklogs(true);
    if (location.pathname.includes("project") || location.pathname.includes("abbreviations"))
      setOpenProjects(true);
  }, [location]);

  const handleNavigation = (path) => {
    navigate(path);
    if (close) close();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
      <nav className="flex flex-col space-y-2">

        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${location.pathname === "/admin-dashboard" ? "bg-gray-700" : ""
            }`}
          onClick={() => handleNavigation("/admin-dashboard")}
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
            <span className="transition-transform duration-200">
              {openWorklogs ? "▾" : "▸"}
            </span>
          </button>
          {openWorklogs && (
            <div className="ml-4 mt-2 flex flex-col space-y-2 animate-fadeIn">
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("approve-worklogs") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/approve-worklogs")}
              >
                Approve Worklogs
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("edit-worklog-entries") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/edit-worklog-entries")}
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
          onClick={() => handleNavigation("/admin/handle-employees")}
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
            <span className="transition-transform duration-200">
              {openProjects ? "▾" : "▸"}
            </span>
          </button>
          {openProjects && (
            <div className="ml-4 mt-2 flex flex-col space-y-2 animate-fadeIn">
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-abbreviations") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/add-abbreviations")}
              >
                Add Abbreviations
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("add-project") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/add-project")}
              >
                Add Project
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${location.pathname.includes("project-requests") ? "bg-gray-700" : ""
                  }`}
                onClick={() => handleNavigation("/admin/project-requests")}
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

