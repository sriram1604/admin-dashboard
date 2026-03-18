import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const register = mutation({
  args: {
    firstname: v.string(),
    lastname: v.string(),
    phonenumber: v.string(),
    aadharCardnumber: v.string(),
    email: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if employee with phonenumber already exists
    const existingEmployee = await ctx.db
      .query("employee")
      .withIndex("by_phonenumber", (q) => q.eq("phonenumber", args.phonenumber))
      .first();

    if (existingEmployee) {
      throw new Error("Phone number already registered.");
    }

    const hashedPassword = bcrypt.hashSync(args.password, 10);

    const employeeId = await ctx.db.insert("employee", {
      firstname: args.firstname,
      lastname: args.lastname,
      phonenumber: args.phonenumber,
      aadharCardnumber: args.aadharCardnumber,
      email: args.email,
      password: hashedPassword,
    });

    const token = crypto.randomUUID();

    await ctx.db.insert("sessions", {
      userId: employeeId,
      token,
      createdAt: Date.now(),
    });

    return { userId: employeeId, token };
  },
});

export const login = mutation({
  args: {
    phonenumber: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db
      .query("employee")
      .withIndex("by_phonenumber", (q) => q.eq("phonenumber", args.phonenumber))
      .first();

    if (!employee) {
      throw new Error("Invalid phone number or password.");
    }

    const isMatch = bcrypt.compareSync(args.password, employee.password);
    if (!isMatch) {
      throw new Error("Invalid phone number or password.");
    }

    const token = crypto.randomUUID();

    await ctx.db.insert("sessions", {
      userId: employee._id,
      token,
      createdAt: Date.now(),
    });

    return { userId: employee._id, token };
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) return { valid: false };

    // 30 days expiry
    if (Date.now() - session.createdAt > 30 * 24 * 60 * 60 * 1000) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: session.userId,
    };
  },
});

export const logoutSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const biometricLogin = mutation({
  args: { userId: v.id("employee") },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.userId);
    if (!employee) {
      throw new Error("Invalid user.");
    }

    const token = crypto.randomUUID();

    await ctx.db.insert("sessions", {
      userId: employee._id,
      token,
      createdAt: Date.now(),
    });

    return { userId: employee._id, token };
  },
});

export const getUser = query({
  args: {
    userId: v.id("employee"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updatePersonal = mutation({
  args: {
    userId: v.id("employee"),
    firstname: v.string(),
    lastname: v.string(),
    email: v.optional(v.string()),
    aadharCardnumber: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      firstname: args.firstname,
      lastname: args.lastname,
      email: args.email,
      aadharCardnumber: args.aadharCardnumber,
    });
    return true;
  },
});

export const updatePassword = mutation({
  args: {
    userId: v.id("employee"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.userId);
    if (!employee) throw new Error("User not found");

    const isMatch = bcrypt.compareSync(args.currentPassword, employee.password);
    if (!isMatch) throw new Error("Incorrect current password");

    const newHashedPassword = bcrypt.hashSync(args.newPassword, 10);

    await ctx.db.patch(args.userId, {
      password: newHashedPassword,
    });
    return true;
  },
});

export const updateProfilePicture = mutation({
  args: {
    userId: v.id("employee"),
    photoUrl: v.string(),
    photoId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      photoUrl: args.photoUrl,
      photoId: args.photoId,
    });
    return true;
  },
});
