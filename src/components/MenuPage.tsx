import { useState } from 'react';
import { 
  Utensils, Search, ShoppingCart, Plus, Minus, Trash2, 
  X, ChevronDown, Filter, User, Home, Award, MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './ImgFallback/ImageWithFallback';

interface MenuPageProps {
  onNavigate: (page: string) => void;
  userRole: string;
  onLogin?: () => void;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  restaurant: string;
  image: string;
  available: boolean;
  description: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Poulet Yassa',
    price: 1500,
    category: 'Local',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/e9/84/a9/e984a924010b724ccd3e03373edb1c52.jpg',
    available: true,
    description: 'Poulet mariné'
  },
  {
    id: 2,
    name: 'Poisson Braisé',
    price: 1500,
    category: 'Local',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/736x/8d/4a/fc/8d4afc3c36d918b914a2730e7c3691dd.jpg',
    available: true,
    description: 'poisson et percile'
  },
  {
    id: 3,
    name: 'Macaroni',
    price: 1000,
    category: 'Local',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/7a/d1/d2/7ad1d28c836140682bb005040aaafe02.jpg',
    available: true,
    description: 'Macaroni viande hachee et sauce tomate'
  },
  {
    id: 4,
    name: 'Bolognaise',
    price: 1000,
    category: 'Local',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/60/28/e5/6028e5a0316ee9006e8caaccd58b83f5.jpg',
    available: true,
    description: 'Spaghetti à la sauce bolognaise boulette'
  },
  {
    id: 5,
    name: 'Jus de Bissap',
    price: 500,
    category: 'Boissons',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/16/cb/6c/16cb6c4b4d6d908daae2702b93b7ca9d.jpg',
    available: true,
    description: 'Boisson traditionnelle à l\'hibiscus'
  },
  {
    id: 6,
    name: 'Okok',
    price: 1000,
    category: 'Local',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/736x/4f/57/17/4f57178313dc91862672ca85572284df.jpg',
    available: false,
    description: 'Okok sallé comme sucré'
  },
  {
    id: 7,
    name: 'Koki',
    price: 1000,
    category: 'Local',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/77/a6/c1/77a6c10851beaae57e33649128d18858.jpg',
    available: true,
    description: 'Koki platain'
  },
  {
    id: 8,
    name: 'Bongo Tchobi',
    price: 1000,
    category: 'local',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/d2/ae/8f/d2ae8f2123cbd41245e3e9ddba25dbdd.jpg',
    available: true,
    description: 'Mbongo riz poisson'
  },
  {
    id: 9,
    name: 'Ndolé',
    price: 1000,
    category: 'local',
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/736x/3b/d3/c5/3bd3c5264006dae0a569ed1c809b5ee1.jpg',
    available: true,
    description: 'Feuilles de ndolé aux arachides'
  }
];

export function MenuPage({ onNavigate, userRole }: MenuPageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRestaurant = selectedRestaurant === 'all' || item.restaurant === selectedRestaurant;
    return matchesSearch && matchesCategory && matchesRestaurant;
  });

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[#cfbd97] text-xl">Mon Miam Miam</h1>
                <p className="text-xs text-[#5E4B3C]">Restaurant ZeDuc@Space</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigate('home')}
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1"
              >
                Accueil
              </button>
              <button
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1 border-b-2 border-[#cfbd97]"
              >
                Menu
              </button>
              <button
                onClick={() => userRole !== 'guest' ? onNavigate('student') : onNavigate('login')}
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1"
              >
                Mes commandes
              </button>
              <button
                onClick={() => userRole !== 'guest' ? onNavigate('student') : onNavigate('login')}
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1"
              >
                Fidélité
              </button>
              <button
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1"
              >
                Contact
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 hover:bg-[#EFD9A7]/30 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-[#000000]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#cfbd97] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {userRole === 'guest' ? (
                <>
                  <Button 
                    variant="ghost"
                    onClick={() => onNavigate('login')}
                    className="hidden sm:inline-flex text-[#000000] hover:bg-[#EFD9A7]/30 rounded-xl"
                  >
                    Connexion
                  </Button>
                  <Button 
                    onClick={() => onNavigate('signup')}
                    className="bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl shadow-md"
                  >
                    S'inscrire
                  </Button>
                </>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center shadow-md cursor-pointer">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] mb-6 shadow-xl">
            <span className="text-4xl"></span>
          </div>
          <h1 className="text-4xl lg:text-5xl text-[#000000] mb-4">
            Découvre ton repas du jour
          </h1>
          <p className="text-lg text-[#5E4B3C] max-w-2xl mx-auto">
            Des plats variés préparés avec amour par nos partenaires locaux
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 bg-white border-0 rounded-3xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
              <Input
                type="text"
                placeholder="Rechercher un plat ou un restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-12 rounded-2xl border-2 border-[#EFD9A7] bg-white">
                  <SelectValue placeholder="Catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                  <SelectItem value="Vegan">Vegan</SelectItem>
                  <SelectItem value="Boissons">Boissons</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger className="w-[180px] h-12 rounded-2xl border-2 border-[#EFD9A7] bg-white">
                  <SelectValue placeholder="Restaurants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous restaurants</SelectItem>
                  <SelectItem value="ZeDuc@Space">ZeDuc@Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Menu Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isCartOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-8 transition-all duration-300`}>
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={`group overflow-hidden border-0 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 ${!item.available ? 'opacity-60' : 'hover:-translate-y-2'}`}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge className="bg-[#cfbd97] text-white border-0 text-sm px-4 py-2">
                      Indisponible
                    </Badge>
                  </div>
                )}
                <Badge className="absolute top-4 left-4 bg-[#EFD9A7] text-[#5E4B3C] border-0 shadow-md">
                  {item.restaurant}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-6 bg-white">
                <div className="mb-3">
                  <Badge className="bg-[#cfbd97]/10 text-[#cfbd97] border-0 text-xs">
                    {item.category}
                  </Badge>
                </div>
                <h3 className="text-[#000000] mb-2 text-lg">{item.name}</h3>
                <p className="text-sm text-[#5E4B3C] mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-[#cfbd97]">{item.price.toFixed(2)}FCFA</span>
                  <Button
                    onClick={() => addToCart(item)}
                    disabled={!item.available}
                    className="bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-[#EFD9A7]/30 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-[#5E4B3C]" />
            </div>
            <h3 className="text-[#000000] mb-2">Aucun plat trouvé</h3>
            <p className="text-[#5E4B3C]">Essaye de modifier tes filtres</p>
          </div>
        )}
      </div>

      {/* Floating Cart Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-[#EFD9A7]">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-[#cfbd97]" />
              <h2 className="text-2xl text-[#000000]">Mon panier 🛍️</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCartOpen(false)}
              className="rounded-xl hover:bg-[#EFD9A7]/30"
            >
              <X className="w-5 h-5 text-[#5E4B3C]" />
            </Button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-full bg-[#EFD9A7]/30 flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-[#5E4B3C]" />
                </div>
                <h3 className="text-[#000000] mb-2">Ton panier est vide</h3>
                <p className="text-[#5E4B3C] mb-6 text-sm">
                  Ton panier est vide pour le moment 🍴
                </p>
                <Button 
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl"
                >
                  Voir plus de plats
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-[#FAF3E0] rounded-2xl p-4">
                    <div className="flex gap-4">
                      {/* Mini Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#000000] mb-1 truncate">{item.name}</h4>
                        <p className="text-[#cfbd97]">{item.price.toFixed(2)}FCFA</p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 p-0 text-[#cfbd97] hover:bg-[#cfbd97]/10 rounded-xl flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 bg-white rounded-2xl p-1">
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
                      <span className="text-[#000000]">
                        {(item.price * item.quantity).toFixed(2)}FCFA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t-2 border-[#EFD9A7] bg-white">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[#5E4B3C]">Sous-total</span>
                  <span className="text-[#000000]">{cartTotal.toFixed(2)}FCFA</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-[#000000]">Total</span>
                  <span className="text-2xl text-[#cfbd97]">{cartTotal.toFixed(2)}FCFA</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5E4B3C]">Points à gagner</span>
                  <span className="text-[#8A9A5B]">+{Math.floor(cartTotal)} pts</span>
                </div>
              </div>
              <Button 
                className="w-full h-14 bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  if (userRole === 'guest') {
                    onNavigate('login');
                  } else {
                    onNavigate('checkout');
                  }
                }}
              >
                Passer la commande
              </Button>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-full mt-3 text-[#5E4B3C] hover:text-[#cfbd97] text-sm transition-colors"
              >
                Voir plus de plats
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Mobile Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] rounded-full shadow-2xl flex items-center justify-center z-30"
      >
        <ShoppingCart className="w-6 h-6 text-white" />
        {cartCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-[#cfbd97] text-white border-2 border-white h-7 w-7 rounded-full flex items-center justify-center p-0">
            {cartCount}
          </Badge>
        )}
      </button>
    </div>
  );
}
