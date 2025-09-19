import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Use environment variable or fallback to localhost
const API_BASE = "http://localhost:5000/api";

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const AUTO_SUBMIT_TIME = "22:30";
const CACHE_KEY = "worklog_cache_v2";
const AUTO_SUBMIT_KEY = "lastAutoSubmitDate";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Cache/auto-submit UI state
  const [cacheInfo, setCacheInfo] = useState({ count: 0, expiresAt: null, timeLeft: "" });
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState("");

  // --- Static options ---
  const WORK_MODES = ["In Office", "WFH", "On Duty", "Half Day", "OT Home", "OT Office", "Night"];
  const STATUS = ["In Progress", "Delayed", "Completed", "Not approved"];
  const HOURS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8"];
  const TASKS = ["CMPL-MS", "VRF-MS", "DRF", "TAL", "R1", "R2", "R3", "R4", "CR", "FER", "SET", "FINAL", "MEET", "QRY", "Coord", "GLANCE", "Research", "Analysis", "KT", "Interview", "PLAN", "UPL"];
  const BASE_BOOK_ELEMENTS = ["Theory", "Exercise", "Chapter", "Full book", "Mind Map", "Diagram", "Solution", "Booklet", "Full Video", "AVLR-VO", "DLR", "Lesson Plan", "Miscellaneous", "AVLR-Ideation", "Marketing", "Development", "Recruitment", "References", "Frames", "Papers", "Projects", "Lesson Plan"];
  const BASE_CHAPTER_NUMBERS = ["Title", "Syllabus", "Content", "Projects", "Papers", "Miscellaneous", "Appendix", "Full Book",
    ...Array.from({ length: 40 }, (_, i) => String(i + 1))
  ];

  const UNITS = [
    { label: "pages", value: "pages" },
    { label: "frames", value: "frames" },
    { label: "seconds", value: "seconds" },
    { label: "general", value: "general" },
  ];

  // --- Form state ---
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [searchBy, setSearchBy] = useState("name");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestRef = useRef(null);

  const [todayRows, setTodayRows] = useState([]);
  const [pastRows, setPastRows] = useState([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [loadingToday, setLoadingToday] = useState(false);
  const [pastError, setPastError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  // edit via form (not inline)
  const [editSourceIndex, setEditSourceIndex] = useState(-1);

  // NEW — Rejected → Edit → Resubmit flow
  const [resubmitTarget, setResubmitTarget] = useState(null); // { id, date, originalRow }
  const [resubmitCountdown, setResubmitCountdown] = useState("");

  /* ==============================
     TOKEN VALIDATION & AUTO-LOGOUT
     ============================== */
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
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(AUTO_SUBMIT_KEY);
        delete axios.defaults.headers.common.Authorization;
        navigate("/");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      setTokenExpired(true);
      localStorage.removeItem("authToken");
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(AUTO_SUBMIT_KEY);
      delete axios.defaults.headers.common.Authorization;
      navigate("/");
      return false;
    }
  }, [navigate]);

  /* ==============================
     DATABASE OPERATIONS FOR TODAY'S WORKLOG
     ============================== */
  // Load today's entries from database
  const loadTodaysWorklogFromDB = useCallback(async () => {
    if (!checkTokenValidity()) return;

    setLoadingToday(true);
    try {
      const { data } = await axios.get("/worklogs/today");
      if (data?.success && Array.isArray(data.entries)) {
        const mapped = data.entries.map((entry) => ({
          id: entry.id,
          workMode: entry.work_mode,
          projectId: entry.project_name,
          projectName: entry.project_name,
          task: entry.task_name,
          bookElement: entry.book_element,
          chapterNo: entry.chapter_number,
          hoursSpent: String(entry.hours_spent || ""),
          noOfUnits: Number(entry.number_of_units) || 0,
          unitsType: entry.unit_type,
          status: entry.status,
          dueOn: entry.due_on ? new Date(entry.due_on).toISOString().slice(0, 10) : "",
          remarks: entry.details || "",
        }));
        setTodayRows(mapped);
      } else {
        setTodayRows([]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        checkTokenValidity();
        return;
      }
      console.error("Failed to load today's worklog from database:", error);
      setTodayRows([]);
    } finally {
      setLoadingToday(false);
    }
  }, [checkTokenValidity]);

  // Save single entry to database
  const saveTodaysEntryToDB = useCallback(async (entry) => {
    if (!checkTokenValidity()) return null;

    try {
      const { data } = await axios.post("/worklogs/today", { entry });
      if (data?.success) {
        return {
          id: data.entry.id,
          workMode: data.entry.work_mode,
          projectId: data.entry.project_name,
          projectName: data.entry.project_name,
          task: data.entry.task_name,
          bookElement: data.entry.book_element,
          chapterNo: data.entry.chapter_number,
          hoursSpent: String(data.entry.hours_spent || ""),
          noOfUnits: Number(data.entry.number_of_units) || 0,
          unitsType: data.entry.unit_type,
          status: data.entry.status,
          dueOn: data.entry.due_on ? new Date(data.entry.due_on).toISOString().slice(0, 10) : "",
          remarks: data.entry.details || "",
        };
      }
    } catch (error) {
      if (error.response?.status === 401) {
        checkTokenValidity();
        return null;
      }
      console.error("Failed to save entry to database:", error);
      throw error;
    }
    return null;
  }, [checkTokenValidity]);

  // Update entry in database
  const updateTodaysEntryInDB = useCallback(async (id, entry) => {
    if (!checkTokenValidity()) return null;

    try {
      const { data } = await axios.put(`/worklogs/today/${id}`, { entry });
      if (data?.success) {
        return {
          id: data.entry.id,
          workMode: data.entry.work_mode,
          projectId: data.entry.project_name,
          projectName: data.entry.project_name,
          task: data.entry.task_name,
          bookElement: data.entry.book_element,
          chapterNo: data.entry.chapter_number,
          hoursSpent: String(data.entry.hours_spent || ""),
          noOfUnits: Number(data.entry.number_of_units) || 0,
          unitsType: data.entry.unit_type,
          status: data.entry.status,
          dueOn: data.entry.due_on ? new Date(data.entry.due_on).toISOString().slice(0, 10) : "",
          remarks: data.entry.details || "",
        };
      }
    } catch (error) {
      if (error.response?.status === 401) {
        checkTokenValidity();
        return null;
      }
      console.error("Failed to update entry in database:", error);
      throw error;
    }
    return null;
  }, [checkTokenValidity]);

  // Delete entry from database
  const deleteTodaysEntryFromDB = useCallback(async (id) => {
    if (!checkTokenValidity()) return false;

    try {
      const { data } = await axios.delete(`/worklogs/today/${id}`);
      return data?.success || false;
    } catch (error) {
      if (error.response?.status === 401) {
        checkTokenValidity();
        return false;
      }
      console.error("Failed to delete entry from database:", error);
      throw error;
    }
  }, [checkTokenValidity]);

  /* ==============================
     DATA LOADER
     ============================== */
  const fetchPastWorklogs = useCallback(async () => {
    if (!checkTokenValidity()) return;

    setLoadingPast(true);
    setPastError(null);
    try {
      const { data } = await axios.get("/worklogs/recent", { params: { days: 7 } });
      if (data?.success && Array.isArray(data.rows)) {
        const mapped = data.rows.map((r) => ({
          id: r.id,
          date: r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
          workMode: r.work_mode,
          projectId: r.project_id || "",
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
          auditStatus: r.audit_status || "Pending",
        }));
        setPastRows(mapped);
        if (mapped.length === 0) setPastError("No recent worklogs found.");
      } else {
        setPastRows([]);
        setPastError("No recent worklogs found.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        checkTokenValidity();
        return;
      }
      setPastError(`Failed to load recent worklogs: ${err?.response?.data?.message || err.message}`);
      setPastRows([]);
    } finally {
      setLoadingPast(false);
    }
  }, [checkTokenValidity]);

  /* ==============================
     AUTO-SUBMIT HELPERS - UPDATED FOR DATABASE
     ============================== */
  const getNextAutoSubmitTime = () => {
    const now = new Date();
    const target = new Date(now);
    const [h, m] = AUTO_SUBMIT_TIME.split(":").map((n) => parseInt(n, 10));
    target.setHours(h, m, 0, 0);
    if (now >= target) target.setDate(target.getDate() + 1);
    return target;
  };

  const updateAutoSubmitCountdown = useCallback(() => {
    const nextSubmit = getNextAutoSubmitTime();
    const now = new Date();
    const diff = nextSubmit - now;

    if (diff <= 0) {
      setAutoSubmitCountdown("Auto-submit time reached!");
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setAutoSubmitCountdown(`${hours}h ${minutes}m ${seconds}s`);
  }, []);

  const performAutoSubmit = useCallback(async () => {
    if (!checkTokenValidity()) return;

    try {
      // Get today's entries from database for auto-submit
      const { data } = await axios.get("/worklogs/today");
      let entriesToSubmit = [];

      if (data?.success && data.entries && data.entries.length > 0) {
        entriesToSubmit = data.entries.map((r) => ({
          workMode: r.work_mode,
          projectId: r.project_name,
          projectName: r.project_name,
          task: r.task_name,
          bookElement: r.book_element,
          chapterNo: String(r.chapter_number || ""),
          hoursSpent: Number(r.hours_spent) || 0,
          noOfUnits: Number(r.number_of_units) || 0,
          unitsType: r.unit_type,
          status: r.status,
          dueOn: r.due_on ? new Date(r.due_on).toISOString().slice(0, 10) : null,
          remarks: r.details || null,
        }));
      }

      const payload = { entries: entriesToSubmit };
      const response = await axios.post("/worklogs", payload);

      // Clear today's worklog from database after successful submission
      if (response.data.success) {
        setTodayRows([]);

        if (entriesToSubmit.length > 0) {
          setSubmitMsg(`Auto-submitted ${response.data.inserted} entry(s) at ${AUTO_SUBMIT_TIME}!`);
        } else {
          setSubmitMsg(`Auto-submitted default "Leave" entry at ${AUTO_SUBMIT_TIME}!`);
        }

        await fetchPastWorklogs();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        checkTokenValidity();
        return;
      }
      setSubmitMsg(`Auto-submit failed: ${error?.response?.data?.message || error.message}`);
    }
  }, [checkTokenValidity, fetchPastWorklogs]);

  // Auto-submit check function
  const checkAutoSubmit = useCallback(() => {
    const now = new Date();
    const [targetHours, targetMinutes] = AUTO_SUBMIT_TIME.split(":").map((n) => parseInt(n, 10));

    // Create target time for today
    const targetTime = new Date(now);
    targetTime.setHours(targetHours, targetMinutes, 0, 0);

    // Check if we're within a 60-second window of the target time
    const timeDiff = Math.abs(now - targetTime);
    const isWithinWindow = timeDiff <= 60000; // 60 seconds

    if (isWithinWindow) {
      const today = now.toDateString();
      const lastSubmitDate = localStorage.getItem(AUTO_SUBMIT_KEY);

      if (lastSubmitDate !== today) {
        localStorage.setItem(AUTO_SUBMIT_KEY, today);
        performAutoSubmit();
      }
    }
  }, [performAutoSubmit]);

  /* ==============================
     Effects: auth, initial load, timers (FIXED)
     ============================== */
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
        picture: decoded.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random&color=fff`,
      };
      setUser(u);
      axios.defaults.baseURL = API_BASE;
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchPastWorklogs();
    } catch (e) {
      console.error("Invalid token:", e);
      localStorage.removeItem("authToken");
      navigate("/");
    }
  }, [navigate, fetchPastWorklogs, checkTokenValidity]);

  // FIXED: Load today's worklog from database on mount - no circular dependencies
  useEffect(() => {
    if (user) {
      loadTodaysWorklogFromDB();
    }
  }, [user]); // Only depend on user

  // FIXED: Update cache info and set up intervals
  useEffect(() => {
    const updateCacheInfoLocal = () => {
      setCacheInfo({
        count: todayRows.length,
        expiresAt: Date.now() + CACHE_DURATION,
        timeLeft: todayRows.length > 0 ? "Stored in DB" : "",
      });
    };

    const cacheInterval = setInterval(updateCacheInfoLocal, 60_000);
    const autoSubmitInterval = setInterval(() => {
      updateAutoSubmitCountdown();
      checkAutoSubmit();
    }, 1_000);
    const tokenCheckInterval = setInterval(checkTokenValidity, 30_000);

    updateCacheInfoLocal();
    updateAutoSubmitCountdown();

    return () => {
      clearInterval(cacheInterval);
      clearInterval(autoSubmitInterval);
      clearInterval(tokenCheckInterval);
    };
  }, [todayRows.length, checkAutoSubmit, updateAutoSubmitCountdown, checkTokenValidity]);

  // NEW: maintain countdown while editing a rejected entry (until D+4 EOD)
  useEffect(() => {
    let timer;
    if (resubmitTarget?.date) {
      const tick = () => setResubmitCountdown(countdownToDplus4(resubmitTarget.date));
      tick();
      timer = setInterval(tick, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [resubmitTarget?.date]);

  /* ==============================
     Actions
     ============================== */
  const handleLogout = () => {
    // Clear all local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem(AUTO_SUBMIT_KEY);
    localStorage.removeItem(CACHE_KEY);

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    delete axios.defaults.headers.common.Authorization;
    navigate("/");
  };

  const showFullBook = useMemo(() => ["FER", "FINAL", "COM"].includes(task), [task]);
  const bookElements = useMemo(() => (showFullBook ? ["Full Book", ...BASE_BOOK_ELEMENTS] : BASE_BOOK_ELEMENTS), [showFullBook]);
  const chapterNumbers = useMemo(
    () => (showFullBook ? BASE_CHAPTER_NUMBERS : BASE_CHAPTER_NUMBERS.filter((v) => v !== "Full Book")),
    [showFullBook]
  );

  // Suggestions loader + validation alignment
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

  // ---------- VALIDATION ----------
  const isEmpty = (v) => Array.isArray(v) ? v.length === 0 : (v === null || v === undefined || String(v).trim() === "");

  // Project is valid if (a) projectId was set by selecting a suggestion, OR (b) user typed an exact existing ID
  // Project is valid if:
  // 1. projectId exists (normal entry OR resubmit prefill), OR
  // 2. projectName exists (resubmit prefill case), OR
  // 3. user typed a project that matches a suggestion
  const projectValid =
    (!!projectId && String(projectId).trim() !== "") ||
    (!!projectName && String(projectName).trim() !== "") ||
    (!!projectQuery.trim() && suggestions.some(s => s.id === projectQuery.trim()));


  // Required fields (replace projectId with projectValid)
  const required = { workMode, projectId: projectValid ? "ok" : "", task, bookElement, chapterNumber, hoursSpent, status, unitsCount, unitsType };

  // Mark as invalid if empty string
  // Mark as invalid if empty (handles strings AND arrays)
  const invalid = Object.fromEntries(
    Object.entries(required).map(([k, v]) => [k, isEmpty(v)])
  );


  const canSubmitRow = Object.values(required).every((v) => !isEmpty(v));

  const clearForm = () => {
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
    setSubmitMsg(null);
    setEditSourceIndex(-1);
    setResubmitTarget(null);
    setResubmitCountdown("");
  };

  // SUBMIT: append if new; replace if editing - NOW SAVES TO DATABASE
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitRow || !projectValid) return;

    // If in resubmit mode, do NOT add to today's – user must click explicit Resubmit button
    if (resubmitTarget) return;

    const newEntry = {
      workMode,
      projectId: projectId || projectQuery.trim(), // ensure ID goes if user typed exact valid ID
      projectName: projectName || projectQuery,
      task,
      bookElement,
      chapterNo: chapterNumber.join(", "),
      hoursSpent,
      noOfUnits: Number(unitsCount),
      unitsType,
      status,
      dueOn,
      remarks,
    };

    try {
      if (editSourceIndex !== -1) {
        // UPDATE existing entry in database
        const currentRow = todayRows[editSourceIndex];
        if (currentRow.id) {
          const updatedEntry = await updateTodaysEntryInDB(currentRow.id, newEntry);
          if (updatedEntry) {
            setTodayRows((prev) => prev.map((r, i) => (i === editSourceIndex ? updatedEntry : r)));
          }
        }
      } else {
        // ADD new entry to database
        const savedEntry = await saveTodaysEntryToDB(newEntry);
        if (savedEntry) {
          setTodayRows((prev) => [...prev, savedEntry]);
        }
      }
      clearForm();
    } catch (error) {
      setSubmitMsg(`Failed to save entry: ${error?.response?.data?.message || error.message}`);
    }
  };

  // copy & delete handlers - UPDATED FOR DATABASE
  const copyRowToForm = (row) => {
    setWorkMode(row.workMode || "");
    setProjectId(row.projectId || "");
    setProjectQuery(row.projectId || row.projectName || "");
    setProjectName(row.projectName || "");
    setTask(row.task || "");
    setBookElement(row.bookElement || "");
    setChapterNumber(
      typeof row.chapterNo === "string"
        ? row.chapterNo.split(",").map((c) => c.trim()).filter(Boolean)
        : Array.isArray(row.chapterNo)
          ? row.chapterNo
          : []
    );
    setHoursSpent(row.hoursSpent !== undefined && row.hoursSpent !== null ? String(row.hoursSpent) : "");
    setUnitsCount(row.noOfUnits !== undefined && row.noOfUnits !== null ? String(row.noOfUnits) : "");
    setUnitsType(row.unitsType || "pages");
    setStatus(row.status || "");
    setDueOn(row.dueOn || "");
    setRemarks(row.remarks || "");
    // not in edit mode when only copying
    setEditSourceIndex(-1);
    setResubmitTarget(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // EDIT: copy into form and set edit mode
  const startEditViaForm = (idx, row) => {
    copyRowToForm(row);
    setEditSourceIndex(idx);
    setResubmitTarget(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRowAt = async (idx) => {
    const row = todayRows[idx];

    try {
      if (row.id) {
        const success = await deleteTodaysEntryFromDB(row.id);
        if (success) {
          setTodayRows((prev) => prev.filter((_, i) => i !== idx));
          if (editSourceIndex === idx) setEditSourceIndex(-1);
        } else {
          setSubmitMsg("Failed to delete entry from database");
        }
      }
    } catch (error) {
      setSubmitMsg(`Failed to delete entry: ${error?.response?.data?.message || error.message}`);
    }
  };

  async function submitTodaysWorklog() {
    if (todayRows.length === 0) return;

    if (!checkTokenValidity()) return;

    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const payload = {
        entries: todayRows.map((r) => ({
          workMode: r.workMode,
          projectId: r.projectId,
          projectName: r.projectName,
          task: r.task,
          bookElement: r.bookElement,
          chapterNo: String(r.chapterNo || ""),
          hoursSpent: Number(r.hoursSpent) || 0,
          noOfUnits: Number(r.noOfUnits) || 0,
          unitsType: r.unitsType,
          status: r.status,
          dueOn: r.dueOn || null,
          remarks: r.remarks || null,
        })),
      };

      const { data } = await axios.post("/worklogs", payload);
      setSubmitMsg(`Successfully submitted ${data.inserted} entry(s) to database!`);

      // Clear today's worklog (this will also clear from database via the controller)
      setTodayRows([]);
      await fetchPastWorklogs();
    } catch (error) {
      if (error.response?.status === 401) {
        checkTokenValidity();
        return;
      }
      setSubmitMsg(`Submit failed: ${error?.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // NEW: Resubmit a rejected past entry (switch to Re-Pending)
  const resubmitRejectedWorklog = async (id, entry) => {
    try {
      const { data } = await axios.put(`/worklogs/resubmit/${id}`, { entry });
      if (data?.success) {
        setSubmitMsg("Resubmitted successfully and moved to Re-Pending.");
        setResubmitTarget(null);
        await fetchPastWorklogs();
      } else {
        setSubmitMsg("Resubmission failed. Please try again.");
      }
    } catch (err) {
      setSubmitMsg(`Resubmission failed: ${err?.response?.data?.message || err.message}`);
    }
  };

  const onClickResubmit = async () => {
    if (!resubmitTarget) return;
    if (!canSubmitRow || !projectValid) {
      setSubmitMsg("Please fill all required fields (*) with a valid Project ID before resubmitting.");
      return;
    }
    // Prepare payload (same fields, Date & Audit not editable/not sent)
    const entry = {
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
      dueOn,
      remarks,
    };
    await resubmitRejectedWorklog(resubmitTarget.id, entry);
  };

  /* ==============================
     Render
     ============================== */
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 text-sm">
      {/* Enhanced Responsive Navbar */}
      {/* Enhanced Responsive Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 h-16">
          {/* Left side - Logo/Title */}
          <div className="flex items-center space-x-2">
            <img
              src="https://i.ibb.co/ccMgHZDg/vk-logo.png"
              alt="Company Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              <span className="block sm:inline">Employee Dashboard</span>
              <span className="hidden sm:inline"> - Work Log</span>
            </h1>
          </div>

          {/* Desktop menu */}
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
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
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
                  className="block h-6 w-6"
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

        {/* Mobile menu */}
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


      {/* Main */}
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* New Entry */}
          <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                {resubmitTarget ? "Edit Rejected Entry" : (editSourceIndex !== -1 ? "Edit Entry" : "New Entry")}
              </h2>
              <div className="text-right">
                <span className="text-xs text-red-600">* required fields</span>
                {cacheInfo.count > 0 && (
                  <div className="text-xs text-blue-600 mt-1 md:hidden">
                    {cacheInfo.count} entries stored in database
                  </div>
                )}
              </div>
            </div>

            {/* Resubmit banner */}
            {resubmitTarget && (
              <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                You are editing a <b>Rejected</b> entry from <b>{resubmitTarget.date}</b>. You can resubmit until <b></b>
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-[2px]">{resubmitCountdown || "calculating…"}</span>
                <button
                  type="button"
                  onClick={() => clearForm()}
                  className="ml-3 underline text-amber-900 hover:text-amber-700"
                  title="Cancel resubmission mode"
                >
                  Cancel
                </button>
              </div>
            )}

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
                        // If user typed exact matching ID, set it as chosen to keep behavior consistent
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
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={clearForm}
                className="w-full sm:w-auto px-4 py-1.5 rounded-2xl border-2 border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>

              {/* Resubmit button only in resubmit mode */}
              {resubmitTarget && (
                <button
                  type="button"
                  onClick={onClickResubmit}
                  className="w-full sm:w-auto px-5 py-1.5 rounded-2xl text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                  title="Send this corrected entry back to SPOC for Re-Approval/Re-Rejection"
                  disabled={!canSubmitRow || !projectValid}
                >
                  Resubmit Entry {resubmitCountdown ? `(${resubmitCountdown})` : ""}
                </button>
              )}

              <button
                type="submit"
                disabled={!canSubmitRow || !projectValid || !!resubmitTarget /* block mixing modes */}
                className={`w-full sm:w-auto px-5 py-1.5 rounded-2xl text-white transition-colors ${canSubmitRow && projectValid && !resubmitTarget
                  ? "bg-indigo-700 hover:bg-indigo-800"
                  : "bg-slate-400 cursor-not-allowed"
                  }`}
              >
                {editSourceIndex !== -1 ? "Update Entry" : "Add to Today's Worklog"}
              </button>
            </div>
          </form>

          {/* Today's Worklog */}
          <section className="mt-8 space-y-6">
            {loadingToday ? (
              <Feedback message="Loading today's worklog..." />
            ) : todayRows.length > 0 ? (
              <>
                <EditableBlock
                  title="Today's Worklog"
                  rows={todayRows}
                  onCopyRow={copyRowToForm}
                  onStartEdit={startEditViaForm}
                  onDeleteRow={deleteRowAt}
                  lists={{ WORK_MODES, TASKS, STATUS, HOURS, UNITS }}
                />
                <div className="text-xs text-slate-600 text-center bg-blue-50 border border-blue-200 rounded-2xl px-3 py-2">
                  Your entries are saved in database and will auto-submit at 10:30 PM (in {autoSubmitCountdown})
                </div>
              </>
            ) : (
              <Feedback message={submitMsg || "No entries for today yet."} />
            )}

            <div className="flex items-center justify-center">
              <button
                onClick={submitTodaysWorklog}
                disabled={submitting || todayRows.length === 0}
                className="px-5 py-1.5 rounded-2xl text-white bg-emerald-700 disabled:opacity-60 hover:bg-emerald-800 transition-colors"
              >
                {submitting ? "Submitting…" : "Submit Today's Worklog"}
              </button>
            </div>

            {submitMsg && <Feedback message={submitMsg} />}
            {pastError && <Feedback message={pastError} />}
            {loadingPast && <Feedback message="Loading past 7 days worklog..." />}
            {!pastError && !loadingPast && pastRows.length === 0 && <Feedback message="No entries in the last 7 days." />}

            {/* 🔔 Rejected panel — placed ABOVE the Past 7 Days table as requested */}
            {pastRows.some(r => r.auditStatus === "Rejected" && withinDplus4(r.date)) && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <div className="text-sm font-semibold text-amber-900 mb-2">Rejected entries you can still edit</div>
                <div className="space-y-2">
                  {pastRows
                    .filter(r => r.auditStatus === "Rejected" && withinDplus4(r.date))
                    .map((r) => (
                      <div key={r.id} className="flex items-center justify-between bg-white rounded-xl border border-amber-200 px-3 py-2 text-xs">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{r.projectId || r.projectName}</div>
                          <div className="text-slate-600">
                            {r.date} · {r.task} · {r.bookElement} · Ch {r.chapterNo || "-"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-700">{countdownToDplus4(r.date)}</span>
                          <button
                            className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            onClick={() => {
                              // Prefill the top form for resubmission
                              setWorkMode(r.workMode || "");
                              setProjectId(r.projectId || "");
                              setProjectQuery(r.projectId || r.projectName || "");
                              setProjectName(r.projectName || "");
                              setTask(r.task || "");
                              setBookElement(r.bookElement || "");
                              setChapterNumber(
                                typeof r.chapterNo === "string"
                                  ? r.chapterNo.split(",").map((c) => c.trim()).filter(Boolean)
                                  : Array.isArray(r.chapterNo) ? r.chapterNo : []
                              );
                              setHoursSpent(r.hoursSpent !== undefined && r.hoursSpent !== null ? String(r.hoursSpent) : "");
                              setUnitsCount(r.noOfUnits !== undefined && r.noOfUnits !== null ? String(r.noOfUnits) : "");
                              setUnitsType(r.unitsType || "pages");
                              setStatus(r.status || "");
                              setDueOn(r.dueOn || "");
                              setRemarks(r.remarks || "");
                              setEditSourceIndex(-1);
                              setResubmitTarget({ id: r.id, date: r.date, originalRow: r });
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Edit & Resubmit
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Past worklogs */}
            {pastRows.length > 0 && (
              <DataBlock
                title={`Past 7 Days Worklog (${pastRows.length} entries)`}
                rows={pastRows}
                subtle
                hideEdit
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ==============================
   UI Helpers
   ============================== */
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

/* ==============================
   Tables & Blocks
   ============================== */
function DataBlock({ title, rows, subtle = false, hideEdit = false, onStartEdit }) {
  return (
    <div className={`rounded-2xl border ${subtle ? "border-slate-200 bg-white" : "border-slate-300 bg-slate-50"} shadow-sm`}>
      <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              {PAST_HEADERS.map((h) => (
                <th key={h} className="px-3 py-2 font-semibold sticky top-0 bg-slate-100">
                  {h}
                </th>
              ))}
              {!hideEdit && <th className="px-3 py-2 font-semibold sticky top-0 bg-slate-100">Edit</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.workMode}</td>
                <td className="px-3 py-2 min-w-[14rem]">{r.projectId || r.projectName}</td>
                <td className="px-3 py-2">{r.task}</td>
                <td className="px-3 py-2">{r.bookElement}</td>
                <td className="px-3 py-2">{r.chapterNo}</td>
                <td className="px-3 py-2">{r.hoursSpent}</td>
                <td className="px-3 py-2">{r.noOfUnits}</td>
                <td className="px-3 py-2">{r.unitsType}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.dueOn}</td>
                <td className="px-3 py-2">{r.remarks}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${r.auditStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                    r.auditStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                      r.auditStatus === 'Re-Pending' ? 'bg-yellow-100 text-yellow-800' :
                        r.auditStatus === 'Re-Approved' ? 'bg-green-200 text-green-900' :
                          r.auditStatus === 'Re-Rejected' ? 'bg-red-200 text-red-900' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {r.auditStatus}
                  </span>
                </td>
                {!hideEdit && (
                  <td className="px-3 py-2">
                    <button
                      className="px-2 py-1 rounded-xl text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      onClick={() => onStartEdit(idx)}
                    >
                      Edit
                    </button>
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

function EditableBlock({ title, rows, onStartEdit, onDeleteRow, onCopyRow, lists }) {
  const { } = lists; // kept for future use

  return (
    <div className="rounded-2xl border border-slate-300 bg-slate-50 shadow-sm">
      <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              {TODAY_HEADERS.map((h) => (
                <th key={h} className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
              {/* Actions on extreme right (sticky) */}
              <th className="px-3 py-2 font-semibold sticky right-0 bg-slate-100 z-10 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-3 py-2 whitespace-nowrap">{r.workMode}</td>
                <td className="px-3 py-2 min-w-[14rem]">{r.projectId || r.projectName}</td>
                <td className="px-3 py-2">{r.task}</td>
                <td className="px-3 py-2">{r.bookElement}</td>
                <td className="px-3 py-2">{r.chapterNo}</td>
                <td className="px-3 py-2">{r.hoursSpent}</td>
                <td className="px-3 py-2">{r.noOfUnits}</td>
                <td className="px-3 py-2">{r.unitsType}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.dueOn}</td>
                <td className="px-3 py-2">{r.remarks}</td>
                {/* Sticky right actions cell */}
                <td className="px-3 py-2 sticky right-0 bg-inherit z-10">
                  <div className="flex gap-1 justify-end">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-xl text-xs bg-sky-600 text-white hover:bg-sky-700"
                      onClick={() => onCopyRow?.(r)}
                      title="Copy this row into the form"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-xl text-xs bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => onStartEdit?.(idx, r)}
                      title="Edit this row in the form"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-xl text-xs bg-rose-600 text-white hover:bg-rose-700"
                      onClick={() => onDeleteRow?.(idx)}
                      title="Delete this row"
                    >
                      Delete
                    </button>
                  </div>
                </td>
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
  const isSuccess = message && (message.includes("Successfully") || message.includes("submitted") || message.includes("Resubmitted"));

  let bgColor = "bg-blue-50 border-blue-200 text-blue-900";
  if (isError) bgColor = "bg-red-50 border-red-200 text-red-900";
  if (isSuccess) bgColor = "bg-emerald-50 border-emerald-200 text-emerald-900";

  return <div className={`rounded-2xl border px-3 py-2 text-xs ${bgColor}`}>{message}</div>;
}

/* ==============================
   Data
   ============================== */
const TODAY_HEADERS = [
  "Work Mode",
  "Project Name",
  "Task",
  "Book Element",
  "Chapter No.",
  "Hours Spent",
  "No. of Units",
  "Unit Type",
  "Status",
  "Due On",
  "Details",
];

const PAST_HEADERS = [
  "Date",
  "Work Mode",
  "Project Name",
  "Task",
  "Book Element",
  "Chapter No.",
  "Hours Spent",
  "No. of Units",
  "Unit Type",
  "Status",
  "Due On",
  "Details",
  "Audit Status",
];

/* ==============================
   Rejection window helpers
   ============================== */
function withinDplus4(dateStr) {
  if (!dateStr) return false;
  const D = new Date(`${dateStr}T00:00:00.000Z`);
  const deadline = new Date(D);
  deadline.setUTCDate(D.getUTCDate() + 4);
  deadline.setUTCHours(23, 59, 59, 999);
  return new Date() <= deadline;
}

function countdownToDplus4(dateStr) {
  if (!dateStr) return "";
  const D = new Date(`${dateStr}T00:00:00.000Z`);
  const deadline = new Date(D);
  deadline.setUTCDate(D.getUTCDate() + 4);
  deadline.setUTCHours(23, 59, 59, 999);
  const now = new Date();
  const ms = deadline - now;
  if (ms <= 0) return "window closed";

  const d = Math.floor(ms / (24 * 3600000));
  const h = Math.floor((ms % (24 * 3600000)) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${d}d ${h}h ${m}m ${s}s left`;
}