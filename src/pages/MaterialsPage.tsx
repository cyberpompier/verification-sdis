import { Hammer, ArrowLeft, PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Material {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  type: string;
  quantity: number;
  location: string;
  status: string;
  last_checked: string;
  description: string;
  photo_url?: string; // Nouvelle colonne pour l'URL de la photo
}

export function MaterialsPage() {
  const { session } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    type: '',
    quantity: 1,
    location: '',
    status: 'Disponible',
    description: '',
    photo_url: '', // Initialisation du champ photo_url
  });
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMaterials = async () => {
    if (!session) {
      setError('Vous devez être connecté pour voir les matériels.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des matériels:', err.message);
      setError('Échec du chargement des matériels: ' + err.message);
      toast({
        title: 'Erreur',
        description: `Échec du chargement des matériels: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewMaterial((prev) => ({
      ...prev,
      [id]: id === 'quantity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (value: string, id: string) => {
    setNewMaterial((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour ajouter un matériel.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('materials')
        .insert({
          ...newMaterial,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setMaterials((prev) => [data, ...prev]);
      setNewMaterial({
        name: '',
        type: '',
        quantity: 1,
        location: '',
        status: 'Disponible',
        description: '',
        photo_url: '',
      });
      setIsDialogOpen(false);
      toast({
        title: 'Succès',
        description: 'Matériel ajouté avec succès !',
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du matériel:', err.message);
      toast({
        title: 'Erreur',
        description: `Échec de l'ajout du matériel: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.status.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Hammer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Matériels
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Inventaire et suivi de vos matériels
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Gérez l'ensemble de vos équipements, outils et autres matériels.
          </p>
        </section>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Rechercher un matériel..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
                <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un nouveau matériel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau matériel</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour ajouter un nouveau matériel à votre inventaire.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMaterial} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="name"
                    value={newMaterial.name}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Input
                    id="type"
                    value={newMaterial.type}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantité
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newMaterial.quantity}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    min="1"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Emplacement
                  </Label>
                  <Input
                    id="location"
                    value={newMaterial.location}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Statut
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange(value, 'status')} value={newMaterial.status}>
                    <SelectTrigger id="status" className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="En réparation">En réparation</SelectItem>
                      <SelectItem value="Hors service">Hors service</SelectItem>
                      <SelectItem value="Perdu">Perdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="photo_url" className="text-right">
                    URL Photo
                  </Label>
                  <Input
                    id="photo_url"
                    value={newMaterial.photo_url}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    placeholder="Ex: https://example.com/image.jpg"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newMaterial.description}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
                    Ajouter
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Chargement des matériels...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Aucun matériel trouvé. Ajoutez-en un pour commencer !
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-700">
                  <TableHead className="w-[80px] text-gray-700 dark:text-gray-300">Photo</TableHead> {/* Nouvelle colonne */}
                  <TableHead className="w-[150px] text-gray-700 dark:text-gray-300">Nom</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Quantité</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Emplacement</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Statut</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Dernière vérif.</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
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
                    <TableCell className="text-gray-800 dark:text-gray-200">{material.quantity}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{material.location}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{material.status}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">
                      {new Date(material.last_checked).toLocaleDateString()}
                    </TableCell>
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
