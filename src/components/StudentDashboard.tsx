import { useState } from 'react';
import { 
  Utensils, LogOut, Home, ShoppingCart, History, 
  Award, MessageSquare, Plus, Minus, Trash2, Star,
  Check, Clock, X, User
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageWithFallback } from './ImgFallback/ImageWithFallback';


interface StudentDashboardProps {
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const menuItems = [
  {
    id: 1,
    name: 'Poulet Yassa',
    price: 1500,
    category: 'Plats',
    image: 'https://i.pinimg.com/1200x/e9/84/a9/e984a924010b724ccd3e03373edb1c52.jpg',
    available: true
  },
  {
    id: 2,
    name: 'Poisson Braisé',
    price: 1500,
    category: 'Plats',
    image: 'https://i.pinimg.com/736x/8d/4a/fc/8d4afc3c36d918b914a2730e7c3691dd.jpg',
    available: true
  },
  {
    id: 3,
    name: 'Macaroni',
    price: 1000,
    category: 'Plats',
    image: 'https://i.pinimg.com/1200x/7a/d1/d2/7ad1d28c836140682bb005040aaafe02.jpg',
    available: true
  },
  {
    id: 4,
    name: 'Bolognaise',
    price: 1000,
    category: 'Plats',
    image: 'https://i.pinimg.com/1200x/60/28/e5/6028e5a0316ee9006e8caaccd58b83f5.jpg',
    available: true
  },
  {
    id: 5,
    name: 'Jus de Bissap',
    price: 500,
    category: 'Boissons',
    image: 'https://i.pinimg.com/1200x/16/cb/6c/16cb6c4b4d6d908daae2702b93b7ca9d.jpg',
    available: true
  },
  {
    id: 6,
    name: 'Okok',
    price: 1000,
    category: 'Plats',
    image: 'https://i.pinimg.com/736x/4f/57/17/4f57178313dc91862672ca85572284df.jpg',
    available: true
  }
];

const orderHistory = [
  {
    id: '1234',
    date: '2025-10-06',
    time: '12:30',
    items: ['Poulet Yassa', 'Jus de Bissap'],
    total: 12.00,
    status: 'delivered',
    points: 12
  },
  {
    id: '1233',
    date: '2025-10-05',
    time: '13:15',
    items: ['Poisson Braisé', 'Alloco'],
    total: 14.50,
    status: 'delivered',
    points: 15
  },
  {
    id: '1232',
    date: '2025-10-04',
    time: '12:00',
    items: ['Macaroni', 'Jus'],
    total: 12.30,
    status: 'delivered',
    points: 12
  }
];

export function StudentDashboard({ onLogout, onNavigate }: StudentDashboardProps) {
  const [cart, setCart] = useState<Array<{id: number, name: string, price: number, quantity: number}>>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loyaltyPoints, setLoyaltyPoints] = useState(145);
  const [complaint, setComplaint] = useState('');

  const addToCart = (item: typeof menuItems[0]) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[#cfbd97] text-xl">Mon Miam Miam</h1>
                <p className="text-xs text-[#5E4B3C]">Espace Étudiant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate('home')}
                className="text-[#5E4B3C] hover:text-[#000000] hover:bg-[#EFD9A7]/30"
              >
                <Home className="w-5 h-5 mr-2" />
                Accueil
              </Button>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-[#cfbd97] hover:bg-[#cfbd97]/10"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Déconnexion
              </Button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white p-2 rounded-2xl shadow-md border-0">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-[#cfbd97] data-[state=active]:text-white">
              <Home className="w-4 h-4 mr-2" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="menu" className="rounded-xl data-[state=active]:bg-[#cfbd97] data-[state=active]:text-white">
              <Utensils className="w-4 h-4 mr-2" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="cart" className="rounded-xl data-[state=active]:bg-[#cfbd97] data-[state=active]:text-white relative">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Panier
              {cartCount > 0 && (
                <Badge className="ml-2 bg-[#cfbd97] text-white border-0">{cartCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-[#cfbd97] data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="rounded-xl data-[state=active]:bg-[#cfbd97] data-[state=active]:text-white">
              <Award className="w-4 h-4 mr-2" />
              Fidélité
            </TabsTrigger>
            <TabsTrigger value="complaints" className="rounded-xl data-[state=active]:bg-[#cfbd97] data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Réclamations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-8 bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] text-white border-0 rounded-3xl shadow-xl">
                <Award className="w-12 h-12 mb-4" />
                <h3 className="text-white mb-2">Points Fidélité</h3>
                <p className="text-4xl mb-2">{loyaltyPoints}</p>
                <p className="text-white/80 text-sm">Plus que {100 - (loyaltyPoints % 100)} pts pour un repas gratuit</p>
              </Card>
              
              <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
                <History className="w-12 h-12 mb-4 text-[#8A9A5B]" />
                <h3 className="text-[#000000] mb-2">Commandes</h3>
                <p className="text-4xl text-[#000000] mb-2">{orderHistory.length}</p>
                <p className="text-[#5E4B3C] text-sm">Total ce mois-ci</p>
              </Card>
              
              <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
                <ShoppingCart className="w-12 h-12 mb-4 text-[#cfbd97]" />
                <h3 className="text-[#000000] mb-2">Panier Actuel</h3>
                <p className="text-4xl text-[#000000] mb-2">{cartCount}</p>
                <p className="text-[#5E4B3C] text-sm">{cartTotal.toFixed(2)}FCFA</p>
              </Card>
            </div>

            <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
              <h3 className="text-[#000000] mb-6">Dernières Commandes</h3>
              <div className="space-y-4">
                {orderHistory.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-[#FAF3E0] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#8A9A5B] flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-[#000000]">Commande #{order.id}</p>
                        <p className="text-sm text-[#5E4B3C]">{order.date} à {order.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#cfbd97]">{order.total.toFixed(2)}FCFA</p>
                      <p className="text-sm text-[#8A9A5B]">+{order.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div>
              <h2 className="text-3xl text-[#000000] mb-2">Menu du Jour</h2>
              <p className="text-[#5E4B3C]">Découvre nos plats traditionnels préparés avec amour</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className={`overflow-hidden border-0 rounded-3xl shadow-lg ${!item.available ? 'opacity-60' : ''}`}>
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge className="bg-[#cfbd97] text-white border-0">Indisponible</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-white">
                    <Badge className="mb-3 bg-[#EFD9A7] text-[#5E4B3C] border-0">{item.category}</Badge>
                    <h4 className="text-[#000000] mb-2">{item.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl text-[#cfbd97]">{item.price.toFixed(2)}FCFA</span>
                      <Button
                        onClick={() => addToCart(item)}
                        disabled={!item.available}
                        className="bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart" className="space-y-6">
            <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
              <h2 className="text-3xl text-[#000000] mb-6">Mon Panier</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-[#EFD9A7]" />
                  <p className="text-[#5E4B3C] mb-6">Ton panier est vide</p>
                  <Button 
                    onClick={() => setActiveTab('menu')}
                    className="bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl"
                  >
                    Voir le menu
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-6 bg-[#FAF3E0] rounded-2xl">
                      <div className="flex-1">
                        <h4 className="text-[#000000] mb-1">{item.name}</h4>
                        <p className="text-[#cfbd97]">{item.price.toFixed(2)}FCFA</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white rounded-2xl p-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-8 w-8 p-0 rounded-xl hover:bg-[#EFD9A7]"
                          >
                            <Minus className="w-4 h-4 text-[#5E4B3C]" />
                          </Button>
                          <span className="w-8 text-center text-[#000000]">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-8 w-8 p-0 rounded-xl hover:bg-[#EFD9A7]"
                          >
                            <Plus className="w-4 h-4 text-[#5E4B3C]" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0 text-[#cfbd97] hover:bg-[#cfbd97]/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t-2 border-[#EFD9A7] pt-6 space-y-4">
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-[#000000]">Total</span>
                      <span className="text-2xl text-[#cfbd97]">{cartTotal.toFixed(2)}FCFA</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#5E4B3C]">Points à gagner</span>
                      <span className="text-[#8A9A5B]">+{Math.floor(cartTotal)} pts</span>
                    </div>
                    <Button 
                      className="w-full h-14 bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl text-lg shadow-lg"
                      onClick={() => {
                        setLoyaltyPoints(loyaltyPoints + Math.floor(cartTotal));
                        setCart([]);
                        setActiveTab('overview');
                      }}
                    >
                      Valider ma commande
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
              <h2 className="text-3xl text-[#000000] mb-6">Historique des Commandes</h2>
              
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div key={order.id} className="p-6 bg-[#FAF3E0] rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-[#000000] mb-1">Commande #{order.id}</h4>
                        <p className="text-sm text-[#5E4B3C]">{order.date} à {order.time}</p>
                      </div>
                      <Badge className="bg-[#8A9A5B] text-white border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Livrée
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-[#5E4B3C]">• {item}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-white">
                      <span className="text-[#cfbd97]">{order.total.toFixed(2)}FCFA</span>
                      <span className="text-[#8A9A5B]">+{order.points} points</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty" className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] text-white border-0 rounded-3xl shadow-xl">
              <div className="text-center">
                <Award className="w-20 h-20 mx-auto mb-6" />
                <h2 className="text-white text-4xl mb-4">{loyaltyPoints} Points</h2>
                <p className="text-white/90 text-lg mb-8">
                  Plus que {100 - (loyaltyPoints % 100)} points pour ton prochain repas gratuit !
                </p>
                <Progress value={(loyaltyPoints % 100)} className="h-4 bg-white/20" />
              </div>
            </Card>

            <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
              <h3 className="text-[#000000] mb-6">Comment ça marche ?</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#cfbd97] flex items-center justify-center flex-shrink-0">
                    <span className="text-white">1</span>
                  </div>
                  <div>
                    <h4 className="text-[#000000] mb-1">Commande et gagne</h4>
                    <p className="text-[#5E4B3C]">1000FCFA dépensé = 1 point gagné</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#cfbd97] flex items-center justify-center flex-shrink-0">
                    <span className="text-white">2</span>
                  </div>
                  <div>
                    <h4 className="text-[#000000] mb-1">Accumule tes points</h4>
                    <p className="text-[#5E4B3C]">Plus tu commandes, plus tu gagnes</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8A9A5B] flex items-center justify-center flex-shrink-0">
                    <span className="text-white">3</span>
                  </div>
                  <div>
                    <h4 className="text-[#000000] mb-1">Échange tes points</h4>
                    <p className="text-[#5E4B3C]">15 points = 1 repas gratuit</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
              <h2 className="text-3xl text-[#000000] mb-6">Soumettre une Réclamation</h2>
              
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                setComplaint('');
                alert('Réclamation soumise avec succès !');
              }}>
                <div className="space-y-3">
                  <Label htmlFor="complaint" className="text-[#000000]">Décris ton problème</Label>
                  <Textarea
                    id="complaint"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Explique-nous ce qui s'est passé..."
                    className="min-h-32 rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full h-14 bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl text-lg"
                >
                  Envoyer la réclamation
                </Button>
              </form>
            </Card>

            <Card className="p-8 bg-[#EFD9A7]/30 border-0 rounded-3xl">
              <h3 className="text-[#000000] mb-4">Besoin d'aide ?</h3>
              <p className="text-[#5E4B3C] mb-6">
                Notre équipe est là pour t'aider. Nous répondons généralement dans les 24 heures.
              </p>
              <div className="space-y-2 text-sm text-[#5E4B3C]">
                <p>📧 contact : majournee123@gmail.com</p>
                <p>📞 +237 6 97 58 76 48</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
