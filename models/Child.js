// models/Child.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  score: Number,
  correctWords: [String],
  wrongWords: [String],
  practiceLetters: [String],
  suggestion: String,
  sodaResults: [
    {
      word: String,
      akshara: String,
      error_type: String,
      ipa_target: String,
      ipa_spoken: String,
    },
  ],
});

const childSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true }, // Sequential numeric id
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  parent: { type: String, required: true },
  city: { type: String, required: true },
  email: { type: String, required: true },
  address: String,
  phone: String,
  reports: [reportSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp before saving
childSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();
  if (this.isNew && (this.id === undefined || this.id === null)) {
    try {
      const Counter = require("./Counter");
      const counter = await Counter.findByIdAndUpdate(
        { _id: "childId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Child", childSchema);
