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
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="flex items-center mb-6">
        <Link href="/login" className="text-xl mr-4">←</Link>
        <h1 className="text-xl font-bold flex-1 text-center">회원가입</h1>
        <div className="w-6" />
      </div>
      <p className="text-gray-500 text-sm mb-6">PetAI와 함께 반려동물 케어를 시작하세요</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'name', label: '이름 *', type: 'text', placeholder: '이름을 입력해주세요' },
          { key: 'email', label: '이메일 *', type: 'email', placeholder: '이메일을 입력해주세요' },
          { key: 'phone', label: '전화번호', type: 'tel', placeholder: '010-0000-0000' },
          { key: 'password', label: '비밀번호 *', type: 'password', placeholder: '비밀번호 (8자 이상)' },
          { key: 'confirmPassword', label: '비밀번호 확인 *', type: 'password', placeholder: '비밀번호를 다시 입력해주세요' },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-gray-700 mb-1 block">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 h-12 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]/30" />
          </div>
        ))}
        <button type="submit" disabled={isLoading}
          className="w-full h-13 bg-[#FF6B35] text-white font-semibold rounded-xl mt-2 hover:bg-[#e55a2b] disabled:opacity-50">
          {isLoading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  );
}
