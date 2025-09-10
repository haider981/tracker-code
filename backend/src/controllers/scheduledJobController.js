// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// /**
//  * Auto-assign "Leave" entries for employees who haven't submitted any worklog for today
//  * This runs as a scheduled job at 22:30 every day
//  */
// exports.autoAssignLeaveForAllEmployees = async () => {
//   try {
//     console.log("Starting auto-leave assignment job...");

//     // Get today's date (no time portion)
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Get all users from the database
//     const allUsers = await prisma.users.findMany({
//       select: {
//         email: true,
//         name: true,
//         team: true,
//         role: true
//       }
//     });

//     if (allUsers.length === 0) {
//       console.log("No users found in database");
//       return { success: true, message: "No users found", processed: 0, inserted: 0 };
//     }

//     console.log(`Found ${allUsers.length} users in database`);

//     // Get all employees who already have worklog entries for today
//     const usersWithEntriesToday = await prisma.masterDatabase.findMany({
//       where: {
//         date: {
//           gte: today,
//           lt: tomorrow
//         }
//       },
//       select: {
//         name: true
//       },
//       distinct: ['name']
//     });

//     const usersWithEntriesSet = new Set(
//       usersWithEntriesToday.map(entry => entry.name.toLowerCase())
//     );

//     console.log(`Found ${usersWithEntriesSet.size} users who already have entries for today`);

//     // Find users without any entries for today
//     const usersWithoutEntries = allUsers.filter(user => 
//       !usersWithEntriesSet.has(user.name.toLowerCase())
//     );

//     console.log(`Found ${usersWithoutEntries.length} users without entries - will assign leave`);

//     if (usersWithoutEntries.length === 0) {
//       return { 
//         success: true, 
//         message: "All employees already have worklog entries for today", 
//         processed: allUsers.length,
//         inserted: 0 
//       };
//     }

//     // Create "Leave" entries for users without any entries
//     const leaveEntries = usersWithoutEntries.map(user => ({
//       date: today,
//       work_mode: "Leave",
//       project_name: "", // blank
//       task_name: "", // blank
//       book_element: "", // blank
//       chapter_number: "", // blank
//       hours_spent: 7.5, // full day leave
//       number_of_units: 0, // blank
//       unit_type: "general", // default
//       status: "", // blank
//       due_on: today, // today as default
//       details: "Auto-assigned leave - no worklog submitted", // automatic remark
//       audit_status: "Pending",
//       name: user.name,
//       team: user.team || ""
//     }));

//     // Insert all leave entries
//     const result = await prisma.masterDatabase.createMany({
//       data: leaveEntries,
//       skipDuplicates: true
//     });

//     console.log(`Auto-leave assignment completed: ${result.count} entries inserted`);

//     return {
//       success: true,
//       message: `Auto-assigned leave for ${result.count} employees`,
//       processed: allUsers.length,
//       inserted: result.count,
//       usersWithoutEntries: usersWithoutEntries.map(u => u.name)
//     };

//   } catch (error) {
//     console.error("Auto-leave assignment job failed:", error);
//     return {
//       success: false,
//       message: "Auto-leave assignment failed",
//       error: error.message
//     };
//   }
// };

// /**
//  * Manual trigger endpoint for testing
//  * POST /api/admin/auto-assign-leave
//  */
// exports.manualTriggerAutoLeave = async (req, res) => {
//   try {
//     // Optional: Add admin role check here
//     // if (req.user?.role?.toLowerCase() !== 'admin') {
//     //   return res.status(403).json({ success: false, message: "Admin access required" });
//     // }

//     const result = await exports.autoAssignLeaveForAllEmployees();
    
//     return res.json(result);
//   } catch (error) {
//     console.error("Manual auto-leave trigger failed:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to trigger auto-leave assignment",
//       error: error.message
//     });
//   }
// };



const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getUTCDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

exports.autoAssignLeaveForAllEmployees = async () => {
  try {
    console.log("Starting auto-leave assignment job...");

    // Get today's date (no time portion)
    const today = getUTCDateOnly();
    const tomorrow= new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Get all users from the database
    const allUsers = await prisma.users.findMany({
      where: {
        team:"CSMA_Intern"
      },
      select: {
        email: true,
        name: true,
        team: true,
        role: true
      }
    });

    if (allUsers.length === 0) {
      console.log("No users found in database");
      return { success: true, message: "No users found", processed: 0, inserted: 0 };
    }

    console.log(`Found ${allUsers.length} users in database`);

    // Get all employees who already have worklog entries for today
    const usersWithEntriesToday = await prisma.masterDatabase.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        name: true
      },
      distinct: ['name']
    });

    const usersWithEntriesSet = new Set(
      usersWithEntriesToday.map(entry => entry.name.toLowerCase())
    );

    console.log(`Found ${usersWithEntriesSet.size} users who already have entries for today`);

    // Find users without any entries for today
    const usersWithoutEntries = allUsers.filter(user => 
      !usersWithEntriesSet.has(user.name.toLowerCase())
    );

    console.log(`Found ${usersWithoutEntries.length} users without entries - will assign leave`);

    if (usersWithoutEntries.length === 0) {
      return { 
        success: true, 
        message: "All employees already have worklog entries for today", 
        processed: allUsers.length,
        inserted: 0 
      };
    }

    // Create "Leave" entries for users without any entries
    const leaveEntries = usersWithoutEntries.map(user => ({
      date: today,
      work_mode: "Leave",
      project_name: "", // blank
      task_name: "", // blank
      book_element: "", // blank
      chapter_number: "", // blank
      hours_spent: 7.5, // full day leave
      number_of_units: 0, // blank
      unit_type: "general", // default
      status: "", // blank
      due_on: today, // today as default
      details: "Auto-assigned leave - no worklog submitted", // automatic remark
      audit_status: "Pending",
      name: user.name,
      team: user.team || ""
    }));

    // Insert all leave entries
    const result = await prisma.masterDatabase.createMany({
      data: leaveEntries,
      skipDuplicates: true
    });

    console.log(`Auto-leave assignment completed: ${result.count} entries inserted`);

    return {
      success: true,
      message: `Auto-assigned leave for ${result.count} Editorial Maths employees`,
      processed: allUsers.length,
      inserted: result.count,
      usersWithoutEntries: usersWithoutEntries.map(u => u.name)
    };

  } catch (error) {
    console.error("Auto-leave assignment job failed:", error);
    return {
      success: false,
      message: "Auto-leave assignment failed",
      error: error.message
    };
  }
};

/**
 * Manual trigger endpoint for testing
 * POST /api/admin/auto-assign-leave
 */
exports.manualTriggerAutoLeave = async (req, res) => {
  try {
    // Optional: Add admin role check here
    // if (req.user?.role?.toLowerCase() !== 'admin') {
    //   return res.status(403).json({ success: false, message: "Admin access required" });
    // }

    const result = await exports.autoAssignLeaveForAllEmployees();
    
    return res.json(result);
  } catch (error) {
    console.error("Manual auto-leave trigger failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to trigger auto-leave assignment",
      error: error.message
    });
  }
};