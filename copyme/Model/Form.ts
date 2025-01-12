import mongoose from "mongoose";

const Form = new mongoose.Schema(
  {
    name: String,
    email: String,
    work: String,
    otherWork: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Form || mongoose.model("Form", Form);