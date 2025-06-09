import { Car, ArrowLeft, Edit, Trash2, PlusCircle, Search } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false); // New state for dialog

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
        setIsDialogOpen(false); // Close dialog on success
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

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.fire_station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <section className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Liste et gestion de vos véhicules
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Ici, vous pouvez ajouter, modifier ou supprimer les informations relatives à vos véhicules de sapeur-pompier.
          </p>
        </section>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Rechercher un véhicule..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
                <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un nouveau véhicule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau véhicule</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour ajouter un nouveau véhicule à votre inventaire.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vehicleName" className="text-right">Nom</Label>
                  <Input
                    id="vehicleName"
                    type="text"
                    placeholder="Ex: FPTL 1"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vehicleType" className="text-right">Type</Label>
                  <Input
                    id="vehicleType"
                    type="text"
                    placeholder="Ex: Fourgon Pompe Tonne Léger"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fireStation" className="text-right">Caserne</Label>
                  <Input
                    id="fireStation"
                    type="text"
                    placeholder="Ex: Caserne de Paris"
                    value={fireStation}
                    onChange={(e) => setFireStation(e.target.value)}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plateNumber" className="text-right">Plaque</Label>
                  <Input
                    id="plateNumber"
                    type="text"
                    placeholder="Ex: AB-123-CD"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">Capacité</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Ex: 6"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    min="0"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Statut</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectItem value="Opérationnel">Opérationnel</SelectItem>
                      <SelectItem value="En maintenance">En maintenance</SelectItem>
                      <SelectItem value="Hors service">Hors service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="photoUrl" className="text-right">URL Photo</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    placeholder="Ex: https://example.com/photo.jpg"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="photo" className="text-right">Photo (Base64)</Label>
                  <Input
                    id="photo"
                    type="text"
                    placeholder="Ex: base64 ou nom de fichier"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lien" className="text-right">Lien</Label>
                  <Input
                    id="lien"
                    type="url"
                    placeholder="Ex: https://wikipedia.org/wiki/FPTL"
                    value={lien}
                    onChange={(e) => setLien(e.target.value)}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="equipmentList" className="text-right">Équipement</Label>
                  <Textarea
                    id="equipmentList"
                    placeholder="Ex: Pompe 2000L/min, Défibrillateur, Lot de sauvetage..."
                    value={equipmentList}
                    onChange={(e) => setEquipmentList(e.target.value)}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 min-h-[80px]"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter le véhicule'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          {authLoading ? (
            <p className="p-8 text-center text-gray-600 dark:text-gray-400">Chargement de la session utilisateur...</p>
          ) : loadingVehicles ? (
            <p className="p-8 text-center text-gray-600 dark:text-gray-400">Chargement des véhicules...</p>
          ) : fetchError ? (
            <p className="p-8 text-center text-red-500 dark:text-red-400">{fetchError}</p>
          ) : filteredVehicles.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full text-center mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Aucun véhicule trouvé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Vous n'avez pas encore ajouté de véhicules. Utilisez le bouton "Ajouter un nouveau véhicule" ci-dessus pour en ajouter un.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-700">
                    <TableHead className="w-[80px] text-gray-700 dark:text-gray-300">Photo</TableHead>
                    <TableHead className="w-[150px] text-gray-700 dark:text-gray-300">Nom</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Caserne</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Plaque</TableHead>
                    <TableHead className="text-center text-gray-700 dark:text-gray-300">Capacité</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Statut</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <TableCell>
                        {vehicle.photo_url ? (
                          <img
                            src={vehicle.photo_url}
                            alt={vehicle.name}
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
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{vehicle.name}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">{vehicle.type}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">{vehicle.fire_station}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">{vehicle.plate_number}</TableCell>
                      <TableCell className="text-center text-gray-800 dark:text-gray-200">{vehicle.capacity}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          vehicle.status === 'Opérationnel' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          vehicle.status === 'En maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {vehicle.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(vehicle.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
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
