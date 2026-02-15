"use client";

import { useState, useEffect } from "react";

const WEB_API_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3001";

const EVENT_TYPE_LABELS: Record<string, string> = {
  chat_recommendation: "AI 채팅 추천",
  business_click: "업체 클릭",
  business_map_click: "지도 클릭",
  business_call_click: "전화 클릭",
  business_direction_click: "길찾기 클릭",
};

interface CategoryStats {
  category: string;
  categoryLabel: string;
  chatRecommendations: number;
  pageClicks: number;
  mapClicks: number;
  callClicks: number;
  directionClicks: number;
  totalInteractions: number;
}

interface AnalyticsEvent {
  id: string;
  type: string;
  category?: string;
  businessName?: string;
  source: string;
  timestamp: string;
}

interface StatsData {
  totalEvents: number;
  byCategory: CategoryStats[];
  recentEvents: AnalyticsEvent[];
  dailyCounts: { date: string; count: number }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${WEB_API_URL}/api/analytics`);
      const data = await res.json();
      setStats(data);
    } catch {
      setError("통계 데이터를 불러올 수 없습니다. Web 서버(port 3001)가 실행 중인지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchStats} className="mt-3 text-sm text-indigo-600 font-medium hover:underline">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매칭 통계</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI 채팅 추천 및 업체 매칭 현황 · 업체 구독료 성과 지표
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          새로고침
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="총 이벤트"
          value={stats.totalEvents}
          icon="📊"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <SummaryCard
          label="AI 추천 횟수"
          value={stats.byCategory.reduce((s, c) => s + c.chatRecommendations, 0)}
          icon="🤖"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
          desc="채팅에서 업체 추천 버튼 클릭"
        />
        <SummaryCard
          label="업체 페이지 클릭"
          value={stats.byCategory.reduce((s, c) => s + c.pageClicks + c.mapClicks, 0)}
          icon="🏪"
          bgColor="bg-orange-50"
          textColor="text-orange-600"
          desc="업체 목록/지도 클릭"
        />
        <SummaryCard
          label="전화/길찾기"
          value={stats.byCategory.reduce((s, c) => s + c.callClicks + c.directionClicks, 0)}
          icon="📞"
          bgColor="bg-green-50"
          textColor="text-green-600"
          desc="실제 연결 (전화/길찾기)"
        />
      </div>

      {/* Category Stats Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">카테고리별 매칭 현황</h2>
          <span className="text-xs text-gray-400">구독료 성과 기준 데이터</span>
        </div>
        {stats.byCategory.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            아직 데이터가 없습니다. 고객이 AI 채팅에서 상담하면 통계가 쌓입니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">카테고리</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">AI 추천</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">업체 클릭</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">지도 클릭</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">전화</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">길찾기</th>
                  <th className="text-center px-4 py-3 font-semibold text-indigo-600">총 매칭</th>
                </tr>
              </thead>
              <tbody>
                {stats.byCategory.map((cat) => (
                  <tr key={cat.category} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-900">{cat.categoryLabel}</td>
                    <td className="text-center px-4 py-3 text-gray-700">{cat.chatRecommendations}</td>
                    <td className="text-center px-4 py-3 text-gray-700">{cat.pageClicks}</td>
                    <td className="text-center px-4 py-3 text-gray-700">{cat.mapClicks}</td>
                    <td className="text-center px-4 py-3 text-gray-700">{cat.callClicks}</td>
                    <td className="text-center px-4 py-3 text-gray-700">{cat.directionClicks}</td>
                    <td className="text-center px-4 py-3 font-bold text-indigo-600">{cat.totalInteractions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Chart */}
      {stats.dailyCounts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">일별 이벤트</h2>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-1.5 h-40">
              {stats.dailyCounts.map((day) => {
                const max = Math.max(...stats.dailyCounts.map((d) => d.count));
                const height = max > 0 ? (day.count / max) * 100 : 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">{day.count}</span>
                    <div
                      className="w-full bg-indigo-500 rounded-t min-h-[4px] transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-gray-400 -rotate-45 origin-center whitespace-nowrap">
                      {day.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">최근 이벤트</h2>
          <span className="text-xs text-gray-400">최근 50개</span>
        </div>
        {stats.recentEvents.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">이벤트가 없습니다</div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {stats.recentEvents.map((event) => (
              <div key={event.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition">
                <span className="text-lg">
                  {event.type === "chat_recommendation" ? "🤖" :
                   event.type === "business_click" ? "🏪" :
                   event.type === "business_map_click" ? "🗺️" :
                   event.type === "business_call_click" ? "📞" : "🧭"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {EVENT_TYPE_LABELS[event.type] || event.type}
                    {event.businessName && <span className="text-gray-500"> — {event.businessName}</span>}
                  </p>
                  <p className="text-xs text-gray-400">
                    {event.category && `${event.category} · `}
                    {event.source} · {new Date(event.timestamp).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label, value, icon, bgColor, textColor, desc,
}: {
  label: string; value: number; icon: string; bgColor: string; textColor: string; desc?: string;
}) {
  return (
    <div className={`rounded-xl p-5 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className={`text-xs font-medium ${textColor} opacity-80`}>{label}</span>
      </div>
      <p className={`text-3xl font-bold ${textColor}`}>{value.toLocaleString()}</p>
      {desc && <p className="text-[11px] text-gray-500 mt-1">{desc}</p>}
    </div>
  );
}
