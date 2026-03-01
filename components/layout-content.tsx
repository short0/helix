'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const showSidebar = !isAuthPage;

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden max-sm:flex-col">
      <Sidebar />
      <main className="flex-1 overflow-y-auto max-sm:order-last">{children}</main>
    </div>
  );
}
