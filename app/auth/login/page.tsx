'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <span className="text-lg font-bold">H</span>
          </div>
          <h1 className="mt-4 text-2xl font-medium text-neutral-900">Sign In</h1>
          <p className="mt-2 text-sm text-neutral-600">Continue to Habit System Designer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border-neutral-300"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-neutral-300"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-neutral-900 hover:underline">
            Sign up
          </Link>
        </div>

        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="w-full border-neutral-300"
        >
          Continue as Guest
        </Button>
      </div>
    </div>
  );
}
