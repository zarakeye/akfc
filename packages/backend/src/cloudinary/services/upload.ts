import { v2 as cloudinary } from 'cloudinary';

type UploadOptions = {
  folder: string;
  publicId: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true
});

/**
 * Uploads a file to Cloudinary.
 *
 * @param {File} file - The file to upload.
 * @param {UploadOptions} options - The upload options.
 * @param {string} options.folder - The folder to upload the file to.
 * @param {string} options.publicId - The public ID of the file.
 * @returns {Promise<{ public_id: string; secure_url: string }>} - A promise that resolves with an object containing the public ID and secure URL of the uploaded file.
 */
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

/**
 * Uploads a file to Cloudinary (authenticated).
 *
 * @param {File} file - The file to upload.
 * @param {UploadOptions} options - The upload options.
 * @param {string} options.folder - The folder to upload the file to.
 * @param {string} options.publicId - The public ID of the file.
 * @returns {Promise<{ public_id: string }>} - A promise that resolves with an object containing the public ID of the uploaded file.
 */
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

/**
 * Generates a signed Cloudinary URL for a given public ID.
 * The URL is signed with a short-lived token that expires after 5 minutes.
 * @param {string} publicId The public ID of the asset to generate a signed URL for.
 * @returns {string} A signed Cloudinary URL for the given public ID.
 */
export function getSignedImageUrl(publicId: string) {
  return cloudinary.url(publicId, {
    type: 'authenticated',
    secure: true,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
  });
}
