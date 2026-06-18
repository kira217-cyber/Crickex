import mongoose from "mongoose";

const SliderSchema = new mongoose.Schema(
  {
    desktopImage: {
      type: String,
      default: "",
      trim: true,
    },

    mobileImage: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
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

SliderSchema.index({ status: 1, order: 1 });

const Slider = mongoose.models.Slider || mongoose.model("Slider", SliderSchema);

export default Slider;
