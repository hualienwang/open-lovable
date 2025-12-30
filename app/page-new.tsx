'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SandboxProvider } from '@/lib/sandbox-context';
import { MainApp } from './MainApp';

export default function AISandboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <SandboxProvider router={router} searchParams={searchParams}>
      <MainApp />
    </SandboxProvider>
  );
}