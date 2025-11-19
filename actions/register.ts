"use server";

import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const Validate = RegisterSchema.safeParse(values);
  if (!Validate.success) {
    return { error: "invalid fileds" };
  }
  const { email, password, name } = Validate.data;
  const hashedPassword = await bcrypt.hash(password, 10);
console.log(email);
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use" };
  }
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
const verificationToken =await generateVerificationToken(email);
await sendVerificationEmail(
  verificationToken.email,
  verificationToken.token, 
)
  return { success: "Confirmation email sent!" };
};
