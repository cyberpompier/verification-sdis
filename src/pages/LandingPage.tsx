import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function LandingPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (session) {
          navigate('/home');
        } else {
          navigate('/auth');
        }
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [navigate, session, loading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-pulse">
          Bienvenue
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Préparation de votre expérience...
        </p>
        <Loader2 className={cn('h-10 w-10 animate-spin text-white')} />
      </div>
    </div>
  );
}
