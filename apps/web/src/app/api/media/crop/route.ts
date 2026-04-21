import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    const left = Number(formData.get("left") ?? 0);
    const top = Number(formData.get("top") ?? 0);
    const width = Number(formData.get("width") ?? 0);
    const height = Number(formData.get("height") ?? 0);
    const rotate = Number(formData.get("rotate") ?? 0);
    const id = formData.get("id")?.toString() ?? "";

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const image = sharp(inputBuffer);
    const meta = await image.metadata();

    const imgW = meta.width ?? 0;
    const imgH = meta.height ?? 0;

    const clamp = (v: number, max: number) =>
      Math.max(0, Math.min(Math.round(v), max));

    const leftC = clamp(left, imgW);
    const topC = clamp(top, imgH);
    const widthC = clamp(width, imgW - leftC);
    const heightC = clamp(height, imgH - topC);

    const extracted = await image
      .extract({
        left: leftC,
        top: topC,
        width: Math.max(1, widthC),
        height: Math.max(1, heightC),
      })
      .toBuffer();

    const finalBuffer = await sharp(extracted)
      .rotate(rotate)
      .webp({ quality: 90 })
      .toBuffer();

    return new Response(new Uint8Array(finalBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        ...(id ? { "X-Asset-Id": id } : {}),
      },
    });
  } catch (err) {
    console.error("Crop API error:", err);

    return NextResponse.json({ error: "Crop failed" }, { status: 500 });
  }
}