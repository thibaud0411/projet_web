import { useState } from 'react'; // Retrait de useEffect car l'état local items est retiré
import { 
    ArrowLeft, MapPin, Phone, CreditCard, Wallet, 
    Building2, Check, ShoppingBag, User, Home, Utensils,
    Award, HelpCircle, ShoppingCart, ChevronDown, Minus, Plus, Trash2
} from 'lucide-react';

// --- STUBBED UI COMPONENTS (Requis pour la lisibilité) ---
const Button = ({ children, className = '', variant, onClick, disabled }) => (
    <button 
        className={`px-4 py-2 font-medium rounded-lg transition-colors ${className}`}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </button>
);
const Card = ({ children, className = '' }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>
        {children}
    </div>
);
const Badge = ({ children, className = '' }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
        {children}
    </span>
);
const Input = ({ id, value, onChange, placeholder, className, required, type }) => (
    <input 
        id={id} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        required={required}
    />
);
const Label = ({ htmlFor, children, className }) => (
    <label 
        htmlFor={htmlFor} 
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
        {children}
    </label>
);
const RadioGroup = ({ children, value, onValueChange, className = '' }) => (
    <div className={className} role="radiogroup" aria-activedescendant={value}>
        {children}
    </div>
);
const RadioGroupItem = ({ value, id, className = '' }) => (
    <input type="radio" id={id} value={value} checked={false} readOnly className={`h-4 w-4 text-[#cfbd97] border-[#cfbd97] focus:ring-[#cfbd97] ${className}`} />
);
const ImageWithFallback = ({ src, alt, className }) => (
    <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x300/EFD9A7/5E4B3C?text=Plat';
            e.currentTarget.onerror = null; 
        }}
    />
);
// --- END STUBBED UI COMPONENTS ---

// --- INTERFACES (pour la cohérence) ---

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string; 
    restaurant?: string;
}

interface Order {
    id: string;
    date: string;
    time: string;
    items: string[];
    total: number;
    status: 'delivered' | 'pending';
    points: number;
}

interface CheckoutPageProps {
    onNavigate: (page: string) => void;
    userRole: string; 
    cart: CartItem[]; // Le panier centralisé
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; // Pour vider/modifier le panier
    setOrderHistory: React.Dispatch<React.SetStateAction<Order[]>>; // Pour ajouter la commande
}

export function CheckoutPage({ 
    onNavigate, 
    cart, // 🔑 Utilisation du panier des props
    setCart,
    setOrderHistory
}: CheckoutPageProps) {

    // Suppression de l'état local 'items'. On utilise 'cart' directement.

    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [paymentMethod, setPaymentMethod] = useState('cinetpay');
    const [building, setBuilding] = useState('');
    const [phone, setPhone] = useState('');

    // --- Fonctions de modification du panier (utilisent setCart) ---
    const updateQuantity = (id: number, change: number) => {
        setCart(cart.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
        ));
    };

    const removeItem = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };
    // ----------------------------------------------------------------

    // --- Calculs (utilisent cart) ---
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFee = (deliveryMethod === 'delivery' && subtotal > 0) ? 500 : 0; 
    const total = subtotal + serviceFee;
    const pointsGained = Math.floor(total / 1000);
    // ---------------------------------

    const handleConfirmOrder = () => {
        if (cart.length === 0) return;

        // 1. Logique de validation (simple)
        if (deliveryMethod === 'delivery' && (!building || !phone)) {
            alert("Veuillez remplir le lieu et le numéro de téléphone pour la livraison.");
            return;
        }

        // 2. Création de l'objet de commande
        const newOrder: Order = {
            id: `ORD-${Date.now().toString().slice(-4)}`, // ID plus court pour l'exemple
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            items: cart.map(i => `${i.name} (x${i.quantity})`), // Utilise la prop cart
            total: total,
            status: 'delivered', // On considère qu'après confirmation/paiement, c'est "Livré" ou "En cours" (pending est plus réaliste)
            points: pointsGained,
        };

        // 3. Mise à jour de l'historique dans App.tsx
        setOrderHistory(prevHistory => [newOrder, ...prevHistory]);

        // 4. Vider le panier dans App.tsx
        setCart([]); 

        // 5. Redirection et notification
        alert(`Commande #${newOrder.id} confirmée ! Paiement par ${paymentMethod === 'cash' ? 'espèces' : 'CinetPay'}.`);
        onNavigate('student'); // Retourne au dashboard
    };

    return (
        <div className="min-h-screen bg-[#FAF3E0]">
            
            {/* Header (Réutilisé de votre version) */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center shadow-lg">
                                <Utensils className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[#cfbd97] text-xl">Mon Miam Miam</h1>
                                <p className="text-xs text-[#5E4B3C]">ZeDuc@Space</p>
                            </div>
                        </div>
                        
                        <nav className="hidden md:flex items-center gap-6">
                            <button onClick={() => onNavigate('student')} className="text-[#cfbd97] transition-colors pb-1 border-b-2 border-[#cfbd97]">Paiement</button>
                            <button onClick={() => onNavigate('student')} className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1">Mes commandes</button>
                        </nav>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => onNavigate('student')}
                                className="relative p-2 hover:bg-[#EFD9A7]/30 rounded-xl transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5 text-[#000000]" />
                                <span className="absolute -top-1 -right-1 bg-[#cfbd97] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center cursor-pointer">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12">
                
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => onNavigate('student')} // Retourne au StudentDashboard
                    className="mb-8 text-[#5E4B3C] hover:bg-[#EFD9A7]/30"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour au panier
                </Button>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Order Summary */}
                    <div className="space-y-6">
                        {/* Cart Recap */}
                        <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl text-[#000000]">
                                    Récapitulatif de ta commande 
                                </h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => onNavigate('student')} 
                                    className="text-[#cfbd97] hover:bg-[#cfbd97]/10"
                                >
                                    Modifier
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {/* 🎯 UTILISE LA PROP 'cart' ICI 🎯 */}
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-[#FAF3E0] rounded-2xl">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                            <ImageWithFallback
                                                src={item.image || 'placeholder'} 
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[#000000] mb-1">{item.name}</h4>
                                            <p className="text-xs text-[#5E4B3C] mb-2">{item.restaurant || 'ZeDuc@Space'}</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-[#EFD9A7] transition-colors"
                                                >
                                                    <Minus className="w-3 h-3 text-[#5E4B3C]" />
                                                </button>
                                                <span className="w-8 text-center text-[#000000]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-[#EFD9A7] transition-colors"
                                                >
                                                    <Plus className="w-3 h-3 text-[#5E4B3C]" />
                                                </button>
                                                <button 
                                                    onClick={() => removeItem(item.id)}
                                                    className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors ml-2"
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg text-[#cfbd97]">
                                                {(item.price * item.quantity).toFixed(2)}FCFA
                                            </p>
                                            <p className="text-xs text-[#5E4B3C]">
                                                {item.price.toFixed(2)}FCFA × {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {/* 🎯 UTILISE LA PROP 'cart' ICI 🎯 */}
                                {cart.length === 0 && (
                                    <p className="text-center text-[#5E4B3C]/70 py-4">Votre panier est vide. Retournez au menu !</p>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t-2 border-[#EFD9A7] space-y-3">
                                <div className="flex justify-between text-[#5E4B3C]">
                                    <span>Sous-total</span>
                                    <span>{subtotal.toFixed(2)}FCFA</span>
                                </div>
                                <div className="flex justify-between text-[#5E4B3C]">
                                    <span>Frais de service (Livraison)</span>
                                    <span>{serviceFee.toFixed(2)}FCFA</span>
                                </div>
                                <div className="flex justify-between text-2xl text-[#000000] pt-3 border-t-2 border-[#EFD9A7]">
                                    <span>Total à payer</span>
                                    <span className="text-[#cfbd97]">{total.toFixed(2)}FCFA</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#8A9A5B]">
                                    <Award className="w-4 h-4" />
                                    <span>Tu gagneras {pointsGained} points fidélité</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                        
                    {/* Right Column - Delivery & Payment */}
                    <div className="space-y-6">
                        {/* Delivery Method */}
                        <Card className="p-8 bg-[#FAF3E0] border-0 rounded-3xl shadow-lg">
                            <h3 className="text-2xl text-[#000000] mb-6">
                                Où veux-tu récupérer ton repas ? 
                            </h3>

                            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-4">
                                
                                {/* Option Livraison */}
                                <div 
                                    className={`flex items-start gap-4 p-6 rounded-2xl cursor-pointer transition-all ${
                                        deliveryMethod === 'delivery' 
                                            ? 'bg-white border-2 border-[#cfbd97] shadow-md' 
                                            : 'bg-white border-2 border-transparent hover:border-[#EFD9A7]'
                                    }`}
                                    onClick={() => setDeliveryMethod('delivery')}
                                >
                                    <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-5 h-5 text-[#cfbd97]" />
                                            <Label htmlFor="delivery" className="text-[#000000] cursor-pointer">Livraison</Label>
                                        </div>
                                        <p className="text-sm text-[#5E4B3C]">Campus? Yansoki? Livraison à domicile ? (+{serviceFee.toFixed(0)}FCFA)</p>
                                    </div>
                                    {deliveryMethod === 'delivery' && (<Check className="w-5 h-5 text-[#cfbd97]" />)}
                                </div>

                                {/* Option Pickup */}
                                <div 
                                    className={`flex items-start gap-4 p-6 rounded-2xl cursor-pointer transition-all ${
                                        deliveryMethod === 'pickup' 
                                            ? 'bg-white border-2 border-[#cfbd97] shadow-md' 
                                            : 'bg-white border-2 border-transparent hover:border-[#EFD9A7]'
                                    }`}
                                    onClick={() => setDeliveryMethod('pickup')}
                                >
                                    <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShoppingBag className="w-5 h-5 text-[#8A9A5B]" />
                                            <Label htmlFor="pickup" className="text-[#000000] cursor-pointer">Je passe récupérer sur place</Label>
                                        </div>
                                        <p className="text-sm text-[#5E4B3C]">J'arrive (0FCFA)</p>
                                    </div>
                                    {deliveryMethod === 'pickup' && (<Check className="w-5 h-5 text-[#cfbd97]" />)}
                                </div>
                            </RadioGroup>

                            {deliveryMethod === 'delivery' && (
                                <div className="mt-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="building" className="text-[#000000]">
                                            <Building2 className="w-4 h-4 inline mr-2" />
                                            Lieu
                                        </Label>
                                        <Input
                                            id="building"
                                            placeholder="Ex: IUI,Yansoki "
                                            value={building}
                                            onChange={(e) => setBuilding(e.target.value)}
                                            className="rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-[#000000]">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            Numéro de téléphone
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+237 6 91 55 76 45"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>


                        {/* Payment Method */}
                        <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
                            <h3 className="text-2xl text-[#000000] mb-6">Mode de paiement 💳</h3>
                            
                            <div className="space-y-4">
                                <div 
                                    className={`flex items-center gap-4 p-6 rounded-2xl cursor-pointer transition-all ${
                                        paymentMethod === 'cinetpay' 
                                            ? 'border-2 border-[#cfbd97] bg-[#FAF3E0] shadow-md' 
                                            : 'border-2 border-[#EFD9A7] hover:border-[#cfbd97]'
                                    }`}
                                    onClick={() => setPaymentMethod('cinetpay')}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center">
                                        <Wallet className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[#000000]">CinetPay</h4>
                                        <p className="text-sm text-[#5E4B3C]">Mobile Money, Orange Money</p>
                                    </div>
                                    {paymentMethod === 'cinetpay' && (<Check className="w-5 h-5 text-[#cfbd97]" />)}
                                </div>

                                <div 
                                    className={`flex items-center gap-4 p-6 rounded-2xl cursor-pointer transition-all ${
                                        paymentMethod === 'cash' 
                                            ? 'border-2 border-[#cfbd97] bg-[#FAF3E0] shadow-md' 
                                            : 'border-2 border-[#EFD9A7] hover:border-[#cfbd97]'
                                    }`}
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#8A9A5B] flex items-center justify-center">
                                        <Wallet className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[#000000]">Paiement à la livraison</h4>
                                        <p className="text-sm text-[#5E4B3C]">En espèces</p>
                                    </div>
                                    {paymentMethod === 'cash' && (<Check className="w-5 h-5 text-[#cfbd97]" />)}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t-2 border-[#EFD9A7]">
                                <Button
                                    onClick={handleConfirmOrder}
                                    className="w-full h-16 bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-3xl text-lg shadow-2xl"
                                    disabled={cart.length === 0}
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Confirmer ma commande
                                </Button>
                                <p className="text-xs text-center text-[#5E4B3C] mt-4">
                                    En validant, tu acceptes nos conditions de commande
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}