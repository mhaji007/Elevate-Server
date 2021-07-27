import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter your name"],
      maxlength: [30, "Your name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please enter your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Your password must be longer than 6 characters"],
      maxlength: [64, "Your password cannot exceed 64 characters"],
      // Whenever user is selected, do not select password
      // select: false,
    },
    photo: {
      type: String,
      default: "/avatar.png",
    },
    role: {
      type: [String],
      default: ["Subscriber"],
      enum: ["Subscriber", "Instructor", "Admin"],
    },
    // Alternative role field

    // role: {
    //   type: String,
    //   default: "user",
    //   enum:{
    //     values:['user', 'anotheRoleButNotAdmin'],
    //     message:"Please select a role"
    //   }
    // },

    // For payement system integration

    // Getting user who wants to become an instructor
    // when onboarding them with Stripe we will be receiving the
    // the Stripe account Id which is saved into the database
    stripe_account_id: "",
    // Stripe related information for instructor (seller)
    stripe_seller: {},
    // Before user makes any purchase we receieve a session object
    // and once the payment has been finialized we will get the updated
    // session object which will have the paid status changed from false to true
    stripeSessions: {},
    passwordResetCode: {
      data: String,
      default: "",
    },
  },

  { timestamp: true }
);

export default mongoose.model("User", userSchema);
