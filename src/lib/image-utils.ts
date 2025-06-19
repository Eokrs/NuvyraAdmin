
'use server';

export async function convertToImgurUrl(originalImageUrl: string): Promise<string> {
  if (!originalImageUrl.startsWith('https://jmdy.shop')) {
    return originalImageUrl; // Not a jmdy.shop URL, return as is
  }

  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) {
    console.warn('IMGUR_CLIENT_ID is not set in .env. Skipping Imgur upload for:', originalImageUrl);
    return originalImageUrl; // Return original if no client ID
  }

  try {
    const formData = new FormData();
    formData.append('image', originalImageUrl);
    // Imgur's API can also take 'type': 'url' in the form data if needed,
    // but often infers it correctly if the 'image' parameter is a URL.

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${clientId}`,
        // 'Content-Type': 'multipart/form-data' is set automatically by fetch with FormData
      },
      body: formData,
    });

    if (!response.ok) {
      // Try to parse error response from Imgur
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse Imgur error response' }));
      console.error('Imgur API error:', response.status, response.statusText, errorData);
      return originalImageUrl; // Return original on API error
    }

    const result = await response.json();
    if (result.success && result.data && result.data.link) {
      console.log('Image successfully uploaded to Imgur:', result.data.link);
      return result.data.link; // Return the new Imgur link
    } else {
      console.error('Imgur API response missing success flag or link property:', result);
      return originalImageUrl; // Return original if response format is unexpected
    }
  } catch (error) {
    console.error('Exception during Imgur upload process:', error);
    return originalImageUrl; // Return original on network or other exceptions
  }
}
