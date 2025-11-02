'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Power } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Auto Post */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Auto Posting</h3>
                <p className="text-sm text-gray-600">Automatically generate and post content</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoPost: !settings.autoPost })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  settings.autoPost ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    settings.autoPost ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Posting Interval */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Posting Interval</h3>
            <input
              type="number"
              value={settings.postingInterval}
              onChange={(e) => setSettings({ ...settings, postingInterval: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="Minutes between posts"
            />
            <p className="text-xs text-gray-500 mt-2">Minutes between automated posts</p>
          </div>

          {/* Tone */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Tone</h3>
            <select
              value={settings.tone}
              onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="funny">Funny</option>
              <option value="professional">Professional</option>
              <option value="informative">Informative</option>
              <option value="casual">Casual</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>

          {/* Platforms */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enabled Platforms</h3>
            <div className="space-y-3">
              {Object.entries(settings.platforms).map(([platform, enabled]) => (
                <label key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <span className="text-gray-900 capitalize font-medium">{platform}</span>
                  <input
                    type="checkbox"
                    checked={enabled as boolean}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: { ...settings.platforms, [platform]: e.target.checked },
                      })
                    }
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
            <input
              type="text"
              value={settings.languages.join(', ')}
              onChange={(e) =>
                setSettings({ ...settings, languages: e.target.value.split(',').map((l: string) => l.trim()) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="en, ur"
            />
            <p className="text-xs text-gray-500 mt-2">Comma-separated language codes</p>
          </div>

          {/* Regions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regions</h3>
            <input
              type="text"
              value={settings.regions.join(', ')}
              onChange={(e) =>
                setSettings({ ...settings, regions: e.target.value.split(',').map((r: string) => r.trim()) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="US, PK"
            />
            <p className="text-xs text-gray-500 mt-2">Comma-separated region codes</p>
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <input
              type="text"
              value={settings.categories.join(', ')}
              onChange={(e) =>
                setSettings({ ...settings, categories: e.target.value.split(',').map((c: string) => c.trim()) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="technology, business, entertainment"
            />
            <p className="text-xs text-gray-500 mt-2">Comma-separated categories</p>
          </div>
        </div>
      </div>
    </div>
  );
}
