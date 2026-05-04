import { NavLink } from "react-router-dom";

const ListItem = ({
    href,
    icon,
    label,
    children,
    justifyBetween = false,
    itemClassName = "",
    isCollapsed = false,
    onClick,
}) => (
    <li
        className={`navlink-item px-3 py-2 d-flex gap-3 align-items-center rounded ${itemClassName}${
            isCollapsed ? " is-collapsed-item" : ""
        }`}
    >
        <NavLink
            to={href}
            onClick={onClick}
            className={`d-flex gap-35 align-items-center w-100${justifyBetween ? " justify-content-between" : ""}`}
            title={label}
        >
            {icon && <i className={icon}></i>}
            <span>{label}</span>
            {children}
        </NavLink>
    </li>
);

export default ListItem;
