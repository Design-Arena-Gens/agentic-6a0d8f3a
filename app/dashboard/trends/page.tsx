'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Check,
  X,
  Trash2,
  ExternalLink,
  TrendingUp
} from 'lucide-react';

interface Trend {
  id: string;
  title: string;
  description: string;
  source: string;
  category: string;
  language: string;
  popularityScore: number;
  approved: boolean;
  used: boolean;
  fetchedAt: string;
  url?: string;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const router = useRouter();

  useEffect(() => {
    loadTrends();
  }, [filter]);

  const loadTrends = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'approved') params.append('approved', 'true');
      if (filter === 'pending') params.append('approved', 'false');

      const response = await fetch(`/api/trends?${params}`);
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setTrends(data);
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewTrends = async () => {
    setFetching(true);
    try {
      const response = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch' }),
      });
      const data = await response.json();
      alert(`Fetched ${data.count} new trending topics!`);
      loadTrends();
    } catch (error) {
      console.error('Error fetching trends:', error);
      alert('Failed to fetch trends');
    } finally {
      setFetching(false);
    }
  };

  const updateTrend = async (id: string, updates: Partial<Trend>) => {
    try {
      await fetch(`/api/trends/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      loadTrends();
    } catch (error) {
      console.error('Error updating trend:', error);
    }
  };

  const deleteTrend = async (id: string) => {
    if (!confirm('Delete this trend?')) return;
    try {
      await fetch(`/api/trends/${id}`, { method: 'DELETE' });
      loadTrends();
    } catch (error) {
      console.error('Error deleting trend:', error);
    }
  };

  const generatePost = async (trendId: string) => {
    router.push(`/dashboard/posts?generate=${trendId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trending Topics</h1>
                <p className="text-sm text-gray-600">{trends.length} topics found</p>
              </div>
            </div>
            <button
              onClick={fetchNewTrends}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
              Fetch New Trends
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-2">
            {['all', 'approved', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Trends List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading trends...</p>
          </div>
        ) : trends.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No trends found</p>
            <button
              onClick={fetchNewTrends}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Fetch Trending Topics
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {trends.map((trend) => (
              <div
                key={trend.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{trend.title}</h3>
                      {trend.url && (
                        <a
                          href={trend.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{trend.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {trend.source}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        {trend.category}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        Score: {trend.popularityScore}
                      </span>
                      {trend.used && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          Used
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!trend.approved ? (
                      <button
                        onClick={() => updateTrend(trend.id, { approved: true })}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateTrend(trend.id, { approved: false })}
                        className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                        title="Unapprove"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTrend(trend.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {trend.approved && !trend.used && (
                  <button
                    onClick={() => generatePost(trend.id)}
                    className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Generate Posts
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
