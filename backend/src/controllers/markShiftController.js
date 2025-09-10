// const { PrismaClient, Role } = require("@prisma/client");
// const prisma = new PrismaClient();

// // Utility: find upcoming Sunday
// function getNextSunday(date) {
//   const sunday = new Date(date);
//   const diff = (7 - date.getDay()) % 7 || 7;
//   sunday.setDate(date.getDate() + diff);
//   return sunday;
// }

// // GET /api/shifts/employees-under-spoc
// const getEmployeesUnderSpoc = async (req, res) => {
//   const { spoc_email } = req.query;

//   if (!spoc_email) {
//     return res.status(400).json({ error: "SPOC email is required" });
//   }

//   try {
//     // Try enum version first
//     const employeesUnderSpoc = await prisma.users.findMany({
//       where: {
//         spoc_email: spoc_email,
//         role: Role.EMPLOYEE, // ✅ enum-safe
//       },
//       select: { id: true, name: true, email: true, team: true },
//       orderBy: { name: "asc" },
//     });

//     res.json(employeesUnderSpoc);
//   } catch (err) {
//     console.error("Error fetching employees under SPOC:", err);

//     // fallback: if your DB column is plain text instead of enum
//     try {
//       const employeesUnderSpoc = await prisma.users.findMany({
//         where: {
//           spoc_email: spoc_email,
//           role: "EMPLOYEE",
//         },
//         select: { id: true, name: true, email: true, team: true },
//         orderBy: { name: "asc" },
//       });

//       res.json(employeesUnderSpoc);
//     } catch (innerErr) {
//       console.error("Fallback query failed:", innerErr);
//       res.status(500).json({ error: "Failed to fetch employees" });
//     }
//   }
// };

// // POST /api/shifts/mark
// const markShifts = async (req, res) => {
//   try {
//     const { spoc_name, spoc_email, nightEmployees, sundayEmployees } = req.body;

//     if (!spoc_name || !spoc_email) {
//       return res.status(400).json({ error: "SPOC details required" });
//     }

//     const today = new Date();
//     const sunday = getNextSunday(today);

//     const records = [];

//     if (nightEmployees?.length) {
//       for (const emp of nightEmployees) {
//         records.push({
//           date: today,
//           name: emp.name,
//           email: emp.email,
//           spoc_name,
//           spoc_email,
//           shift_date: today,
//           shift_type: "NIGHT",
//         });
//       }
//     }

//     if (sundayEmployees?.length) {
//       for (const emp of sundayEmployees) {
//         records.push({
//           date: today,
//           name: emp.name,
//           email: emp.email,
//           spoc_name,
//           spoc_email,
//           shift_date: sunday,
//           shift_type: "SUNDAY",
//         });
//       }
//     }

//     if (records.length === 0) {
//       return res.status(400).json({ error: "No employees selected" });
//     }

//     const saved = await prisma.markShift.createMany({ data: records });
//     res.json({ message: "Shifts marked successfully", count: saved.count });
//   } catch (error) {
//     console.error("Error marking shifts:", error);
//     res.status(500).json({ error: "Failed to mark shifts" });
//   }
// };

// // GET /api/shifts/history
// const getShiftHistory = async (req, res) => {
//   try {
//     const { spoc_email, type } = req.query;

//     const where = {};
//     if (spoc_email) where.spoc_email = spoc_email;
//     if (type) where.shift_type = type.toUpperCase();

//     const shifts = await prisma.markShift.findMany({
//       where,
//       orderBy: { shift_date: "desc" },
//     });

//     res.json(shifts);
//   } catch (error) {
//     console.error("Error fetching history:", error);
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// };

// module.exports = {
//   markShifts,
//   getShiftHistory,
//   getEmployeesUnderSpoc,
// };


const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Utility: find upcoming Sunday
function getNextSunday(date) {
  const sunday = new Date(date);
  const diff = (7 - date.getDay()) % 7 || 7;
  sunday.setDate(date.getDate() + diff);
  return sunday;
}

// GET employees under a SPOC
const getEmployeesUnderSpoc = async (req, res) => {
  try {
    const { spoc_email } = req.query;
    if (!spoc_email) {
      return res.status(400).json({ error: "SPOC email is required" });
    }

    let employeesUnderSpoc;

    try {
      // Try with role as 'EMPLOYEE'
      employeesUnderSpoc = await prisma.users.findMany({
        where: { spoc_email, role: 'EMPLOYEE' },
        select: { id: true, name: true, email: true }
      });
    } catch (enumError) {
      try {
        // Try with role as lowercase 'employee'
        employeesUnderSpoc = await prisma.users.findMany({
          where: { spoc_email, role: 'employee' },
          select: { id: true, name: true, email: true }
        });
      } catch (caseError) {
        // Fallback raw query
        employeesUnderSpoc = await prisma.$queryRaw`
          SELECT id, name, email 
          FROM "Users" 
          WHERE spoc_email = ${spoc_email} 
          AND role::text = 'Employee'
        `;
      }
    }

    res.json(employeesUnderSpoc);
  } catch (error) {
    console.error("Error fetching employees under SPOC:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// Check existing shifts for a SPOC
const checkExistingShifts = async (req, res) => {
  try {
    const { spoc_email, date } = req.query;
    if (!spoc_email || !date) {
      return res.status(400).json({ error: "SPOC email and date are required" });
    }

    const today = new Date(date);
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Night shifts
    const nightShifts = await prisma.markShift.findMany({
      where: {
        spoc_email,
        shift_type: "NIGHT",
        shift_date: { gte: startOfDay, lt: endOfDay }
      }
    });

    // Sunday shifts
    const sundayShifts = await prisma.markShift.findMany({
      where: {
        spoc_email,
        shift_type: "SUNDAY",
        shift_date: { gte: startOfDay, lt: endOfDay }
      }
    });

    console.log(sundayShifts.length, nightShifts.length);

    res.json({
      nightExists: nightShifts.length > 0,
      sundayExists: sundayShifts.length > 0
    });
  } catch (error) {
    console.error("Error checking existing shifts:", error);
    res.status(500).json({ error: "Failed to check existing shifts" });
  }
};

// Delete a shift entry
const deleteShiftEntry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Shift ID is required" });
    }

    const existingShift = await prisma.markShift.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingShift) {
      return res.status(404).json({ error: "Shift entry not found" });
    }

    await prisma.markShift.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Shift entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift entry:", error);
    res.status(500).json({ error: "Failed to delete shift entry" });
  }
};

// POST /api/shifts/mark
const markShifts = async (req, res) => {
  try {
    const { spoc_name, spoc_email, nightEmployees, sundayEmployees } = req.body;

    if (!spoc_name || !spoc_email) {
      return res.status(400).json({ error: "SPOC details required" });
    }

    const today = new Date();
    const sunday = getNextSunday(today);
    const records = [];

    // Night shift employees
    if (nightEmployees && nightEmployees.length > 0) {
      for (const emp of nightEmployees) {
        records.push({
          date: today,
          name: emp.name,
          email: emp.email,
          spoc_name,
          spoc_email,
          shift_date: today,
          shift_type: "NIGHT"
        });
      }
    }

    // Sunday shift employees
    if (sundayEmployees && sundayEmployees.length > 0) {
      for (const emp of sundayEmployees) {
        records.push({
          date: today,
          name: emp.name,
          email: emp.email,
          spoc_name,
          spoc_email,
          shift_date: sunday,
          shift_type: "SUNDAY"
        });
      }
    }

    if (records.length === 0) {
      return res.status(400).json({ error: "No employees selected" });
    }

    const saved = await prisma.markShift.createMany({ data: records });
    res.json({ message: "Shifts marked successfully", count: saved.count });
  } catch (error) {
    console.error("Error marking shifts:", error);
    res.status(500).json({ error: "Failed to mark shifts" });
  }
};

// GET /api/shifts/history
const getShiftHistory = async (req, res) => {
  try {
    const { spoc_email, type } = req.query;
    const where = {};

    if (spoc_email) where.spoc_email = spoc_email;
    if (type) where.shift_type = type.toUpperCase();

    const shifts = await prisma.markShift.findMany({
      where,
      orderBy: { shift_date: "desc" }
    });

    res.json(shifts);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

module.exports = {
  markShifts,
  getShiftHistory,
  getEmployeesUnderSpoc,
  checkExistingShifts,
  deleteShiftEntry
};


// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();

// // Utility: find upcoming Sunday (if today is Sunday → return today)
// function getNextSunday(date) {
//   const sunday = new Date(date);
//   const diff = (7 - sunday.getDay()) % 7;
//   sunday.setDate(sunday.getDate() + diff);
//   return sunday;
// }

// // Normalize a date to start of day
// function normalizeDate(date) {
//   return new Date(date.setHours(0, 0, 0, 0));
// }

// // -------------------- Get Employees under SPOC --------------------
// const getEmployeesUnderSpoc = async (req, res) => {
//   try {
//     const { spoc_email } = req.query;

//     if (!spoc_email) {
//       return res.status(400).json({ error: "SPOC email is required" });
//     }

//     let employeesUnderSpoc;
//     try {
//       employeesUnderSpoc = await prisma.users.findMany({
//         where: {
//           spoc_email,
//           role: "EMPLOYEE",
//         },
//         select: { id: true, name: true, email: true },
//       });
//     } catch (enumError) {
//       try {
//         employeesUnderSpoc = await prisma.users.findMany({
//           where: {
//             spoc_email,
//             role: "employee",
//           },
//           select: { id: true, name: true, email: true },
//         });
//       } catch (caseError) {
//         employeesUnderSpoc = await prisma.$queryRaw`
//           SELECT id, name, email 
//           FROM "Users" 
//           WHERE spoc_email = ${spoc_email} 
//           AND role::text = 'Employee'
//         `;
//       }
//     }

//     res.json(employeesUnderSpoc);
//   } catch (error) {
//     console.error("Error fetching employees under SPOC:", error);
//     res.status(500).json({ error: "Failed to fetch employees" });
//   }
// };

// // -------------------- Check Existing Shifts --------------------
// const checkExistingShifts = async (req, res) => {
//   try {
//     const { spoc_email, date } = req.query;

//     if (!spoc_email || !date) {
//       return res.status(400).json({ error: "SPOC email and date are required" });
//     }

//     const today = new Date(date);
//     const startOfDay = normalizeDate(new Date(today));
//     const endOfDay = new Date(startOfDay);
//     endOfDay.setDate(endOfDay.getDate() + 1);

//     const sunday = getNextSunday(new Date(today));
//     const startOfSunday = normalizeDate(new Date(sunday));
//     const endOfSunday = new Date(startOfSunday);
//     endOfSunday.setDate(endOfSunday.getDate() + 1);

//     // Night shift check
//     const nightShifts = await prisma.markShift.findMany({
//       where: {
//         spoc_email,
//         shift_type: "NIGHT",
//         shift_date: { gte: startOfDay, lt: endOfDay },
//       },
//     });

//     // Sunday shift check
//     const sundayShifts = await prisma.markShift.findMany({
//       where: {
//         spoc_email,
//         shift_type: "SUNDAY",
//         shift_date: { gte: startOfSunday, lt: endOfSunday },
//       },
//     });

//     console.log("Night:", nightShifts.length, "Sunday:", sundayShifts.length);

//     res.json({
//       nightExists: nightShifts.length > 0,
//       sundayExists: sundayShifts.length > 0,
//     });
//   } catch (error) {
//     console.error("Error checking existing shifts:", error);
//     res.status(500).json({ error: "Failed to check existing shifts" });
//   }
// };

// // -------------------- Delete Shift Entry --------------------
// const deleteShiftEntry = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: "Shift ID is required" });
//     }

//     const existingShift = await prisma.markShift.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!existingShift) {
//       return res.status(404).json({ error: "Shift entry not found" });
//     }

//     await prisma.markShift.delete({
//       where: { id: parseInt(id) },
//     });

//     res.json({ message: "Shift entry deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting shift entry:", error);
//     res.status(500).json({ error: "Failed to delete shift entry" });
//   }
// };

// // -------------------- Mark Shifts --------------------
// const markShifts = async (req, res) => {
//   try {
//     const { spoc_name, spoc_email, nightEmployees, sundayEmployees } = req.body;

//     if (!spoc_name || !spoc_email) {
//       return res.status(400).json({ error: "SPOC details required" });
//     }

//     const today = normalizeDate(new Date());
//     const sunday = normalizeDate(getNextSunday(new Date()));

//     const records = [];

//     if (nightEmployees && nightEmployees.length > 0) {
//       for (const emp of nightEmployees) {
//         records.push({
//           date: today,
//           name: emp.name,
//           email: emp.email,
//           spoc_name,
//           spoc_email,
//           shift_date: today,
//           shift_type: "NIGHT",
//         });
//       }
//     }

//     if (sundayEmployees && sundayEmployees.length > 0) {
//       for (const emp of sundayEmployees) {
//         records.push({
//           date: today,
//           name: emp.name,
//           email: emp.email,
//           spoc_name,
//           spoc_email,
//           shift_date: sunday,
//           shift_type: "SUNDAY",
//         });
//       }
//     }

//     if (records.length === 0) {
//       return res.status(400).json({ error: "No employees selected" });
//     }

//     const saved = await prisma.markShift.createMany({ data: records });

//     res.json({ message: "Shifts marked successfully", count: saved.count });
//   } catch (error) {
//     console.error("Error marking shifts:", error);
//     res.status(500).json({ error: "Failed to mark shifts" });
//   }
// };

// // -------------------- Shift History --------------------
// const getShiftHistory = async (req, res) => {
//   try {
//     const { spoc_email, type } = req.query;

//     const where = {};
//     if (spoc_email) where.spoc_email = spoc_email;
//     if (type) where.shift_type = type.toUpperCase();

//     const shifts = await prisma.markShift.findMany({
//       where,
//       orderBy: { shift_date: "desc" },
//     });

//     res.json(shifts);
//   } catch (error) {
//     console.error("Error fetching history:", error);
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// };

// module.exports = {
//   markShifts,
//   getShiftHistory,
//   getEmployeesUnderSpoc,
//   checkExistingShifts,
//   deleteShiftEntry,
// };
