import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400000 // Auto-delete after 24 hours (in milliseconds)
    }
});

const blacklistModel = mongoose.model("TokenBlacklist", blacklistSchema);

export default blacklistModel;
