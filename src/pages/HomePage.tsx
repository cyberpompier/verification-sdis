import { Home, Settings, User, LogOut, Car, Hammer, Users, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

export default function HomePage() { // Changed to default export
  const { signOut, session } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getProfile() {
      if (session) {
        try {
          const { data, error, status } = await supabase
            .from('profiles')
            .select(`username`)
            .eq('id', session.user.id)
            .single();

          if (error && status !== 406) {
            throw error;
          }

          if (data) {
            setUsername(data.username);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    }

    getProfile();
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mon Application PWA
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => navigate('/home')}>
              <Home className="mr-2 h-4 w-4" /> Accueil
            </Button>
            
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => navigate('/settings/vehicles')}>
              <Car className="mr-2 h-4 w-4" /> Véhicules
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  <Settings className="mr-2 h-4 w-4" /> Paramètres
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => navigate('/settings/materials')}>
                  <Hammer className="mr-2 h-4 w-4" />
                  <span>Matériels</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/personnel')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Personnel</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres Généraux</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => navigate('/verification')}>
              <MailCheck className="mr-2 h-4 w-4" /> Vérification
            </Button>

            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              <User className="mr-2 h-4 w-4" /> {username || session?.user?.email || 'Profil'}
            </Button>
          </nav>
          <Button
            variant="outline"
            className="hidden md:flex text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </Button>
          {/* Mobile Menu Placeholder (e.g., using Sheet component) */}
          <div className="md:hidden">
            <Button variant="ghost">
              <Home className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Découvrez l'objectif de notre application
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Notre application PWA est conçue pour simplifier la gestion de vos tâches quotidiennes et améliorer votre productivité. Que vous soyez un professionnel occupé, un étudiant ou simplement quelqu'un qui cherche à mieux organiser sa vie, notre plateforme est là pour vous aider.
          </p>
        </section>

        <Separator className="my-12 bg-gray-300 dark:bg-gray-700" />

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">Organisation Intuitive</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Créez, modifiez et organisez vos tâches avec une facilité déconcertante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 dark:text-gray-200">
                Grâce à une interface utilisateur épurée et des fonctionnalités glisser-déposer, vous pouvez gérer vos listes de tâches, projets et rappels en quelques clics. Priorisez ce qui compte vraiment et suivez vos progrès en temps réel.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">Accès Hors Ligne</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Travaillez n'importe où, n'importe quand, même sans connexion internet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 dark:text-gray-200">
                En tant que PWA, notre application est entièrement fonctionnelle hors ligne. Vos données sont synchronisées dès que vous retrouvez une connexion, garantissant que vous ne manquiez jamais une mise à jour.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-purple-600 dark:text-purple-400">Sécurité des Données</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Vos informations sont protégées avec les meilleures pratiques de sécurité.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 dark:text-gray-200">
                Nous utilisons Supabase pour une gestion de base de données robuste et sécurisée. Vos données sont chiffrées et vos informations personnelles restent confidentielles, vous offrant une tranquillité d'esprit totale.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12 bg-gray-300 dark:bg-gray-700" />

        <section className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Prêt à commencer ?
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Rejoignez des milliers d'utilisateurs qui transforment leur façon de travailler et de vivre.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300">
            Commencer Gratuitement
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 text-center text-gray-600 dark:text-gray-400">
        <div className="container mx-auto px-4">
          <p>&copy; 2024 Mon Application PWA. Tous droits réservés.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Politique de Confidentialité</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Conditions d'Utilisation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
