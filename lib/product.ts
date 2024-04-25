import db from "@/lib/db";
import { z } from "zod";

export const productSchema = z.object({
    photo: z.string({
      required_error: "Photo is required",
    }),
    title: z.string({
      required_error: "Title is required",
    }),
    description: z.string({
      required_error: "Description is required",
    }),
    price: z.coerce.number({
      required_error: "Price is required",
    }),
});

export type ProductType = z.infer<typeof productSchema>;

interface User {
  username: string;
  avatar: string | null;
}

export type Product = {
  id: number;
  user: User;  // Update this to use the User interface
  photo: string;
  title: string;
  description: string;
  price: number;
  created_at: Date;
  updated_at: Date;
  userId: number;
};

export async function getProduct(id: string) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return null;
  }
  const product = await db.product.findUnique({
    where: {
      id: numericId,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  return product;
};

export async function getProductTitle(id: string) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return null;
  }
  const product = await db.product.findUnique({
    where: {
      id: numericId,
    },
    select: {
      title: true,
    },
  });
  return product;
};