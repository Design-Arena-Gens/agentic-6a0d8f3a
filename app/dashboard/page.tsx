'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Social Manager</h1>
              <p className="text-sm text-gray-600">Automated Social Media Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Trends</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalTrends || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.approvedTrends || 0} approved
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Posts</h3>
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.postedPosts || 0} posted
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Scheduled</h3>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.scheduledPosts || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              Ready to post
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Failed</h3>
              <Settings className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.failedPosts || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              Need attention
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/dashboard/trends')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <TrendingUp className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Trending Topics</h3>
            <p className="text-sm text-blue-100">
              Discover and manage trending topics
            </p>
          </button>

          <button
            onClick={() => router.push('/dashboard/posts')}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <FileText className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Posts</h3>
            <p className="text-sm text-green-100">
              View and manage all posts
            </p>
          </button>

          <button
            onClick={() => router.push('/dashboard/settings')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Settings className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-sm text-purple-100">
              Configure automation settings
            </p>
          </button>
        </div>

        {/* Platform Stats */}
        {stats?.postsByPlatform && Object.keys(stats.postsByPlatform).length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts by Platform</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.postsByPlatform).map(([platform, count]) => (
                <div key={platform} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                  <p className="text-sm text-gray-600 capitalize">{platform}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
