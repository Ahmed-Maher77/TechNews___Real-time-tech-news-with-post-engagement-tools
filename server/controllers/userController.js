import User from "../models/User.js";
import { toPublicUser } from "../utils/serializers.js";

export async function updateMe(req, res) {
    const updates = {};
    const name = req.body.name !== undefined ? String(req.body.name).trim() : null;
    const email =
        req.body.email !== undefined
            ? String(req.body.email).trim().toLowerCase()
            : null;

    if (name) updates.name = name;
    if (email) {
        const taken = await User.findOne({
            email,
            _id: { $ne: req.user.id },
        });
        if (taken) {
            return res.status(409).json({ message: "auth.emailExists" });
        }
        updates.email = email;
    }

    if (req.file) {
        updates.userPic = `/uploads/${req.file.filename}`;
    } else if (req.body.userPic !== undefined) {
        updates.userPic = String(req.body.userPic).trim();
    }

    if (Object.keys(updates).length === 0) {
        const user = await User.findById(req.user.id);
        return res.json({ user: toPublicUser(user) });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
    });
    res.json({ user: toPublicUser(user) });
}
