import { JSX } from 'react';
import type { User } from '@prisma/client';
import Image from 'next/image';

export default function UserCard({ user }: { user: User }): JSX.Element {
  return (
    <div className="p-4 rounded shadow-md bg-white">
      <div className='flex gap-5'>
        <div>
        <Image
          src={user.avatar ?? '/account_circle_size_40.svg'}
          alt="preview"
          className="w-24 h-24 rounded-full object-cover"
          width={500}
          height={500}
          sizes="(max-width: 768px) 100px, 200px"
        />
      </div>
      <h2 className="flex text-center items-center text-xl font-bold mb-2"><span>{user.firstName} {user.lastName}</span></h2>
      </div>
      
      <div className="flex text-gray-600 mb-1"><Image src="/email.svg" alt="email" width={20} height={20} />: {user.email}
      </div>
      {user.phone && (
        <div className="flex text-gray-600 mb-1">
          <Image src="/mobilePhone.svg" alt="phone" width={20} height={20} /> : <span>{user.phone}</span>
        </div>
      )}
      {user.birthDate && <p className="text-gray-600">Date de naissance: {new Date(user.birthDate).toLocaleDateString()}</p>}
    </div>
  );
}