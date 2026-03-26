import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const markAttendance = mutation({
  args: {
    phonenumber: v.string(),
    lat: v.number(),
    long: v.number(),
    city: v.string(),
    address: v.string(),
    isOT: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find employee by phone number
    const employee = await ctx.db
      .query("employee")
      .withIndex("by_phonenumber", (q) => q.eq("phonenumber", args.phonenumber))
      .first();

    if (!employee) {
      throw new Error("Employee not found with this phone number");
    }

    // Time validation (6 AM - 10 AM IST)
    const now = Date.now();
    const currentHourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(now);
    const currentMinStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      minute: "numeric",
    }).format(now);
    const hourInt = parseInt(currentHourStr);
    const minInt = parseInt(currentMinStr);

    if (hourInt < 6 || (hourInt === 10 && minInt > 0) || hourInt > 10) {
      throw new Error(
        "Attendance marking is only allowed between 6:00 AM and 10:00 AM IST.",
      );
    }

    const todayLocal = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }); // Gives MM/DD/YYYY in local timezone
    // Convert to YYYY-MM-DD
    const [month, day, year] = todayLocal.split("/");
    const dateString = `${year}-${month}-${day}`;

    // Check if attendance already exists for today
    const existingAttendance = await ctx.db
      .query("attendance")
      .withIndex("by_employeeId_dateString", (q) =>
        q.eq("employeeId", employee._id).eq("dateString", dateString),
      )
      .first();

    if (existingAttendance) {
      if (existingAttendance.status === "present") {
        throw new Error("Attendance already marked for today");
      }

      // Update existing pending to present
      const updateData: any = {
        lat: args.lat,
        long: args.long,
        city: args.city,
        address: args.address,
        attendanceTime: now,
        status: "present",
        isOT: args.isOT,
      };

      if (args.isOT === false) {
        const todayLocalStr = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
        const [m, d, y] = todayLocalStr.split("/");
        const sixPM_IST_epoch = new Date(`${y}-${m}-${d}T18:00:00+05:30`).getTime();
        updateData.checkoutTime = Math.min(now + 8 * 60 * 60 * 1000, sixPM_IST_epoch);
        updateData.otMinutes = 0;
        updateData.hasOT = false;
        updateData.autoCheckout = true;
      }

      await ctx.db.patch(existingAttendance._id, updateData);

      if (args.isOT !== false) {
        // Schedule a checkout reminder 8 hours from now
        await ctx.scheduler.runAfter(
          8 * 60 * 60 * 1000,
          internal.notifications.sendCheckoutReminder,
          {
            employeeId: employee._id,
          },
        );
      }

      return { success: true, message: "Attendance updated to present" };
    }

    // Insert new attendance
    const insertData: any = {
      employeeId: employee._id,
      lat: args.lat,
      long: args.long,
      city: args.city,
      address: args.address,
      attendanceTime: now,
      status: "present",
      dateString,
      isOT: args.isOT,
    };

    if (args.isOT === false) {
      const todayLocalStr = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
      const [m, d, y] = todayLocalStr.split("/");
      const sixPM_IST_epoch = new Date(`${y}-${m}-${d}T18:00:00+05:30`).getTime();
      insertData.checkoutTime = Math.min(now + 8 * 60 * 60 * 1000, sixPM_IST_epoch);
      insertData.otMinutes = 0;
      insertData.hasOT = false;
      insertData.autoCheckout = true;
    }

    await ctx.db.insert("attendance", insertData);

    if (args.isOT !== false) {
      // Schedule a checkout reminder 8 hours from now
      await ctx.scheduler.runAfter(
        8 * 60 * 60 * 1000,
        internal.notifications.sendCheckoutReminder,
        {
          employeeId: employee._id,
        },
      );
    }

    return { success: true, message: "Attendance marked successfully" };
  },
});

export const getTodayAttendance = query({
  args: { employeeId: v.optional(v.id("employee")) },
  handler: async (ctx, args) => {
    if (!args.employeeId) return null;

    const todayLocal = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = todayLocal.split("/");
    const dateString = `${year}-${month}-${day}`;

    const record = await ctx.db
      .query("attendance")
      .withIndex("by_employeeId_dateString", (q) =>
        q.eq("employeeId", args.employeeId!).eq("dateString", dateString),
      )
      .first();

    if (!record) {
      return { status: "pending", dateString };
    }
    return record;
  },
});

export const getStats = query({
  args: { employeeId: v.optional(v.id("employee")) },
  handler: async (ctx, args) => {
    if (!args.employeeId) return null;
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId!))
      .collect();

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === "present").length;
    const absentDays = records.filter((r) => r.status === "absent").length;

    return {
      absentDays,
      presentDays,
      totalDays,
    };
  },
});

export const getActivity = query({
  args: { id: v.id("attendance") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const markCheckout = mutation({
  args: { employeeId: v.id("employee") },
  handler: async (ctx, args) => {
    const todayLocal = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = todayLocal.split("/");
    const dateString = `${year}-${month}-${day}`;

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_employeeId_dateString", (q) =>
        q.eq("employeeId", args.employeeId).eq("dateString", dateString),
      )
      .first();

    if (!existing || existing.status !== "present") {
      throw new Error("Cannot checkout: not checked in today");
    }

    if (existing.checkoutTime) {
      throw new Error("Already checked out for today");
    }

    const checkoutTime = Date.now();

    const checkinTime = existing.attendanceTime || existing._creationTime;
    const totalDurationMins = Math.floor(
      (checkoutTime - checkinTime) / (1000 * 60),
    );

    let otDurationMinutes = 0;
    if (existing.isOT === true && totalDurationMins > 8 * 60) {
      otDurationMinutes = totalDurationMins - 8 * 60;
    }

    const hasOT = otDurationMinutes > 0;

    await ctx.db.patch(existing._id, {
      checkoutTime,
      hasOT,
      otDurationMinutes,
      isOT: existing.isOT,
      otMinutes: otDurationMinutes,
    });

    const otHours = Math.floor(otDurationMinutes / 60);
    const otMins = otDurationMinutes % 60;
    let message = "Successfully checked out!";
    if (hasOT) {
      message += ` You worked Overtime today (${otHours}h ${otMins}m).`;
    }

    return { success: true, message, hasOT, otDurationMinutes };
  },
});

export const getRecentActivity = query({
  args: { employeeId: v.optional(v.id("employee")) },
  handler: async (ctx, args) => {
    if (!args.employeeId) return [];
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId!))
      .order("desc") // Most recent first based on creation time
      .take(5);

    return records;
  },
});

export const getAllActivity = query({
  args: {
    employeeId: v.optional(v.id("employee")),
    filter: v.optional(v.string()), // "all", "present", "late"
  },
  handler: async (ctx, args) => {
    if (!args.employeeId) return [];
    let records = await ctx.db
      .query("attendance")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId!))
      .order("desc") // Most recent first based on creation time
      .collect();

    if (args.filter === "present") {
      records = records.filter((r) => r.status === "present");
    } else if (args.filter === "absent") {
      records = records.filter((r) => r.status === "absent");
    } else if (args.filter === "late") {
      records = records.filter((r) => {
        if (!r.attendanceTime) return false;
        const date = new Date(r.attendanceTime);
        return date.getHours() >= 10;
      });
    }

    return records;
  },
});

export const createDailyAttendance = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Skip Sundays (day 0 in IST)
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    if (nowIST.getDay() === 0) return; // 0 = Sunday

    const todayLocal = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = todayLocal.split("/");
    const dateString = `${year}-${month}-${day}`;

    const employees = await ctx.db.query("employee").collect();

    for (const employee of employees) {
      const existing = await ctx.db
        .query("attendance")
        .withIndex("by_employeeId_dateString", (q) =>
          q.eq("employeeId", employee._id).eq("dateString", dateString),
        )
        .first();

      if (!existing) {
        await ctx.db.insert("attendance", {
          employeeId: employee._id,
          status: "pending",
          dateString,
        });
      }
    }
  },
});

export const markAbsentAttendance = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Skip Sundays (day 0 in IST)
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    if (nowIST.getDay() === 0) return; // 0 = Sunday

    const todayLocal = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = todayLocal.split("/");
    const dateString = `${year}-${month}-${day}`;

    // Get all pending attendance for today
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_dateString", (q) => q.eq("dateString", dateString))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Mark them as absent
    for (const record of records) {
      await ctx.db.patch(record._id, {
        status: "absent",
      });
    }
  },
});

export const autoCheckoutMissing = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Skip Sundays (day 0 in IST)
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    if (nowIST.getDay() === 0) return; // 0 = Sunday

    const todayLocal = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = todayLocal.split("/");
    const dateString = `${year}-${month}-${day}`;

    // For pending records, they should have been marked absent at 10:01 AM by markAbsentAttendance
    // But as a fallback, mark remaining pending as absent
    const pendingRecords = await ctx.db
      .query("attendance")
      .withIndex("by_dateString", (q) => q.eq("dateString", dateString))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    for (const record of pendingRecords) {
      await ctx.db.patch(record._id, {
        status: "absent",
      });
    }

    // Process Missing Checkouts
    const presentRecords = await ctx.db
      .query("attendance")
      .withIndex("by_dateString", (q) => q.eq("dateString", dateString))
      .filter((q) => q.eq(q.field("status"), "present"))
      .collect();

    const currentCronTime = Date.now();

    for (const record of presentRecords) {
      if (!record.checkoutTime) {
        const checkinTime = record.attendanceTime || record._creationTime;

        if (record.isOT === true) {
          const checkoutTime = currentCronTime;
          const totalDurationMins = Math.floor((checkoutTime - checkinTime) / (1000 * 60));

          let otDurationMinutes = 0;
          if (totalDurationMins > 8 * 60) {
            otDurationMinutes = totalDurationMins - 8 * 60;
          }
          const hasOT = otDurationMinutes > 0;

          await ctx.db.patch(record._id, {
            checkoutTime,
            hasOT,
            otDurationMinutes,
            isOT: true,
            otMinutes: otDurationMinutes,
            autoCheckout: true,
          });
        } else {
          const sixPM_IST_epoch = new Date(`${year}-${month}-${day}T18:00:00+05:30`).getTime();
          const checkoutTime = Math.min(checkinTime + 8 * 60 * 60 * 1000, sixPM_IST_epoch);
          await ctx.db.patch(record._id, {
            checkoutTime,
            hasOT: false,
            otDurationMinutes: 0,
            isOT: false,
            otMinutes: 0,
            autoCheckout: true,
          });
        }
      }
    }
  },
});

export const autoFillAbsentReason = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Skip Sundays
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    if (nowIST.getDay() === 0) return;

    const todayLocal = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
    const [month, day, year] = todayLocal.split("/");
    const dateString = `${year}-${month}-${day}`;

    const absentRecords = await ctx.db
      .query("attendance")
      .withIndex("by_dateString", (q) => q.eq("dateString", dateString))
      .filter((q) => q.eq(q.field("status"), "absent"))
      .collect();

    for (const record of absentRecords) {
      if (!record.reason) {
        await ctx.db.patch(record._id, {
          reason: "No Reason",
        });
      }
    }
  },
});

export const submitAbsentReason = mutation({
  args: {
    employeeId: v.id("employee"),
    reason: v.string(),
    dateString: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_employeeId_dateString", (q) =>
        q.eq("employeeId", args.employeeId).eq("dateString", args.dateString),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        reason: args.reason,
        status: "absent", // Ensure status is absent if reason provided
      });
    } else {
      await ctx.db.insert("attendance", {
        employeeId: args.employeeId,
        status: "absent",
        dateString: args.dateString,
        reason: args.reason,
      });
    }
  },
});
