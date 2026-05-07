import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },
        image: { type: String, default: "" },
        date: { type: Date, default: () => new Date() },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            },
        ],
        dislikedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            },
        ],
        commentCount: { type: Number, default: 0 },
        featured: { type: Boolean, default: false },
    },
    { timestamps: true },
);

postSchema.index({ title: "text", description: "text", content: "text", category: "text" });
postSchema.index({ featured: 1, date: -1 });
postSchema.index({ author: 1, date: -1 });

export default mongoose.model("Post", postSchema);
