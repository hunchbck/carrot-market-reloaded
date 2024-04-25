"use server";

interface DeleteResult {
  success: boolean;
  error?: string;
}

export async function deleteImageFromCloudflare(imageUrl: string): Promise<DeleteResult> {
  const prefix = "https://imagedelivery.net/nwxXMmJxUUiN7Xi9SKXUwA/";

  // Check if imageUrl is provided and valid
  if (!imageUrl) {
    console.error('No image URL provided.');
    return { success: false, error: "No image URL provided." };
  }

  // Ensure imageUrl contains the expected prefix
  if (!imageUrl.startsWith(prefix)) {
    console.error('Invalid image URL format.');
    return { success: false, error: "Invalid image URL format." };
  }

  const imageId = imageUrl.replace(prefix, "");
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`;
  const headers = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`
  };

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: headers
    });

    if (response.ok) {
      // Assuming the API returns a successful response on successful deletion
      return { success: true };
    } else {
      const result = await response.json();
      return { success: false, error: `Failed to delete image. Status: ${response.status}, Message: ${result.errors?.[0]?.message || result.message}` };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: `Error deleting image: ${error.message}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export async function getUploadUrl(): Promise<UploadResult> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        },
      }
    );
    if (response.ok) {
      const result = await response.json();
      return { success: true, result: result.result }; // Assuming the API returns an object with a 'result' key
    } else {
      return { success: false, error: `Failed to fetch URL: ${response.status}` };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: `Error fetching URL: ${error.message}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}