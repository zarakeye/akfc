import { v2 as cloudinary } from "cloudinary";

type MoveFileArgs = {
  publicId: string;
  from: string;
  to: string;
};

export async function moveFile({
  publicId,
  from,
  to,
}: MoveFileArgs): Promise<void> {
  const fileName = publicId.split("/").pop();
  
  if (!fileName) {
    throw new Error(`Invalid publicId: ${publicId}`);
  }

  const targetFolder = from.replace(/\/[^/]+$/, `/${to}`);
  const fromPublicId = `${from}/${fileName}`;
  const toPublicId = `${targetFolder}/${fileName}`;

  return cloudinary.uploader.rename(
    fromPublicId,
    toPublicId,
    {
      overwrite: true,
      invalidate: true,
    }
  );
}