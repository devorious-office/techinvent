'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();

  const navLinkClasses = (path) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path 
        ? 'bg-cyan-500 text-white' 
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700/50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo can be re-enabled if you have it in /public */}
          {/* <Image src="/cu-logo.png" alt="CU Logo" width={40} height={40} /> */}
          <div>
            <h1 className="text-lg font-bold text-white">TECH INVENT 2025</h1>
            <p className="text-xs text-gray-400">Proposal Management</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
          <Link href="/" className={navLinkClasses('/')}>
            New Proposal
          </Link>
          <Link href="/proposals" className={navLinkClasses('/proposals')}>
            My Proposals
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;