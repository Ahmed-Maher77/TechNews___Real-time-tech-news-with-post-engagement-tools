import { useDispatch, useSelector } from "react-redux";
import { selectTheme, setTheme, toggleTheme } from "../../../store/uiSlice";
import "./ThemeToggleButton.css";

function ThemeToggleButton({ compact = false, variant = "chip", label = "" }) {
    const dispatch = useDispatch();
    const theme = useSelector(selectTheme);
    const isDark = theme === "dark";
    const isSwitch = variant === "switch";

    return (
        <div className={`theme-toggle-wrap${isSwitch ? " is-switch" : ""}`}>
            {label ? <span className="theme-toggle-label">{label}</span> : null}
            {isSwitch ? (
                compact ? (
                    <button
                        type="button"
                        className="theme-toggle-btn compact"
                        onClick={() => dispatch(toggleTheme())}
                        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
                        title={`Switch to ${isDark ? "light" : "dark"} mode`}
                        aria-pressed={isDark}
                    >
                        <i className={`fa-solid ${isDark ? "fa-moon" : "fa-sun"}`}></i>
                    </button>
                ) : (
                    <div className="theme-tabs" role="tablist" aria-label="Theme mode">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={!isDark}
                            className={`theme-tab ${!isDark ? "active" : ""}`}
                            onClick={() => dispatch(setTheme("light"))}
                            title="Use light theme"
                        >
                            <i className="fa-solid fa-sun"></i>
                            <span>Light</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={isDark}
                            className={`theme-tab ${isDark ? "active" : ""}`}
                            onClick={() => dispatch(setTheme("dark"))}
                            title="Use dark theme"
                        >
                            <i className="fa-solid fa-moon"></i>
                            <span>Dark</span>
                        </button>
                    </div>
                )
            ) : (
                <button
                    type="button"
                    className={`theme-toggle-btn${compact ? " compact" : ""}`}
                    onClick={() => dispatch(toggleTheme())}
                    aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
                    title={`Switch to ${isDark ? "light" : "dark"} mode`}
                    aria-pressed={isDark}
                >
                    <>
                        <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`}></i>
                        {!compact ? <span>{isDark ? "Light" : "Dark"}</span> : null}
                    </>
                </button>
            )}
        </div>
    );
}

export default ThemeToggleButton;
