import { useTranslation } from "react-i18next";

function AdminPagination({ page, pages, onPageChange }) {
    const { t } = useTranslation();

    if (pages <= 1) return null;

    return (
        <div className="d-flex justify-content-center gap-2 mt-3">
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => onPageChange?.((prev) => prev - 1)}
            >
                {t("postsToolbar.prev")}
            </button>
            <span className="align-self-center small text-muted">
                {t("postsToolbar.pageStatus", {
                    current: page,
                    total: pages,
                })}
            </span>
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= pages}
                onClick={() => onPageChange?.((prev) => prev + 1)}
            >
                {t("postsToolbar.next")}
            </button>
        </div>
    );
}

export default AdminPagination;
