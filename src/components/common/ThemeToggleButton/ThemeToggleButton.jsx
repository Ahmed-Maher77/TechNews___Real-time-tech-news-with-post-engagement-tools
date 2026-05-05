import { useDispatch, useSelector } from "react-redux";
import { selectTheme, toggleTheme } from "../../../store/uiSlice";
import "./ThemeToggleButton.css";

function ThemeToggleButton({ compact = false, variant = "chip", label = "" }) {
    const dispatch = useDispatch();
    const theme = useSelector(selectTheme);
    const isDark = theme === "dark";
    const isSwitch = variant === "switch";

    return (
        <div className={`theme-toggle-wrap${isSwitch ? " is-switch" : ""}`}>
            {label ? <span className="theme-toggle-label">{label}</span> : null}
            <button
                type="button"
                className={`theme-toggle-btn${compact ? " compact" : ""}${isSwitch ? " switch" : ""}`}
                onClick={() => dispatch(toggleTheme())}
                aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
                title={`Switch to ${isDark ? "light" : "dark"} mode`}
                aria-pressed={isDark}
            >
                {isSwitch ? (
                    <>
                        <span className="theme-switch-track">
                            <span className="theme-switch-thumb"></span>
                        </span>
                    </>
                ) : (
                    <>
                        <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`}></i>
                        {!compact ? <span>{isDark ? "Light" : "Dark"}</span> : null}
                    </>
                )}
            </button>
        </div>
    );
}

export default ThemeToggleButton;
