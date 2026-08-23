import express from "express";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin, requireMother } from "../middleware/protectAdmin.js";

const router = express.Router();

/* =========================
   Create First Mother Admin
========================= */
router.post("/create-first-time", async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();

    if (totalAdmins > 0) {
      return errorResponse(res, "First admin already created", 403);
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, "Email and password required", 400);
    }

    if (password.length < 6) {
      return errorResponse(res, "Password must be at least 6 characters", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: "mother",
      permissions: [],
    });

    return successResponse(
      res,
      "First mother admin created successfully",
      {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || [],
        },
      },
      201,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email already exists", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Admin Login
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, "Email and password required", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const token = generateToken(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      "30d",
    );

    return successResponse(res, "Login successful", {
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Get Profile
========================= */
router.get("/profile", protectAdmin, async (req, res) => {
  return successResponse(res, "Profile loaded", {
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions || [],
    },
  });
});

/* =========================
   Update Profile
========================= */
router.put("/profile", protectAdmin, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    const normalizedNewEmail =
      typeof email === "string" && email.trim()
        ? email.toLowerCase().trim()
        : admin.email;

    const wantEmailChange = normalizedNewEmail !== admin.email;

    const wantPasswordChange =
      typeof newPassword === "string" && newPassword.trim().length > 0;

    if (!wantEmailChange && !wantPasswordChange) {
      return errorResponse(res, "Nothing to update", 400);
    }

    if (!currentPassword) {
      return errorResponse(res, "Current password is required", 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

    if (wantEmailChange) {
      const exists = await Admin.findOne({ email: normalizedNewEmail });

      if (exists && String(exists._id) !== String(admin._id)) {
        return errorResponse(res, "Email already in use", 409);
      }

      admin.email = normalizedNewEmail;
    }

    if (wantPasswordChange) {
      if (newPassword.trim().length < 6) {
        return errorResponse(
          res,
          "New password must be at least 6 characters",
          400,
        );
      }

      admin.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    await admin.save();

    return successResponse(res, "Profile updated successfully", {
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email already exists", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Demo Credentials (public)
========================= */

/**
 * Feeds the demo box on the login page.
 *
 * Public on purpose: a viewer account is read-only, and the whole point of
 * these credentials is that anyone can try the panel with them. Only viewer
 * accounts are ever returned, and only ones that have a readable password
 * stored, so a mother or sub admin can never leak through here.
 */
router.get("/demo-credentials", async (req, res) => {
  try {
    const viewer = await Admin.findOne({
      role: "viewer",
      demoPassword: { $nin: ["", null] },
    })
      .sort({ createdAt: -1 })
      .select("email demoPassword")
      .lean();

    if (!viewer) {
      return successResponse(res, "No demo account", { demo: null });
    }

    return successResponse(res, "Demo account loaded", {
      demo: {
        email: viewer.email,
        password: viewer.demoPassword,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Create Admin
========================= */
router.post("/create-admin", protectAdmin, requireMother, async (req, res) => {
  try {
    const { email, password, role, permissions } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, "Email and password required", 400);
    }

    if (password.length < 6) {
      return errorResponse(res, "Password must be at least 6 characters", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await Admin.findOne({ email: normalizedEmail });

    if (exists) {
      return errorResponse(res, "Admin already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const finalRole = ["mother", "viewer"].includes(role) ? role : "sub";

    const newAdmin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: finalRole,
      // Only a viewer's password is stored readably, because only those
      // credentials are meant to be shown on the login page.
      demoPassword: finalRole === "viewer" ? password : "",
      // mother and viewer both reach every screen, so neither carries a
      // per-page permission list.
      permissions:
        role === "mother" || role === "viewer"
          ? []
          : Array.isArray(permissions)
            ? permissions
            : [],
    });

    return successResponse(
      res,
      "Admin created successfully",
      {
        admin: {
          id: newAdmin._id,
          email: newAdmin.email,
          role: newAdmin.role,
          permissions: newAdmin.permissions || [],
        },
      },
      201,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email already exists", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   List Admins
========================= */
router.get("/admins", protectAdmin, requireMother, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("_id email role permissions createdAt updatedAt")
      .sort({ createdAt: -1 });

    return successResponse(res, "Admins loaded successfully", {
      admins,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Update Admin
========================= */
router.put("/admins/:id", protectAdmin, requireMother, async (req, res) => {
  try {
    const { email, role, permissions, newPassword } = req.body || {};

    const target = await Admin.findById(req.params.id);

    if (!target) {
      return errorResponse(res, "Admin not found", 404);
    }

    if (typeof email === "string" && email.trim() !== "") {
      const normalizedEmail = email.toLowerCase().trim();

      const exists = await Admin.findOne({ email: normalizedEmail });

      if (exists && String(exists._id) !== String(target._id)) {
        return errorResponse(res, "Email already in use by another admin", 409);
      }

      target.email = normalizedEmail;
    }

    if (typeof role === "string") {
      target.role = ["mother", "viewer"].includes(role) ? role : "sub";

      if (target.role !== "sub") {
        target.permissions = [];
      }

      // Demoting away from viewer must not leave a readable password behind.
      if (target.role !== "viewer") {
        target.demoPassword = "";
      }
    }

    if (Array.isArray(permissions) && target.role === "sub") {
      target.permissions = permissions;
    }

    if (typeof newPassword === "string" && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return errorResponse(
          res,
          "New password must be at least 6 characters",
          400,
        );
      }

      target.password = await bcrypt.hash(newPassword.trim(), 10);

      if (target.role === "viewer") {
        target.demoPassword = newPassword.trim();
      }
    }

    await target.save();

    return successResponse(res, "Admin updated successfully", {
      admin: {
        id: target._id,
        email: target.email,
        role: target.role,
        permissions: target.permissions || [],
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Delete Admin
========================= */
router.delete("/admins/:id", protectAdmin, requireMother, async (req, res) => {
  try {
    const target = await Admin.findById(req.params.id);

    if (!target) {
      return errorResponse(res, "Admin not found", 404);
    }

    if (String(target._id) === String(req.admin._id)) {
      return errorResponse(
        res,
        "You cannot delete your own admin account",
        400,
      );
    }

    await Admin.deleteOne({ _id: target._id });

    return successResponse(res, "Admin deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
