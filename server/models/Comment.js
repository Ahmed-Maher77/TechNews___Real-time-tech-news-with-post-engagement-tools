import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: { type: String, required: true, trim: true, maxlength: 5000 },
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
    },
    { timestamps: true },
);

export default mongoose.model("Comment", commentSchema);
