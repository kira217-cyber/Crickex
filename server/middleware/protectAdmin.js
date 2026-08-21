import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protectAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";

    console.log("AUTH HEADER:", auth);

    const token = auth.startsWith("Bearer ")
      ? auth.split(" ")[1]
      : null;

    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - no token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED:", decoded);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - admin not found",
      });
    }

    req.admin = admin;

    // A viewer is read-only everywhere. Enforcing it here rather than route by
    // route means a new admin route is safe by default instead of open by
    // default. Every admin write in this codebase is a non-GET request.
    if (admin.role === "viewer" && req.method !== "GET") {
      return res.status(403).json({
        success: false,
        code: "VIEW_ONLY_ADMIN",
        message: "You can Only Read Not Allow Any Oparation",
      });
    }

    next();
  } catch (error) {
    console.log("JWT ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Not authorized - invalid token",
    });
  }
};



export const requireMother = (req, res, next) => {
  if (req.admin?.role !== "mother") {
    return res.status(403).json({
      success: false,
      message: "Only mother admin allowed",
    });
  }

  next();
};