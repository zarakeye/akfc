'use client';

import { useState, useEffect, JSX } from 'react';
import type { User } from '@prisma/client';

interface AuthGateProps {
  user: User | null
}

export default function AuthGate({ user }: AuthGateProps): JSX.Element {
  const { isFirstLogin } = user;
  const [firstLogin, setFirstLogin] = useState(user?.isFirstLogin);

  useEffect(() => {
    setFirstLogin 
  })
}