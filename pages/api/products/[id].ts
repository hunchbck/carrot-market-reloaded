// This file is located at /pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Product, getProduct } from "@/lib/product";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product | { message: string }>
) {
  const id = req.query.id as string; // Cast as string, ensure type safety
  const product = await getProduct(id);
  if (!product) {
    console.log("API 실패", id);
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.status(200).json(product);
}
