import { useState } from 'react';
import { 
  ArrowLeft, MapPin, Phone, CreditCard, Wallet, 
  Building2, Check, ShoppingBag, User, Home, Utensils,
  Award, HelpCircle, ShoppingCart, ChevronDown, Minus, Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { ImageWithFallback } from '../components/ImgFallback/ImageWithFallback';

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
  userRole: string;
}


const cartItems = [
  {
    id: 1,
    name: 'Poulet Yassa',
    restaurant: 'ZeDuc@Space',
    price: 1500,
    quantity: 2,
    image: 'https://i.pinimg.com/1200x/e9/84/a9/e984a924010b724ccd3e03373edb1c52.jpg'
  },
  {
    id: 2,
    name: 'Poisson Braisé',
    restaurant: 'ZeDuc@Space',
    price: 1500,
    quantity: 1,
    image: 'https://i.pinimg.com/736x/8d/4a/fc/8d4afc3c36d918b914a2730e7c3691dd.jpg'
  },
  {
    id: 3,
    name: 'Jus de Bissap',
    restaurant: 'ZeDuc@Space',
    price: 500,
    quantity: 2,
    image: 'https://i.pinimg.com/1200x/16/cb/6c/16cb6c4b4d6d908daae2702b93b7ca9d.jpg'
  }
];

export function CheckoutPage({ onNavigate, userRole }: CheckoutPageProps) {
  const [items, setItems] = useState(cartItems);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cinetpay');
  const [building, setBuilding] = useState('');
  const [phone, setPhone] = useState('');

  const updateQuantity = (id: number, change: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = 1.50;
  const total = subtotal + serviceFee;

  const handleConfirmOrder = () => {
    // In real app, this would process the order
    alert('Commande confirmée avec succès ! 🎉');
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      {/* Header - Unified Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[#cfbd97] text-xl">Mon Miam Miam</h1>
                <p className="text-xs text-[#5E4B3C]">ZeDuc@Space</p>
              </div>
            </div>
            
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate('home')}
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1"
              >
                Accueil
              </button>
              <button 
                onClick={() => onNavigate('menu')}
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1"
              >
                Menu
              </button>
              <button 
                onClick={() => onNavigate('student')}
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1"
              >
                Mes commandes
              </button>
              <button 
                onClick={() => onNavigate('student')}
                className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1"
              >
                Fidélité
              </button>
              <button className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1">
                Contact
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('menu')}
                className="relative p-2 hover:bg-[#EFD9A7]/30 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-[#000000]" />
                <span className="absolute -top-1 -right-1 bg-[#cfbd97] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
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
          onClick={() => onNavigate('menu')}
          className="mb-8 text-[#5E4B3C] hover:bg-[#EFD9A7]/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au menu
        </Button>

        {/* Hero Illustration */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] mb-4">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl text-[#000000] mb-4">
            Finalise ta commande 
          </h1>
          <p className="text-lg text-[#5E4B3C]">
            Plus qu'une étape pour savourer ton repas
          </p>
        </div>

        {/* Two Column Layout */}
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
                  onClick={() => onNavigate('menu')}
                  className="text-[#cfbd97] hover:bg-[#cfbd97]/10"
                >
                  Modifier
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-[#FAF3E0] rounded-2xl">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#000000] mb-1">{item.name}</h4>
                      <p className="text-xs text-[#5E4B3C] mb-2">{item.restaurant}</p>
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
              </div>

              <div className="mt-6 pt-6 border-t-2 border-[#EFD9A7] space-y-3">
                <div className="flex justify-between text-[#5E4B3C]">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)}FCFA</span>
                </div>
                <div className="flex justify-between text-[#5E4B3C]">
                  <span>Frais de service</span>
                  <span>{serviceFee.toFixed(2)}FCFA</span>
                </div>
                <div className="flex justify-between text-2xl text-[#000000] pt-3 border-t-2 border-[#EFD9A7]">
                  <span>Total</span>
                  <span className="text-[#cfbd97]">{total.toFixed(2)}FCFA</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#8A9A5B]">
                  <Award className="w-4 h-4" />
                  <span>Tu gagneras {Math.floor(total)} points fidélité</span>
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
                      <Label htmlFor="delivery" className="text-[#000000] cursor-pointer">
                        Livraison
                      </Label>
                    </div>
                    <p className="text-sm text-[#5E4B3C]">
                      Campus? Yansoki?   Livraison a domicile ?
                    </p>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <Check className="w-5 h-5 text-[#cfbd97]" />
                  )}
                </div>

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
                      <Label htmlFor="pickup" className="text-[#000000] cursor-pointer">
                        Je passe récupérer sur place
                      </Label>
                    </div>
                    <p className="text-sm text-[#5E4B3C]">
                      J'arrive
                    </p>
                  </div>
                  {deliveryMethod === 'pickup' && (
                    <Check className="w-5 h-5 text-[#cfbd97]" />
                  )}
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
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="p-8 bg-white border-0 rounded-3xl shadow-lg">
              <h3 className="text-2xl text-[#000000] mb-6">
                Mode de paiement 💳
              </h3>

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
                  {paymentMethod === 'cinetpay' && (
                    <Check className="w-5 h-5 text-[#cfbd97]" />
                  )}
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
                  {paymentMethod === 'cash' && (
                    <Check className="w-5 h-5 text-[#cfbd97]" />
                  )}
                </div>

 
              </div>

              <div className="mt-8 pt-6 border-t-2 border-[#EFD9A7]">
                <Button
                  onClick={handleConfirmOrder}
                  className="w-full h-16 bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-3xl text-lg shadow-2xl"
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
