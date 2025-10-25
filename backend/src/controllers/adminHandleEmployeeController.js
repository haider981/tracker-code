// const prisma = require("../config/prisma");

// // Helper function to check for existing users
// const checkExistingUser = async (email, excludeId = null) => {
//   const whereClause = { email: email.toLowerCase() };

//   // If updating, exclude the current user's ID from the check
//   if (excludeId) {
//     whereClause.id = { not: Number(excludeId) };
//   }

//   const existingUser = await prisma.users.findFirst({
//     where: whereClause,
//     select: { id: true, name: true, email: true }
//   });

//   return existingUser;
// };

// // ✅ Get all employees - CLEAN VERSION
// const getUsers = async (req, res) => {
//   try {
//     const users = await prisma.users.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         spoc_name: true,
//         spoc_email: true,
//         team: true,
//         sub_team: true,
//         role: true,
//       }
//     });

//     console.log("Users fetched successfully:", users.length);
//     res.json({ success: true, users });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({
//       message: "Error fetching users",
//       error: err.message
//     });
//   }
// };

// // ✅ Add employee with enhanced duplicate prevention
// const addUser = async (req, res) => {
//   try {
//     const { name, email, spoc_name, spoc_email, team, sub_team, role } = req.body;

//     // Required field validation
//     if (!name || !email || !team) {
//       return res.status(400).json({
//         message: "Missing required fields: name, email, and team are required"
//       });
//     }

//     // Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email.trim())) {
//       return res.status(400).json({
//         message: "Please provide a valid email address"
//       });
//     }

//     // Check if user already exists with this email
//     const existingUser = await checkExistingUser(email.trim());
//     if (existingUser) {
//       return res.status(409).json({
//         message: `User with email '${email.trim().toLowerCase()}' already exists. User: ${existingUser.name}`,
//         conflictField: "email",
//         existingUser: {
//           id: existingUser.id,
//           name: existingUser.name,
//           email: existingUser.email
//         }
//       });
//     }

//     // Validate SPOC email format if provided
//     if (spoc_email && spoc_email.trim() && !emailRegex.test(spoc_email.trim())) {
//       return res.status(400).json({
//         message: "Please provide a valid SPOC email address"
//       });
//     }

//     // Prepare user data
//     const userData = {
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       team: team.trim(),
//       sub_team: sub_team.trim(),
//       role: role || "Employee"
//     };

//     // Add optional fields only if they have values
//     if (spoc_name && spoc_name.trim()) {
//       userData.spoc_name = spoc_name.trim();
//     }
//     if (spoc_email && spoc_email.trim()) {
//       userData.spoc_email = spoc_email.trim().toLowerCase();
//     }

//     const newUser = await prisma.users.create({
//       data: userData,
//     });

//     console.log("User created successfully:", newUser.email);
//     res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       user: newUser
//     });

//   } catch (err) {
//     console.error("Error adding user:", err);

//     // Handle Prisma unique constraint violations as backup
//     if (err.code === 'P2002') {
//       const field = err.meta?.target?.[0] || 'email';
//       return res.status(409).json({
//         message: `User with this ${field} already exists`,
//         conflictField: field
//       });
//     }

//     res.status(500).json({
//       message: "Error adding user",
//       error: err.message
//     });
//   }
// };

// // ✅ Update employee with enhanced duplicate prevention
// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, spoc_name, spoc_email, team, sub_team, role } = req.body;

//     // Validate ID format
//     const userId = Number(id);
//     if (isNaN(userId) || userId <= 0) {
//       return res.status(400).json({
//         message: "Invalid user ID provided"
//       });
//     }

//     // Required field validation
//     if (!name || !email || !team) {
//       return res.status(400).json({
//         message: "Missing required fields: name, email, and team are required"
//       });
//     }

//     // Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email.trim())) {
//       return res.status(400).json({
//         message: "Please provide a valid email address"
//       });
//     }

//     // Check if another user already exists with this email
//     const existingUser = await checkExistingUser(email.trim(), userId);
//     if (existingUser) {
//       return res.status(409).json({
//         message: `Another user with email '${email.trim().toLowerCase()}' already exists. User: ${existingUser.name}`,
//         conflictField: "email",
//         existingUser: {
//           id: existingUser.id,
//           name: existingUser.name,
//           email: existingUser.email
//         }
//       });
//     }

//     // Validate SPOC email format if provided
//     if (spoc_email && spoc_email.trim() && !emailRegex.test(spoc_email.trim())) {
//       return res.status(400).json({
//         message: "Please provide a valid SPOC email address"
//       });
//     }

//     // Prepare update data
//     const updateData = {
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       team: team.trim(),
//       sub_team: sub_team.trim(),
//       role: role || "Employee"
//     };

//     // Handle optional fields (allow clearing them by sending empty strings)
//     if (spoc_name !== undefined) {
//       updateData.spoc_name = spoc_name ? spoc_name.trim() : null;
//     }
//     if (spoc_email !== undefined) {
//       updateData.spoc_email = spoc_email ? spoc_email.trim().toLowerCase() : null;
//     }

//     const updatedUser = await prisma.users.update({
//       where: { id: userId },
//       data: updateData,
//     });

//     console.log("User updated successfully:", updatedUser.email);
//     res.json({
//       success: true,
//       message: "User updated successfully",
//       user: updatedUser
//     });

//   } catch (err) {
//     console.error("Error updating user:", err);

//     if (err.code === 'P2025') {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     // Handle Prisma unique constraint violations as backup
//     if (err.code === 'P2002') {
//       const field = err.meta?.target?.[0] || 'email';
//       return res.status(409).json({
//         message: `Another user with this ${field} already exists`,
//         conflictField: field
//       });
//     }

//     res.status(500).json({
//       message: "Error updating user",
//       error: err.message
//     });
//   }
// };

// // ✅ Delete employee
// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID format
//     const userId = Number(id);
//     if (isNaN(userId) || userId <= 0) {
//       return res.status(400).json({
//         message: "Invalid user ID provided"
//       });
//     }

//     await prisma.users.delete({
//       where: { id: userId },
//     });

//     console.log("User deleted successfully, ID:", userId);
//     res.json({
//       success: true,
//       message: "User deleted successfully"
//     });

//   } catch (err) {
//     console.error("Error deleting user:", err);

//     if (err.code === 'P2025') {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     res.status(500).json({
//       message: "Error deleting user",
//       error: err.message
//     });
//   }
// };


// const getTeams = async (req, res) => {
//   try {
//     const teams = await prisma.users.findMany({
//       where: {
//         team: {
//           not: null  // FIXED: Changed from String to null
//         }
//       },
//       select: {
//         team: true,
//       },
//       distinct: ['team'],
//     });

//     const uniqueTeams = teams
//       .map(t => t.team)
//       .filter(t => t && t.trim())
//       .sort();

//     res.json({ success: true, teams: uniqueTeams });
//   } catch (err) {
//     console.error("Error fetching teams:", err);
//     res.status(500).json({
//       message: "Error fetching teams",
//       error: err.message
//     });
//   }
// };

// // ✅ Get all unique sub-teams - FIXED: Use null instead of String
// const getSubTeams = async (req, res) => {
//   try {
//     const { team } = req.query;

//     const whereClause = {
//       sub_team: {
//         not: null  // FIXED: Changed from String to null
//       }
//     };

//     // If team is provided, filter sub_teams by that team
//     if (team) {
//       whereClause.team = team;
//     }

//     const subTeams = await prisma.users.findMany({
//       where: whereClause,
//       select: {
//         sub_team: true,
//       },
//       distinct: ['sub_team'],
//     });

//     const uniqueSubTeams = subTeams
//       .map(st => st.sub_team)
//       .filter(st => st && st.trim())
//       .sort();

//     res.json({ success: true, subTeams: uniqueSubTeams });
//   } catch (err) {
//     console.error("Error fetching sub-teams:", err);
//     res.status(500).json({
//       message: "Error fetching sub-teams",
//       error: err.message
//     });
//   }
// };

// // ✅ Get all SPOCs (users with role 'Spoc' or 'ADMIN') - FIXED: Use null instead of String
// const getSpocs = async (req, res) => {
//   try {
//     const spocs = await prisma.users.findMany({
//       where: {
//         OR: [
//           { role: 'Spoc' },
//           { role: 'ADMIN' }
//         ],
//         email: {
//           not: null  // FIXED: Changed from String to null
//         }
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//       },
//       orderBy: {
//         name: 'asc'
//       }
//     });

//     res.json({ success: true, spocs });
//   } catch (err) {
//     console.error("Error fetching SPOCs:", err);
//     res.status(500).json({
//       message: "Error fetching SPOCs",
//       error: err.message
//     });
//   }
// };

// // Update the exports at the bottom of the file
// module.exports = {
//   getUsers,
//   addUser,
//   updateUser,
//   deleteUser,
//   getTeams,
//   getSubTeams,
//   getSpocs
// };

const prisma = require("../config/prisma");

// Helper function to check for existing users
const checkExistingUser = async (email, excludeId = null) => {
  const whereClause = { email: email.toLowerCase() };
  
  // If updating, exclude the current user's ID from the check
  if (excludeId) {
    whereClause.id = { not: Number(excludeId) };
  }
  
  const existingUser = await prisma.users.findFirst({
    where: whereClause,
    select: { id: true, name: true, email: true }
  });
  
  return existingUser;
};

// ✅ Get all employees - CLEAN VERSION
const getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        spoc_name: true,
        spoc_email: true,
        team: true,
        sub_team: true,
        role: true,
      },
      orderBy: [
        {
          role: 'desc' // This will put 'Spoc' before 'Employee' alphabetically
        },
        {
          name: 'asc' // Then sort by name within each role
        }
      ]
    });

    // Additional sorting to ensure ADMIN > Spoc > Employee order
    const sortedUsers = users.sort((a, b) => {
      const roleOrder = { 'ADMIN': 1, 'Spoc': 2, 'Employee': 3 };
      const roleA = roleOrder[a.role] || 4;
      const roleB = roleOrder[b.role] || 4;
      
      if (roleA !== roleB) {
        return roleA - roleB;
      }
      
      // If same role, sort by name
      return (a.name || '').localeCompare(b.name || '');
    });

    console.log("Users fetched successfully:", sortedUsers.length);
    res.json({ success: true, users: sortedUsers });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ 
      message: "Error fetching users", 
      error: err.message 
    });
  }
};

// ✅ Add employee with enhanced duplicate prevention
const addUser = async (req, res) => {
  try {
    const { name, email, spoc_name, spoc_email, team, sub_team, role } = req.body;

    // Required field validation
    if (!name || !email || !team) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, and team are required" 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Check if user already exists with this email
    const existingUser = await checkExistingUser(email.trim());
    if (existingUser) {
      return res.status(409).json({ 
        message: `User with email '${email.trim().toLowerCase()}' already exists. User: ${existingUser.name}`,
        conflictField: "email",
        existingUser: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email
        }
      });
    }

    // Validate SPOC email format if provided
    if (spoc_email && spoc_email.trim() && !emailRegex.test(spoc_email.trim())) {
      return res.status(400).json({ 
        message: "Please provide a valid SPOC email address" 
      });
    }

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      team: team.trim(),
      sub_team: sub_team?.trim() || "",
      role: role || "Employee",
      spoc_name: spoc_name?.trim() || "",
      spoc_email: spoc_email?.trim().toLowerCase() || ""
    };

    const newUser = await prisma.users.create({
      data: userData,
    });

    console.log("User created successfully:", newUser.email);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser
    });

  } catch (err) {
    console.error("Error adding user:", err);
    
    // Handle Prisma unique constraint violations as backup
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'email';
      return res.status(409).json({ 
        message: `User with this ${field} already exists`,
        conflictField: field
      });
    }
    
    res.status(500).json({ 
      message: "Error adding user", 
      error: err.message 
    });
  }
};

// ✅ Update employee with enhanced duplicate prevention
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, spoc_name, spoc_email, team, sub_team, role } = req.body;

    // Validate ID format
    const userId = Number(id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        message: "Invalid user ID provided" 
      });
    }

    // Required field validation
    if (!name || !email || !team) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, and team are required" 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Check if another user already exists with this email
    const existingUser = await checkExistingUser(email.trim(), userId);
    if (existingUser) {
      return res.status(409).json({ 
        message: `Another user with email '${email.trim().toLowerCase()}' already exists. User: ${existingUser.name}`,
        conflictField: "email",
        existingUser: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email
        }
      });
    }

    // Validate SPOC email format if provided
    if (spoc_email && spoc_email.trim() && !emailRegex.test(spoc_email.trim())) {
      return res.status(400).json({ 
        message: "Please provide a valid SPOC email address" 
      });
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      team: team.trim(),
      sub_team: sub_team?.trim() || "",
      role: role || "Employee",
      spoc_name: spoc_name?.trim() || "",
      spoc_email: spoc_email?.trim().toLowerCase() || ""
    };

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    console.log("User updated successfully:", updatedUser.email);
    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Error updating user:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }
    
    // Handle Prisma unique constraint violations as backup
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'email';
      return res.status(409).json({ 
        message: `Another user with this ${field} already exists`,
        conflictField: field
      });
    }
    
    res.status(500).json({ 
      message: "Error updating user", 
      error: err.message 
    });
  }
};

// ✅ Delete employee
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    const userId = Number(id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        message: "Invalid user ID provided" 
      });
    }

    await prisma.users.delete({
      where: { id: userId },
    });

    console.log("User deleted successfully, ID:", userId);
    res.json({ 
      success: true,
      message: "User deleted successfully" 
    });
    
  } catch (err) {
    console.error("Error deleting user:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }
    
    res.status(500).json({ 
      message: "Error deleting user", 
      error: err.message 
    });
  }
};

// ✅ Get all unique teams - FIXED: Filter empty strings instead
const getTeams = async (req, res) => {
  try {
    const teams = await prisma.users.findMany({
      where: {
        team: {
          not: ""  // Filter out empty strings
        }
      },
      select: {
        team: true,
      },
      distinct: ['team'],
    });

    const uniqueTeams = teams
      .map(t => t.team)
      .filter(t => t && t.trim())
      .sort();

    res.json({ success: true, teams: uniqueTeams });
  } catch (err) {
    console.error("Error fetching teams:", err);
    res.status(500).json({ 
      message: "Error fetching teams", 
      error: err.message 
    });
  }
};

// ✅ Get all unique sub-teams - FIXED: Filter empty strings instead
const getSubTeams = async (req, res) => {
  try {
    const { team } = req.query;
    
    const whereClause = {
      sub_team: { 
        not: ""  // Filter out empty strings
      }
    };
    
    // If team is provided, filter sub_teams by that team
    if (team) {
      whereClause.team = team;
    }

    const subTeams = await prisma.users.findMany({
      where: whereClause,
      select: {
        sub_team: true,
      },
      distinct: ['sub_team'],
    });

    const uniqueSubTeams = subTeams
      .map(st => st.sub_team)
      .filter(st => st && st.trim())
      .sort();

    res.json({ success: true, subTeams: uniqueSubTeams });
  } catch (err) {
    console.error("Error fetching sub-teams:", err);
    res.status(500).json({ 
      message: "Error fetching sub-teams", 
      error: err.message 
    });
  }
};

// ✅ Get all SPOCs - FIXED: Filter empty strings instead
const getSpocs = async (req, res) => {
  try {
    const spocs = await prisma.users.findMany({
      where: {
        OR: [
          { role: 'Spoc' },
          { role: 'ADMIN' }
        ],
        email: { 
          not: ""  // Filter out empty strings
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ success: true, spocs });
  } catch (err) {
    console.error("Error fetching SPOCs:", err);
    res.status(500).json({ 
      message: "Error fetching SPOCs", 
      error: err.message 
    });
  }
};

// Export all functions
module.exports = { 
  getUsers, 
  addUser, 
  updateUser, 
  deleteUser,
  getTeams,
  getSubTeams,
  getSpocs
};