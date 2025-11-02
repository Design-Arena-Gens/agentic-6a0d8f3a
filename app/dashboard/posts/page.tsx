'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Sparkles
} from 'lucide-react';

interface Post {
  id: string;
  trendId: string;
  platform: string;
  content: string;
  imageUrl?: string;
  status: string;
  scheduledFor?: string;
  postedAt?: string;
  error?: string;
  createdAt: string;
}

function PostsContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const generateTrendId = searchParams.get('generate');

  useEffect(() => {
    loadPosts();
    if (generateTrendId) {
      openGenerateModal(generateTrendId);
    }
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGenerateModal = async (trendId: string) => {
    const platforms = ['facebook', 'instagram', 'twitter', 'threads', 'pinterest'];
    const tone = prompt('Enter tone (funny, professional, informative, casual, inspirational):', 'professional') || 'professional';

    setGenerating(true);
    for (const platform of platforms) {
      try {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            trendId,
            platform,
            tone,
          }),
        });
      } catch (error) {
        console.error(`Error generating ${platform} post:`, error);
      }
    }
    setGenerating(false);
    loadPosts();
  };

  const postNow = async (postId: string) => {
    if (!confirm('Post this now?')) return;
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'post', postId }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Posted successfully!');
      } else {
        alert(`Failed: ${data.error}`);
      }
      loadPosts();
    } catch (error) {
      console.error('Error posting:', error);
      alert('Failed to post');
    }
  };

  const schedulePost = async (postId: string) => {
    const scheduledFor = prompt('Enter date and time (YYYY-MM-DD HH:MM):');
    if (!scheduledFor) return;

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule',
          postId,
          scheduledFor: new Date(scheduledFor).toISOString(),
        }),
      });
      loadPosts();
    } catch (error) {
      console.error('Error scheduling:', error);
      alert('Failed to schedule');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      loadPosts();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'posted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Edit className="w-5 h-5 text-gray-500" />;
    }
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
                <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
                <p className="text-sm text-gray-600">{posts.length} posts</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {generating && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-xl mb-6 flex items-center gap-3">
            <Sparkles className="w-5 h-5 animate-pulse" />
            Generating posts with AI...
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 mb-4">No posts yet</p>
            <button
              onClick={() => router.push('/dashboard/trends')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Generate from Trends
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(post.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{post.platform}</h3>
                      <p className="text-xs text-gray-500 capitalize">{post.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {post.status === 'draft' && (
                      <>
                        <button
                          onClick={() => postNow(post.id)}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                          title="Post Now"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => schedulePost(post.id)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          title="Schedule"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="w-full max-w-md rounded-lg mb-3" />
                )}

                {post.error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    Error: {post.error}
                  </div>
                )}

                {post.scheduledFor && (
                  <p className="text-xs text-gray-500">
                    Scheduled for: {new Date(post.scheduledFor).toLocaleString()}
                  </p>
                )}
                {post.postedAt && (
                  <p className="text-xs text-gray-500">
                    Posted at: {new Date(post.postedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <PostsContent />
    </Suspense>
  );
}
