import { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, LogOut, Home, ShoppingCart, History, 
  Award, MessageSquare, Plus, Minus, Trash2, Star,
  Check, Clock, X, User, Bell
} from 'lucide-react';

// --- STUBBED UI COMPONENTS (Required to make the single file runnable) ---
// Since the original file imports local components (./ui/...), 
// these minimal functional stubs are necessary to compile the single file
// without altering the structure of the main component's logic or design.

// Minimal Button Stub
const Button = ({ children, className = '', variant, size, onClick, disabled, type }) => (
    <button 
        className={`px-4 py-2 font-medium rounded-lg transition-colors ${className}`}
        onClick={onClick}
        disabled={disabled}
        type={type}
    >
        {children}
    </button>
);

// Minimal Card Stub
const Card = ({ children, className = '' }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>
        {children}
    </div>
);

// Minimal Badge Stub
const Badge = ({ children, className = '' }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
        {children}
    </span>
);

// Minimal Tabs Stubs (Kept for compatibility with original code structure, though unused now)
const Tabs = ({ children, value, onValueChange, className = '' }) => (
    <div className={className} data-state={value}>
        {children}
    </div>
);

const TabsList = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
        {children}
    </div>
);

const TabsTrigger = ({ children, value, className = '', ...props }) => (
    <button
        className={`inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
        data-state={props['data-[state=active]'] ? 'active' : 'inactive'}
        onClick={() => props.onClick && props.onClick(value)}
    >
        {children}
    </button>
);

const TabsContent = ({ children, value, className = '' }) => (
    <div 
        data-state={value} 
        className={className}
    >
        {children}
    </div>
);


// Minimal Progress Stub
const Progress = ({ value, className = '' }) => (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
        <div 
            className="h-full w-full flex-1 bg-primary transition-all rounded-full"
            style={{ width: `${value}%`, backgroundColor: '#8A9A5B' }}
        />
    </div>
);

// Minimal Textarea Stub
const Textarea = ({ id, value, onChange, placeholder, className, required }) => (
    <textarea 
        id={id} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        required={required}
    />
);

// Minimal Input Stub
const Input = ({ id, value, onChange, placeholder, className, required }) => (
    <input 
        id={id} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        required={required}
    />
);

// Minimal Label Stub
const Label = ({ htmlFor, children, className }) => (
    <label 
        htmlFor={htmlFor} 
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
        {children}
    </label>
);

// Minimal ImageWithFallback Stub
const ImageWithFallback = ({ src, alt, className }) => (
    <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x300/EFD9A7/5E4B3C?text=Plat';
            e.currentTarget.onerror = null; // prevents infinite loop
        }}
    />
);
// --- END STUBBED UI COMPONENTS ---


// --- STATIC MENU DATA (Kept as per original structure) ---
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

// Define the Order structure for type safety
interface Order {
  id: string;
  date: string;
  time: string;
  items: string[];
  total: number;
  status: 'delivered' | 'pending';
  points: number;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface StudentDashboardProps {
  onLogout: () => void;
  onNavigate: (page: string) => void;
}


export function StudentDashboard({ onLogout, onNavigate }: StudentDashboardProps) {
  // État du panier et de la page active (activeTab devient activePage)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activePage, setActivePage] = useState('overview'); // Renommage de activeTab
  const [complaint, setComplaint] = useState('');
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Calculs
  const totalLoyaltyPoints = useMemo(() => {
    return orderHistory.reduce((sum, order) => sum + order.points, 0);
  }, [orderHistory]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pointsToGain = Math.floor(cartTotal / 1000);
  

  // Logique d'ajout au panier
  const addToCart = (item: typeof menuItems[0]) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
    setNotification({ message: `${item.name} ajouté au panier !`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Logique de mise à jour/suppression du panier
  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    ));
  };

  const removeFromCart = (id: number) => {
    const item = cart.find(i => i.id === id);
    setCart(cart.filter(item => item.id !== id));
    setNotification({ message: `${item?.name} retiré du panier.`, type: 'error' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fonction de validation de la commande
  const checkout = () => {
    if (cart.length === 0) return;

    const total = cartTotal;
    const pointsGained = pointsToGain;

    const newOrder: Order = {
      id: Date.now().toString().slice(-4),
      date: new Date().toLocaleDateString('fr-FR'),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      items: cart.map(item => `${item.name} (x${item.quantity})`),
      total: total,
      status: 'delivered', 
      points: pointsGained
    };

    setOrderHistory(prevHistory => [newOrder, ...prevHistory]);
    setCart([]);

    setNotification({ message: `Commande #${newOrder.id} validée avec succès ! Vous avez gagné ${pointsGained} points.`, type: 'success' });
    setTimeout(() => setNotification(null), 5000);

    setActivePage('overview');
  };

  // Fonction de soumission de réclamation (remplace l'alert)
  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Réclamation soumise:', complaint);
    
    setNotification({ message: 'Réclamation soumise avec succès ! Notre équipe la traite dans les 24h.', type: 'success' });
    setTimeout(() => setNotification(null), 5000);

    setComplaint('');
  };
    
// --- START: Content Renderers (Abstracted from TabsContent) ---

const NotificationBanner = () => {
    if (!notification) return null;

    const baseClasses = "fixed bottom-4 right-4 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-[9999] transition-all transform";
    const typeClasses = notification.type === 'success' 
        ? 'bg-[#8A9A5B] text-white' 
        : 'bg-red-500 text-white';

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <Bell className="w-5 h-5" />
            <span className="font-semibold">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2">
                <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
        </div>
    );
};

const OverviewContent = () => (
    <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-8 bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] text-white border-0 rounded-3xl shadow-xl">
                <Award className="w-12 h-12 mb-4" />
                <h3 className="text-white mb-2">Points Fidélité</h3>
                <p className="text-4xl mb-2">{totalLoyaltyPoints}</p>
                <p className="text-white/80 text-sm">
                    Plus que {totalLoyaltyPoints >= 100 ? 0 : 100 - (totalLoyaltyPoints % 100)} pts pour un repas gratuit
                </p>
            </Card>
            
            <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
                <History className="w-12 h-12 mb-4 text-[#8A9A5B]" />
                <h3 className="text-[#000000] mb-2">Commandes Totales</h3>
                <p className="text-4xl text-[#000000] mb-2">{orderHistory.length}</p>
                <p className="text-[#5E4B3C] text-sm">Historique complet</p>
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
                {orderHistory.length === 0 ? (
                    <div className="text-center py-6 bg-[#FAF3E0] rounded-2xl">
                        <p className="text-[#5E4B3C]">Aucune commande récente. Commence à commander pour gagner des points !</p>
                        <Button 
                            onClick={() => setActivePage('menu')}
                            className="mt-4 bg-[#8A9A5B] hover:bg-[#8A9A5B] text-white rounded-2xl"
                        >
                            Voir le menu
                        </Button>
                    </div>
                ) : (
                    orderHistory.slice(0, 3).map((order) => (
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
                    ))
                )}
            </div>
        </Card>
    </div>
);

const MenuContent = () => (
    <div className="space-y-6">
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
    </div>
);

const CartContent = () => (
    <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
        <h2 className="text-3xl text-[#000000] mb-6">Mon Panier</h2>
        
        {cart.length === 0 ? (
            <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-[#EFD9A7]" />
                <p className="text-[#5E4B3C] mb-6">Ton panier est vide</p>
                <Button 
                    onClick={() => setActivePage('menu')}
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
                        <span className="text-[#5E4B3C]">Points à gagner (1 pt/1000FCFA)</span>
                        <span className="text-[#8A9A5B]">+{pointsToGain} pts</span>
                    </div>
                    <Button 
                        className="w-full h-14 bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl text-lg shadow-lg"
                        onClick={checkout}
                        disabled={cart.length === 0}
                    >
                        Valider ma commande
                    </Button>
                </div>
            </div>
        )}
    </Card>
);

const HistoryContent = () => (
    <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
        <h2 className="text-3xl text-[#000000] mb-6">Historique des Commandes</h2>
        
        <div className="space-y-4">
            {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto mb-4 text-[#EFD9A7]" />
                    <p className="text-[#5E4B3C] mb-6">Ton historique est vide. Passe ta première commande !</p>
                    <Button 
                        onClick={() => setActivePage('menu')}
                        className="bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl"
                    >
                        Voir le menu
                    </Button>
                </div>
            ) : (
                orderHistory.map((order) => (
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
                ))
            )}
        </div>
    </Card>
);

const LoyaltyContent = () => (
    <div className="space-y-6">
        <Card className="p-8 bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] text-white border-0 rounded-3xl shadow-xl">
            <div className="text-center">
                <Award className="w-20 h-20 mx-auto mb-6" />
                <h2 className="text-white text-4xl mb-4">{totalLoyaltyPoints} Points</h2>
                <p className="text-white/90 text-lg mb-8">
                    Plus que {totalLoyaltyPoints >= 100 ? 0 : 100 - (totalLoyaltyPoints % 100)} points pour ton prochain repas gratuit !
                </p>
                <Progress value={(totalLoyaltyPoints % 100)} className="h-4 bg-white/20" />
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
                        <p className="text-[#5E4B3C]">100 points = 1 repas gratuit</p>
                    </div>
                </div>
            </div>
        </Card>
    </div>
);

const ComplaintsContent = () => (
    <div className="space-y-6">
        <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
            <h2 className="text-3xl text-[#000000] mb-6">Soumettre une Réclamation</h2>
            
            <form className="space-y-6" onSubmit={submitComplaint}>
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
    </div>
);

// --- END: Content Renderers ---

// Navigation items definition for the new header structure
const navItems = [
    { value: 'overview', label: 'Tableau de bord', icon: Home, count: 0 },
    { value: 'menu', label: 'Menu', icon: Utensils, count: 0 },
    { value: 'cart', label: 'Panier', icon: ShoppingCart, count: cartCount },
    { value: 'history', label: 'Historique', icon: History, count: 0 },
    { value: 'loyalty', label: 'Fidélité', icon: Award, count: 0 },
    { value: 'complaints', label: 'Réclamations', icon: MessageSquare, count: 0 },
];

const renderContent = () => {
    switch (activePage) {
        case 'overview':
            return <OverviewContent />;
        case 'menu':
            return <MenuContent />;
        case 'cart':
            return <CartContent />;
        case 'history':
            return <HistoryContent />;
        case 'loyalty':
            return <LoyaltyContent />;
        case 'complaints':
            return <ComplaintsContent />;
        default:
            return <OverviewContent />;
    }
};

  return (
    <div className="min-h-screen bg-[#FAF3E0] font-sans">
        <NotificationBanner />

      {/* Header (Main bar + Navigation bar) */}
      <header className="sticky top-0 z-50 bg-white shadow-xl">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          {/* Top Bar: Logo, Title, User Actions */}
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[#cfbd97] text-2xl font-bold">Mon Miam Miam</h1>
                <p className="text-xs text-[#5E4B3C]">Espace Étudiant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-[#cfbd97] hover:bg-[#cfbd97]/10 rounded-xl"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Déconnexion
              </Button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

            {/* Main Navigation Bar (replaces the old TabsList in the body) */}
            <div className="flex justify-center border-t border-[#EFD9A7]/50 pt-2 pb-2 overflow-x-auto whitespace-nowrap">
                {navItems.map((item) => {
                    const isActive = activePage === item.value;
                    const Icon = item.icon;
                    const itemClass = isActive
                        ? 'bg-[#cfbd97] text-white shadow-md'
                        : 'text-[#5E4B3C] hover:bg-[#EFD9A7]/50';

                    // Update count for the cart item
                    const currentCount = item.value === 'cart' ? cartCount : 0;

                    return (
                        <Button
                            key={item.value}
                            variant="ghost"
                            onClick={() => setActivePage(item.value)}
                            className={`flex items-center px-4 py-2 mx-1 rounded-xl transition-colors ${itemClass}`}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                            {currentCount > 0 && (
                                <Badge className={`ml-2 ${isActive ? 'bg-white text-[#cfbd97]' : 'bg-[#cfbd97] text-white'} border-0`}>
                                    {currentCount}
                                </Badge>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
      </header>

      {/* Main Content Area (Conditional Rendering) */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12">
            {renderContent()}
      </div>
    </div>
  );
}
