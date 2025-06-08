import { Car, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  photo: string | null;
  lien: string | null;
  created_at: string;
}

export function VehiclesPage() {
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [fireStation, setFireStation] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [equipmentList, setEquipmentList] = useState('');
  const [status, setStatus] = useState('Opérationnel');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photo, setPhoto] = useState('');
  const [lien, setLien] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch vehicles on component mount or session change
  useEffect(() => {
    let isMounted = true;

    const fetchVehicles = async () => {
      if (!isMounted) return;
      setLoadingVehicles(true);
      setFetchError(null);

      if (!session) {
        if (isMounted) {
          setVehicles([]);
          setFetchError('Vous devez être connecté pour voir les véhicules.');
          setLoadingVehicles(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!isMounted) return;
        if (error) {
          throw error;
        }

        setVehicles(data || []);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Erreur lors du chargement des véhicules:', err.message);
        setFetchError('Échec du chargement des véhicules: ' + err.message);
      } finally {
        if (!isMounted) return;
        setLoadingVehicles(false);
      }
    };

    if (!authLoading) {
      fetchVehicles();
    }

    return () => {
      isMounted = false;
    };
  }, [session, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!session) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour ajouter un véhicule.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    if (!vehicleName || !vehicleType || !fireStation || !plateNumber) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires (Nom, Type, Caserne, Plaque).',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([
          {
            user_id: session.user.id,
            name: vehicleName,
            type: vehicleType,
            fire_station: fireStation,
            plate_number: plateNumber,
            capacity: capacity === '' ? 0 : capacity,
            equipment_list: equipmentList,
            status: status,
            photo_url: photoUrl,
            photo: photo,
            lien: lien,
          },
        ])
        .select();

      if (error) {
        if (error.code === '23505') { // Unique violation error code
          toast({
            title: 'Erreur',
            description: 'Un véhicule avec cette plaque d\'immatriculation existe déjà.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Succès',
          description: 'Véhicule ajouté avec succès !',
        });
        // Add the new vehicle to the local state to update the list immediately
        if (data && data.length > 0) {
          setVehicles((prev) => [data[0] as Vehicle, ...prev]);
        }
        // Clear form
        setVehicleName('');
        setVehicleType('');
        setFireStation('');
        setPlateNumber('');
        setCapacity('');
        setEquipmentList('');
        setStatus('Opérationnel');
        setPhotoUrl('');
        setPhoto('');
        setLien('');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du véhicule:', error.message);
      toast({
        title: 'Erreur',
        description: `Échec de l'ajout du véhicule: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vehicleId: string) => {
    toast({
      title: 'Fonctionnalité à venir',
      description: `Modifier le véhicule avec l'ID: ${vehicleId}`,
    });
    // Implémenter la logique de modification ici
  };

  const handleDelete = async (vehicleId: string) => {
    if (!session) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour supprimer un véhicule.',
        variant: 'destructive',
      });
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicleId)
          .eq('user_id', session.user.id); // Ensure user can only delete their own vehicles

        if (error) {
          throw error;
        }

        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        toast({
          title: 'Succès',
          description: 'Véhicule supprimé avec succès !',
        });
      } catch (error: any) {
        console.error('Erreur lors de la suppression du véhicule:', error.message);
        toast({
          title: 'Erreur',
          description: `Échec de la suppression du véhicule: ${error.message}`,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/home">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Véhicules
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Liste et gestion de vos véhicules
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Ici, vous pouvez ajouter, modifier ou supprimer les informations relatives à vos véhicules de sapeur-pompier.
          </p>
        </section>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Ajouter un nouveau véhicule</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="vehicleName" className="text-gray-700 dark:text-gray-300">Nom du véhicule</Label>
              <Input
                id="vehicleName"
                type="text"
                placeholder="Ex: FPTL 1"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="vehicleType" className="text-gray-700 dark:text-gray-300">Type de véhicule</Label>
              <Input
                id="vehicleType"
                type="text"
                placeholder="Ex: Fourgon Pompe Tonne Léger"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="fireStation" className="text-gray-700 dark:text-gray-300">Caserne d'affectation</Label>
              <Input
                id="fireStation"
                type="text"
                placeholder="Ex: Caserne de Paris"
                value={fireStation}
                onChange={(e) => setFireStation(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="plateNumber" className="text-gray-700 dark:text-gray-300">Plaque d'immatriculation</Label>
              <Input
                id="plateNumber"
                type="text"
                placeholder="Ex: AB-123-CD"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="capacity" className="text-gray-700 dark:text-gray-300">Capacité (personnel)</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Ex: 6"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="mt-1"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Statut</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Opérationnel">Opérationnel</SelectItem>
                  <SelectItem value="En maintenance">En maintenance</SelectItem>
                  <SelectItem value="Hors service">Hors service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="photoUrl" className="text-gray-700 dark:text-gray-300">URL de la photo (optionnel)</Label>
              <Input
                id="photoUrl"
                type="url"
                placeholder="Ex: https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="photo" className="text-gray-700 dark:text-gray-300">Photo (optionnel)</Label>
              <Input
                id="photo"
                type="text"
                placeholder="Ex: base64 ou nom de fichier"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="lien" className="text-gray-700 dark:text-gray-300">Lien (optionnel)</Label>
              <Input
                id="lien"
                type="url"
                placeholder="Ex: https://wikipedia.org/wiki/FPTL"
                value={lien}
                onChange={(e) => setLien(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="equipmentList" className="text-gray-700 dark:text-gray-300">Liste d'équipement (optionnel)</Label>
              <Textarea
                id="equipmentList"
                placeholder="Ex: Pompe 2000L/min, Défibrillateur, Lot de sauvetage..."
                value={equipmentList}
                onChange={(e) => setEquipmentList(e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter le véhicule'}
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Véhicules existants</h3>
          {authLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Chargement de la session utilisateur...</p>
          ) : loadingVehicles ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Chargement des véhicules...</p>
          ) : fetchError ? (
            <p className="text-center text-red-500 dark:text-red-400">{fetchError}</p>
          ) : vehicles.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full text-center mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Aucun véhicule trouvé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Vous n'avez pas encore ajouté de véhicules. Utilisez le formulaire ci-dessus pour en ajouter un.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Caserne</TableHead>
                    <TableHead>Plaque</TableHead>
                    <TableHead className="text-center">Capacité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.name}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.fire_station}</TableCell>
                      <TableCell>{vehicle.plate_number}</TableCell>
                      <TableCell className="text-center">{vehicle.capacity}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          vehicle.status === 'Opérationnel' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          vehicle.status === 'En maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {vehicle.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(vehicle.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
