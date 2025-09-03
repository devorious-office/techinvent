'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';

export default function LayoutProvider({ children }) {
  const pathname = usePathname();

  // Define the routes that should have the Sidebar and Header
  const layoutRoutes = ['/', '/proposals','/users'];

  // This logic checks if the current page is one of the main layout routes
  // or a dynamic sub-route (like /proposals/some-id).
const showLayout =
  layoutRoutes.includes(pathname) ||
  pathname.startsWith('/proposals/') ||
  pathname.startsWith('/users/');

  

  // If the page does not require the main layout (e.g., a future /login page),
  // we render the children directly.
  if (!showLayout) {
    return <>{children}</>;
  }

  // Otherwise, we render the full admin layout with the Sidebar and Header.
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
