import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Car, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Vehicle {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  type: string;
  fire_station: string;
  plate_number: string | null;
  capacity: number | null;
  equipment_list: string | null;
  status: string | null;
  photo_url: string | null;
  lien: string | null;
  last_verified_at: string | null;
  verification_status: string | null;
  verifier_id: string | null; // Ensure this is present and not last_verified_by
}

export function VehiclesPage() {
  const { session, loading: authLoading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: '',
    fire_station: '',
    plate_number: '',
    capacity: '',
    equipment_list: '',
    status: '',
    photo_url: '',
    lien: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchVehicles = async () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setVehicles([]);
          setLoading(false);
          setError('Vous devez être connecté pour voir les véhicules.');
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*') // Select all columns, including the new verifier_id
          .eq('user_id', session.user.id);

        if (!isMounted) return;

        if (error) {
          throw error;
        }
        setVehicles(data || []);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Erreur lors du chargement des véhicules:', err.message);
        setError('Échec du chargement des véhicules: ' + err.message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchVehicles();
    }

    return () => {
      isMounted = false;
    };
  }, [session, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour ajouter un véhicule.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          user_id: session.user.id,
          name: newVehicle.name,
          type: newVehicle.type,
          fire_station: newVehicle.fire_station,
          plate_number: newVehicle.plate_number || null,
          capacity: newVehicle.capacity ? parseInt(newVehicle.capacity) : null,
          equipment_list: newVehicle.equipment_list || null,
          status: newVehicle.status || null,
          photo_url: newVehicle.photo_url || null,
          lien: newVehicle.lien || null,
          // last_verified_by and verifier_id are not set here, they are set during verification
        })
        .select();

      if (error) {
        throw error;
      }

      setVehicles((prev) => [...prev, data[0]]);
      setNewVehicle({
        name: '',
        type: '',
        fire_station: '',
        plate_number: '',
        capacity: '',
        equipment_list: '',
        status: '',
        photo_url: '',
        lien: '',
      });
      setIsDialogOpen(false);
      toast({
        title: 'Succès',
        description: 'Véhicule ajouté avec succès.',
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du véhicule:', err.message);
      setError('Échec de l\'ajout du véhicule: ' + err.message);
      toast({
        title: 'Erreur',
        description: 'Échec de l\'ajout du véhicule: ' + err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-center relative mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-3xl font-bold text-center">Gestion des Véhicules</h2>
        </div>

        <div className="flex justify-end mb-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un véhicule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau véhicule</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour ajouter un véhicule.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddVehicle} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nom
                  </Label>
                  <Input id="name" value={newVehicle.name} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Input id="type" value={newVehicle.type} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fire_station" className="text-right">
                    Caserne
                  </Label>
                  <Input id="fire_station" value={newVehicle.fire_station} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plate_number" className="text-right">
                    Plaque
                  </Label>
                  <Input id="plate_number" value={newVehicle.plate_number} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">
                    Capacité
                  </Label>
                  <Input id="capacity" type="number" value={newVehicle.capacity} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="equipment_list" className="text-right">
                    Équipement
                  </Label>
                  <Textarea id="equipment_list" value={newVehicle.equipment_list} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Statut
                  </Label>
                  <Input id="status" value={newVehicle.status} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="photo_url" className="text-right">
                    URL Photo
                  </Label>
                  <Input id="photo_url" value={newVehicle.photo_url} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lien" className="text-right">
                    Lien
                  </Label>
                  <Input id="lien" value={newVehicle.lien} onChange={handleInputChange} className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                    {loading ? 'Ajout en cours...' : 'Ajouter'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Chargement des véhicules...</p>
        ) : error ? (
          <p className="text-center text-red-500 dark:text-red-400">{error}</p>
        ) : vehicles.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 p-8 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md">
            <Car className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-lg font-semibold">Aucun véhicule enregistré.</p>
            <p className="text-sm">Cliquez sur "Ajouter un véhicule" pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-700">
                  <TableHead className="w-[150px] text-gray-700 dark:text-gray-300">Nom</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Caserne</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Plaque</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Statut</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{vehicle.name}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{vehicle.type}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{vehicle.fire_station}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{vehicle.plate_number || 'N/A'}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{vehicle.status || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
