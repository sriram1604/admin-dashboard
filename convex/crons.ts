import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Runs every day at 03:30 UTC which maps to 09:00 AM IST
crons.daily(
  "create-daily-attendance",
  { hourUTC: 0, minuteUTC: 30 },
  internal.attendance.createDailyAttendance,
);

// Runs every day at 04:30 UTC which maps to 10:00 AM IST
crons.daily(
  "mark-absent-attendance",
  { hourUTC: 4, minuteUTC: 30 },
  internal.attendance.markAbsentAttendance,
);

// Runs every day at 17:30 UTC which maps to 11:00 PM IST
crons.daily(
  "auto-checkout-missing",
  { hourUTC: 17, minuteUTC: 30 },
  internal.attendance.autoCheckoutMissing,
);

// Runs every day at 00:00 UTC which maps to 05:30 AM IST
crons.daily(
  "send-morning-reminder",
  { hourUTC: 0, minuteUTC: 0 },
  internal.notifications.sendMorningReminderAll,
);

// Runs every day at 09:00 UTC which maps to 02:30 PM IST
crons.daily(
  "send-afternoon-status-reminder",
  { hourUTC: 9, minuteUTC: 0 },
  internal.notifications.sendAfternoonCheckoutReminder,
);

// Runs every day at 04:30 UTC which maps to 10:00 AM IST
crons.daily(
  "notify-absent-users",
  { hourUTC: 4, minuteUTC: 30 },
  internal.notifications.notifyAbsentReasonRequired,
);

// Runs every Sunday at 04:30 UTC which maps to 10:00 AM IST on Sunday
crons.weekly(
  "delete-old-seen-messages",
  { dayOfWeek: "sunday", hourUTC: 4, minuteUTC: 30 },
  internal.notifications.deleteOldSeenMessages,
);

export default crons;
