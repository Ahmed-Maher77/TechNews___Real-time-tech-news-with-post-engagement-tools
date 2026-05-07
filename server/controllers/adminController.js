import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { toPublicUser } from "../utils/serializers.js";

export async function createAdmin(req, res) {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({ message: "auth.emailExists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hash,
        role: "admin",
        userPic: "",
    });

    res.status(201).json({ user: toPublicUser(user) });
}
