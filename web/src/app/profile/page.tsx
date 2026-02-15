'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const MENU_ITEMS = [
  { icon: '🐾', label: '반려동물 관리', href: '/profile', color: '#FF6B35' },
  { icon: '📅', label: '예약 내역', href: '/profile', color: '#4ECDC4' },
  { icon: '🧾', label: '주문 내역', href: '/profile', color: '#3498DB' },
  { icon: '❤️', label: '찜 목록', href: '/profile', color: '#E74C3C' },
  { icon: '💬', label: '상담 내역', href: '/consultation', color: '#F39C12' },
  { icon: '⚙️', label: '설정', href: '/profile', color: '#95A5A6' },
];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF6B35] flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{user?.name || '사용자'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{user?.email || 'user@email.com'}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pet Quick View */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-xl">
              🐾
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">내 반려동물</p>
              <p className="text-xs text-gray-500 mt-0.5">반려동물을 등록해주세요</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-3 bg-white rounded-xl shadow-sm overflow-hidden">
          {MENU_ITEMS.map((item, i) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition ${i < MENU_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: item.color + '15' }}>
                {item.icon}
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800">{item.label}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full text-center py-4 mt-4 text-sm text-red-500 font-medium hover:text-red-600 transition">
          로그아웃
        </button>
      </div>
    </div>
  );
}
