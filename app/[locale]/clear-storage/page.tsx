'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearStoragePage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage cleared!');
    setTimeout(() => {
      router.push('/de/submit');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-text-primary">Clearing Storage...</h1>
        <p className="text-text-secondary">Redirecting to submit page...</p>
      </div>
    </div>
  );
}
