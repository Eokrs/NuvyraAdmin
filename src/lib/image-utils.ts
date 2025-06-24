
'use server';

export async function uploadImageToImgur(dataUri: string): Promise<string> {
  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) {
    console.warn('IMGUR_CLIENT_ID is not set. Cannot upload to Imgur.');
    throw new Error('O upload para o Imgur não está configurado no servidor (IMGUR_CLIENT_ID ausente).');
  }

  const base64Data = dataUri.split(',')[1];
  if (!base64Data) {
      throw new Error('URI de dados inválido para o upload da imagem.');
  }

  try {
    const formData = new FormData();
    formData.append('image', base64Data);
    formData.append('type', 'base64');

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${clientId}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Imgur API error:', response.status, response.statusText, errorData);
      const errorMessage = errorData?.data?.error || 'Falha no upload para o Imgur.';
      throw new Error(`Erro da API do Imgur: ${errorMessage}`);
    }

    const result = await response.json();
    if (result.success && result.data && result.data.link) {
      console.log('Image successfully uploaded to Imgur:', result.data.link);
      return result.data.link;
    } else {
      throw new Error('A resposta da API do Imgur não contém um link válido.');
    }
  } catch (error: any) {
    console.error('Exceção durante o processo de upload para o Imgur:', error);
    if (error.message.startsWith('Erro da API do Imgur:') || error.message.startsWith('O upload para o Imgur não está configurado')) {
        throw error;
    }
    throw new Error('Ocorreu um erro inesperado durante o upload da imagem.');
  }
}
