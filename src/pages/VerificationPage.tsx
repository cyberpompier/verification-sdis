import { MailCheck, Car, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Vehicle {
  id: string;
  name: string;
  lien: string | null;
  photo_url: string | null;
}

export function VerificationPage() {
  const { session, loading: authLoading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    let isMounted = true; // Drapeau pour suivre l'état de montage du composant

    const fetchVehicles = async () => {
      if (!isMounted) return; // Ne pas continuer si le composant est démonté
      setLoadingVehicles(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('id, name, lien, photo_url')
          .eq('user_id', session.user.id);

        if (!isMounted) return; // Vérifier à nouveau avant de définir l'état
        if (error) {
          throw error;
        }

        setVehicles(data || []);
      } catch (err: any) {
        if (!isMounted) return; // Vérifier à nouveau avant de définir l'état
        console.error('Erreur lors du chargement des véhicules:', err.message);
        setError('Échec du chargement des véhicules: ' + err.message);
      } finally {
        if (!isMounted) return; // Vérifier à nouveau avant de définir l'état
        setLoadingVehicles(false);
      }
    };

    // Déclenche la récupération des véhicules uniquement si l'authentification est terminée
    // et qu'une session utilisateur est présente.
    if (!authLoading) {
      if (session) {
        fetchVehicles();
      } else {
        // Si l'authentification est terminée mais qu'il n'y a pas de session
        if (isMounted) { // Mettre à jour l'état uniquement si le composant est monté
          setVehicles([]);
          setError('Vous devez être connecté pour voir les véhicules.');
          setLoadingVehicles(false);
        }
      }
    }

    return () => {
      isMounted = false; // Définir le drapeau sur false lors du démontage du composant
    };
  }, [session, authLoading]); // Déclenche l'effet lorsque la session ou l'état de chargement de l'authentification change

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-center relative mb-6"> {/* Added relative for positioning */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)} // Navigate back
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-3xl font-bold text-center">Vos Véhicules Enregistrés</h2>
        </div>
        {authLoading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Chargement de la session utilisateur...</p>
        ) : loadingVehicles ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Chargement des véhicules...</p>
        ) : error ? (
          <p className="text-center text-red-500 dark:text-red-400">{error}</p>
        ) : vehicles.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full text-center mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Aucun véhicule trouvé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">La liste de vos véhicules sera affichée ici.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TooltipProvider>
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-x-4 p-4 pb-2">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{vehicle.name}</CardTitle>
                    <Avatar className="h-24 w-24"> {/* Changed from h-12 w-12 to h-24 w-24 */}
                      {vehicle.photo_url ? (
                        <AvatarImage src={vehicle.photo_url} alt={`Photo de ${vehicle.name}`} />
                      ) : (
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          <Car className="h-12 w-12" /> {/* Adjusted icon size for larger avatar */}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {vehicle.lien ? (
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                            onClick={() => window.open(vehicle.lien!, '_blank')}
                          >
                            <ExternalLink className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{vehicle.lien}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Aucun lien fourni.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
