'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/consultation', label: '상담' },
  { href: '/business', label: '업체' },
  { href: '/shopping', label: '쇼핑' },
  { href: '/chat', label: 'AI 채팅' },
  { href: '/profile', label: '프로필' },
];

export default function TopNav() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-10">
          <div className="w-9 h-9 rounded-full bg-[#FF6B35] flex items-center justify-center">
            <span className="text-lg">🐾</span>
          </div>
          <span className="text-xl font-bold text-[#FF6B35]">PetAI</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
