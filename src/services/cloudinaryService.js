import {
  CLOUD_NAME,
  UPLOAD_PRESET,
} from '../firebase/cloudinary.js';

export const uploadToCloudinary = async (
  file,
  resourceType = 'image'
) => {
  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append(
      'upload_preset',
      UPLOAD_PRESET
    );

    const endpoint =
      resourceType === 'video'
        ? 'video/upload'
        : 'image/upload';

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };

  } catch (error) {
    console.error(error);

    return {
      success: false,
      error,
    };
  }
};