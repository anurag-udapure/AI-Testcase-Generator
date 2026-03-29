import mongoose from "mongoose";

const TestCaseSchema = new mongoose.Schema({
    requirement: String,
    context: String,
    testCases: Array,

    // ✅ NEW FIELDS
    rating: {
        type: Number,
        default: 0,
    },
    review: {
        type: String,
        default: "",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.models.TestCase ||
    mongoose.model("TestCase", TestCaseSchema);