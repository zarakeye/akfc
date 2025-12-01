import { JSX } from 'react';
import { useState, useEffect } from 'react';
import type { User } from '@prisma/client';
import Image from 'next/image';

export default function UserCard({ user }: { user: User }): JSX.Element {
  return (
    <div className="p-4 border rounded shadow-md bg-white">
      {/* <div>
        <Image
      </div> */}
      <h2 className="text-xl font-bold mb-2">{user.firstName} {user.lastName}</h2>
      <div className="flex text-gray-600 mb-1"><Image src="/email.svg" alt="email" width={20} height={20} />: {user.email}
      </div>
      {user.phone && (
        <div className="flex text-gray-600 mb-1">
          <Image src="/mobilePhone.svg" alt="phone" width={20} height={20} />: <span>{user.phone}</span>
        </div>
      )}
      {user.birthDate && <p className="text-gray-600">Birth Date: {new Date(user.birthDate).toLocaleDateString()}</p>}
    </div>
  );
}