import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/d_avatar.png/avatar.png",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required:false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    socialProfiles: {
      github: {
        type: String,
        default: "",
        trim: true,
      },
      linkedin: {
        type: String,
        default: "",
        trim: true,
      },
    },
    connectedProviders: {
      type: [String],
      default: [],
    },
    reviewStats: {
      totalReviewsGiven: {
        type: Number,
        default: 0,
      },
      distinctProjectsReviewed: {
        type: Number,
        default: 0,
      },
      averageRatingGiven: {
        type: Number,
        default: 0,
      },
      averageDeviationFromGlobal: {
        type: Number,
        default: 0,
      },
      ratingCount: {
        type: Number,
        default: 0,
      },
      extremeRatingCount: {
        type: Number,
        default: 0,
      },
    },
    credibilityScore: {
      type: Number,
      default: 1,
      min: 0.2,
      max: 1.5,
    },
    abuseSignals: {
      suspicious: {
        type: Boolean,
        default: false,
      },
      confirmedAbuse: {
        type: Boolean,
        default: false,
      },
      sameIpMatches: {
        type: Number,
        default: 0,
      },
      spamFlags: {
        type: Number,
        default: 0,
      },
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials"
    },
    resetPasswordTokenHash: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
