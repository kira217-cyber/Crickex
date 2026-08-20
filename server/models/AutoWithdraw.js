import mongoose from "mongoose";

const { Schema } = mongoose;

const WalletSnapshotSchema = new Schema(
  {
    methodId: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    methodName: {
      bn: {
        type: String,
        default: "",
      },
      en: {
        type: String,
        default: "",
      },
    },

    walletType: {
      type: String,
      default: "",
      trim: true,
    },

    walletNumber: {
      type: String,
      default: "",
      trim: true,
    },

    label: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const AutoWithdrawSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    wallet: {
      type: Schema.Types.ObjectId,
      ref: "EWallet",
      default: null,
    },

    walletSnapshot: {
      type: WalletSnapshotSchema,
      default: () => ({
        methodId: "",
        methodName: { bn: "", en: "" },
        walletType: "",
        walletNumber: "",
        label: "",
      }),
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // The lowercase wallet key OraclePay expects (bkash / nagad / rocket / upay).
    paymentMethod: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "REVIEW",
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "REVIEW",
      index: true,
    },

    // OraclePay's own id for this withdrawal, returned by the create call.
    opayWithdrawalId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    proofImages: {
      type: [String],
      default: [],
    },

    balanceBefore: {
      type: Number,
      default: 0,
    },

    balanceAfter: {
      type: Number,
      default: 0,
    },

    // Money is held the moment the request is made; these two flags keep the
    // hold and the refund from ever running twice.
    balanceDeducted: {
      type: Boolean,
      default: false,
      index: true,
    },

    refunded: {
      type: Boolean,
      default: false,
      index: true,
    },

    processingAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    // Set only when an admin manually returned a request the gateway never
    // resolved, so a forced return is never mistaken for a normal failure.
    forceReturned: {
      type: Boolean,
      default: false,
    },

    forceReturnedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: "",
      trim: true,
    },

    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    lastWebhook: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

AutoWithdrawSchema.index({ user: 1, createdAt: -1 });
AutoWithdrawSchema.index({ status: 1, createdAt: -1 });

const AutoWithdraw =
  mongoose.models.AutoWithdraw ||
  mongoose.model("AutoWithdraw", AutoWithdrawSchema);

export default AutoWithdraw;
