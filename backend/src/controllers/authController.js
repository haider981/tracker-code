const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ success: false, message: "Missing idToken" });

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    const picture =
      payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

    // Lookup predefined role in DB
    const userRow = await prisma.users.findUnique({ where: { email } });
    const role = userRow ? userRow.role : "EMPLOYEE";
    const team = userRow ? userRow.team : null;

    // Sign JWT
    const token = jwt.sign({ email, name, role, team, picture }, process.env.JWT_SECRET, { expiresIn: "8h" });

    return res.json({
      success: true,
      token,
      user: { email, name, role, team, picture },
    });
  } catch (err) {
    console.error("Auth error", err);
    return res.status(401).json({ success: false, message: "Invalid ID token" });
  }
};

// const { OAuth2Client } = require("google-auth-library");
// const jwt = require("jsonwebtoken");
// const prisma = require("../config/prisma");

// // Allow comma‑separated client IDs in env (local, prod, etc.)
// const AUDIENCE = (process.env.GOOGLE_CLIENT_ID || "")
//   .split(",")
//   .map(s => s.trim())
//   .filter(Boolean);

// const client = new OAuth2Client(); // you don't need to pass clientId here

// exports.googleAuth = async (req, res) => {
//   // Accept common ways the token arrives
//   const bearer = req.headers.authorization?.startsWith("Bearer ")
//     ? req.headers.authorization.slice(7)
//     : null;
//   const idToken = req.body?.idToken || req.body?.credential || bearer;

//   if (!idToken) {
//     return res.status(400).json({ success: false, message: "Missing ID token (idToken/credential)" });
//   }
//   if (!AUDIENCE.length) {
//     console.error("GOOGLE_CLIENT_ID is not set");
//     return res.status(500).json({ success: false, message: "Server misconfigured" });
//   }

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken,
//       audience: AUDIENCE, // can be an array
//     });
//     const payload = ticket.getPayload();

//     // (Optional) extra checks & quick debug
//     // console.log({ aud: payload.aud, iss: payload.iss, email: payload.email });

//     const email = payload.email;
//     const name = payload.name || (email ? email.split("@")[0] : "User");
//     const picture =
//       payload.picture ||
//       `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

//     // DB lookup happens AFTER token verification
//     const userRow = email ? await prisma.users.findUnique({ where: { email } }) : null;
//     const role = userRow?.role || "EMPLOYEE";
//     const team = userRow?.team ?? null;

//     const token = jwt.sign({ email, name, role, team, picture }, process.env.JWT_SECRET, { expiresIn: "8h" });

//     return res.json({ success: true, token, user: { email, name, role, team, picture } });
//   } catch (err) {
//     console.error("verifyIdToken error:", err?.message || err);
//     return res.status(401).json({ success: false, message: "Invalid ID token" });
//   }
// };
