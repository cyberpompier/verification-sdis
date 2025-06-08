import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/auth');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-pulse">
            Chargement...
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Vérification de votre session...
          </p>
          <Loader2 className={cn('h-10 w-10 animate-spin text-white')} />
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Or a redirect component, but navigate handles it
  }

  return <>{children}</>;
}
