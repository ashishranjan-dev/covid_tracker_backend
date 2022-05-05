import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    email_token: { type: String, required: true },
    email_vaccinated: { type: Boolean, default: false, required: true },
    user_vaccinated: { type: Boolean, default: false, required: false },
    gender: { type: String, default: "", required: false, trim: true },
    vaccine: { type: String, default: "", required: false },
  },
  { timestamps: true }
);

// Model
const UserModel = mongoose.model("user", userSchema);

export default UserModel;
