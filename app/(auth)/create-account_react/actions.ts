"use server";

import bcrypt from "bcrypt";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import login from "@/lib/login";
import { accountSchema } from "./schema";

export async function createAccount(formData: FormData) {
  const data = {
    username: formData.get("username"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    email: formData.get("email"),
    name: formData.get("name"),
    mobile: formData.get("mobile"),
  };
  const result = await accountSchema.safeParseAsync(data);
  if (!result.success) {
//    console.log(result.error.flatten());
    return result.error.flatten();
  } else {
//    console.log("data:", result.data);
    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    const user = await db.user.create({
      data: {
        username: result.data.username,
        password: hashedPassword,
        email: result.data.email,
        name: result.data.name,
        mobile: result.data.mobile,
      },
      select: {
        id: true,
      },
    });
    await login(user.id);
    redirect("/profile");
  };
};