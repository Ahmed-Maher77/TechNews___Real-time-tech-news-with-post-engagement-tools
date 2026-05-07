function truncateText(value, maxLen) {
    const text = String(value || "").trim();
    if (!text) return "";
    if (!Number.isFinite(maxLen) || maxLen <= 0) return text;
    return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

export default truncateText;

