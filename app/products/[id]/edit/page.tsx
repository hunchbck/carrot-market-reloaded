"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { getUploadUrl } from "@/lib/cloudflare";
import { ProductType, productSchema } from "@/lib/product";
import { updateProduct } from "./actions";

export default async function EditProduct({
  params,
}: {
  params: { id: string };
}) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    // Function to fetch product
    const fetchProduct = async (id: string) => {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setPreview(`${data.photo}/public`);
        setValue(
          "photo",
          data.photo
        );
      } else {
        console.error('Failed to fetch product');
      }
    };
    fetchProduct(params.id);
  }, [params.id]);
  if (!product) {
    return;
  }

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }
    if (files[0]) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFile(file);
      const uploadResult = await getUploadUrl();
      if (uploadResult.success && uploadResult.result) {
        const { id, uploadURL } = uploadResult.result;
        setUploadUrl(uploadURL);
        setValue("photo", `https://imagedelivery.net/nwxXMmJxUUiN7Xi9SKXUwA/${id}`);
      } else {
        console.error(uploadResult.error); // Properly log or display the error
      }
    }
  };
  
  const onSubmit = handleSubmit(async (data: ProductType) => {
    if (file) {
      const cloudflareForm = new FormData();
      cloudflareForm.append("file", file);
      const response = await fetch(uploadUrl, {
        method: "post",
        body: cloudflareForm,
      });
      if (response.status !== 200) {
        return;
      }
    }
    const formData = new FormData();
    formData.append("id", String(params.id));
    formData.append("title", data.title);
    formData.append("price", data.price + "");
    formData.append("description", data.description);
    formData.append("photo", data.photo);
    const updateErrors = await updateProduct(formData);
    if (updateErrors) {
      // setError or handle appropriately
      console.error('Failed to update product:', errors);
    }
  });
  const onValid = async () => {
    await onSubmit();
  };
  
  return (
    <div>
      <form action={onValid} className="p-5 flex flex-col gap-5">
      <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요.
                {errors.photo?.message}
              </div>
            </>
          ) : null}
        </label>
        <input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
        />
        <Input 
          required
          placeholder="제목"
          type="text"
          {...register("title")}
          defaultValue={product.title}
          errors={[errors.title?.message ?? ""]}
        />
        <Input
          type="number"
          required
          placeholder="가격"
          {...register("price")}
          defaultValue={product.price}
          errors={[errors.price?.message ?? ""]}
        />
        <Input
          type="text"
          required
          placeholder="자세한 설명"
          {...register("description")}
          defaultValue={product.description}
          errors={[errors.description?.message ?? ""]}
        />
        <Button text="상품 수정" />
      </form>
    </div>
  );
}