import { cloudinary } from '../cloudinary/cloudinary.client';


export async function listAuthenticatedResources(prefix: string) {
  const result = await cloudinary.api.resources({
    type: 'authenticated',
    prefix,
    max_results: 500
  });

  return result.resources.map((r: typeof result.resources[0]) => ({
    publicId: r.public_id,
    url: r.secure_url
  }));
}