import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const saveToken = mutation({
  args: { employeeId: v.id("employee"), pushToken: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.employeeId, { pushToken: args.pushToken });
  },
});

export const getNotifications = query({
  args: { employeeId: v.optional(v.id("employee")) },
  handler: async (ctx, args) => {
    if (!args.employeeId) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId!))
      .order("desc")
      .collect();
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: { employeeId: v.id("employee") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    for (const notif of unread) {
      await ctx.db.patch(notif._id, { read: true });
    }
  },
});

// Used by the background tasks
export const insertNotification = internalMutation({
  args: {
    employeeId: v.id("employee"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      employeeId: args.employeeId,
      title: args.title,
      body: args.body,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const getEmployeeToken = internalQuery({
  args: { employeeId: v.id("employee") },
  handler: async (ctx, args) => {
    const emp = await ctx.db.get(args.employeeId);
    return emp?.pushToken;
  },
});

export const getAllEmployeeTokens = internalQuery({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.db.query("employee").collect();
    return employees.map(e => ({ employeeId: e._id, pushToken: e.pushToken }));
  },
});

export const sendPushNotification = internalAction({
  args: { pushToken: v.string(), title: v.string(), body: v.string(), data: v.optional(v.any()) },
  handler: async (ctx, args) => {
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: args.pushToken,
          title: args.title,
          body: args.body,
          data: args.data,
          sound: "default", // Custom sounds on iOS require specific setup, 'default' is safe for now but we want the channel to handle it on Android
          priority: "high",
          channelId: "alarm", // Match the channel we created in the app
        }),
      });
    } catch (e) {
      console.error("Push notification error:", e);
    }
  },
});

// Cron action: send morning reminder to all
export const sendMorningReminderAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.runQuery(internal.notifications.getAllEmployeeTokens);
    for (const emp of employees) {
      const title = "Attendance Started!";
      const body = "Please put your check-in from 9-10 AM.";
      
      await ctx.runMutation(internal.notifications.insertNotification, {
        employeeId: emp.employeeId,
        title,
        body,
      });

      if (emp.pushToken) {
        await ctx.runAction(internal.notifications.sendPushNotification, {
          pushToken: emp.pushToken,
          title,
          body,
        });
      }
    }
  },
});

// Cron action: send 2:30 PM status reminder
export const sendAfternoonCheckoutReminder = internalAction({
  args: {},
  handler: async (ctx) => {
    const todayLocal = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = todayLocal.split("/");
    const dateString = `${year}-${month}-${day}`;

    // Get tokens and checkins
    const employees = await ctx.runQuery(internal.notifications.getAllEmployeeTokens);
    
    for (const emp of employees) {
      const attendance = await ctx.runQuery(api.attendance.getTodayAttendance, { employeeId: emp.employeeId });
      
      const anyAttendance = attendance as any;
      if (attendance && attendance.status === "present" && anyAttendance.attendanceTime) {
        const checkinDate = new Date(anyAttendance.attendanceTime);
        checkinDate.setHours(checkinDate.getHours() + 8);
        const checkoutTimeStr = checkinDate.toLocaleTimeString("en-US", { 
          timeZone: "Asia/Kolkata", 
          hour: "2-digit", 
          minute: "2-digit" 
        });

        const title = "Checkout Schedule";
        const body = `Your 8-hour shift ends at ${checkoutTimeStr}. Please plan your checkout accordingly.`;

        await ctx.runMutation(internal.notifications.insertNotification, {
          employeeId: emp.employeeId,
          title,
          body,
        });

        if (emp.pushToken) {
          await ctx.runAction(internal.notifications.sendPushNotification, {
            pushToken: emp.pushToken,
            title,
            body,
          });
        }
      }
    }
  },
});

// Scheduled action: send checkout reminder (The "Alarm")
export const sendCheckoutReminder = internalAction({
  args: { employeeId: v.id("employee") },
  handler: async (ctx, args) => {
    const token = await ctx.runQuery(internal.notifications.getEmployeeToken, {
      employeeId: args.employeeId,
    });
    
    const title = "⏰ Shift Complete!";
    const body = "Your 8 hours are up! Please checkout if you are ready to leave.";

    await ctx.runMutation(internal.notifications.insertNotification, {
      employeeId: args.employeeId,
      title,
      body,
    });

    if (token) {
      await ctx.runAction(internal.notifications.sendPushNotification, {
        pushToken: token,
        title,
        body,
        data: { type: "alarm" }
      });
    }
  },
});

// Cron mutation: delete old seen messages
export const deleteOldSeenMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("read"), true))
      .collect();

    for (const notif of notifications) {
      if (notif.createdAt < oneWeekAgo) {
        await ctx.db.delete(notif._id);
      }
    }
  },
});

export const notifyAbsentReasonRequired = internalAction({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.runQuery(internal.notifications.getAllEmployeeTokens);
    
    for (const emp of employees) {
      const attendance = await ctx.runQuery(api.attendance.getTodayAttendance, { employeeId: emp.employeeId });
      
      // If no attendance or status is 'absent' or 'pending' (and it's now 10 AM, so should be marked absent)
      if (!attendance || attendance.status === "pending" || attendance.status === "absent") {
        // Double check if reason is already provided
        const record = attendance as any;
        if (record && record.reason) continue;

        const title = "Reason Required!";
        const body = "It's past 10 AM and you haven't checked in. Please provide a reason for your absence.";

        await ctx.runMutation(internal.notifications.insertNotification, {
          employeeId: emp.employeeId,
          title,
          body,
        });

        if (emp.pushToken) {
          await ctx.runAction(internal.notifications.sendPushNotification, {
            pushToken: emp.pushToken,
            title,
            body,
            data: { type: "absent_reason_required" }
          });
        }
      }
    }
  },
});

// Send notification to multiple employees at once
export const sendBulkNotification = action({
  args: {
    employeeIds: v.array(v.id("employee")),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    for (const employeeId of args.employeeIds) {
      const token = await ctx.runQuery(internal.notifications.getEmployeeToken, { employeeId });

      await ctx.runMutation(internal.notifications.insertNotification, {
        employeeId,
        title: args.title,
        body: args.body,
      });

      if (token) {
        await ctx.runAction(internal.notifications.sendPushNotification, {
          pushToken: token,
          title: args.title,
          body: args.body,
        });
      }
    }
    return { success: true, count: args.employeeIds.length };
  },
});

// Backward compatibility or Admin dashboard specific action
export const sendNotification = action({
  args: {
    employeeId: v.id("employee"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get employee push token
    // We use internal query here for consistency
    const token = await ctx.runQuery(internal.notifications.getEmployeeToken, { employeeId: args.employeeId });

    // 2. Store in database
    await ctx.runMutation(internal.notifications.insertNotification, {
      employeeId: args.employeeId,
      title: args.title,
      body: args.body,
    });

    // 3. Send push notification if token exists
    if (token) {
        await ctx.runAction(internal.notifications.sendPushNotification, {
            pushToken: token,
            title: args.title,
            body: args.body,
        });
    }

    return { success: true };
  },
});
