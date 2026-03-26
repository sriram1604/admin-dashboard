import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 1. Daily Initialization - 6:00 AM IST (00:30 UTC)
crons.daily(
  "create-daily-attendance",
  { hourUTC: 0, minuteUTC: 30 },
  internal.attendance.createDailyAttendance,
);

// 2. Morning Notification - 5:30 AM IST (00:00 UTC)
crons.daily(
  "send-morning-reminder",
  { hourUTC: 0, minuteUTC: 0 },
  internal.notifications.sendMorningReminderAll,
);

// 3. Mark Absent - 10:01 AM IST (04:31 UTC)
crons.daily(
  "mark-absent-attendance",
  { hourUTC: 4, minuteUTC: 31 },
  internal.attendance.markAbsentAttendance,
);

// 4. Missing Checkouts Cap (specifically for OT missing) - 11:30 PM IST (18:00 UTC)
crons.daily(
  "auto-checkout-missing",
  { hourUTC: 18, minuteUTC: 0 },
  internal.attendance.autoCheckoutMissing,
);

// 5. Checkout Reminder - 2:30 PM IST (09:00 UTC)
crons.daily(
  "send-afternoon-status-reminder",
  { hourUTC: 9, minuteUTC: 0 },
  internal.notifications.sendAfternoonCheckoutReminder,
);

// 6. Notify Absent Users - 10:00 AM IST (04:30 UTC)
crons.daily(
  "notify-absent-users",
  { hourUTC: 4, minuteUTC: 30 },
  internal.notifications.notifyAbsentReasonRequired,
);

// 7. Auto Fill "No Reason" - 11:00 PM IST (17:30 UTC)
crons.daily(
  "auto-fill-absent-reason",
  { hourUTC: 17, minuteUTC: 30 },
  internal.attendance.autoFillAbsentReason,
);

// 8. Weekly Cleanup Sunday 10:00 AM IST (04:30 UTC)
crons.weekly(
  "delete-old-seen-messages",
  { dayOfWeek: "sunday", hourUTC: 4, minuteUTC: 30 },
  internal.notifications.deleteOldSeenMessages,
);

export default crons;
