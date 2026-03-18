import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  employee: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    phonenumber: v.string(),
    aadharCardnumber: v.string(),
    email: v.optional(v.string()),
    password: v.string(), // store hashed passwords in production, we do plain/basic hash here for simplicity unless specified
    photoUrl: v.optional(v.string()),
    photoId: v.optional(v.string()),
    pushToken: v.optional(v.string()),
    role: v.optional(v.string()), // "Admin", "Employee", etc.
    status: v.optional(v.string()), // "active", "inactive"
    joiningDate: v.optional(v.number()),
    employeeId: v.optional(v.string()), // Custom Employee ID
  }).index("by_phonenumber", ["phonenumber"]),

  attendance: defineTable({
    employeeId: v.id("employee"),
    lat: v.optional(v.number()),
    long: v.optional(v.number()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    attendanceTime: v.optional(v.number()),
    checkoutTime: v.optional(v.number()),
    hasOT: v.optional(v.boolean()),
    otDurationMinutes: v.optional(v.number()),
    status: v.string(), // "present", "absent", "pending"
    dateString: v.string(), // ISO string YYYY-MM-DD for identifying the day
    reason: v.optional(v.string()), // For absent users
  })
    .index("by_employeeId", ["employeeId"])
    .index("by_employeeId_dateString", ["employeeId", "dateString"])
    .index("by_dateString", ["dateString"]),

  sessions: defineTable({
    userId: v.id("employee"),
    token: v.string(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  notifications: defineTable({
    employeeId: v.id("employee"),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_employeeId", ["employeeId"]),
});
