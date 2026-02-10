"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { api } from "@/lib/api";
import type { ConsultationStats, Consultation } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  in_progress: "진행중",
  pending: "대기중",
  assigned: "배정됨",
  completed: "완료",
  cancelled: "취소됨",
};

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, consultationsRes] = await Promise.all([
        api.get<ConsultationStats>("/consultations/stats"),
        api.get<{ items: Consultation[] }>("/consultations", {
          params: { page: 1, page_size: 5 },
        }),
      ]);
      setStats(statsRes.data);
      setRecentConsultations(consultationsRes.data.items);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-8">대시보드</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="오늘 상담"
            value={stats?.today_count?.toString() || "0"}
            icon="📝"
            color="blue"
          />
          <StatCard
            title="대기중 상담"
            value={stats?.pending?.toString() || "0"}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="진행중 상담"
            value={stats?.in_progress?.toString() || "0"}
            icon="💬"
            color="purple"
          />
          <StatCard
            title="완료된 상담"
            value={stats?.completed?.toString() || "0"}
            icon="✅"
            color="green"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">최근 상담 신청</h2>
              <Link
                href="/consultations"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                전체 보기 →
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-500">로딩 중...</p>
            ) : recentConsultations.length === 0 ? (
              <p className="text-gray-500">상담 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {consultation.consultation_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {consultation.guardian_name || "이름 미입력"} ·{" "}
                        {consultation.pet_name || "반려동물 미입력"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          STATUS_COLORS[consultation.status]
                        }`}
                      >
                        {STATUS_LABELS[consultation.status]}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(consultation.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">상담 분야별 통계</h2>
            {stats?.by_category ? (
              <div className="space-y-3">
                {Object.entries(stats.by_category)
                  .filter(([, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            {getCategoryLabel(category)}
                          </span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (count / stats.total_consultations) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                {Object.values(stats.by_category).every((v) => v === 0) && (
                  <p className="text-gray-500">통계 데이터가 없습니다.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">통계 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    health: "건강 상담",
    behavior: "행동 상담",
    nutrition: "영양/사료",
    grooming: "미용 상담",
    training: "훈련 상담",
    emergency: "응급 상담",
    insurance: "보험 상담",
    other: "기타",
  };
  return labels[category] || category;
}

function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: string;
  icon: string;
  color?: "blue" | "yellow" | "purple" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100",
    yellow: "bg-yellow-50 border-yellow-100",
    purple: "bg-purple-50 border-purple-100",
    green: "bg-green-50 border-green-100",
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </div>
  );
}