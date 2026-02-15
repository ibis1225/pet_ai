'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return alert('필수 항목을 모두 입력해주세요.');
    if (form.password !== form.confirmPassword) return alert('비밀번호가 일치하지 않습니다.');
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined });
      router.push('/');
    } catch { alert('회원가입 실패. 다시 시도해주세요.'); }
  };

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#FF6B35] flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-2xl font-bold text-[#FF6B35]">회원가입</h1>
          <p className="text-gray-500 text-sm mt-1">PetAI와 함께 반려동물 케어를 시작하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { key: 'name', label: '이름 *', icon: '👤', type: 'text', placeholder: '이름을 입력해주세요' },
            { key: 'email', label: '이메일 *', icon: '✉️', type: 'email', placeholder: '이메일을 입력해주세요' },
            { key: 'phone', label: '전화번호', icon: '📱', type: 'tel', placeholder: '010-0000-0000' },
            { key: 'password', label: '비밀번호 *', icon: '🔒', type: 'password', placeholder: '비밀번호 (8자 이상)' },
            { key: 'confirmPassword', label: '비밀번호 확인 *', icon: '🔒', type: 'password', placeholder: '비밀번호를 다시 입력해주세요' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-gray-700 mb-1 block">{f.label}</label>
              <div className="flex items-center bg-gray-50 rounded-xl px-4 h-12">
                <span className="text-gray-400 mr-3">{f.icon}</span>
                <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm" />
              </div>
            </div>
          ))}
          <button type="submit" disabled={isLoading}
            className="w-full h-13 bg-[#FF6B35] text-white font-semibold rounded-xl mt-2 hover:bg-[#e55a2b] transition disabled:opacity-50">
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-500">
          이미 계정이 있으신가요? <Link href="/login" className="text-[#FF6B35] font-semibold">로그인</Link>
        </p>
      </div>
    </div>
  );
}
