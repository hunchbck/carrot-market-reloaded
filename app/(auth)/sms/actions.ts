"use server";

//import twilio from "twilio";
import crypto from "crypto";
import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import login from "@/lib/login";

const mobileSchema = z
    .string()
    .trim()
    .refine(
        (mobile) => validator.isMobilePhone(mobile, "ko-KR"),
        "Wrong mobile format"
    );
    async function tokenExists(token: number) {
        const exists = await db.sMSToken.findUnique({
          where: {
            token: token.toString(),
          },
          select: {
            id: true,
          },
        });
        return Boolean(exists);
    }
    
    const tokenSchema = z.coerce
    .number()
    .min(100000)
    .max(999999)
    .refine(tokenExists, "This token does not exist.");

interface ActionState {
    token: boolean;
};

async function getToken() {
    const token = crypto.randomInt(100000, 999999).toString();
    const exists = await db.sMSToken.findUnique({
      where: {
        token,
      },
      select: {
        id: true,
      },
    });
    if (exists) {
      return getToken();
    } else {
      return token;
    }
};

export async function smsLogIn(prevState: ActionState, formData: FormData) {
    const mobile = formData.get("mobile");
    const token = formData.get("token");
    if (!prevState.token) {
        const result = mobileSchema.safeParse(mobile);
        if (!result.success) {
            return {
                token: false,
                error: result.error.flatten(),
            };
        } else {
            await db.sMSToken.deleteMany({
                where: {
                    user: {
                        mobile: result.data,
                    },
                },
            });
            const token = await getToken();
            await db.sMSToken.create({
                data: {
                    token,
                    user: {
                        connectOrCreate: {
                            where: {
                                mobile: result.data,
                            },
                            create: {
                                username: "Mobile" + crypto.randomBytes(10).toString("hex"),
                                mobile: result.data,
                            },
                        },
                    },
                },
            });
/*            
            // send the token using twilio
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            console.log("TWILIO_ACCOUNT_SID: ",process.env.TWILIO_ACCOUNT_SID);
            console.log("TWILIO_AUTH_TOKEN: ",process.env.TWILIO_AUTH_TOKEN);
            console.log("TWILIO_MOBILE_NUMBER: ",process.env.TWILIO_MOBILE_NUMBER);
            console.log("MY_MOBILE_NUMBER: ",process.env.MY_MOBILE_NUMBER);
            try {
                await client.messages.create({
                    body: `Your Karrot verification code is: ${token}`,
                    from: process.env.TWILIO_MOBILE_NUMBER!,
                    to: process.env.MY_MOBILE_NUMBER!,
                });
            } catch (error) {
                if (error instanceof Error) {
                    console.error("Failed to send SMS:", error.message);
                    // 여기에서 사용자에게 메시지 전송 실패를 알리는 로직을 구현할 수 있습니다.
                    // 예: 오류 페이지로 리다이렉트 하거나, 사용자에게 문제를 알리는 알림을 표시
                } else {
                    console.error("An unexpected error occurred", error);
                    // `error`가 Error 인스턴스가 아닐 때의 처리
                }
                return {
                    token: false,
                };
            };
*/    
            return {
                token: true,
            };
        };
    } else {
        const result = await tokenSchema.spa(token);
        if (!result.success) {
            return {
                token: true,
                error: result.error.flatten(),
            };
        } else {
            const token = await db.sMSToken.findUnique({
                where: {
                  token: result.data.toString(),
                },
                select: {
                  id: true,
                  userId: true,
                },
            });
            await db.user.update({
                where: { id: token!.userId },
                data : {
                    mobileCertified : true,
                },
            });
            await login(token!.userId);
            await db.sMSToken.delete({
                where: {
                    id: token!.id,
                },
            });
            redirect("/profile");
        };
    };
};