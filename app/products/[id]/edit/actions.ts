"use server";

import db from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { deleteImageFromCloudflare } from "@/lib/cloudflare";
import { productSchema, Product, getProduct } from "@/lib/product";
import { revalidatePath } from "next/cache";
import getIsOwner from "@/lib/owner";

export async function updateProduct(formData: FormData) {
  console.log("updateProduct 함수");
  const id = formData.get("id") as string;
  if (typeof id !== 'string' || !id) {
    console.error('Product ID is missing or invalid');
    return redirect("/home");
  }
  const product = await getProduct(id);
  if (!product) {
    return notFound();
  }
  console.log("product", product);
  const isOwner = await getIsOwner(product.userId);
  if (!isOwner) {
    return redirect("/home");
  }
  const data = {
    photo: formData.get("photo") as string,
    title: formData.get("title") as string,
    price: parseFloat(formData.get("price") as string) || product.price,
    description: formData.get("description") as string,
  };
  const result = productSchema.safeParse(data);
  if (!result.success) {
    console.error('Validation failed:', result.error.flatten());
    return result.error.flatten();
  }
  console.log("result", result);
  const updateData: Partial<Product> = {};
  let deletionNeeded = false;
  if (result.data.photo !== product.photo) {
      updateData.photo = result.data.photo;
      deletionNeeded = true;
  }
  if (result.data.title !== product.title) {
      updateData.title = result.data.title;
  }
  if (result.data.price !== Number(product.price)) {
      updateData.price = result.data.price;
  }
  if (result.data.description !== product.description) {
      updateData.description = result.data.description;
  }
  if (Object.keys(updateData).length === 0) {
    console.log("업데이트 내용이 없습니다!");
    redirect("/home");
  }
  await db.product.update({
      where: { id: product.id },
      data: updateData,
  });
  // Handle deletion of old image if necessary
  if (deletionNeeded && product.photo) {
    console.log("product.photo", product.photo);
    const deleteResult = await deleteImageFromCloudflare(product.photo);
    if (!deleteResult.success) {
      console.error('Failed to delete old image:', deleteResult.error);
      // Optionally handle rollback or further error management
    }
  }
  await revalidatePath("/home");
  await revalidatePath(`/products/${product.id}`);
  return redirect(`/products/${product.id}`);
}
