export const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + " min ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " hours ago";
  return Math.floor(diff / 86400000) + " days ago";
};

export const logNotification = (notification) => {
  const existing = JSON.parse(localStorage.getItem("notifications")) || [];

  const newNotification = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    isRead: false,
    priority: "normal", // normal | warning | important
    ...notification
  };

  const updated = [newNotification, ...existing].slice(0, 20);

  localStorage.setItem("notifications", JSON.stringify(updated));

  window.dispatchEvent(new Event("notificationLogged"));
};

export const logActivity = (activity) => {
  const existing = JSON.parse(localStorage.getItem("activities")) || [];

  const newActivity = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    ...activity
  };

  const updated = [newActivity, ...existing].slice(0, 50);

  localStorage.setItem("activities", JSON.stringify(updated));

  // Trigger notification for important events
  if (["interview_complete", "ats_analysis", "support_reply_received", "new_role_recommended"].includes(activity.type)) {
    logNotification({
      message: activity.title,
      type: activity.type,
      priority: activity.status === "warning" ? "warning" : "normal"
    });
  }

  window.dispatchEvent(new Event("activityLogged"));
};
