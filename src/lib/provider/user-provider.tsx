import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import React from 'react';

export default function UserProvider({
  children,
  fallbackRedirectUrl = '/',
}: {
  children: React.ReactNode;
  fallbackRedirectUrl?: string;
}) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className='min-h-screen flex justify-center items-center bg-gray-50'>
          <div className='max-w-md w-full'>
            <SignIn routing='hash' fallbackRedirectUrl={fallbackRedirectUrl} />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
