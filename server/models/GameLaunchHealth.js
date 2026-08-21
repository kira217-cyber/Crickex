import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Tracks whether a game actually launches.
 *
 * The upstream catalogue offers no "playable" flag, so the only way to learn
 * that a game is broken is to try launching it. Every launch attempt updates
 * the row here; once a game has failed enough times in a row without a single
 * success, it stops being listed on the client site.
 */
const GameLaunchHealthSchema = new Schema(
  {
    gameUId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Consecutive failures. Reset to 0 the moment a launch succeeds, so a
    // game that was merely failing during an upstream outage comes back on
    // its own.
    failCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    hidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastFailedAt: {
      type: Date,
      default: null,
    },

    lastSucceededAt: {
      type: Date,
      default: null,
    },

    lastError: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

const GameLaunchHealth =
  mongoose.models.GameLaunchHealth ||
  mongoose.model("GameLaunchHealth", GameLaunchHealthSchema);

export default GameLaunchHealth;
