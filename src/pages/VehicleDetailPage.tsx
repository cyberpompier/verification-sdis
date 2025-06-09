import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle, XCircle, Car, Package, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Vehicle {
  id: string;
  name: string;
  type: string;
  fire_station: string;
  plate_number: string;
  capacity: number;
  equipment_list: string | null;
  status: string;
  photo_url: string | null;
  lien: string | null;
  created_at: string;
  verifier_id?: string | null; // Changed from last_verified_by
  last_verified_at?: string | null;
  verification_status?: string | null;
}

interface Material {
  id: string;
  name: string;
  type: string;
  quantity: number;
  location: string;
  status: string;
  is_verified: boolean;
  photo_url: string | null;
}

export function VehicleDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      if (!session || !vehicleId) {
        if (isMounted) {
          setError('Session utilisateur non trouvée ou ID de véhicule manquant.');
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch vehicle details
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .eq('user_id', session.user.id)
          .single();

        if (!isMounted) return;
        if (vehicleError) {
          throw vehicleError;
        }
        setVehicle(vehicleData);

        // Fetch materials associated with this vehicle
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .eq('user_id', session.user.id)
          .order('name', { ascending: true });

        if (!isMounted) return;
        if (materialsError) {
          throw materialsError;
        }
        setMaterials(materialsData || []);

      } catch (err: any) {
        if (!isMounted) return;
        console.error('Erreur lors du chargement des détails du véhicule ou du matériel:', err.message);
        setError('Échec du chargement: ' + err.message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [vehicleId, session, authLoading]);

  const handleToggleVerification = async (materialId: string, currentStatus: boolean) => {
    if (!session) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour modifier le statut.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('materials')
        .update({ is_verified: !currentStatus })
        .eq('id', materialId)
        .eq('user_id', session.user.id); // Ensure user can only update their own materials

      if (error) {
        throw error;
      }

      setMaterials((prevMaterials) =>
        prevMaterials.map((mat) =>
          mat.id === materialId ? { ...mat, is_verified: !currentStatus } : mat
        )
      );
      toast({
        title: 'Succès',
        description: `Statut de vérification mis à jour pour ${materials.find(m => m.id === materialId)?.name}.`,
      });
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut de vérification:', err.message);
      toast({
        title: 'Erreur',
        description: `Échec de la mise à jour du statut: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleControlAction = (materialId: string) => {
    toast({
      title: 'Action de contrôle',
      description: `Exécuter une action de contrôle pour le matériel ID: ${materialId}. (Fonctionnalité à implémenter)`,
    });
    // Future: Implement specific control actions (e.g., open a modal for details, log an issue)
  };

  const handleValidateAndGoBack = async () => {
    if (!session || !vehicleId) {
      toast({
        title: 'Erreur',
        description: 'Session utilisateur non trouvée ou ID de véhicule manquant pour la validation.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const verifiedCount = materials.filter(mat => mat.is_verified).length;
      const totalMaterials = materials.length;
      let status: string;

      if (totalMaterials === 0) {
        status = 'Non applicable'; // Or 'Non vérifié' if you prefer
      } else if (verifiedCount === totalMaterials) {
        status = 'OK';
      } else {
        status = 'Anomalie';
      }

      const { error: updateError } = await supabase
        .from('vehicles')
        .update({
          verifier_id: session.user.id, // Changed from last_verified_by
          last_verified_at: new Date().toISOString(),
          verification_status: status,
        })
        .eq('id', vehicleId)
        .eq('user_id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Validation',
        description: `Vérifications terminées. Statut: ${status}. Retour à la page précédente.`,
      });
      navigate(-1); // Go back to the previous page (VerificationPage)
    } catch (err: any) {
      console.error('Erreur lors de la validation du véhicule:', err.message);
      toast({
        title: 'Erreur',
        description: `Échec de la validation: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const verifiedCount = materials.filter(mat => mat.is_verified).length;
  const totalMaterials = materials.length;
  const progressPercentage = totalMaterials > 0 ? (verifiedCount / totalMaterials) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
        <p className="text-center text-gray-600 dark:text-gray-400">Chargement des détails du véhicule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
        <Button onClick={() => navigate(-1)} className="ml-4">Retour</Button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
        <p className="text-center text-gray-600 dark:text-gray-400">Véhicule non trouvé.</p>
        <Button onClick={() => navigate(-1)} className="ml-4">Retour</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/verification">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Détails du Véhicule
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 flex-shrink-0">
              {vehicle.photo_url ? (
                <AvatarImage src={vehicle.photo_url} alt={`Photo de ${vehicle.name}`} />
              ) : (
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-4xl">
                  <Car className="h-20 w-20" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-grow text-center md:text-left">
              <CardTitle className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{vehicle.name}</CardTitle>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                <span className="font-semibold">Type:</span> {vehicle.type}
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                <span className="font-semibold">Caserne:</span> {vehicle.fire_station}
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                <span className="font-semibold">Plaque:</span> {vehicle.plate_number}
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                <span className="font-semibold">Capacité:</span> {vehicle.capacity} personnes
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                <span className="font-semibold">Statut:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                  vehicle.status === 'Opérationnel' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  vehicle.status === 'En maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {vehicle.status}
                </span>
              </p>
              {vehicle.lien && (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border-blue-300 dark:border-blue-600"
                        onClick={() => window.open(vehicle.lien!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" /> Voir le lien
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{vehicle.lien}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Progression de la vérification du matériel
          </h2>
          <div className="flex items-center gap-4">
            <Progress value={progressPercentage} className="w-full h-3 bg-gray-200 dark:bg-gray-700" />
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {verifiedCount}/{totalMaterials} ({progressPercentage.toFixed(0)}%)
            </span>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Matériel affecté
          </h2>
          {materials.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Aucun matériel affecté</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Ce véhicule n'a pas encore de matériel associé.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-700">
                      <TableHead className="w-[80px] text-gray-700 dark:text-gray-300">Photo</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Nom</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Type</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300">Quantité</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Statut</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300">Vérifié</TableHead>
                      <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell>
                          {material.photo_url ? (
                            <img
                              src={material.photo_url}
                              alt={material.name}
                              className="w-12 h-12 object-cover rounded-md shadow-sm"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image'; // Fallback image
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                              N/A
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{material.name}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">{material.type}</TableCell>
                        <TableCell className="text-center text-gray-800 dark:text-gray-200">{material.quantity}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            material.status === 'Disponible' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            material.status === 'En réparation' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {material.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {material.is_verified ? (
                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex space-x-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleVerification(material.id, material.is_verified)}
                              className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
                            >
                              {material.is_verified ? 'Dé-vérifier' : 'Vérifier'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleControlAction(material.id)}
                              className="text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900"
                            >
                              Contrôler
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleValidateAndGoBack}
            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 px-8 py-3 text-lg"
            disabled={isSaving}
          >
            {isSaving ? 'Validation en cours...' : 'Valider et revenir'}
          </Button>
        </div>
      </main>

      <footer className="w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 text-center text-gray-600 dark:text-gray-400">
        <div className="container mx-auto px-4">
          <p>&copy; 2024 Mon Application PWA. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
