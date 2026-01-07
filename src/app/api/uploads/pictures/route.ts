import { NextResponse } from 'next/server';
import { uploadToCloudinaryAuthenticated } from '@/server/cloudinary/upload';

export const runtime = 'nodejs';

const APP_SHORT_NAME = process.env.APP_SHORT_NAME || 'my-app';

export async function POST(req: Request) {
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
