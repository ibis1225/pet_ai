'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, devLogin, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');
    try {
      await login(email, password);
      router.push('/');
    } catch { alert('로그인 실패. 이메일 또는 비밀번호를 확인해주세요.'); }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen px-8 bg-white">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-[#FF6B35] flex items-center justify-center mx-auto mb-3">
          <span className="text-4xl">🐾</span>
        </div>
        <h1 className="text-3xl font-bold text-[#FF6B35]">PetAI</h1>
        <p className="text-gray-500 mt-1">반려동물 AI 상담 플랫폼</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center bg-gray-50 rounded-xl px-4 h-13">
          <span className="text-gray-400 mr-3">✉️</span>
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm" autoComplete="email" />
        </div>
        <div className="flex items-center bg-gray-50 rounded-xl px-4 h-13">
          <span className="text-gray-400 mr-3">🔒</span>
          <input type={showPw ? 'text' : 'password'} placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 text-sm">{showPw ? '숨기기' : '보기'}</button>
        </div>
        <button type="submit" disabled={isLoading}
          className="w-full h-13 bg-[#FF6B35] text-white font-semibold rounded-xl hover:bg-[#e55a2b] transition disabled:opacity-50">
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center mt-5 text-sm text-gray-500">
        계정이 없으신가요? <Link href="/register" className="text-[#FF6B35] font-semibold">회원가입</Link>
      </p>

      <button onClick={() => { devLogin(); router.push('/'); }}
        className="mt-8 text-xs text-gray-300 mx-auto block">[DEV] 로그인 건너뛰기</button>
    </div>
  );
}
