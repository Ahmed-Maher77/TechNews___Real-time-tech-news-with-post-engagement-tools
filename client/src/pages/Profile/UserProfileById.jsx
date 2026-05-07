import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import Avatar from "../../components/common/Avatar/Avatar";

function UserProfileById() {
    const { t } = useTranslation();
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(false);
            try {
                const { data } = await api.get(`/users/${userId}`);
                setUser(data?.user || null);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    if (loading) {
        return <section className="ProfilePage">{t("postDetails.loading")}</section>;
    }

    if (error || !user) {
        return (
            <section className="ProfilePage">
                <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                    <p className="mb-0 text-danger">User not found.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="ProfilePage">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-4">
                    {user.userPic ? (
                        <Avatar
                            src={user.userPic}
                            size={72}
                            alt={`${user.name || "User"}'s picture`}
                        />
                    ) : (
                        <Avatar username={user.name || ""} size={72} />
                    )}
                    <div className="flex-grow-1">
                        <h1 className="h3 mb-1">{user.name}</h1>
                        {user.email ? <p className="mb-0">{user.email}</p> : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default UserProfileById;

