'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setError('Failed to create account. Please try again.');
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
          <h1 className="mt-4 text-2xl font-medium text-neutral-900">Create Account</h1>
          <p className="mt-2 text-sm text-neutral-600">Start designing your habits</p>
        </div>

        {success && (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            Account created! Redirecting...
          </div>
        )}

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

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="border-neutral-300"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword}
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-neutral-900 hover:underline">
            Sign in
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
