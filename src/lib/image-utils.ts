
'use server';

export async function convertToImgurUrl(originalImageUrl: string): Promise<string> {
  if (!originalImageUrl.startsWith('https://jmdy.shop')) {
    return originalImageUrl; // Not a jmdy.shop URL, return as is
  }

  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) {
    console.warn('IMGUR_CLIENT_ID is not set. Skipping Imgur upload for:', originalImageUrl);
    return originalImageUrl; // Return original if no client ID
  }

  try {
    // Step 1: Fetch the image from the original URL as a blob
    const imageResponse = await fetch(originalImageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image from ${originalImageUrl}:`, imageResponse.status, imageResponse.statusText);
      return originalImageUrl;
    }
    const imageBlob = await imageResponse.blob();

    // Step 2: Prepare FormData for Imgur API with the image blob
    const formData = new FormData();
    formData.append('image', imageBlob); // Uploading as a blob (file)

    // Step 3: Post the image data to Imgur
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${clientId}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse Imgur error response' }));
      console.error('Imgur API error:', response.status, response.statusText, errorData);
      return originalImageUrl;
    }

    const result = await response.json();
    if (result.success && result.data && result.data.link) {
      console.log('Image successfully uploaded to Imgur:', result.data.link);
      return result.data.link;
    } else {
      console.error('Imgur API response missing success flag or link property:', result);
      return originalImageUrl;
    }
  } catch (error) {
    console.error('Exception during Imgur upload process:', error);
    return originalImageUrl;
  }
}
