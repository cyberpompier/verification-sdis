import { Users, ArrowLeft, PlusCircle, Edit, Trash2, Search } from 'lucide-react';
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

interface Personnel {
  id: string;
  created_at: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  contact_number: string;
  email: string;
  fire_station: string;
  status: string;
  notes?: string;
  photo_url?: string; // Nouvelle colonne pour l'URL de la photo
}

export function PersonnelPage() {
  const { session } = useAuth();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPersonnel, setNewPersonnel] = useState({
    first_name: '',
    last_name: '',
    role: '',
    contact_number: '',
    email: '',
    fire_station: '',
    status: 'Actif',
    notes: '',
    photo_url: '', // Initialisation du champ photo_url
  });
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPersonnel = async () => {
    if (!session) {
      setError('Vous devez être connecté pour voir le personnel.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPersonnel(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement du personnel:', err.message);
      setError('Échec du chargement du personnel: ' + err.message);
      toast({
        title: 'Erreur',
        description: `Échec du chargement du personnel: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewPersonnel((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (value: string, id: string) => {
    setNewPersonnel((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour ajouter un membre du personnel.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('personnel')
        .insert({
          ...newPersonnel,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setPersonnel((prev) => [data, ...prev]);
      setNewPersonnel({
        first_name: '',
        last_name: '',
        role: '',
        contact_number: '',
        email: '',
        fire_station: '',
        status: 'Actif',
        notes: '',
        photo_url: '',
      });
      setIsDialogOpen(false);
      toast({
        title: 'Succès',
        description: 'Membre du personnel ajouté avec succès !',
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du personnel:', err.message);
      toast({
        title: 'Erreur',
        description: `Échec de l'ajout du personnel: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  const filteredPersonnel = personnel.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.fire_station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.status.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion du Personnel
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Informations et suivi de votre équipe
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Gérez les profils de vos employés, leurs rôles et leurs coordonnées.
          </p>
        </section>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Rechercher un membre du personnel..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
                <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un nouveau membre du personnel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau membre du personnel</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour ajouter un nouveau membre à votre équipe.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPersonnel} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="first_name" className="text-right">
                    Prénom
                  </Label>
                  <Input
                    id="first_name"
                    value={newPersonnel.first_name}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="last_name" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="last_name"
                    value={newPersonnel.last_name}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rôle
                  </Label>
                  <Input
                    id="role"
                    value={newPersonnel.role}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact_number" className="text-right">
                    Téléphone
                  </Label>
                  <Input
                    id="contact_number"
                    value={newPersonnel.contact_number}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPersonnel.email}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fire_station" className="text-right">
                    Caserne
                  </Label>
                  <Input
                    id="fire_station"
                    value={newPersonnel.fire_station}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Statut
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange(value, 'status')} value={newPersonnel.status}>
                    <SelectTrigger id="status" className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="En congé">En congé</SelectItem>
                      <SelectItem value="Retraité">Retraité</SelectItem>
                      <SelectItem value="En formation">En formation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="photo_url" className="text-right">
                    URL Photo
                  </Label>
                  <Input
                    id="photo_url"
                    value={newPersonnel.photo_url}
                    onChange={handleInputChange}
                    className="col-span-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    placeholder="Ex: https://example.com/profile.jpg"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={newPersonnel.notes}
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
              Chargement du personnel...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Aucun membre du personnel trouvé. Ajoutez-en un pour commencer !
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-700">
                  <TableHead className="w-[80px] text-gray-700 dark:text-gray-300">Photo</TableHead> {/* Nouvelle colonne */}
                  <TableHead className="w-[150px] text-gray-700 dark:text-gray-300">Prénom</TableHead>
                  <TableHead className="w-[150px] text-gray-700 dark:text-gray-300">Nom</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Rôle</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Téléphone</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Caserne</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Statut</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersonnel.map((member) => (
                  <TableRow key={member.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell>
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-12 h-12 object-cover rounded-full shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/48?text=👤'; // Fallback image
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                          👤
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{member.first_name}</TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{member.last_name}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{member.role}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{member.contact_number}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{member.email}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{member.fire_station}</TableCell>
                    <TableCell className="text-gray-800 dark:text-gray-200">{member.status}</TableCell>
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
