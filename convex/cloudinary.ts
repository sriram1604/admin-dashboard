import { ActionCtx, action } from "./_generated/server";
import { v } from "convex/values";

export const generateSignature = action({
  args: {
    paramsToSign: v.any(),
  },
  handler: async (ctx: ActionCtx, args: { paramsToSign: Record<string, any> }) => {
    try {
      const API_SECRET = process.env.CLOUDINARY_API_SECRET;

      if (!API_SECRET) {
        console.error("CLOUDINARY_API_SECRET is missing from Convex environment variables");
        throw new Error("Cloudinary API Secret not found in environment variables");
      }

      console.log("Generating signature for params:", args.paramsToSign);

      // Sort parameters alphabetically
      const sortedKeys = Object.keys(args.paramsToSign).sort();
      const stringToSign = sortedKeys
        .map((key) => `${key}=${args.paramsToSign[key]}`)
        .join("&") + API_SECRET;

      console.log("String to sign (without secret shown):", stringToSign.replace(API_SECRET, "****"));

      // Use Web Crypto API (SHA-1)
      const msgBuffer = new TextEncoder().encode(stringToSign);
      const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      console.log("Generated signature:", signature);
      return signature;
    } catch (error: any) {
      console.error("Error in generateSignature:", error);
      throw new Error(`Failed to generate Cloudinary signature: ${error.message}`);
    }
  },
});
