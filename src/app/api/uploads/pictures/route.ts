import { NextResponse } from 'next/server';
import { uploadToCloudinaryAuthenticated } from '@/server/cloudinary/services/upload';

export const runtime = 'nodejs';

const APP_SHORT_NAME = process.env.APP_SHORT_NAME || 'my-app';

/**
 * Upload multiple pictures to Cloudinary.
 *
 * The request body should contain a form data with a key named 'pictures'
 * and a value that is an array of File objects.
 *
 * The response will be a JSON object with a 'success' key that is true if
 * all the pictures were uploaded successfully, and a 'results' key that is
 * an array of objects with a 'publicId' key containing the public ID of the
 * uploaded picture.
 *
 * If any of the pictures fail to upload, the response status will be 500 and
 * the JSON object will contain an 'error' key with the value 'Upload failed'.
 *
 * If no pictures are uploaded, the response status will be 400 and the JSON object
 * will contain an 'error' key with the value 'No picture uploaded'.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const files = formData.getAll('pictures') as File[];
    
    if (!files.length) {
      return NextResponse.json(
        { error: 'No picture uploaded' },
        { status: 400 }
      );
    }

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadToCloudinaryAuthenticated(file, {
        folder: `${APP_SHORT_NAME}/pending`,
        publicId: `picture_${Date.now()}_${i}`,
      });

      results.push({ publicId: result.public_id });
    }

    return NextResponse.json({
      succes: true,
      results
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
