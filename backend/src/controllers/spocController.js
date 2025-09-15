// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// class SpocController {
    
//     // Get pending worklogs for approval
//     static async getPendingWorklogs(req, res) {
//         try {
//             const spocEmail = req.user.email;
//             console.log('SPOC Email:', spocEmail); // Debug log
            
//             // Calculate date range for past 7 days
//             const endDate = new Date();
//             const startDate = new Date();
//             startDate.setDate(endDate.getDate() - 7);
//             startDate.setHours(0, 0, 0, 0); // Start of day
//             endDate.setHours(23, 59, 59, 999); // End of day
            
//             console.log('Date range:', { startDate, endDate }); // Debug log
            
//             // First, get all employees under this SPOC
//             let employeesUnderSpoc;
            
//             try {
//                 employeesUnderSpoc = await prisma.users.findMany({
//                     where: {
//                         spoc_email: spocEmail,
//                         role: 'EMPLOYEE' // or enum value
//                     },
//                     select: { name: true, email: true, team: true }
//                 });
//             } catch (enumError) {
//                 try {
//                     employeesUnderSpoc = await prisma.users.findMany({
//                         where: {
//                             spoc_email: spocEmail,
//                             role: 'employee' // lowercase
//                         },
//                         select: { name: true, email: true, team: true }
//                     });
//                 } catch (caseError) {
//                     employeesUnderSpoc = await prisma.$queryRaw`
//                         SELECT name, email, team 
//                         FROM "Users" 
//                         WHERE spoc_email = ${spocEmail} 
//                         AND role::text = 'Employee'
//                     `;
//                 }
//             }

//             console.log('Employees found:', employeesUnderSpoc.length); // Debug log

//             if (employeesUnderSpoc.length === 0) {
//                 return res.json({
//                     success: true,
//                     worklogsByDate: {},
//                     totalCount: 0,
//                     message: 'No employees found under this SPOC'
//                 });
//             }

//             const employeeNames = employeesUnderSpoc.map(emp => emp.name);
//             console.log('Employee names:', employeeNames); // Debug log

//             // Fetch worklogs for these employees with pending status
//             const worklogs = await prisma.masterDatabase.findMany({
//                 where: {
//                     name: { in: employeeNames },
//                     date: { gte: startDate, lte: endDate },
//                     audit_status: 'Pending'
//                 }
//             });

//             console.log('Worklogs found:', worklogs.length); // Debug log

//             // Group worklogs by date and add employee info
//             const worklogsByDate = {};
//             worklogs.forEach(log => {
//                 const employeeInfo = employeesUnderSpoc.find(emp => emp.name === log.name);
                
//                 const formattedLog = {
//                     _id: log.id,
//                     employeeName: log.name,
//                     employeeEmail: employeeInfo?.email || '',
//                     workMode: log.work_mode,
//                     projectName: log.project_name,
//                     task: log.task_name,
//                     bookElement: log.book_element,
//                     chapterNo: log.chapter_number,
//                     hoursSpent: log.hours_spent,
//                     noOfUnits: log.number_of_units,
//                     unitType: log.unit_type,
//                     status: log.status,
//                     dueOn: log.due_on,
//                     details: log.details || '',
//                     auditStatus: log.audit_status,
//                     team: log.team,
//                     date: log.date
//                 };

//                 const dateKey = log.date ? log.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                
//                 if (!worklogsByDate[dateKey]) {
//                     worklogsByDate[dateKey] = [];
//                 }
//                 worklogsByDate[dateKey].push(formattedLog);
//             });

//             // ✅ Sort worklogs by date (latest first)
//             const sortedWorklogsByDate = {};
//             Object.keys(worklogsByDate)
//                 .sort((a, b) => new Date(b) - new Date(a)) // Desc order
//                 .forEach(key => {
//                     sortedWorklogsByDate[key] = worklogsByDate[key];
//                 });

//             res.json({
//                 success: true,
//                 worklogsByDate: sortedWorklogsByDate,
//                 totalCount: worklogs.length,
//                 employeeCount: employeesUnderSpoc.length
//             });

//         } catch (error) {
//             console.error('Error fetching pending worklogs:', error);
//             res.status(500).json({
//                 success: false,
//                 error: 'Internal server error',
//                 message: error.message
//             });
//         }
//     }

//     // Update worklog audit status
//     static async updateWorklogStatus(req, res) {
//         try {
//             const { worklogId, auditStatus } = req.body;
//             const spocEmail = req.user.email;

//             console.log('Update request:', { worklogId, auditStatus, spocEmail });

//             if (!worklogId || !auditStatus) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Missing required fields',
//                     message: 'worklogId and auditStatus are required'
//                 });
//             }

//             if (!['Approved', 'Rejected'].includes(auditStatus)) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Invalid audit status',
//                     message: 'auditStatus must be either "Approved" or "Rejected"'
//                 });
//             }

//             const worklog = await prisma.masterDatabase.findUnique({
//                 where: { id: parseInt(worklogId) }
//             });

//             if (!worklog) {
//                 return res.status(404).json({
//                     success: false,
//                     error: 'Worklog not found',
//                     message: 'The specified worklog does not exist'
//                 });
//             }

//             let employee;
//             try {
//                 employee = await prisma.users.findFirst({
//                     where: {
//                         name: worklog.name,
//                         spoc_email: spocEmail,
//                         role: 'EMPLOYEE'
//                     }
//                 });
//             } catch (enumError) {
//                 try {
//                     employee = await prisma.users.findFirst({
//                         where: {
//                             name: worklog.name,
//                             spoc_email: spocEmail,
//                             role: 'employee'
//                         }
//                     });
//                 } catch (caseError) {
//                     const result = await prisma.$queryRaw`
//                         SELECT id, name, email, team, spoc_name 
//                         FROM "Users" 
//                         WHERE name = ${worklog.name} 
//                         AND spoc_email = ${spocEmail} 
//                         AND role::text = 'Employee'
//                         LIMIT 1
//                     `;
//                     employee = result[0] || null;
//                 }
//             }

//             if (!employee) {
//                 return res.status(403).json({
//                     success: false,
//                     error: 'Access denied',
//                     message: 'You are not authorized to approve/reject this worklog'
//                 });
//             }

//             const updatedWorklog = await prisma.masterDatabase.update({
//                 where: { id: parseInt(worklogId) },
//                 data: { audit_status: auditStatus }
//             });

//             res.json({
//                 success: true,
//                 message: `Worklog ${auditStatus.toLowerCase()} successfully`,
//                 worklog: {
//                     id: updatedWorklog.id,
//                     employeeName: updatedWorklog.name,
//                     projectName: updatedWorklog.project_name,
//                     auditStatus: updatedWorklog.audit_status,
//                     updatedAt: new Date()
//                 }
//             });

//         } catch (error) {
//             console.error('Error updating worklog status:', error);
//             res.status(500).json({
//                 success: false,
//                 error: 'Internal server error',
//                 message: error.message
//             });
//         }
//     }

//     // Get worklog summary
//     static async getWorklogSummary(req, res) {
//         try {
//             const spocEmail = req.user.email;
            
//             let employeesUnderSpoc;
//             try {
//                 employeesUnderSpoc = await prisma.users.findMany({
//                     where: { spoc_email: spocEmail, role: 'EMPLOYEE' },
//                     select: { name: true }
//                 });
//             } catch (enumError) {
//                 try {
//                     employeesUnderSpoc = await prisma.users.findMany({
//                         where: { spoc_email: spocEmail, role: 'employee' },
//                         select: { name: true }
//                     });
//                 } catch (caseError) {
//                     employeesUnderSpoc = await prisma.$queryRaw`
//                         SELECT name 
//                         FROM "Users" 
//                         WHERE spoc_email = ${spocEmail} 
//                         AND role::text = 'Employee'
//                     `;
//                 }
//             }

//             if (employeesUnderSpoc.length === 0) {
//                 return res.json({
//                     success: true,
//                     summary: {
//                         totalEmployees: 0,
//                         pendingApprovals: 0,
//                         approvedWorklogs: 0,
//                         rejectedWorklogs: 0,
//                         totalWorklogs: 0
//                     }
//                 });
//             }

//             const employeeNames = employeesUnderSpoc.map(emp => emp.name);

//             const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
//                 prisma.masterDatabase.count({ where: { name: { in: employeeNames }, audit_status: 'Pending' } }),
//                 prisma.masterDatabase.count({ where: { name: { in: employeeNames }, audit_status: 'Approved' } }),
//                 prisma.masterDatabase.count({ where: { name: { in: employeeNames }, audit_status: 'Rejected' } })
//             ]);

//             res.json({
//                 success: true,
//                 summary: {
//                     totalEmployees: employeesUnderSpoc.length,
//                     pendingApprovals: pendingCount,
//                     approvedWorklogs: approvedCount,
//                     rejectedWorklogs: rejectedCount,
//                     totalWorklogs: pendingCount + approvedCount + rejectedCount
//                 }
//             });

//         } catch (error) {
//             console.error('Error fetching worklog summary:', error);
//             res.status(500).json({
//                 success: false,
//                 error: 'Internal server error',
//                 message: error.message
//             });
//         }
//     }

//     // Get all employees under SPOC
//     static async getEmployeesUnderSpoc(req, res) {
//         try {
//             const spocEmail = req.user.email;
            
//             let employees;
//             const possibleRoleValues = ['Employee', 'Spoc', 'ADMIN'];
            
//             for (const roleValue of possibleRoleValues) {
//                 try {
//                     employees = await prisma.users.findMany({
//                         where: { spoc_email: spocEmail, role: roleValue },
//                         select: { id: true, name: true, email: true, team: true, spoc_name: true },
//                         orderBy: { name: 'asc' }
//                     });
//                     if (employees.length > 0) break;
//                 } catch (error) {
//                     console.log(`Failed to get employees with role ${roleValue}:`, error.message);
//                     continue;
//                 }
//             }
            
//             if (!employees) employees = [];

//             res.json({
//                 success: true,
//                 employees,
//                 count: employees.length
//             });

//         } catch (error) {
//             console.error('Error fetching employees under SPOC:', error);
//             res.status(500).json({
//                 success: false,
//                 error: 'Internal server error',
//                 message: error.message
//             });
//         }
//     }
// }

// module.exports = SpocController;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * SPOC Controller
 *
 * Endpoints:
 *  - POST /api/spoc/worklogs
 *  - PUT  /api/spoc/worklogs/update-status
 *  - PUT  /api/spoc/worklogs/bulk-update-status   <-- NEW (Approve All support)
 *  - GET  /api/spoc/worklogs/summary
 *  - GET  /api/spoc/employees
 *
 * Notes:
 *  - Dates passed as YYYY-MM-DD. We compute full-day UTC bounds.
 *  - Rows are returned for all audit_status values (Pending/Approved/Rejected).
 *  - “Approve All” updates many rows in a single statement for speed.
 */

class SpocController {
  /** POST /api/spoc/worklogs */
  static async getWorklogs(req, res) {
    const t0 = Date.now();
    try {
      const spocEmail = req.user?.email;
      if (!spocEmail) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Missing user email in token.",
        });
      }

      const { startDate, endDate, employees: filterEmployees } = req.body || {};
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "startDate and endDate (YYYY-MM-DD) are required.",
        });
      }

      const start = parseISOStart(startDate);
      const end = parseISOEnd(endDate);
      if (!start || !end) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Invalid date format. Use YYYY-MM-DD.",
        });
      }

      // Employees under this SPOC
      const employeesUnderSpoc = await findEmployeesBySpoc(spocEmail);
      if (employeesUnderSpoc.length === 0) {
        return res.json({
          success: true,
          worklogsByDate: {},
          totalCount: 0,
          employeeCount: 0,
          message: "No employees found under this SPOC.",
        });
      }
      const allNames = employeesUnderSpoc.map((e) => e.name);
      const namesToUse =
        Array.isArray(filterEmployees) && filterEmployees.length > 0
          ? filterEmployees
          : allNames;

      // Fetch rows
      const worklogs = await prisma.masterDatabase.findMany({
        where: {
          name: { in: namesToUse },
          date: { gte: start, lte: end },
        },
        orderBy: [{ date: "desc" }, { name: "asc" }, { id: "asc" }],
      });

      // Group by date string (YYYY-MM-DD)
      const byDate = {};
      for (const log of worklogs) {
        const dateKey = toISODateKey(log.date);
        if (!byDate[dateKey]) byDate[dateKey] = [];

        const u = employeesUnderSpoc.find((e) => e.name === log.name);

        byDate[dateKey].push({
          _id: log.id,
          employeeName: log.name,
          employeeEmail: u?.email || "",
          workMode: log.work_mode,
          projectName: log.project_name,
          task: log.task_name,
          bookElement: log.book_element,
          chapterNo: log.chapter_number,
          hoursSpent: log.hours_spent,
          noOfUnits: log.number_of_units,
          unitType: log.unit_type,
          status: log.status,
          dueOn: log.due_on, // can be Date or string; frontend handles formatting robustly
          details: log.details || "",
          auditStatus: log.audit_status, // "Pending" | "Approved" | "Rejected"
          team: log.team,
          date: log.date,
        });
      }

      const sorted = {};
      Object.keys(byDate)
        .sort((a, b) => new Date(b) - new Date(a))
        .forEach((k) => (sorted[k] = byDate[k]));

      const t1 = Date.now();
      console.log(
        `[getWorklogs] SPOC=${spocEmail} items=${worklogs.length} in ${t1 - t0}ms`
      );

      return res.json({
        success: true,
        worklogsByDate: sorted,
        totalCount: worklogs.length,
        employeeCount: employeesUnderSpoc.length,
      });
    } catch (error) {
      console.error("[getWorklogs] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /** PUT /api/spoc/worklogs/update-status */
  static async updateWorklogStatus(req, res) {
    const t0 = Date.now();
    try {
      const { worklogId, auditStatus } = req.body || {};
      const spocEmail = req.user?.email;

      if (!worklogId || !auditStatus) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "worklogId and auditStatus are required.",
        });
      }
      if (!["Approved", "Rejected"].includes(auditStatus)) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: 'auditStatus must be "Approved" or "Rejected".',
        });
      }

      const idInt = parseInt(worklogId, 10);
      if (Number.isNaN(idInt)) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "worklogId must be an integer.",
        });
      }

      const worklog = await prisma.masterDatabase.findUnique({
        where: { id: idInt },
      });
      if (!worklog) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Worklog not found.",
        });
      }

      // Ownership check: SPOC must own this employee
      const authorized = await verifySpocOwnsEmployee(spocEmail, worklog.name);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "You are not authorized to approve/reject this worklog.",
        });
      }

      const updated = await prisma.masterDatabase.update({
        where: { id: idInt },
        data: { audit_status: auditStatus },
      });

      const t1 = Date.now();
      console.log(
        `[updateWorklogStatus] id=${idInt} -> ${auditStatus} in ${t1 - t0}ms`
      );

      return res.json({
        success: true,
        message: `Worklog ${auditStatus.toLowerCase()} successfully`,
        worklog: {
          id: updated.id,
          employeeName: updated.name,
          projectName: updated.project_name,
          auditStatus: updated.audit_status,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("[updateWorklogStatus] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /** PUT /api/spoc/worklogs/bulk-update-status */
  static async bulkUpdateWorklogStatus(req, res) {
    const t0 = Date.now();
    try {
      const { worklogIds, auditStatus } = req.body || {};
      const spocEmail = req.user?.email;

      if (!Array.isArray(worklogIds) || worklogIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "worklogIds (array) is required.",
        });
      }
      if (!["Approved", "Rejected"].includes(auditStatus)) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: 'auditStatus must be "Approved" or "Rejected".',
        });
      }

      const ids = worklogIds.map((x) => parseInt(x, 10)).filter((n) => !isNaN(n));
      if (ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "No valid integer IDs provided.",
        });
      }

      // Ensure all rows belong to SPOC's employees
      const rows = await prisma.masterDatabase.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true },
      });

      const distinctNames = [...new Set(rows.map((r) => r.name))];
      for (const nm of distinctNames) {
        const ok = await verifySpocOwnsEmployee(spocEmail, nm);
        if (!ok) {
          return res.status(403).json({
            success: false,
            error: "Forbidden",
            message: `You are not authorized to update records for employee "${nm}".`,
          });
        }
      }

      // Bulk update
      const r = await prisma.masterDatabase.updateMany({
        where: { id: { in: ids } },
        data: { audit_status: auditStatus },
      });

      const t1 = Date.now();
      console.log(
        `[bulkUpdateWorklogStatus] count=${ids.length} -> ${auditStatus} in ${
          t1 - t0
        }ms`
      );

      return res.json({
        success: true,
        count: r.count,
        message: `Updated ${r.count} worklog(s) to ${auditStatus}.`,
      });
    } catch (error) {
      console.error("[bulkUpdateWorklogStatus] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /** GET /api/spoc/worklogs/summary */
  static async getWorklogSummary(req, res) {
    try {
      const spocEmail = req.user?.email;
      if (!spocEmail) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Missing user email in token.",
        });
      }

      const employees = await findEmployeesBySpoc(spocEmail);
      if (employees.length === 0) {
        return res.json({
          success: true,
          summary: {
            totalEmployees: 0,
            pendingApprovals: 0,
            approvedWorklogs: 0,
            rejectedWorklogs: 0,
            totalWorklogs: 0,
          },
        });
      }

      const names = employees.map((e) => e.name);
      const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
        prisma.masterDatabase.count({
          where: { name: { in: names }, audit_status: "Pending" },
        }),
        prisma.masterDatabase.count({
          where: { name: { in: names }, audit_status: "Approved" },
        }),
        prisma.masterDatabase.count({
          where: { name: { in: names }, audit_status: "Rejected" },
        }),
      ]);

      return res.json({
        success: true,
        summary: {
          totalEmployees: employees.length,
          pendingApprovals: pendingCount,
          approvedWorklogs: approvedCount,
          rejectedWorklogs: rejectedCount,
          totalWorklogs: pendingCount + approvedCount + rejectedCount,
        },
      });
    } catch (error) {
      console.error("[getWorklogSummary] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /** GET /api/spoc/employees */
  static async getEmployeesUnderSpoc(req, res) {
    try {
      const spocEmail = req.user?.email;
      if (!spocEmail) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Missing user email in token.",
        });
      }

      const employees = await findEmployeesBySpoc(spocEmail);
      return res.json({
        success: true,
        employees,
        count: employees.length,
      });
    } catch (error) {
      console.error("[getEmployeesUnderSpoc] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
}

module.exports = SpocController;

/* ========================= Helpers ========================= */

function parseISOStart(s) {
  try {
    const d = new Date(`${s}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}
function parseISOEnd(s) {
  try {
    const d = new Date(`${s}T23:59:59.999Z`);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}
function toISODateKey(d) {
  const dt = new Date(d);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Role/ownership utilities (robust to enum/text casing) */
async function findEmployeesBySpoc(spocEmail) {
  // Try enum/uppercase
  try {
    const res = await prisma.users.findMany({
      where: { spoc_email: spocEmail, role: "EMPLOYEE" },
      select: { id: true, name: true, email: true, team: true, spoc_name: true },
      orderBy: { name: "asc" },
    });
    if (res.length) return res;
  } catch {}

  // lowercase
  try {
    const res = await prisma.users.findMany({
      where: { spoc_email: spocEmail, role: "employee" },
      select: { id: true, name: true, email: true, team: true, spoc_name: true },
      orderBy: { name: "asc" },
    });
    if (res.length) return res;
  } catch {}

  // capitalized
  try {
    const res = await prisma.users.findMany({
      where: { spoc_email: spocEmail, role: "Employee" },
      select: { id: true, name: true, email: true, team: true, spoc_name: true },
      orderBy: { name: "asc" },
    });
    if (res.length) return res;
  } catch {}

  // Raw SQL fallback
  try {
    const res = await prisma.$queryRaw`
      SELECT id, name, email, team, spoc_name
      FROM "Users"
      WHERE spoc_email = ${spocEmail}
        AND role::text IN ('EMPLOYEE','Employee','employee')
      ORDER BY name ASC
    `;
    return res || [];
  } catch {
    return [];
  }
}

async function verifySpocOwnsEmployee(spocEmail, employeeName) {
  try {
    const r1 = await prisma.users.findFirst({
      where: { name: employeeName, spoc_email: spocEmail, role: "EMPLOYEE" },
    });
    if (r1) return true;
  } catch {}

  try {
    const r2 = await prisma.users.findFirst({
      where: { name: employeeName, spoc_email: spocEmail, role: "employee" },
    });
    if (r2) return true;
  } catch {}

  try {
    const r3 = await prisma.users.findFirst({
      where: { name: employeeName, spoc_email: spocEmail, role: "Employee" },
    });
    if (r3) return true;
  } catch {}

  try {
    const raw = await prisma.$queryRaw`
      SELECT id FROM "Users"
      WHERE name = ${employeeName}
        AND spoc_email = ${spocEmail}
        AND role::text IN ('EMPLOYEE','Employee','employee')
      LIMIT 1
    `;
    return raw && raw.length > 0;
  } catch {
    return false;
  }
}
