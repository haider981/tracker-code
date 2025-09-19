// const prisma = require("../config/prisma");

// // Get worklogs with filters for admin edit page
// const getWorklogsForEdit = async (req, res) => {
//   try {
//     const { startDate, endDate, employees } = req.body;

//     // Build query filter
//     let dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter.dueOn = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     }

//     let employeeFilter = {};
//     if (employees && employees.length > 0) {
//       employeeFilter.employeeName = { $in: employees };
//     }

//     // Combine filters
//     const filter = { ...dateFilter, ...employeeFilter };

//     // Fetch worklogs
//     const worklogs = await masterDatabase.find(filter)
//       .sort({ dueOn: -1, createdAt: -1 })
//       .lean();

//     // Group by date
//     const worklogsByDate = {};
//     worklogs.forEach(worklog => {
//       const dateKey = worklog.dueOn.toISOString().split('T')[0];
//       if (!worklogsByDate[dateKey]) {
//         worklogsByDate[dateKey] = [];
//       }
//       worklogsByDate[dateKey].push({
//         ...worklog,
//         _id: worklog._id.toString(),
//         dueOn: worklog.dueOn.toISOString().split('T')[0]
//       });
//     });

//     res.json({
//       success: true,
//       worklogsByDate
//     });

//   } catch (error) {
//     console.error('Error fetching worklogs for edit:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch worklogs',
//       error: error.message
//     });
//   }
// };

// // Update worklog entry
// const updateWorklogEntry = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Validate required fields
//     const requiredFields = ['employeeName', 'workMode', 'projectName', 'task', 'unitType', 'status', 'dueOn'];
//     for (let field of requiredFields) {
//       if (!updateData[field]) {
//         return res.status(400).json({
//           success: false,
//           message: `${field} is required`
//         });
//       }
//     }

//     // Validate numeric fields
//     if (updateData.chapterNo !== undefined) {
//       updateData.chapterNo = Number(updateData.chapterNo);
//       if (isNaN(updateData.chapterNo) || updateData.chapterNo < 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Chapter number must be a valid number >= 0'
//         });
//       }
//     }

//     if (updateData.hoursSpent !== undefined) {
//       updateData.hoursSpent = Number(updateData.hoursSpent);
//       if (isNaN(updateData.hoursSpent) || updateData.hoursSpent < 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Hours spent must be a valid number >= 0'
//         });
//       }
//     }

//     if (updateData.noOfUnits !== undefined) {
//       updateData.noOfUnits = Number(updateData.noOfUnits);
//       if (isNaN(updateData.noOfUnits) || updateData.noOfUnits < 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Number of units must be a valid number >= 0'
//         });
//       }
//     }

//     // Convert dueOn to proper date format
//     if (updateData.dueOn) {
//       updateData.dueOn = new Date(updateData.dueOn);
//     }

//     // Add updated timestamp and updater info
//     updateData.updatedAt = new Date();
//     updateData.updatedBy = req.user.name; // Assuming user info is in req.user

//     // Update the worklog entry
//     const updatedWorklog = await masterDatabase.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedWorklog) {
//       return res.status(404).json({
//         success: false,
//         message: 'Worklog entry not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Worklog entry updated successfully',
//       worklog: {
//         ...updatedWorklog.toObject(),
//         _id: updatedWorklog._id.toString(),
//         dueOn: updatedWorklog.dueOn.toISOString().split('T')[0]
//       }
//     });

//   } catch (error) {
//     console.error('Error updating worklog entry:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update worklog entry',
//       error: error.message
//     });
//   }
// };

// // Delete worklog entry
// const deleteWorklogEntry = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find and delete the worklog entry
//     const deletedWorklog = await masterDatabase.findByIdAndDelete(id);

//     if (!deletedWorklog) {
//       return res.status(404).json({
//         success: false,
//         message: 'Worklog entry not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Worklog entry deleted successfully',
//       deletedWorklog: {
//         _id: deletedWorklog._id.toString(),
//         employeeName: deletedWorklog.employeeName,
//         projectName: deletedWorklog.projectName,
//         dueOn: deletedWorklog.dueOn.toISOString().split('T')[0]
//       }
//     });

//   } catch (error) {
//     console.error('Error deleting worklog entry:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete worklog entry',
//       error: error.message
//     });
//   }
// };

// // Create new worklog entry
// const createWorklogEntry = async (req, res) => {
//   try {
//     const worklogData = req.body;

//     // Validate required fields
//     const requiredFields = ['employeeName', 'workMode', 'projectName', 'task', 'unitType', 'status', 'dueOn'];
//     for (let field of requiredFields) {
//       if (!worklogData[field]) {
//         return res.status(400).json({
//           success: false,
//           message: `${field} is required`
//         });
//       }
//     }

//     // Validate numeric fields
//     if (worklogData.chapterNo !== undefined) {
//       worklogData.chapterNo = Number(worklogData.chapterNo) || 0;
//     }

//     if (worklogData.hoursSpent !== undefined) {
//       worklogData.hoursSpent = Number(worklogData.hoursSpent) || 0;
//     }

//     if (worklogData.noOfUnits !== undefined) {
//       worklogData.noOfUnits = Number(worklogData.noOfUnits) || 0;
//     }

//     // Convert dueOn to proper date format
//     if (worklogData.dueOn) {
//       worklogData.dueOn = new Date(worklogData.dueOn);
//     }

//     // Set default values
//     worklogData.auditStatus = worklogData.auditStatus || 'Pending';
//     worklogData.createdAt = new Date();
//     worklogData.createdBy = req.user.name; // Assuming user info is in req.user

//     // Create new worklog entry
//     const newWorklog = new masterDatabase(worklogData);
//     const savedWorklog = await newWorklog.save();

//     res.status(201).json({
//       success: true,
//       message: 'Worklog entry created successfully',
//       worklog: {
//         ...savedWorklog.toObject(),
//         _id: savedWorklog._id.toString(),
//         dueOn: savedWorklog.dueOn.toISOString().split('T')[0]
//       }
//     });

//   } catch (error) {
//     console.error('Error creating worklog entry:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create worklog entry',
//       error: error.message
//     });
//   }
// };

// // Get all employees for dropdown
// const getAllEmployees = async (req, res) => {
//   try {
//     const employees = await User.find({ role: { $ne: 'admin' } })
//       .select('name email')
//       .sort({ name: 1 });

//     res.json({
//       success: true,
//       employees: employees.map(emp => ({
//         id: emp._id.toString(),
//         name: emp.name,
//         email: emp.email
//       }))
//     });

//   } catch (error) {
//     console.error('Error fetching employees:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch employees',
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   getWorklogsForEdit,
//   updateWorklogEntry,
//   deleteWorklogEntry,
//   createWorklogEntry,
//   getAllEmployees
// };


const prisma = require("../config/prisma");

// -------------------------
// Get worklogs with filters
// -------------------------
const getWorklogsForEdit = async (req, res) => {
  try {
    const { startDate, endDate, employees } = req.body;

    const where = {};

    if (startDate && endDate) {
      where.due_on = {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    if (employees && employees.length > 0) {
      where.name = { in: employees }; // employees match "name" in MasterDatabase
    }

    const worklogs = await prisma.masterDatabase.findMany({
      where,
      orderBy: [{ due_on: "desc" }, { date: "desc" }],
    });

    // Group by due_on date
    const worklogsByDate = {};
    worklogs.forEach((worklog) => {
      if (!worklog.due_on) return;
      const dateKey = worklog.due_on.toISOString().split("T")[0];
      if (!worklogsByDate[dateKey]) {
        worklogsByDate[dateKey] = [];
      }
      worklogsByDate[dateKey].push({
        ...worklog,
        id: worklog.id.toString(),
        due_on: worklog.due_on.toISOString().split("T")[0],
      });
    });

    res.json({ success: true, worklogsByDate });
  } catch (error) {
    console.error("Error fetching worklogs for edit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch worklogs",
      error: error.message,
    });
  }
};

// -------------------------
// Update worklog entry
// -------------------------
const updateWorklogEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert numeric fields
    if (updateData.chapter_number !== undefined) {
      updateData.chapter_number = String(updateData.chapter_number);
    }
    if (updateData.hours_spent !== undefined) {
      updateData.hours_spent = Number(updateData.hours_spent);
    }
    if (updateData.number_of_units !== undefined) {
      updateData.number_of_units = Number(updateData.number_of_units);
    }

    if (updateData.due_on) {
      updateData.due_on = new Date(updateData.due_on);
    }

    updateData.audit_status = updateData.audit_status || "Pending";

    const updatedWorklog = await prisma.masterDatabase.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Worklog entry updated successfully",
      worklog: {
        ...updatedWorklog,
        id: updatedWorklog.id.toString(),
        due_on: updatedWorklog.due_on
          ? updatedWorklog.due_on.toISOString().split("T")[0]
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating worklog entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update worklog entry",
      error: error.message,
    });
  }
};

// -------------------------
// Delete worklog entry
// -------------------------
const deleteWorklogEntry = async (req, res) => {
  try {
    const { id } = req.params;

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
        due_on: deletedWorklog.due_on
          ? deletedWorklog.due_on.toISOString().split("T")[0]
          : null,
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

// -------------------------
// Create new worklog entry
// -------------------------
const createWorklogEntry = async (req, res) => {
  try {
    const worklogData = req.body;

    if (worklogData.chapter_number !== undefined) {
      worklogData.chapter_number = String(worklogData.chapter_number);
    }
    if (worklogData.hours_spent !== undefined) {
      worklogData.hours_spent = Number(worklogData.hours_spent);
    }
    if (worklogData.number_of_units !== undefined) {
      worklogData.number_of_units = Number(worklogData.number_of_units);
    }
    if (worklogData.due_on) {
      worklogData.due_on = new Date(worklogData.due_on);
    }

    worklogData.audit_status = worklogData.audit_status || "Pending";
    worklogData.date = new Date(); // use current timestamp

    const savedWorklog = await prisma.masterDatabase.create({
      data: worklogData,
    });

    res.status(201).json({
      success: true,
      message: "Worklog entry created successfully",
      worklog: {
        ...savedWorklog,
        id: savedWorklog.id.toString(),
        due_on: savedWorklog.due_on
          ? savedWorklog.due_on.toISOString().split("T")[0]
          : null,
      },
    });
  } catch (error) {
    console.error("Error creating worklog entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create worklog entry",
      error: error.message,
    });
  }
};

// -------------------------
// Get all employees
// -------------------------
const getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.users.findMany({
      where: { role: { not: "ADMIN" } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      employees: employees.map((emp) => ({
        id: emp.id.toString(),
        name: emp.name,
        email: emp.email,
      })),
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

module.exports = {
  getWorklogsForEdit,
  updateWorklogEntry,
  deleteWorklogEntry,
  createWorklogEntry,
  getAllEmployees,
};
