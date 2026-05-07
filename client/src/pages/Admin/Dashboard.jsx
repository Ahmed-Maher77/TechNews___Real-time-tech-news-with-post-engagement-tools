import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import api from "../../utils/api";
import "./Dashboard.css";

function Dashboard() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await api.get("/admin/stats");
                setStats(data);
            } catch {
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const overview = stats?.overview || { users: 0, admins: 0, posts: 0 };
    const moderation = stats?.moderation || {
        pending: 0,
        approved: 0,
        rejected: 0,
    };
    const trend = stats?.postsByDay || [];
    const quality = stats?.quality || { reviewed: 0, approvalRate: 0 };
    const recentPending = stats?.recentPending || [];

    const moderationChartData = useMemo(
        () => [
            {
                name: t("admin.moderationStatus_pending"),
                value: moderation.pending || 0,
                color: "#f59e0b",
            },
            {
                name: t("admin.moderationStatus_approved"),
                value: moderation.approved || 0,
                color: "#10b981",
            },
            {
                name: t("admin.moderationStatus_rejected"),
                value: moderation.rejected || 0,
                color: "#ef4444",
            },
        ],
        [moderation, t],
    );

    return (
        <section className="Dashboard py-4">
            <header className="dashboard-header mb-4">
                <h1 className="h3 mb-2">{t("nav.dashboard")}</h1>
                <p className="text-muted mb-0">{t("admin.dashboardBlurb")}</p>
            </header>

            {loading ? (
                <p className="mb-0">{t("common.loading")}</p>
            ) : !stats ? (
                <p className="text-muted mb-0">{t("admin.dashboardError")}</p>
            ) : (
                <>
                    <div className="dashboard-kpi-grid mb-5">
                        <article className="dashboard-kpi-card">
                            <p className="dashboard-kpi-label mb-1">
                                {t("admin.kpiUsers")}
                            </p>
                            <h2 className="dashboard-kpi-value mb-0">
                                {overview.users}
                            </h2>
                        </article>
                        <article className="dashboard-kpi-card">
                            <p className="dashboard-kpi-label mb-1">
                                {t("admin.kpiAdmins")}
                            </p>
                            <h2 className="dashboard-kpi-value mb-0">
                                {overview.admins}
                            </h2>
                        </article>
                        <article className="dashboard-kpi-card">
                            <p className="dashboard-kpi-label mb-1">
                                {t("admin.kpiPosts")}
                            </p>
                            <h2 className="dashboard-kpi-value mb-0">
                                {overview.posts}
                            </h2>
                        </article>
                        <article className="dashboard-kpi-card">
                            <p className="dashboard-kpi-label mb-1">
                                {t("admin.kpiApprovalRate")}
                            </p>
                            <h2 className="dashboard-kpi-value mb-0">
                                {quality.approvalRate}%
                            </h2>
                        </article>
                    </div>

                    <div className="dashboard-chart-grid">
                        <article className="dashboard-chart-card">
                            <h3 className="dashboard-chart-title mb-3">
                                {t("admin.moderationBreakdownTitle")}
                            </h3>
                            <div className="dashboard-chart-shell">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={moderationChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={64}
                                            outerRadius={96}
                                            paddingAngle={2}
                                        >
                                            {moderationChartData.map((entry) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </article>

                        <article className="dashboard-chart-card">
                            <h3 className="dashboard-chart-title mb-3">
                                {t("admin.postsTrendTitle")}
                            </h3>
                            <div className="dashboard-chart-shell">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={trend}
                                        margin={{
                                            top: 8,
                                            right: 8,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--theme-border-soft)"
                                        />
                                        <XAxis dataKey="label" />
                                        <YAxis
                                            allowDecimals={false}
                                            width={26}
                                        />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            name={t("admin.postsCreatedLabel")}
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </article>
                    </div>

                    <div className="dashboard-extra-grid mt-5">
                        <article className="dashboard-chart-card">
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                                <h3 className="dashboard-chart-title mb-0">
                                    {t("admin.pendingQuickQueueTitle")}
                                </h3>
                                <Link
                                    to="/admin/moderation-queue"
                                    className="dashboard-link-btn"
                                >
                                    {t("admin.openModerationQueue")}
                                </Link>
                            </div>
                            {recentPending.length ? (
                                <>
                                    <ul className="dashboard-pending-timeline list-unstyled mb-0">
                                        {recentPending.map((post) => (
                                            <li
                                                key={post.id}
                                                className="dashboard-pending-timeline-item"
                                            >
                                                <span
                                                    className="dashboard-pending-dot"
                                                    aria-hidden="true"
                                                ></span>
                                                <div className="dashboard-pending-card">
                                                    <div>
                                                        <p className="dashboard-pending-title mb-1">
                                                            {post.title}
                                                        </p>
                                                        <p className="dashboard-pending-meta mb-0">
                                                            {t("admin.byAuthor", {
                                                                author: post.author,
                                                            })}
                                                        </p>
                                                    </div>
                                                    <span className="badge text-bg-warning">
                                                        {t("admin.moderationStatus_pending")}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="dashboard-pending-total mb-0 mt-3">
                                        {t("admin.pendingTotalSummary", {
                                            total: moderation.pending,
                                        })}
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted mb-0">
                                    {t("admin.noPendingPosts")}
                                </p>
                            )}
                        </article>

                        <article className="dashboard-chart-card dashboard-health-card">
                            <h3 className="dashboard-chart-title mb-3">
                                {t("admin.moderationHealthTitle")}
                            </h3>
                            <div className="dashboard-health-grid">
                                <div>
                                    <p className="dashboard-kpi-label mb-1">
                                        {t("admin.reviewedPosts")}
                                    </p>
                                    <p className="dashboard-health-value mb-0">
                                        {quality.reviewed}
                                    </p>
                                </div>
                                <div>
                                    <p className="dashboard-kpi-label mb-1">
                                        {t("admin.pendingPosts")}
                                    </p>
                                    <p className="dashboard-health-value mb-0">
                                        {moderation.pending}
                                    </p>
                                </div>
                            </div>
                            <p className="dashboard-health-note mb-0 mt-3">
                                {t("admin.moderationHealthHint", {
                                    approvalRate: quality.approvalRate,
                                })}
                            </p>
                        </article>
                    </div>
                </>
            )}
        </section>
    );
}

export default Dashboard;
