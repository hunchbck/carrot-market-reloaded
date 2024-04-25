"use server";
import bcrypt from "bcrypt";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import login from "@/lib/login";

const checkUsername = (username: string): boolean => !(/^(Github|Kakao|Mobile)/i.test(username));
const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "username must be a string!",
        required_error: "Where is my username???",
      })
      .toLowerCase()
      .trim()
      // .transform((username) => `🔥 ${username}`)
      .refine(checkUsername, "'Github', 'Kakao', 'Mobile'은 사용하실 수 없습니다."),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
    email: z.string().email().toLowerCase(),
    name: z.string().trim(),
    mobile: z.string().trim(),
  })
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This username is already taken",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
/*  
  .refine(checkPasswords, {
    message: "Both passwords should be the same!",
    path: ["confirm_password"],
  })
*/  
  .superRefine(async ({ password, confirm_password }, ctx) => {
    if (!checkPasswords({password, confirm_password})) {
      ctx.addIssue({
        code: "custom",
        message: "Both passwords should be the same!",
        path: ["confirm_password"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This email is already taken",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ mobile }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        mobile,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This mobile is already taken",
        path: ["mobile"],
        fatal: true,
      });
      return z.NEVER;
    }
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    email: formData.get("email"),
    name: formData.get("name"),
    mobile: formData.get("mobile"),
  };
  const result = await formSchema.safeParseAsync(data);
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