import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      // "viewer" can reach every admin screen but is blocked from any write,
      // including editing its own profile. See protectAdmin.
      enum: ["mother", "sub", "viewer"],
      default: "sub",
    },

    permissions: {
      type: [String],
      default: [],
    },

    /**
     * Readable copy of a viewer account's password, kept only so the login
     * page can show the demo credentials. `password` above stays hashed and is
     * still the one that authenticates.
     *
     * Set for "viewer" accounts only, and deliberately so: those credentials
     * are meant to be public and the account cannot change anything. Never
     * populate this for a mother or sub admin.
     */
    demoPassword: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;