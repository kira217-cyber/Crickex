import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    text: {
      bn: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const Notice = mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);

export default Notice;
