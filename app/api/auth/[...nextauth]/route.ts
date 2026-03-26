import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nextAuthHandler = (req: any, ctx: any) =>
  NextAuth(req, ctx, getAuthOptions());

export { nextAuthHandler as GET, nextAuthHandler as POST };
