"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import SocialLogin from "@/components/social-login";
import { createAccount } from "./actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountType, accountSchema } from "./schema";

export default function CreateAccount() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AccountType>({
    resolver: zodResolver(accountSchema),
  });
  const onSubmit = handleSubmit(async (data: AccountType) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("confirm_password", data.confirm_password);
    formData.append("email", data.email);
    formData.append("name", data.name);
    formData.append("mobile", data.mobile);
    const errors = await createAccount(formData);
    if (errors) {
      // setError("")
    }
  });
  const onValid = async () => {
    await onSubmit();
  };
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Fill in the form below to join!</h2>
      </div>
      <form action={onValid} className="flex flex-col gap-3">
        <Input
          type="text"
          placeholder="username"
          required
          {...register("username")}
          errors={[errors.username?.message ?? ""]}
          minLength={3}
          maxLength={10}
        />
        <Input
          type="password"
          placeholder="Password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          {...register("password")}
          errors={[errors.password?.message ?? ""]}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          {...register("confirm_password")}
          errors={[errors.confirm_password?.message ?? ""]}
        />
        <Input
          type="text"
          placeholder="Name"
          required
          {...register("name")}
          errors={[errors.name?.message ?? ""]}
          minLength={2}
          maxLength={20}
        />
        <Input
          type="email"
          placeholder="Email"
          required
          {...register("email")}
          errors={[errors.email?.message ?? ""]}
        />
        <Input
          type="text"
          placeholder="Mobile"
          {...register("mobile")}
          errors={[errors.mobile?.message ?? ""]}
        />
        <Button text="Create account" />
      </form>
      <SocialLogin />
    </div>
  );
}