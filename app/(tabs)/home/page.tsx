import ProductList from "@/components/product-list";
import { PlusIcon } from "@heroicons/react/24/solid";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  unstable_cache as nextCache,
  revalidatePath,
  revalidateTag,
} from "next/cache";
import Link from "next/link";

const getCachedProducts = nextCache(
  getInitialProducts,
  ["home-products"]
);

async function getInitialProducts() {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
}

export type InitialProducts = Prisma.PromiseReturnType<typeof getInitialProducts>;

export const metadata = {
  title: "Home",
};

// export const dynamic = "force-dynamic";
// export const revalidate = 60;

export default async function Products() {
  const initialProducts = await getCachedProducts();
  const revalidate = async () => {
    "use server";
    await revalidatePath("/home");
  };
  return (
    <div>
      <Link href="/home/recent">Recent products</Link>
      <ProductList initialProducts={initialProducts} />
      <Link
        href="/add-product"
        className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
}