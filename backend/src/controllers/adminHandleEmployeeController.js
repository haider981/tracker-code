// const prisma = require("../config/prisma");

// // ✅ Get all employees
// const getUsers = async (req, res) => {
//   try {
//     // Get ALL fields (no select clause)
//     const users = await prisma.users.findMany();
    
//     console.log("Raw users from DB:", JSON.stringify(users, null, 2));
//     res.json({ success: true, users });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ 
//       message: "Error fetching users", 
//       error: err.message 
//     });
//   }
// };

// // ✅ Add employee
// const addUser = async (req, res) => {
//   try {
//     const { name, email, spoc_name, spoc_email, team, role } = req.body;

//     // Validate required fields
//     if (!name || !email || !team) {
//       return res.status(400).json({
//         message: "Missing required fields: name, email, and team are required"
//       });
//     }

//     // Create user data object without id (let it auto-increment)
//     const userData = {
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       team: team.trim(),
//       role: role || "Employee"
//     };

//     // Add optional fields only if they exist
//     if (spoc_name && spoc_name.trim()) {
//       userData.spoc_name = spoc_name.trim();
//     }
//     if (spoc_email && spoc_email.trim()) {
//       userData.spoc_email = spoc_email.trim().toLowerCase();
//     }

//     const newUser = await prisma.users.create({
//       data: userData,
//     });

//     res.status(201).json(newUser);
//   } catch (err) {
//     console.error("Error adding user:", err);

//     // Handle unique constraint errors
//     if (err.code === 'P2002') {
//       return res.status(400).json({
//         message: "User with this email already exists"
//       });
//     }

//     res.status(400).json({ message: "Error adding user", error: err.message });
//   }
// };

// // ✅ Update employee
// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, spoc_name, spoc_email, team, role } = req.body;

//     // Validate required fields
//     if (!name || !email || !team) {
//       return res.status(400).json({
//         message: "Missing required fields: name, email, and team are required"
//       });
//     }

//     // Create update data object
//     const updateData = {
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       team: team.trim(),
//       role: role || "Employee"
//     };

//     // Add optional fields
//     if (spoc_name !== undefined) {
//       updateData.spoc_name = spoc_name ? spoc_name.trim() : null;
//     }
//     if (spoc_email !== undefined) {
//       updateData.spoc_email = spoc_email ? spoc_email.trim().toLowerCase() : null;
//     }

//     const updatedUser = await prisma.users.update({
//       where: { id: Number(id) },
//       data: updateData,
//     });

//     res.json(updatedUser);
//   } catch (err) {
//     console.error("Error updating user:", err);

//     // Handle not found errors
//     if (err.code === 'P2025') {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     // Handle unique constraint errors
//     if (err.code === 'P2002') {
//       return res.status(400).json({
//         message: "User with this email already exists"
//       });
//     }

//     res.status(400).json({ message: "Error updating user", error: err.message });
//   }
// };

// // ✅ Delete employee
// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await prisma.users.delete({
//       where: { id: Number(id) },
//     });

//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting user:", err);

//     // Handle not found errors
//     if (err.code === 'P2025') {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     res.status(400).json({ message: "Error deleting user", error: err.message });
//   }
// };

// module.exports = { getUsers, addUser, updateUser, deleteUser };

const prisma = require("../config/prisma");

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
        role: true,
      }
    });

    console.log("Users fetched successfully:", users.length);
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ 
      message: "Error fetching users", 
      error: err.message 
    });
  }
};

// ✅ Add employee
const addUser = async (req, res) => {
  try {
    const { name, email, spoc_name, spoc_email, team, role } = req.body;

    if (!name || !email || !team) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, and team are required" 
      });
    }

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      team: team.trim(),
      role: role || "Employee"
    };

    if (spoc_name && spoc_name.trim()) {
      userData.spoc_name = spoc_name.trim();
    }
    if (spoc_email && spoc_email.trim()) {
      userData.spoc_email = spoc_email.trim().toLowerCase();
    }

    const newUser = await prisma.users.create({
      data: userData,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error adding user:", err);
    if (err.code === 'P2002') {
      return res.status(400).json({ 
        message: "User with this email already exists" 
      });
    }
    res.status(400).json({ 
      message: "Error adding user", 
      error: err.message 
    });
  }
};

// ✅ Update employee
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, spoc_name, spoc_email, team, role } = req.body;

    if (!name || !email || !team) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, and team are required" 
      });
    }

    const updateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      team: team.trim(),
      role: role || "Employee"
    };

    if (spoc_name !== undefined) {
      updateData.spoc_name = spoc_name ? spoc_name.trim() : null;
    }
    if (spoc_email !== undefined) {
      updateData.spoc_email = spoc_email ? spoc_email.trim().toLowerCase() : null;
    }

    const updatedUser = await prisma.users.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "User not found" });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ 
        message: "User with this email already exists" 
      });
    }
    res.status(400).json({ 
      message: "Error updating user", 
      error: err.message 
    });
  }
};

// ✅ Delete employee
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.users.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(400).json({ 
      message: "Error deleting user", 
      error: err.message 
    });
  }
};

module.exports = { getUsers, addUser, updateUser, deleteUser };