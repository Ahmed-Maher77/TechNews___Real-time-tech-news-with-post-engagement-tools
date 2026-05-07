import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../utils/api";
import Avatar from "../../components/common/Avatar/Avatar";
import MainButton from "../../components/common/MainButton/MainButton";
import { selectAuth, setAuth } from "../../store/authSlice";

function Profile() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const auth = useSelector(selectAuth);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (auth) {
            setName(auth.name || "");
            setEmail(auth.email || "");
            setAvatarPreview(auth.userPic || "");
        }
    }, [auth]);

    useEffect(() => {
        return () => {
            if (avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setAvatarFile(null);
            setAvatarPreview(auth?.userPic || "");
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.error(t("auth.imageInvalid"));
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("name", name.trim());
            fd.append("email", email.trim());
            if (avatarFile) {
                fd.append("avatar", avatarFile);
            }
            const { data } = await api.patch("/users/me", fd);
            dispatch(setAuth(data.user));
            setAvatarFile(null);
            toast.success(t("profile.updateSuccess"));
        } catch (err) {
            const msg = err.response?.data?.message || "profile.updateError";
            toast.error(t(msg, { defaultValue: msg }));
        } finally {
            setSaving(false);
        }
    };

    const displayName = auth?.name || t("profile.fallbackUser");
    const displayRole = auth?.role || "user";
    const roleLabel = t(`profile.roleLabels.${displayRole}`, {
        defaultValue: displayRole,
    });

    if (!auth) {
        return null;
    }

    return (
        <section className="ProfilePage">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-4">
                        {avatarPreview ? (
                            <Avatar
                                src={avatarPreview}
                                size={72}
                                alt={`${displayName}'s picture`}
                            />
                        ) : (
                            <Avatar username={displayName} size={72} />
                        )}
                        <div className="flex-grow-1">
                            <h1 className="h3 mb-1">{displayName}</h1>
                            <span className="badge text-bg-dark text-capitalize">
                                {roleLabel}
                            </span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="profile-avatar">
                            {t("auth.profilePhoto")}
                        </label>
                        <input
                            id="profile-avatar"
                            type="file"
                            className="form-control app-form-control"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="profile-name">
                            {t("auth.fullName")}
                        </label>
                        <input
                            id="profile-name"
                            type="text"
                            className="form-control app-form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label" htmlFor="profile-email">
                            {t("auth.email")}
                        </label>
                        <input
                            id="profile-email"
                            type="email"
                            className="form-control app-form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <MainButton type="submit" disabled={saving} fullWidth>
                        {saving
                            ? t("profile.saving")
                            : t("profile.saveChanges")}
                    </MainButton>
                </form>
            </div>
        </section>
    );
}

export default Profile;
