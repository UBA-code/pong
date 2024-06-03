import Snackbar from "@mui/joy/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toggleNotificationViewStatus } from "../../redux/slices/notificationSlice";

//? icons
import ConversationNotification from "./ConversationNotification";
import AlertNotification from "./AlertNotification";

export default function NotificationSnackBar() {
  const notificationStats = useSelector(
    (state: RootState) => state.notification
  );
  const dispatch = useDispatch();

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={notificationStats.status || false}
      color={notificationStats.color}
      variant="soft"
      style={{
        maxWidth: "300px",
        top: "70px",
        justifyContent:
          notificationStats.type === "alert" ? "center" : "space-between",
      }}
      autoHideDuration={3000}
      onClose={() => dispatch(toggleNotificationViewStatus(false))}
    >
      {notificationStats.type === "alert" ? (
        <AlertNotification content={notificationStats.alertContent || ""} />
      ) : (
        <ConversationNotification notificationStats={notificationStats} />
      )}
    </Snackbar>
  );
}
