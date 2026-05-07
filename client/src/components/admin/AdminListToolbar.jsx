function AdminListToolbar({
    searchTerm,
    onSearchChange,
    searchPlaceholder,
    sortBy,
    onSortChange,
    sortOptions = [],
}) {
    return (
        <div className="d-flex flex-wrap gap-2 mb-3">
            <input
                type="search"
                className="form-control app-form-control"
                style={{ maxWidth: 320 }}
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
            />
            <select
                className="form-select app-form-control"
                style={{ maxWidth: 220 }}
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default AdminListToolbar;
