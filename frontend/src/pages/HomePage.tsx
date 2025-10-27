import { ShoppingCart, Utensils, Award, Heart, ChevronRight, User, Menu as MenuIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/ImgFallback/ImageWithFallback';
import messieImg from '../assets/messie.png';
import benieImg from '../assets/Benie.png';
import vangaImg from '../assets/vanga.png';


interface HomePageProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

const menuItems = [
  {
    id: 1,
    name: 'Fufu and Eru',
    price: 1000,
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/e9/8d/4e/e98d4ea0d4a22e9cac2902e221329437.jpg',
    badge: 'Populaire'
  },
  {
    id: 2,
    name: 'Taro',
    price: 1000,
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/f7/4a/8b/f74a8bdcce40a4c4164bf206dd50b2b3.jpg',
    badge: 'Nouveau',
    badge: 'Chef Special'
  },
  {
    id: 3,
    name: 'Couscous Gombo',
    price: 1000,
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/df/34/b3/df34b330a3f98f6f4ad18f0cf2a7b9fa.jpg',
    badge: ''
  },
  {
    id: 4,
    name: 'Cornchaff',
    price: 1000,
    restaurant: 'ZeDuc@Space',
    image: 'https://i.pinimg.com/1200x/0b/d9/e8/0bd9e886ef8b74eda7155b6068bf69b4.jpg',
    badge: 'Nouveau'
  }
];

const testimonials = [
  {
    name: 'Messie Karlone',
    faculty: 'Institut Ucac-Icam',
    comment: 'Et le plat d\'Okok on en parle mon frere Landry connais l\'histoire.',
    avatar: messieImg
  },
  {
    name: 'Benie Cecilda',
    faculty: 'Institut Ucac-Icam',
    comment: 'Le ndolé qu’ils font là-bas c’est le feu et le système de points de fidélité est génial... J\'ai déjà mes 2 plat njoh !',
    avatar: benieImg
  },
  {
    name: 'Vanga Army',
    faculty: 'Institut Ucac-Icam',
    comment: 'Franchement, le site là m’a sauvé pendant les pauses entre les cours.',
    avatar: vangaImg
  }
];

export function HomePage({ onNavigate, userRole }: HomePageProps) {
  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      {/* Header - Fixed Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
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
              <a href="#" className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1 border-b-2 border-[#cfbd97]">Accueil</a>
              <button onClick={() => onNavigate('menu')} className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1">Menu</button>
              <button onClick={() => userRole !== 'guest' ? onNavigate('student') : onNavigate('login')} className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1">Mes commandes</button>
              <a href="#fidelite" className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1">Fidélité</a>
              <button onClick={() => onNavigate('contact')} className="text-[#000000] hover:text-[#cfbd97] transition-colors pb-1">Contact</button>

            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigate('menu')}
                className="hidden md:flex relative p-2 hover:bg-[#EFD9A7]/30 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-[#000000]" />
                <span className="absolute -top-1 -right-1 bg-[#cfbd97] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </button>
              
              {userRole === 'guest' ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => onNavigate('login')}
                    className="hidden sm:inline-flex text-[#000000] hover:bg-[#EFD9A7]/30"
                  >
                    Connexion
                  </Button>
                  <Button 
                    onClick={() => onNavigate('signup')}
                    className="bg-[#cfbd97] hover:bg-[#cfbd97] text-white shadow-md rounded-2xl"
                  >
                    S'inscrire
                  </Button>
                </>
              ) : (
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </button>
              )}
              <button className="md:hidden">
                <MenuIcon className="w-6 h-6 text-[#000000]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #cfbd97 0%, #cfbd97 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://i.pinimg.com/736x/99/32/77/99327756db5fcf62aa3f083eb082016c.jpg"
            alt="African food background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-20">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-5xl mb-6">
            </h1>
            <p className="text-xl mb-10 text-white/90">
              Découvre, commande et savoure les plats de ton campus — simple, rapide, local.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button 
                size="lg" 
                onClick={() => onNavigate('menu')}
                className="bg-[#cfbd97] hover:bg-[#cfbd97] text-white px-8 py-6 text-lg rounded-3xl shadow-2xl group"
              >
                Commander maintenant
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => onNavigate('menu')}
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#cfbd97] px-8 py-6 text-lg rounded-3xl"
              >
                Voir le menu
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
      <section className="py-20" id="menu">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#000000] mb-4">
              Les favoris des étudiants 
            </h2>
            <p className="text-lg text-[#5E4B3C]">
              Découvre nos plats signature, préparés avec amour chaque jour
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0 rounded-3xl bg-white"
              >
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {item.badge && (
                    <Badge className="absolute top-4 right-4 bg-[#cfbd97] text-white border-0 rounded-full px-3 py-1">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <h4 className="text-[#000000] mb-1">{item.name}</h4>
                    <p className="text-xs text-[#5E4B3C]">{item.restaurant}</p>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl text-[#cfbd97]">{item.price.toFixed(2)}FCFA</span>
                  </div>
                  <Button 
                    className="w-full bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl shadow-md"
                    onClick={() => onNavigate('menu')}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ajouter au panier
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Section */}
      <section className="py-20 bg-[#EFD9A7]" id="fidelite">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl text-[#000000] mb-6">
                Fidélité & Récompenses
              </h2>
              <p className="text-lg text-[#5E4B3C] mb-8">
                Gagne des points à chaque commande et profite de réductions exclusives. 
                Plus tu commandes, plus tu économises !
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8A9A5B] flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#000000] mb-1">1000FCFA = 1 point</h4>
                    <p className="text-sm text-[#5E4B3C]">Accumule des points à chaque euro dépensé</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#cfbd97] flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#000000] mb-1">15 points = 1 repas gratuit</h4>
                    <p className="text-sm text-[#5E4B3C]">Échange tes points contre des repas offerts</p>
                  </div>
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-[#cfbd97] hover:bg-[#cfbd97] 
                text-white rounded-2xl px-8"
                onClick={() => onNavigate('login')}
              >
                Voir mes points
              </Button>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://i.pinimg.com/1200x/d1/fe/18/d1fe187f3b094007ee304094e5cd442b.jpg"
                alt="Happy students"
                className="w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#000000] mb-4">
              Ce que disent nos étudiants
            </h2>
            <p className="text-lg text-[#5E4B3C]">
              Rejoins des centaines d'étudiants satisfaits
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 bg-white rounded-3xl shadow-lg border-0 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <ImageWithFallback
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-[#000000]">{testimonial.name}</h4>
                    <p className="text-sm text-[#5E4B3C]">{testimonial.faculty}</p>
                  </div>
                </div>
                <p className="text-[#5E4B3C] leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

 

{/* Footer */}
<footer className="bg-[#000000] text-[#FAF3E0] py-16">
  <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-[#FAF3E0] text-xl">Mon Miam Miam</h3>
        </div>
        <p className="text-[#EFD9A7]">
          Ton restaurant universitaire connecté, simple et savoureux.
        </p>
      </div>

      <div>
        <h4 className="text-[#EFD9A7] mb-4">À propos</h4>
        <ul className="space-y-3">
          <li><a href="#" className="text-[#FAF3E0] hover:text-[#cfbd97] transition-colors">Notre histoire</a></li>
          <li><a href="#" className="text-[#FAF3E0] hover:text-[#cfbd97] transition-colors">L'équipe</a></li>
          <li><a href="#" className="text-[#FAF3E0] hover:text-[#cfbd97] transition-colors">Nos valeurs</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-[#EFD9A7] mb-4">Contact</h4>
        <ul className="space-y-3">
          <li className="text-[#FAF3E0]">ZeDuc@Space</li>
          <li className="text-[#FAF3E0]">Institut Ucac-Icam</li>
          <li><a href="mailto:majournee321@gmail.com" className="text-[#FAF3E0] hover:text-[#cfbd97] transition-colors">majournee321@gmail.com</a></li>
          <li className="text-[#FAF3E0]">+237 697587648</li>
        </ul>
      </div>

      <div>
        <h4 className="text-[#EFD9A7] mb-4">Mentions légales</h4>
        <ul className="space-y-3">
          <li><a href="#" className="text-[#FAF3E0] hover:text-[#cfbd97] transition-colors">Conditions d'utilisation</a></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-[#5E4B3C] pt-8 text-center">
      <p className="text-[#EFD9A7]">© 2025 Mon Miam Miam - Tous droits réservés</p>
    </div>
  </div>
</footer>
</div>
);
}
