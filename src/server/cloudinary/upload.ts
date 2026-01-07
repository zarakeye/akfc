import { v2 as cloudinary } from 'cloudinary';

type UploadOptions = {
  folder: string;
  publicId: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadToCloudinary(
  file: File,
  { folder, publicId }: UploadOptions
) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{
    public_id: string;
    secure_url: string;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({
        folder,
        public_id: publicId,
        resource_type: 'image',
        type: 'authenticated',
        overwrite: false
      }, (err, result) => {
        if (err || !result) reject(err);
        else resolve({
          public_id: result.public_id,
          secure_url: result.secure_url
        });
      })
      .end(buffer);
  });
}

export async function uploadToCloudinaryAuthenticated(
  file: File,
  { folder, publicId }: UploadOptions
) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{
    public_id: string;
  }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        type: 'authenticated',
        overwrite: false,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve({
            public_id: result.public_id,
          });
        }
      }
    ).end(buffer);

    // // Node.js File -> buffer -> stream
    // const reader = new FileReader();
    // reader.onload = () => {
    //   const arrayBuffer = reader.result as ArrayBuffer;
    //   stream.end(Buffer.from(arrayBuffer));
    // };
    // reader.onerror = reject;
    // reader.readAsArrayBuffer(file);
  });
}

export function getSignedImageUrl(publicId: string) {
  return cloudinary.url(publicId, {
    type: 'authenticated',
    secure: true,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
  });
}
