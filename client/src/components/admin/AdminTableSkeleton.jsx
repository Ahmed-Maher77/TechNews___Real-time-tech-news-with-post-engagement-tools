function AdminTableSkeleton({
    columns = 5,
    rows = 5,
    className = "",
    containerClassName = "",
}) {
    const rootClass = ["admin-table-skeleton", className].filter(Boolean).join(" ");
    const cells = Array.from({ length: columns });
    const rowItems = Array.from({ length: rows });

    return (
        <div className={containerClassName}>
            <div className={rootClass} aria-hidden="true">
                <div className="admin-table-skeleton-head">
                    {cells.map((_, idx) => (
                        <span
                            key={`head-${idx}`}
                            className={`admin-skeleton-line ${idx === 0 ? "medium" : "short"}`}
                        ></span>
                    ))}
                </div>
                {rowItems.map((_, rowIdx) => (
                    <div
                        key={`row-${rowIdx}`}
                        className="admin-table-skeleton-row"
                    >
                        {cells.map((__, colIdx) => (
                            <span
                                key={`row-${rowIdx}-col-${colIdx}`}
                                className={`admin-skeleton-line ${
                                    colIdx === 0
                                        ? "long"
                                        : colIdx === columns - 1
                                          ? "medium"
                                          : "short"
                                }`}
                            ></span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminTableSkeleton;
