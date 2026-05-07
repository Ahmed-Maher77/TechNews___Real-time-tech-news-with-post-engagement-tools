import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const [, , emailArg, passwordArg] = process.argv;

if (!emailArg || !passwordArg) {
    console.error("Usage: node server/scripts/seedAdmin.js <email> <password>");
    process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const password = passwordArg;

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI is not set in environment");
        process.exit(1);
    }

    await mongoose.connect(uri);
    const hash = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ email });
    if (existing) {
        existing.role = "admin";
        existing.password = hash;
        await existing.save();
        console.log("Updated existing user to admin:", email);
    } else {
        await User.create({
            name: "Admin",
            email,
            password: hash,
            role: "admin",
            userPic: "",
        });
        console.log("Created admin:", email);
    }

    await mongoose.disconnect();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
