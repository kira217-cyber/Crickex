import mongoose from "mongoose";

const { Schema } = mongoose;

const AutoWithdrawMethodSchema = new Schema(
  {
    methodId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    opayMethod: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "upay"],
      required: true,
      default: "bkash",
    },

    name: {
      bn: {
        type: String,
        default: "",
        trim: true,
      },
      en: {
        type: String,
        default: "",
        trim: true,
      },
    },

    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    minAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true },
);

const AutoWithdrawTokenSchema = new Schema(
  {
    businessToken: {
      type: String,
      default: "",
      trim: true,
    },

    active: {
      type: Boolean,
      default: false,
    },

    // Path segment on our webhook URL, so only OraclePay's callback (which
    // gets the URL from us) can post withdrawal updates back.
    webhookSecret: {
      type: String,
      default: "",
      trim: true,
    },

    minAmount: {
      type: Number,
      default: 50,
      min: 1,
    },

    maxAmount: {
      type: Number,
      default: 500000,
      min: 0,
    },

    methods: {
      type: [AutoWithdrawMethodSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const AutoWithdrawToken =
  mongoose.models.AutoWithdrawToken ||
  mongoose.model("AutoWithdrawToken", AutoWithdrawTokenSchema);

export default AutoWithdrawToken;
