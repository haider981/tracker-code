// // const prisma = require("../config/prisma");

// // // Get worklogs with filters for admin edit page
// // const getWorklogsForEdit = async (req, res) => {
// //   try {
// //     const { startDate, endDate, employees } = req.body;

// //     // Build query filter
// //     let dateFilter = {};
// //     if (startDate && endDate) {
// //       dateFilter.dueOn = {
// //         $gte: new Date(startDate),
// //         $lte: new Date(endDate + 'T23:59:59.999Z')
// //       };
// //     }

// //     let employeeFilter = {};
// //     if (employees && employees.length > 0) {
// //       employeeFilter.employeeName = { $in: employees };
// //     }

// //     // Combine filters
// //     const filter = { ...dateFilter, ...employeeFilter };

// //     // Fetch worklogs
// //     const worklogs = await masterDatabase.find(filter)
// //       .sort({ dueOn: -1, createdAt: -1 })
// //       .lean();

// //     // Group by date
// //     const worklogsByDate = {};
// //     worklogs.forEach(worklog => {
// //       const dateKey = worklog.dueOn.toISOString().split('T')[0];
// //       if (!worklogsByDate[dateKey]) {
// //         worklogsByDate[dateKey] = [];
// //       }
// //       worklogsByDate[dateKey].push({
// //         ...worklog,
// //         _id: worklog._id.toString(),
// //         dueOn: worklog.dueOn.toISOString().split('T')[0]
// //       });
// //     });

// //     res.json({
// //       success: true,
// //       worklogsByDate
// //     });

// //   } catch (error) {
// //     console.error('Error fetching worklogs for edit:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to fetch worklogs',
// //       error: error.message
// //     });
// //   }
// // };

// // // Update worklog entry
// // const updateWorklogEntry = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const updateData = req.body;

// //     // Validate required fields
// //     const requiredFields = ['employeeName', 'workMode', 'projectName', 'task', 'unitType', 'status', 'dueOn'];
// //     for (let field of requiredFields) {
// //       if (!updateData[field]) {
// //         return res.status(400).json({
// //           success: false,
// //           message: `${field} is required`
// //         });
// //       }
// //     }

// //     // Validate numeric fields
// //     if (updateData.chapterNo !== undefined) {
// //       updateData.chapterNo = Number(updateData.chapterNo);
// //       if (isNaN(updateData.chapterNo) || updateData.chapterNo < 0) {
// //         return res.status(400).json({
// //           success: false,
// //           message: 'Chapter number must be a valid number >= 0'
// //         });
// //       }
// //     }

// //     if (updateData.hoursSpent !== undefined) {
// //       updateData.hoursSpent = Number(updateData.hoursSpent);
// //       if (isNaN(updateData.hoursSpent) || updateData.hoursSpent < 0) {
// //         return res.status(400).json({
// //           success: false,
// //           message: 'Hours spent must be a valid number >= 0'
// //         });
// //       }
// //     }

// //     if (updateData.noOfUnits !== undefined) {
// //       updateData.noOfUnits = Number(updateData.noOfUnits);
// //       if (isNaN(updateData.noOfUnits) || updateData.noOfUnits < 0) {
// //         return res.status(400).json({
// //           success: false,
// //           message: 'Number of units must be a valid number >= 0'
// //         });
// //       }
// //     }

// //     // Convert dueOn to proper date format
// //     if (updateData.dueOn) {
// //       updateData.dueOn = new Date(updateData.dueOn);
// //     }

// //     // Add updated timestamp and updater info
// //     updateData.updatedAt = new Date();
// //     updateData.updatedBy = req.user.name; // Assuming user info is in req.user

// //     // Update the worklog entry
// //     const updatedWorklog = await masterDatabase.findByIdAndUpdate(
// //       id,
// //       updateData,
// //       { new: true, runValidators: true }
// //     );

// //     if (!updatedWorklog) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Worklog entry not found'
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       message: 'Worklog entry updated successfully',
// //       worklog: {
// //         ...updatedWorklog.toObject(),
// //         _id: updatedWorklog._id.toString(),
// //         dueOn: updatedWorklog.dueOn.toISOString().split('T')[0]
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error updating worklog entry:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to update worklog entry',
// //       error: error.message
// //     });
// //   }
// // };

// // // Delete worklog entry
// // const deleteWorklogEntry = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     // Find and delete the worklog entry
// //     const deletedWorklog = await masterDatabase.findByIdAndDelete(id);

// //     if (!deletedWorklog) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Worklog entry not found'
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       message: 'Worklog entry deleted successfully',
// //       deletedWorklog: {
// //         _id: deletedWorklog._id.toString(),
// //         employeeName: deletedWorklog.employeeName,
// //         projectName: deletedWorklog.projectName,
// //         dueOn: deletedWorklog.dueOn.toISOString().split('T')[0]
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error deleting worklog entry:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to delete worklog entry',
// //       error: error.message
// //     });
// //   }
// // };

// // // Create new worklog entry
// // const createWorklogEntry = async (req, res) => {
// //   try {
// //     const worklogData = req.body;

// //     // Validate required fields
// //     const requiredFields = ['employeeName', 'workMode', 'projectName', 'task', 'unitType', 'status', 'dueOn'];
// //     for (let field of requiredFields) {
// //       if (!worklogData[field]) {
// //         return res.status(400).json({
// //           success: false,
// //           message: `${field} is required`
// //         });
// //       }
// //     }

// //     // Validate numeric fields
// //     if (worklogData.chapterNo !== undefined) {
// //       worklogData.chapterNo = Number(worklogData.chapterNo) || 0;
// //     }

// //     if (worklogData.hoursSpent !== undefined) {
// //       worklogData.hoursSpent = Number(worklogData.hoursSpent) || 0;
// //     }

// //     if (worklogData.noOfUnits !== undefined) {
// //       worklogData.noOfUnits = Number(worklogData.noOfUnits) || 0;
// //     }

// //     // Convert dueOn to proper date format
// //     if (worklogData.dueOn) {
// //       worklogData.dueOn = new Date(worklogData.dueOn);
// //     }

// //     // Set default values
// //     worklogData.auditStatus = worklogData.auditStatus || 'Pending';
// //     worklogData.createdAt = new Date();
// //     worklogData.createdBy = req.user.name; // Assuming user info is in req.user

// //     // Create new worklog entry
// //     const newWorklog = new masterDatabase(worklogData);
// //     const savedWorklog = await newWorklog.save();

// //     res.status(201).json({
// //       success: true,
// //       message: 'Worklog entry created successfully',
// //       worklog: {
// //         ...savedWorklog.toObject(),
// //         _id: savedWorklog._id.toString(),
// //         dueOn: savedWorklog.dueOn.toISOString().split('T')[0]
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error creating worklog entry:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to create worklog entry',
// //       error: error.message
// //     });
// //   }
// // };

// // // Get all employees for dropdown
// // const getAllEmployees = async (req, res) => {
// //   try {
// //     const employees = await User.find({ role: { $ne: 'admin' } })
// //       .select('name email')
// //       .sort({ name: 1 });

// //     res.json({
// //       success: true,
// //       employees: employees.map(emp => ({
// //         id: emp._id.toString(),
// //         name: emp.name,
// //         email: emp.email
// //       }))
// //     });

// //   } catch (error) {
// //     console.error('Error fetching employees:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to fetch employees',
// //       error: error.message
// //     });
// //   }
// // };

// // module.exports = {
// //   getWorklogsForEdit,
// //   updateWorklogEntry,
// //   deleteWorklogEntry,
// //   createWorklogEntry,
// //   getAllEmployees
// // };


// const prisma = require("../config/prisma");

// // -------------------------
// // Get worklogs with filters
// // -------------------------
// const getWorklogsForEdit = async (req, res) => {
//   try {
//     const { startDate, endDate, employees } = req.body;

//     const where = {};

//     if (startDate && endDate) {
//       where.due_on = {
//         gte: new Date(startDate),
//         lte: new Date(endDate + "T23:59:59.999Z"),
//       };
//     }

//     if (employees && employees.length > 0) {
//       where.name = { in: employees }; // employees match "name" in MasterDatabase
//     }

//     const worklogs = await prisma.masterDatabase.findMany({
//       where,
//       orderBy: [{ due_on: "desc" }, { date: "desc" }],
//     });

//     // Group by due_on date
//     const worklogsByDate = {};
//     worklogs.forEach((worklog) => {
//       if (!worklog.due_on) return;
//       const dateKey = worklog.due_on.toISOString().split("T")[0];
//       if (!worklogsByDate[dateKey]) {
//         worklogsByDate[dateKey] = [];
//       }
//       worklogsByDate[dateKey].push({
//         ...worklog,
//         id: worklog.id.toString(),
//         due_on: worklog.due_on.toISOString().split("T")[0],
//       });
//     });

//     res.json({ success: true, worklogsByDate });
//   } catch (error) {
//     console.error("Error fetching worklogs for edit:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch worklogs",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Update worklog entry
// // -------------------------
// const updateWorklogEntry = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Convert numeric fields
//     if (updateData.chapter_number !== undefined) {
//       updateData.chapter_number = String(updateData.chapter_number);
//     }
//     if (updateData.hours_spent !== undefined) {
//       updateData.hours_spent = Number(updateData.hours_spent);
//     }
//     if (updateData.number_of_units !== undefined) {
//       updateData.number_of_units = Number(updateData.number_of_units);
//     }

//     if (updateData.due_on) {
//       updateData.due_on = new Date(updateData.due_on);
//     }

//     updateData.audit_status = updateData.audit_status || "Pending";

//     const updatedWorklog = await prisma.masterDatabase.update({
//       where: { id: Number(id) },
//       data: updateData,
//     });

//     res.json({
//       success: true,
//       message: "Worklog entry updated successfully",
//       worklog: {
//         ...updatedWorklog,
//         id: updatedWorklog.id.toString(),
//         due_on: updatedWorklog.due_on
//           ? updatedWorklog.due_on.toISOString().split("T")[0]
//           : null,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating worklog entry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update worklog entry",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Delete worklog entry
// // -------------------------
// const deleteWorklogEntry = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedWorklog = await prisma.masterDatabase.delete({
//       where: { id: Number(id) },
//     });

//     res.json({
//       success: true,
//       message: "Worklog entry deleted successfully",
//       deletedWorklog: {
//         id: deletedWorklog.id.toString(),
//         name: deletedWorklog.name,
//         project_name: deletedWorklog.project_name,
//         due_on: deletedWorklog.due_on
//           ? deletedWorklog.due_on.toISOString().split("T")[0]
//           : null,
//       },
//     });
//   } catch (error) {
//     console.error("Error deleting worklog entry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete worklog entry",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Create new worklog entry
// // -------------------------
// const createWorklogEntry = async (req, res) => {
//   try {
//     const worklogData = req.body;

//     if (worklogData.chapter_number !== undefined) {
//       worklogData.chapter_number = String(worklogData.chapter_number);
//     }
//     if (worklogData.hours_spent !== undefined) {
//       worklogData.hours_spent = Number(worklogData.hours_spent);
//     }
//     if (worklogData.number_of_units !== undefined) {
//       worklogData.number_of_units = Number(worklogData.number_of_units);
//     }
//     if (worklogData.due_on) {
//       worklogData.due_on = new Date(worklogData.due_on);
//     }

//     worklogData.audit_status = worklogData.audit_status || "Pending";
//     worklogData.date = new Date(); // use current timestamp

//     const savedWorklog = await prisma.masterDatabase.create({
//       data: worklogData,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Worklog entry created successfully",
//       worklog: {
//         ...savedWorklog,
//         id: savedWorklog.id.toString(),
//         due_on: savedWorklog.due_on
//           ? savedWorklog.due_on.toISOString().split("T")[0]
//           : null,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating worklog entry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create worklog entry",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Get all employees
// // -------------------------
// const getAllEmployees = async (req, res) => {
//   try {
//     const employees = await prisma.users.findMany({
//       where: { role: { not: "ADMIN" } },
//       select: { id: true, name: true, email: true },
//       orderBy: { name: "asc" },
//     });

//     res.json({
//       success: true,
//       employees: employees.map((emp) => ({
//         id: emp.id.toString(),
//         name: emp.name,
//         email: emp.email,
//       })),
//     });
//   } catch (error) {
//     console.error("Error fetching employees:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch employees",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   getWorklogsForEdit,
//   updateWorklogEntry,
//   deleteWorklogEntry,
//   createWorklogEntry,
//   getAllEmployees,
// };


// const prisma = require("../config/prisma");

// // -------------------------
// // Get worklogs with filters
// // -------------------------
// const getWorklogsForEdit = async (req, res) => {
//   try {
//     const { startDate, endDate, employees, teams } = req.body;
    
//     console.log('Filter params received:', { startDate, endDate, employees, teams });

//     const where = {};

//     // Date filter
//     if (startDate && endDate) {
//       where.due_on = {
//         gte: new Date(startDate + "T00:00:00.000Z"),
//         lte: new Date(endDate + "T23:59:59.999Z"),
//       };
//     }

//     // Employee filter
//     if (employees && employees.length > 0) {
//       where.name = { in: employees };
//     }

//     // Team filter (if teams are provided, we need to get employees from those teams)
//     if (teams && teams.length > 0) {
//       try {
//         // Get users from selected teams
//         const usersInTeams = await prisma.users.findMany({
//           where: {
//             OR: [
//               { team_id: { in: teams.map(id => Number(id)) } },
//               { team: { in: teams } } // fallback for string-based team matching
//             ]
//           },
//           select: { name: true }
//         });

//         const teamEmployeeNames = usersInTeams.map(user => user.name);
        
//         // Combine with employee filter if exists
//         if (where.name?.in) {
//           // Intersection of selected employees and team members
//           where.name.in = where.name.in.filter(name => teamEmployeeNames.includes(name));
//         } else {
//           // Only team members
//           where.name = { in: teamEmployeeNames };
//         }
//       } catch (teamError) {
//         console.warn('Team filtering failed, proceeding without team filter:', teamError.message);
//       }
//     }

//     console.log('Prisma where clause:', JSON.stringify(where, null, 2));

//     const worklogs = await prisma.masterDatabase.findMany({
//       where,
//       orderBy: [{ due_on: "desc" }, { date: "desc" }],
//     });

//     console.log(`Found ${worklogs.length} worklogs`);

//     // Group by due_on date
//     const worklogsByDate = {};
//     worklogs.forEach((worklog) => {
//       let dateKey;
      
//       if (worklog.due_on) {
//         dateKey = worklog.due_on.toISOString().split("T")[0];
//       } else {
//         // Fallback to regular date if due_on is not available
//         dateKey = worklog.date ? worklog.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
//       }

//       if (!worklogsByDate[dateKey]) {
//         worklogsByDate[dateKey] = [];
//       }

//       worklogsByDate[dateKey].push({
//         ...worklog,
//         id: worklog.id.toString(),
//         due_on: worklog.due_on ? worklog.due_on.toISOString().split("T")[0] : dateKey,
//         // Ensure all required fields exist
//         audit_status: worklog.audit_status || "Pending",
//         hours_spent: worklog.hours_spent || 0,
//         number_of_units: worklog.number_of_units || 0,
//         unit_type: worklog.unit_type || "pages",
//         work_mode: worklog.work_mode || "",
//         task: worklog.task || "",
//         book_element: worklog.book_element || "",
//         chapter_number: worklog.chapter_number || "",
//         status: worklog.status || "",
//         details: worklog.details || "",
//       });
//     });

//     console.log('Grouped worklogs by date:', Object.keys(worklogsByDate));

//     res.json({ success: true, worklogsByDate });
//   } catch (error) {
//     console.error("Error fetching worklogs for edit:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch worklogs",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Update worklog entry
// // -------------------------
// const updateWorklogEntry = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     console.log('Updating worklog:', id, updateData);

//     // Convert and validate data
//     const processedData = {
//       ...updateData,
//       chapter_number: updateData.chapter_number !== undefined ? String(updateData.chapter_number) : undefined,
//       hours_spent: updateData.hours_spent !== undefined ? Number(updateData.hours_spent) : undefined,
//       number_of_units: updateData.number_of_units !== undefined ? Number(updateData.number_of_units) : undefined,
//       due_on: updateData.due_on ? new Date(updateData.due_on) : undefined,
//       audit_status: updateData.audit_status || "Pending",
//     };

//     // Remove undefined values
//     Object.keys(processedData).forEach(key => {
//       if (processedData[key] === undefined) {
//         delete processedData[key];
//       }
//     });

//     const updatedWorklog = await prisma.masterDatabase.update({
//       where: { id: Number(id) },
//       data: processedData,
//     });

//     res.json({
//       success: true,
//       message: "Worklog entry updated successfully",
//       worklog: {
//         ...updatedWorklog,
//         id: updatedWorklog.id.toString(),
//         due_on: updatedWorklog.due_on ? updatedWorklog.due_on.toISOString().split("T")[0] : null,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating worklog entry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update worklog entry",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Delete worklog entry
// // -------------------------
// const deleteWorklogEntry = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log('Deleting worklog:', id);

//     const deletedWorklog = await prisma.masterDatabase.delete({
//       where: { id: Number(id) },
//     });

//     res.json({
//       success: true,
//       message: "Worklog entry deleted successfully",
//       deletedWorklog: {
//         id: deletedWorklog.id.toString(),
//         name: deletedWorklog.name,
//         project_name: deletedWorklog.project_name,
//         due_on: deletedWorklog.due_on ? deletedWorklog.due_on.toISOString().split("T")[0] : null,
//       },
//     });
//   } catch (error) {
//     console.error("Error deleting worklog entry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete worklog entry",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Create new worklog entry
// // -------------------------
// const createWorklogEntry = async (req, res) => {
//   try {
//     const worklogData = req.body;

//     console.log('Creating worklog:', worklogData);

//     const processedData = {
//       ...worklogData,
//       chapter_number: worklogData.chapter_number !== undefined ? String(worklogData.chapter_number) : "",
//       hours_spent: worklogData.hours_spent !== undefined ? Number(worklogData.hours_spent) : 0,
//       number_of_units: worklogData.number_of_units !== undefined ? Number(worklogData.number_of_units) : 0,
//       due_on: worklogData.due_on ? new Date(worklogData.due_on) : new Date(),
//       audit_status: worklogData.audit_status || "Pending",
//       date: new Date(), // Current timestamp
//       unit_type: worklogData.unit_type || "pages",
//     };

//     const savedWorklog = await prisma.masterDatabase.create({
//       data: processedData,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Worklog entry created successfully",
//       worklog: {
//         ...savedWorklog,
//         id: savedWorklog.id.toString(),
//         due_on: savedWorklog.due_on ? savedWorklog.due_on.toISOString().split("T")[0] : null,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating worklog entry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create worklog entry",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Get all employees
// // -------------------------
// const getAllEmployees = async (req, res) => {
//   try {
//     const employees = await prisma.users.findMany({
//       where: { role: { not: "ADMIN" } },
//       select: { 
//         id: true, 
//         name: true, 
//         email: true,
//         team: true,
//         team_id: true 
//       },
//       orderBy: { name: "asc" },
//     });

//     res.json({
//       success: true,
//       employees: employees.map((emp) => ({
//         id: emp.id.toString(),
//         name: emp.name,
//         email: emp.email,
//         team: emp.team,
//         teamId: emp.team_id,
//       })),
//     });
//   } catch (error) {
//     console.error("Error fetching employees:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch employees",
//       error: error.message,
//     });
//   }
// };

// // -------------------------
// // Get all teams
// // -------------------------

// module.exports = {
//   getWorklogsForEdit,
//   updateWorklogEntry,
//   deleteWorklogEntry,
//   createWorklogEntry,
//   getAllEmployees,
// };

const prisma = require("../config/prisma");

/* ============ Fetch worklogs ============ */
const getWorklogsForEdit = async (req, res) => {
  try {
    const { startDate, endDate, employees } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate (YYYY-MM-DD) are required." });
    }

    const worklogs = await prisma.masterDatabase.findMany({
      where: {
        date: { gte: new Date(startDate), lte: new Date(endDate) },
        ...(employees && employees.length > 0 ? { name: { in: employees } } : {}),
      },
      orderBy: { date: "desc" },
    });

    // Group by dateKey
    const worklogsByDate = {};
    worklogs.forEach((w) => {
      const key = w.date.toISOString().split("T")[0];
      if (!worklogsByDate[key]) worklogsByDate[key] = [];
      worklogsByDate[key].push(w);
    });

    res.json({ success: true, worklogsByDate });
  } catch (err) {
    console.error("Error fetching worklogs:", err);
    res.status(500).json({ success: false, message: "Server error while fetching worklogs" });
  }
};

/* ============ Add worklog ============ */
const createWorklogEntry = async (req, res) => {
  try {
    const data = req.body;

    const newWorklog = await prisma.masterDatabase.create({
      data: {
        name: data.employeeName,
        date: new Date(data.date),
        work_mode: data.workMode,
        project_name: data.projectName,
        task_name: data.task,
        book_element: data.bookElement,
        chapter_number: data.chapterNumbers,
        hours_spent: data.hoursSpent,
        number_of_units: data.noOfUnits,
        unit_type: data.unitType,
        status: data.status,
        due_on: new Date(data.dueOn),
        details: data.details,
        audit_status: data.auditStatus,
        team: data.team, 
      },
    });

    res.json({ success: true, worklog: newWorklog });
  } catch (err) {
    console.error("Error creating worklog:", err);
    res.status(500).json({ success: false, message: "Server error while creating worklog" });
  }
};

/* ============ Update worklog ============ */
const updateWorklogEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await prisma.masterDatabase.update({
      where: { id: Number(id)},
      data: {
        name: data.employeeName,
        work_mode: data.workMode,
        project_name: data.projectName,
        task_name: data.task,
        book_element: data.bookElement,
        chapter_number: data.chapterNumbers,
        hours_spent: data.hoursSpent,
        number_of_units: data.noOfUnits,
        unit_type: data.unitType,
        status: data.status,
        details: data.details,
        audit_status: data.auditStatus,
      },
    });

    res.json({ success: true, worklog: updated });
  } catch (err) {
    console.error("Error updating worklog:", err);
    res.status(500).json({ success: false, message: "Server error while updating worklog" });
  }
};

/* ============ Delete worklog ============ */
const deleteWorklogEntry = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Deleting worklog:', id);

    const deletedWorklog = await prisma.masterDatabase.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "Worklog entry deleted successfully",
      deletedWorklog: {
        id: deletedWorklog.id.toString(),
        name: deletedWorklog.name,
        project_name: deletedWorklog.project_name,
        due_on: deletedWorklog.due_on ? deletedWorklog.due_on.toISOString().split("T")[0] : null,
      },
    });
  } catch (error) {
    console.error("Error deleting worklog entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete worklog entry",
      error: error.message,
    });
  }
};


module.exports = {
  getWorklogsForEdit,
  updateWorklogEntry,
  deleteWorklogEntry,
  createWorklogEntry,
};