import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listEmployees = query({
  args: {
    paginationOpts: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("employee").paginate(args.paginationOpts);
  },
});

export const getEmployees = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("employee").collect();
  },
});

export const getEmployeeById = query({
  args: { id: v.id("employee") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createEmployee = mutation({
  args: {
    firstname: v.string(),
    lastname: v.string(),
    email: v.optional(v.string()),
    phonenumber: v.string(),
    employeeId: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
    joiningDate: v.optional(v.number()),
    aadharCardnumber: v.string(),
    password: v.string(),
    pfNumber: v.optional(v.string()),
    esiNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("employee")
      .withIndex("by_phonenumber", (q) => q.eq("phonenumber", args.phonenumber))
      .first();

    if (existing) {
      throw new Error("Employee with this phone number already exists");
    }

    return await ctx.db.insert("employee", {
      firstname: args.firstname,
      lastname: args.lastname,
      phonenumber: args.phonenumber,
      email: args.email,
      employeeId: args.employeeId,
      role: args.role || "Employee",
      status: args.status || "active",
      joiningDate: args.joiningDate ?? Date.now(),
      aadharCardnumber: args.aadharCardnumber,
      password: args.password,
      pfNumber: args.pfNumber,
      esiNumber: args.esiNumber,
    });
  },
});

export const deleteEmployee = mutation({
  args: { id: v.id("employee") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateEmployee = mutation({
  args: {
    id: v.id("employee"),
    firstname: v.optional(v.string()),
    lastname: v.optional(v.string()),
    email: v.optional(v.string()),
    phonenumber: v.optional(v.string()),
    employeeId: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
    joiningDate: v.optional(v.number()),
    aadharCardnumber: v.optional(v.string()),
    pfNumber: v.optional(v.string()),
    esiNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const getEmployeeDetails = query({
  args: { employeeId: v.id("employee") },
  handler: async (ctx, args) => {
    console.log("Getting details for employee:", args.employeeId);
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      console.log("Employee not found");
      return null;
    }

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === "present").length;
    const absentDays = records.filter((r) => r.status === "absent").length;

    const lastCheckIn = records
      .filter((r) => r.attendanceTime)
      .sort(
        (a, b) => (b.attendanceTime || 0) - (a.attendanceTime || 0),
      )[0]?.attendanceTime;

    const lastCheckOut = records
      .filter((r) => r.checkoutTime)
      .sort(
        (a, b) => (b.checkoutTime || 0) - (a.checkoutTime || 0),
      )[0]?.checkoutTime;

    return {
      ...employee,
      attendanceSummary: {
        totalDays,
        presentDays,
        absentDays,
        presentPercentage: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
      },
      lastCheckIn,
      lastCheckOut,
    };
  },
});

export const listAttendance = query({
  args: {
    paginationOpts: v.any(),
    dateString: v.optional(v.string()),
    status: v.optional(v.string()),
    employeeId: v.optional(v.id("employee")),
  },
  handler: async (ctx, args) => {
    let results;
    if (args.dateString) {
      results = await ctx.db
        .query("attendance")
        .withIndex("by_dateString", (q) => q.eq("dateString", args.dateString!))
        .paginate(args.paginationOpts);
    } else if (args.employeeId) {
      results = await ctx.db
        .query("attendance")
        .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId!))
        .paginate(args.paginationOpts);
    } else {
      results = await ctx.db
        .query("attendance")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // Join with employee data
    const pageWithEmployees = await Promise.all(
      results.page.map(async (record) => {
        const employee = await ctx.db.get(record.employeeId);
        return {
          ...record,
          employeeName: employee
            ? `${employee.firstname} ${employee.lastname}`
            : "Unknown",
          employeePhone: employee?.phonenumber,
          photoUrl: employee?.photoUrl,
        };
      }),
    );

    return { ...results, page: pageWithEmployees };
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.db.query("employee").collect();
    const totalEmployees = employees.length;

    // Safe way to get YYYY-MM-DD in IST
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const dateString = istTime.toISOString().split("T")[0];

    const todayAttendance = await ctx.db
      .query("attendance")
      .withIndex("by_dateString", (q) => q.eq("dateString", dateString))
      .collect();

    const attendanceMap = new Map<string, string>();
    for (const record of todayAttendance) {
      const empId = record.employeeId.toString();
      const existingStatus = attendanceMap.get(empId);
      if (record.status === "present") {
        attendanceMap.set(empId, "present");
      } else if (record.status === "pending" && existingStatus !== "present") {
        attendanceMap.set(empId, "pending");
      } else if (!existingStatus) {
        attendanceMap.set(empId, record.status);
      }
    }

    let presentToday = 0;
    let pendingToday = 0;

    for (const emp of employees) {
      const status = attendanceMap.get(emp._id.toString());
      if (status === "present") {
        presentToday++;
      } else if (status === "pending") {
        pendingToday++;
      }
    }

    // Mathematically guarantee totals match total active employees
    const absentToday = totalEmployees - presentToday - pendingToday;

    return {
      totalEmployees,
      presentToday,
      absentToday,
      pendingToday,
      dateString,
    };
  },
});

export const insertNotification = mutation({
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

export const getNotifications = query({
  args: { employeeId: v.id("employee") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId))
      .order("desc")
      .collect();
  },
});

export const getAbsentReasons = query({
  args: {},
  handler: async (ctx) => {
    // Safe way to get YYYY-MM-DD in IST
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const dateString = istTime.toISOString().split("T")[0];

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_dateString", (q) => q.eq("dateString", dateString))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "absent"),
          q.neq(q.field("reason"), undefined),
        ),
      )
      .order("desc").collect();

    return await Promise.all(
      records.map(async (record) => {
        const employee = await ctx.db.get(record.employeeId);
        return {
          ...record,
          employeeName: employee
            ? `${employee.firstname} ${employee.lastname}`
            : "Unknown Employee",
          employeePhoto: employee?.photoUrl,
        };
      }),
    );
  },
});

export const getAttendanceExport = query({
  args: {
    startDate: v.optional(v.string()), // YYYY-MM-DD
    endDate: v.optional(v.string()),   // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    let records;
    
    if (args.startDate && args.endDate) {
      records = await ctx.db.query("attendance")
        .withIndex("by_dateString", (query) => 
          query.gte("dateString", args.startDate!).lte("dateString", args.endDate!)
        )
        .collect();
    } else if (args.startDate) {
      records = await ctx.db.query("attendance")
        .withIndex("by_dateString", (query) => 
          query.gte("dateString", args.startDate!)
        )
        .collect();
    } else {
      records = await ctx.db.query("attendance")
        .withIndex("by_dateString")
        .order("desc")
        .collect();
    }

    // Join with employee data
    return await Promise.all(
      records.map(async (record) => {
        const employee = await ctx.db.get(record.employeeId);
        return {
          ...record,
          employeeName: employee ? `${employee.firstname} ${employee.lastname}` : "Unknown",
          employeePhone: employee?.phonenumber,
          employeeIdTag: employee?.employeeId,
          role: employee?.role,
        };
      })
    );
  },
});

export const getTodayOTStatus = query({
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

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_dateString", (q) => q.eq("dateString", dateString))
      .filter((q) => q.eq(q.field("status"), "present"))
      .collect();

    const withEmployees = await Promise.all(
      records.map(async (record) => {
        const employee = await ctx.db.get(record.employeeId);
        return {
          ...record,
          employeeName: employee ? `${employee.firstname} ${employee.lastname}` : "Unknown",
          employeeIdTag: employee?.employeeId || "N/A",
        };
      })
    );

    return {
      ot: withEmployees.filter((r) => r.isOT === true),
      nonOt: withEmployees.filter((r) => r.isOT !== true),
    };
  },
});

export const updateOTStatusToFalse = mutation({
  args: { attendanceId: v.id("attendance") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.attendanceId);
    if (!record || record.status !== "present") {
      throw new Error("Attendance record not found or not present today.");
    }
    if (record.isOT !== true) {
      throw new Error("Already non-OT.");
    }

    const checkinTime = record.attendanceTime || record._creationTime;

    const todayLocalStr = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
    const [m, d, y] = todayLocalStr.split("/");
    const sixPM_IST_epoch = new Date(`${y}-${m}-${d}T18:00:00+05:30`).getTime();
    
    const checkoutTime = Math.min(checkinTime + 8 * 60 * 60 * 1000, sixPM_IST_epoch);

    await ctx.db.patch(args.attendanceId, {
      isOT: false,
      hasOT: false,
      otMinutes: 0,
      otDurationMinutes: 0,
      checkoutTime,
      autoCheckout: true,
    });

    return { success: true };
  },
});

export const adminMarkPresent = mutation({
  args: {
    attendanceId: v.id("attendance"),
    checkInTime: v.number(),
    checkOutTime: v.optional(v.number()),
    comments: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.attendanceId);
    if (!record) throw new Error("Attendance record not found");
    
    await ctx.db.patch(args.attendanceId, {
      status: "present",
      attendanceTime: args.checkInTime,
      checkoutTime: args.checkOutTime,
      reason: args.comments, // storing comments in reason field
    });

    const checkOutStr = args.checkOutTime 
      ? new Date(args.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) 
      : "Not provided";
      
    const bodyText = `Admin provided present for you. Check-out time: ${checkOutStr}. Comments: ${args.comments}`;
    
    await ctx.db.insert("notifications", {
      employeeId: record.employeeId,
      title: "Attendance Updated to Present",
      body: bodyText,
      read: false,
      createdAt: Date.now()
    });
  }
});

export const adminMarkAbsent = mutation({
  args: {
    attendanceId: v.id("attendance"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.attendanceId);
    if (!record) throw new Error("Attendance record not found");
    
    await ctx.db.patch(args.attendanceId, {
      status: "absent",
      reason: args.reason,
      attendanceTime: undefined,
      checkoutTime: undefined,
      lat: undefined,
      long: undefined,
      city: undefined,
      address: undefined,
      isOT: undefined,
      hasOT: undefined,
      otMinutes: undefined,
      otDurationMinutes: undefined,
      autoCheckout: undefined,
    });

    await ctx.db.insert("notifications", {
      employeeId: record.employeeId,
      title: "Attendance Updated to Absent",
      body: `Admin marked you absent for today. Reason: ${args.reason}`,
      read: false,
      createdAt: Date.now()
    });
  }
});
