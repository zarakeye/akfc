'use client';

import Finder from '@features/finder-core/components/Finder';
import { cloudinaryAdapter } from '@features/cloudinary-adapter/cloudinaryAdapter';

export default function TestFinderPage() {
  return (
    <div className='p-6'>
      <Finder adapter={cloudinaryAdapter} />
    </div>
  );
}