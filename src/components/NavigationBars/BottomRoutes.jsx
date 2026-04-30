import generateProfileImage_Placeholder from "../../utils/functions/generateProfileImage_Placeholder";
import ListItem from "./ListItem";
import MainButton from "../common/MainButton/MainButton";

const BottomRoutes = ({ username, userPic, isCollapsed, isLoggedIn }) => (
    <div className="bottom d-flex flex-column gap-2">
        {isLoggedIn ? (
            <>
                <ListItem
                    href="/profile"
                    label="Profile"
                    justifyBetween={true}
                    isCollapsed={isCollapsed}
                    itemClassName="profile-item"
                >
                    <figure className="mb-0 d-flex align-items-center gap-2 justify-content-between">
                        {userPic ? (
                            <img src={userPic} alt="{username}'s picture" />
                        ) : (
                            generateProfileImage_Placeholder(username)
                        )}
                    </figure>
                </ListItem>
                <ListItem
                    href="/logout"
                    label="Logout"
                    justifyBetween={true}
                    itemClassName="logout-item"
                    isCollapsed={isCollapsed}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </ListItem>
            </>
        ) : (
            <MainButton
                type="button"
                className={`login-main-btn${isCollapsed ? " is-collapsed" : ""}`}
                fullWidth={!isCollapsed}
                onClick={() => {
                    window.location.href = "/login";
                }}
            >
                {isCollapsed ? (
                    <i className="fa-solid fa-right-to-bracket"></i>
                ) : (
                    <div className="d-flex align-items-center gap-2 justify-content-center">
                        <span>Login</span>
                        <i className="fa-solid fa-right-to-bracket"></i>
                    </div>
                )}
            </MainButton>
        )}
    </div>
);

export default BottomRoutes;
