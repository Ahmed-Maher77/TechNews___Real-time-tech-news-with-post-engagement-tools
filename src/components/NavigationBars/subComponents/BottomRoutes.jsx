import generateProfileImage_Placeholder from "../../../utils/functions/generateProfileImage_Placeholder";
import ListItem from "./ListItem";

const BottomRoutes = ({ username, userPic, isCollapsed }) => (
    <div className="bottom d-flex flex-column gap-2">
        <ListItem href="/profile" label="Profile" justifyBetween={true} isCollapsed={isCollapsed}>
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
    </div>
);

export default BottomRoutes;
