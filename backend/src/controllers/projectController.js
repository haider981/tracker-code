const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/projects?search=query
const getProjects = async (req, res) => {
  try {
    const search = req.query.q || "";      // text to search
    const by = req.query.by || "name";     // default search by name

    let where = {};

    if (by === "id") {
      where = {
        projectid: {
          contains: search,
          mode: "insensitive",
        },
      };
    } else {
      where = {
        project_name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const projects = await prisma.ProjectRecords.findMany({
      where,
      orderBy: { project_name: "asc" },
      take: 50, // limit results
    });

    res.json({ success: true, projects });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getProjects };
