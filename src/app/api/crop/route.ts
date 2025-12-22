// app/api/crop/route.ts
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const left = Number(formData.get('left') ?? 0);
    const top = Number(formData.get('top') ?? 0);
    const width = Number(formData.get('width') ?? 0);
    const height = Number(formData.get('height') ?? 0);
    const rotate = Number(formData.get('rotate') ?? 0);
    const id = formData.get('id') ?? '';

    // read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // apply rotation (baked) then extract
    // const rotated = sharp(inputBuffer).rotate(rotate);

    // Extract the area under the grid then apply rotation
    const image = sharp(inputBuffer); // create sharp instance
    const meta = await image.metadata(); // get image metadata
    const imgW = meta.width ?? 0; // image width
    const imgH = meta.height ?? 0; // image height

    // clamp values to image bounds
    const clamp = (v: number, max: number) => Math.max(0, Math.min(Math.round(v), max));
    const leftC = clamp(left, imgW);
    const topC = clamp(top, imgH);
    const widthC = clamp(width, imgW - leftC);
    const heightC = clamp(height, imgH - topC);

    const extracted = await image.extract({
      left: leftC,
      top: topC,
      width: Math.max(1, widthC),
      height: Math.max(1, heightC),
    }).toBuffer();

    // Output in WebP
    const finalBuffer = await sharp(extracted).rotate(rotate).webp({ quality: 90 }).toBuffer();
    const base64 = `data:image/webp;base64,${finalBuffer.toString('base64')}`;

    return NextResponse.json({ base64, id });
  } catch (err) {
    console.error('Crop API error', err);
    return NextResponse.json({ error: 'Crop failed' }, { status: 500 });
  }
}