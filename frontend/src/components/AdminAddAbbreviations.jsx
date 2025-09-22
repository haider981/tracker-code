import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X as XIcon,
  AlertCircle,
  CheckCircle,
  Filter as FilterIcon,
  Search,
} from "lucide-react";

/* =========================
   DUMMY DATA (per TAB)
   ========================= */
const UNI_DATA = {
  "Class/Sem": [
    { full: "Pre-Primary", abbr: "PrePrim" },
    { full: "Nursery", abbr: "Nursery" },
    { full: "LKG", abbr: "LKG" },
    { full: "UKG", abbr: "UKG" },
    { full: "1st", abbr: "1st" },
    { full: "2nd", abbr: "2nd" },
    { full: "3rd", abbr: "3rd" },
    { full: "4th", abbr: "4th" },
    { full: "5th", abbr: "5th" },
    { full: "6th", abbr: "6th" },
    { full: "7th", abbr: "7th" },
    { full: "8th", abbr: "8th" },
  ],
  "Board/Uni": [
    { full: "Assam", abbr: "ABSE" },
    { full: "Bihar", abbr: "BSEB" },
    { full: "Central", abbr: "CBSE" },
    { full: "Haryana", abbr: "HBSE" },
    { full: "Himachal Pradesh", abbr: "HPBSE" },
    { full: "Indian (10)", abbr: "ICSE" },
    { full: "Indian (12)", abbr: "ISC" },
    { full: "Jammu & Kashmir", abbr: "JKBSE" },
    { full: "Jharkhand", abbr: "JBSE" },
    { full: "Manipur", abbr: "MBSE" },
    { full: "Nagaland", abbr: "NBSE" },
    { full: "Orissa", abbr: "CHSE" },
    { full: "Punjab", abbr: "PBSE" },
    { full: "Ranker Commerce", abbr: "RankCom" },
    { full: "Tamil Nadu", abbr: "TNSB" },
    { full: "Kerala", abbr: "KBPE" },
    { full: "Maharashtra", abbr: "MSB" },
  ],
  Subject: [
    { full: "Art", abbr: "Art" },
    { full: "Atlas", abbr: "Atlas" },
    { full: "Assamese", abbr: "Asm" },
    { full: "Biology", abbr: "Bio" },
    { full: "Chemistry", abbr: "Chem" },
    { full: "Computer", abbr: "Comp" },
    { full: "English", abbr: "Eng" },
    { full: "Environmental Studies", abbr: "EVS" },
    { full: "French", abbr: "French" },
    { full: "Geography", abbr: "Geo" },
    { full: "German", abbr: "Germ" },
    { full: "General Awareness", abbr: "GA" },
    { full: "General Knowledge", abbr: "GK" },
    { full: "Hindi", abbr: "Hin" },
    { full: "History", abbr: "Hist" },
    { full: "History & Civics", abbr: "HistCiv" },
    { full: "Malayalam", abbr: "Malym" },
    { full: "Marathi", abbr: "Marathi" },
    { full: "Mathematics", abbr: "Math" },
    { full: "Moral Values", abbr: "MV" },
    { full: "Odia", abbr: "Odia" },
    { full: "Physics", abbr: "Phys" },
    { full: "Russian", abbr: "Russ" },
  ],
  "Series/Author": [
    { full: "Art with Angie", abbr: "Angie" },
    { full: "Colour Me", abbr: "ColourMe" },
    { full: "Learn to Create", abbr: "LCreate" },
    { full: "Learn, Draw & Colour", abbr: "LDC" },
    { full: "Art & Craft", abbr: "Art&Cr(Hyd)" },
    { full: "Skills in Creative Art", abbr: "SkillCArt" },
    { full: "Map Workbook", abbr: "MapWB" },
    { full: "Middle Atlas", abbr: "Mid" },
    { full: "Primary Atlas", abbr: "Prim" },
    { full: "Senior Atlas", abbr: "Snr" },
    { full: "ICSE Innovative Biology", abbr: "InnoBio" },
    { full: "ICSE Innovative Chemistry", abbr: "InnoChem" },
    { full: "Artificial Intelligence", abbr: "AI" },
    { full: "Computer Fun", abbr: "CompFun" },
    { full: "Future Kids Computers", abbr: "FKComp" },
    { full: "On Clouds", abbr: "Clouds" },
    { full: "English with Elmo (Capital)", abbr: "Elmo(cap)" },
    { full: "English with Elmo (Small)", abbr: "Elmo(small)" },
    { full: "Go Grammar", abbr: "GGram" },
    { full: "Know Your Grammar", abbr: "KYGram" },
    { full: "Pattern with Patsy", abbr: "Patsy" },
    { full: "Pearls MCB", abbr: "Pearls" },
    { full: "Read with Roxan", abbr: "Roxan" },
  ],
  Medium: [
    { full: "Eng", abbr: "(Eng)" },
    { full: "Hin", abbr: "(Hin)" },
  ],
  Session: [
    { full: "2025-2026", abbr: "25-26" },
    { full: "2026-2027", abbr: "26-27" },
  ],
};

// VK / FK tabs just tweak a few entries so each tab looks different
const VK_DATA = {
  ...UNI_DATA,
  Subject: [
    { full: "English", abbr: "Eng" },
    { full: "Mathematics", abbr: "Math" },
    { full: "Science", abbr: "Sci" },
    { full: "Social Studies", abbr: "SST" },
    { full: "Computer", abbr: "Comp" },
    { full: "Hindi", abbr: "Hin" },
  ],
  Medium: [
    { full: "Eng", abbr: "(Eng)" },
    { full: "Hin", abbr: "(Hin)" },
    { full: "Marathi", abbr: "(Mar)" },
  ],
  Session: [
    { full: "2024-2025", abbr: "24-25" },
    { full: "2025-2026", abbr: "25-26" },
  ],
};

const FK_DATA = {
  ...UNI_DATA,
  "Board/Uni": [
    { full: "CBSE", abbr: "CBSE" },
    { full: "ICSE", abbr: "ICSE" },
    { full: "State (Maharashtra)", abbr: "MSB" },
    { full: "State (Kerala)", abbr: "KBPE" },
  ],
  "Series/Author": [
    { full: "Future Kids Computers", abbr: "FKComp" },
    { full: "Future Kids English", abbr: "FKEng" },
    { full: "Future Kids Math", abbr: "FKMath" },
  ],
  Medium: [
    { full: "Eng", abbr: "(Eng)" },
    { full: "Hin", abbr: "(Hin)" },
    { full: "Gujarati", abbr: "(Guj)" },
  ],
};

/* =========================
   MAIN PAGE
   ========================= */
export default function AdminAddAbbreviation() {
  const navigate = useNavigate();
  const location = useLocation();

  // nav + auth (same behavior as your other page)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // tabs
  const TABS = ["UNI", "VK", "FK"];
  const [activeTab, setActiveTab] = useState("UNI");

  // messages
  const [banner, setBanner] = useState({ type: "", text: "" });

  /* ---------- auth ---------- */
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  // local working data for each tab
  const initialData = useMemo(
    () => ({
      UNI: structuredClone(UNI_DATA),
      VK: structuredClone(VK_DATA),
      FK: structuredClone(FK_DATA),
    }),
    []
  );
  const [dataByTab, setDataByTab] = useState(initialData);

  const onChangeList = (tabKey, listTitle, rows) => {
    setDataByTab((prev) => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        [listTitle]: rows,
      },
    }));
  };

  const showOk = (text) => {
    setBanner({ type: "success", text });
    setTimeout(() => setBanner({ type: "", text: "" }), 2500);
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
      {/* Navbar (same look & behavior) */}
      <Navbar
        user={user}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Sidebar (same) */}
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

      {/* Content */}
      <main className="lg:ml-72 pt-20 p-6">
        <div className="space-y-6">
          {banner.text && (
            <MessageAlert
              type={banner.type}
              message={banner.text}
              onClose={() => setBanner({ type: "", text: "" })}
            />
          )}

          {/* Page header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Add / Edit Abbreviations
              </h1>
              <p className="text-sm text-slate-600">
                Manage lists for UNI, VK and FK. Edit inline, remove items, or
                add new rows.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow border border-slate-200">
            <div className="border-b border-slate-200 p-2">
              <div className="flex gap-2">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeTab === t
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Lists grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(dataByTab[activeTab]).map(([title, rows]) => (
                <EditableListCard
                  key={title}
                  title={title}
                  rows={rows}
                  onChange={(updated) => onChangeList(activeTab, title, updated)}
                  onSaved={() => showOk(`${title} updated for ${activeTab}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================
   Editable List Card
   ========================= */
function EditableListCard({ title, rows, onChange, onSaved }) {
  const [filter, setFilter] = useState("");
  const [draft, setDraft] = useState(rows);
  const [editIndex, setEditIndex] = useState(-1);
  const [tempRow, setTempRow] = useState({ full: "", abbr: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(rows);
  }, [rows]);

  const startEdit = (idx) => {
    setEditIndex(idx);
    setTempRow(draft[idx]);
    setError("");
  };
  const cancelEdit = () => {
    setEditIndex(-1);
    setTempRow({ full: "", abbr: "" });
  };
  const saveEdit = () => {
    if (!tempRow.full?.trim() || !tempRow.abbr?.trim()) {
      setError("Both fields are required.");
      return;
    }
    const copy = [...draft];
    copy[editIndex] = { ...tempRow, full: tempRow.full.trim(), abbr: tempRow.abbr.trim() };
    setDraft(copy);
    onChange(copy);
    cancelEdit();
    onSaved?.();
  };

  const removeRow = (idx) => {
    const copy = draft.filter((_, i) => i !== idx);
    setDraft(copy);
    onChange(copy);
  };

  const [newRow, setNewRow] = useState({ full: "", abbr: "" });
  const addRow = () => {
    if (!newRow.full.trim() || !newRow.abbr.trim()) {
      setError("Both fields are required.");
      return;
    }
    const copy = [...draft, { full: newRow.full.trim(), abbr: newRow.abbr.trim() }];
    setDraft(copy);
    onChange(copy);
    setNewRow({ full: "", abbr: "" });
    setError("");
    onSaved?.();
  };

  const filtered = draft.filter(
    (r) =>
      r.full.toLowerCase().includes(filter.toLowerCase()) ||
      r.abbr.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        <div className="hidden md:flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-indigo-600" />
          <div className="flex items-center border rounded-lg px-2 py-1 bg-white">
            <Search className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-3 mt-3 mb-1 p-2 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mr-2" /> {error}
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="px-3 py-2 text-left w-1/2">Full Name</th>
              <th className="px-3 py-2 text-left w-1/3">Abbreviation</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const originalIndex = draft.indexOf(row); // map back to real index
              const isEditing = editIndex === originalIndex;
              return (
                <tr key={originalIndex} className="border-t">
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-full border rounded px-2 py-1"
                        value={tempRow.full}
                        onChange={(e) =>
                          setTempRow((p) => ({ ...p, full: e.target.value }))
                        }
                      />
                    ) : (
                      row.full
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-full border rounded px-2 py-1"
                        value={tempRow.abbr}
                        onChange={(e) =>
                          setTempRow((p) => ({ ...p, abbr: e.target.value }))
                        }
                      />
                    ) : (
                      row.abbr
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                            onClick={saveEdit}
                          >
                            <Save size={16} />
                          </button>
                          <button
                            className="bg-gray-200 hover:bg-gray-300 text-slate-800 px-3 py-1 rounded"
                            onClick={cancelEdit}
                          >
                            <XIcon size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                            onClick={() => startEdit(originalIndex)}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded"
                            onClick={() => removeRow(originalIndex)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
          {/* Add new row */}
          <tfoot>
            <tr className="border-t bg-slate-50">
              <td className="px-3 py-2">
                <input
                  className="w-full border rounded px-2 py-1"
                  placeholder="Full name"
                  value={newRow.full}
                  onChange={(e) =>
                    setNewRow((p) => ({ ...p, full: e.target.value }))
                  }
                />
              </td>
              <td className="px-3 py-2">
                <input
                  className="w-full border rounded px-2 py-1"
                  placeholder="Abbreviation"
                  value={newRow.abbr}
                  onChange={(e) =>
                    setNewRow((p) => ({ ...p, abbr: e.target.value }))
                  }
                />
              </td>
              <td className="px-3 py-2">
                <button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded flex items-center gap-1"
                  onClick={addRow}
                >
                  <Plus size={16} /> Add
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden p-3 pt-0 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <FilterIcon className="w-4 h-4 text-indigo-600" />
          <div className="flex items-center border rounded-lg px-2 py-1 bg-white w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="text-xs outline-none w-full"
            />
          </div>
        </div>

        {filtered.map((row, idx) => {
          const originalIndex = draft.indexOf(row);
          const isEditing = editIndex === originalIndex;
          return (
            <div
              key={originalIndex}
              className="border rounded-lg p-3 shadow-sm bg-white"
            >
              <div className="text-xs text-slate-500">Full Name</div>
              <div className="font-medium">
                {isEditing ? (
                  <input
                    className="w-full border rounded px-2 py-1 mt-1"
                    value={tempRow.full}
                    onChange={(e) =>
                      setTempRow((p) => ({ ...p, full: e.target.value }))
                    }
                  />
                ) : (
                  row.full
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2">Abbreviation</div>
              <div className="font-mono">
                {isEditing ? (
                  <input
                    className="w-full border rounded px-2 py-1 mt-1"
                    value={tempRow.abbr}
                    onChange={(e) =>
                      setTempRow((p) => ({ ...p, abbr: e.target.value }))
                    }
                  />
                ) : (
                  row.abbr
                )}
              </div>

              <div className="flex gap-2 mt-3">
                {isEditing ? (
                  <>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                      onClick={saveEdit}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-slate-800 px-3 py-1 rounded text-sm"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => startEdit(originalIndex)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => removeRow(originalIndex)}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* add row (mobile) */}
        <div className="border rounded-lg p-3 bg-slate-50">
          <div className="text-sm font-medium mb-2">Add new</div>
          <div className="space-y-2">
            <input
              className="w-full border rounded px-2 py-1"
              placeholder="Full name"
              value={newRow.full}
              onChange={(e) =>
                setNewRow((p) => ({ ...p, full: e.target.value }))
              }
            />
            <input
              className="w-full border rounded px-2 py-1"
              placeholder="Abbreviation"
              value={newRow.abbr}
              onChange={(e) =>
                setNewRow((p) => ({ ...p, abbr: e.target.value }))
              }
            />
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              onClick={addRow}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Shared UI bits (same vibe)
   ========================= */
function MessageAlert({ message, type, onClose }) {
  return (
    <div
      className={`rounded-lg p-4 flex items-center justify-between ${
        type === "success"
          ? "bg-green-50 border border-green-200"
          : "bg-red-50 border border-red-200"
      }`}
    >
      <div className="flex items-center">
        {type === "success" ? (
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
        )}
        <p
          className={`text-sm font-medium ${
            type === "success" ? "text-green-800" : "text-red-800"
          }`}
        >
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className={`${
          type === "success"
            ? "text-green-600 hover:text-green-800"
            : "text-red-600 hover:text-red-800"
        }`}
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

function Navbar({
  user,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-semibold">
              Admin Dashboard - Abbreviations
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full border-2 border-slate-600"
            />
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
              aria-label="Toggle user menu"
            >
              {!mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700">
            <div className="px-3 py-3 bg-slate-800 flex items-center rounded-lg">
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-slate-600"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-white">
                  {user.name}
                </div>
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

function SidebarLinks({ navigate, location, close }) {
  const [openWorklogs, setOpenWorklogs] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("worklog")) setOpenWorklogs(true);
    if (
      location.pathname.includes("project") ||
      location.pathname.includes("abbreviations")
    )
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
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${
            location.pathname === "/admin-dashboard" ? "bg-gray-700" : ""
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
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${
                  location.pathname.includes("approve-worklogs")
                    ? "bg-gray-700"
                    : ""
                }`}
                onClick={() => handleNavigation("/admin/approve-worklogs")}
              >
                Approve Worklogs
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${
                  location.pathname.includes("edit-worklog-entries")
                    ? "bg-gray-700"
                    : ""
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
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${
            location.pathname.includes("handle-employees") ? "bg-gray-700" : ""
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
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${
                  location.pathname.includes("add-abbreviations")
                    ? "bg-gray-700"
                    : ""
                }`}
                onClick={() => handleNavigation("/admin/add-abbreviations")}
              >
                Add Abbreviations
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${
                  location.pathname.includes("add-project") ? "bg-gray-700" : ""
                }`}
                onClick={() => handleNavigation("/admin/add-project")}
              >
                Add Project
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${
                  location.pathname.includes("project-requests")
                    ? "bg-gray-700"
                    : ""
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