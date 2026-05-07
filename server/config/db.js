import mongoose from "mongoose";

const connectOptions = {
    serverSelectionTimeoutMS: 15_000,
    // Prefer IPv4; some Windows setups fail SRV → host resolution on IPv6 paths.
    family: 4,
};

export async function connectDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not set");
    }
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);
    await mongoose.connect(uri, connectOptions);
}

