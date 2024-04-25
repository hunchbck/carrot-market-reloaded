import db from "@/lib/db";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { socialToken, socialUser } from "@/lib/social";
import login from "@/lib/login";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code === null) {
    // 여기서 적절한 처리를 해주어야 합니다. 예를 들어:
    // 리다이렉트를 통해 사용자를 에러 페이지나 로그인 페이지로 보낼 수 있습니다.
    return redirect("/login");  // 로그인 페이지 또는 에러 페이지로 리다이렉션
  }
  const accessToken = await socialToken("kakao", code);
  const userProfile = await socialUser("kakao", accessToken.access_token);

  const user = await db.user.findUnique({
    where: {
      email: userProfile.kakao_account.email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      mobile: true,
      avatar: true,
      socialInfo: true,
    },
  });

  if (!user) {
    const username = "Kakao" + userProfile.id;
    const socialInfo = { Kakao: userProfile };
    const newUser = await db.user.create({
      data: {
        username,
        email: userProfile.kakao_account.email,
        emailCertified: true,
        name: userProfile.kakao_account.name,
        avatar: userProfile.properties.profile_image,
        mobile: userProfile.kakao_account.phone_number,
        mobileCertified: true,
        socialOnly: true,
        socialInfo: JSON.stringify(socialInfo),
      },
      select: {
        id: true,
      },
    });
    await login(newUser.id);
  } else {
    let data = {};
    // Ensure socialInfo is a valid string before parsing
    let socialInfo = user.socialInfo ? JSON.parse(user.socialInfo) : {};
    if (!("Kakao" in socialInfo)) {
      // Update the user record with the new socialInfo
      socialInfo = { ...socialInfo, Kakao: userProfile, };
      data = {
        emailCertified: true,
        socialInfo: JSON.stringify(socialInfo),
      };
    };
    if (!user.name){
      data = {
        ...data,
        name: userProfile.kakao_account.name,
      };
    };
    if (!user.mobile){
      data = {
        ...data,
        mobile: userProfile.kakao_account.phone_number,
        mobileCertified: true,
      };
    };
    if (!user.avatar){
      data = {
        ...data,
        avatar: userProfile.properties.profile_image,
      };
    };
    await db.user.update({
      where: { id: user.id },
      data,
    });
    await login(user.id);
  };
  return redirect("/profile");
};