import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Ajout de l'état de chargement

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false); // La session initiale est chargée
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false); // L'état de la session a changé, donc le chargement est terminé
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading }; // Retourne l'état de chargement
}
