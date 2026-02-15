"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "대시보드", href: "/dashboard", icon: "📊" },
  { name: "매칭 통계", href: "/stats", icon: "📈" },
  { name: "상담 관리", href: "/consultations", icon: "📝" },
  { name: "사용자 관리", href: "/users", icon: "👥" },
  { name: "업체 관리", href: "/businesses", icon: "🏢" },
  { name: "상품 관리", href: "/products", icon: "🛍️" },
  { name: "주문 관리", href: "/orders", icon: "📦" },
  { name: "채팅 로그", href: "/chat-logs", icon: "💬" },
  { name: "설정", href: "/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600">🐾 PetAI Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">PetAI Admin v0.1.0</p>
      </div>
    </aside>
  );
}