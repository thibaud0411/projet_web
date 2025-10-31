import { Button } from "../components/ui/button";
import { Utensils, ShoppingCart, User, Menu as MenuIcon } from "lucide-react";

export function ContactPage({ onNavigate, userRole }: { onNavigate: (page: string) => void, userRole: string }) {
  return (
    <div className="min-h-screen bg-[#FAF3E0] flex flex-col">
      {/* Header identique à HomePage */}
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
              <button onClick={() => onNavigate('home')} className="text-[#000000] hover:text-[#cfbd97] pb-1">Accueil</button>
              <button onClick={() => onNavigate('menu')} className="text-[#000000] hover:text-[#cfbd97] pb-1">Menu</button>
              <button onClick={() => userRole !== 'guest' ? onNavigate('student') : onNavigate('login')} className="text-[#000000] hover:text-[#cfbd97] pb-1">Mes commandes</button>
              <button onClick={() => onNavigate('contact')} className="text-[#cfbd97] border-b-2 border-[#cfbd97] pb-1">Contact</button>
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

      {/* Section principale - Contact */}
      <section className="flex-grow py-20">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-4xl font-semibold text-[#000000] mb-8 text-center">
            Contactez-nous
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Formulaire */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message envoyé avec succès 🎉");
                e.currentTarget.reset();
              }}
              className="bg-white rounded-3xl shadow-lg p-8 space-y-6"
            >
              <div>
                <label className="block text-sm text-[#5E4B3C] mb-2">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Miam Daddy"
                  className="w-full px-4 py-3 rounded-2xl border border-[#EFD9A7] bg-[#FAF3E0]/40 focus:ring-2 focus:ring-[#cfbd97]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#5E4B3C] mb-2">Email</label>
                <input
                  type="email"
                  required
                  placeholder="exemple@mail.com"
                  className="w-full px-4 py-3 rounded-2xl border border-[#EFD9A7] bg-[#FAF3E0]/40 focus:ring-2 focus:ring-[#cfbd97]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#5E4B3C] mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Écrivez votre message..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#EFD9A7] bg-[#FAF3E0]/40 focus:ring-2 focus:ring-[#cfbd97]"
                ></textarea>
              </div>

              <Button type="submit" className="w-full bg-[#cfbd97] hover:bg-[#cfbd97]/90 text-white rounded-2xl py-3">
                Envoyer le message
              </Button>
            </form>

            {/* Infos de contact */}
            <div className="space-y-6 text-[#5E4B3C]">
              <div>
                <h3 className="text-2xl text-[#000000] mb-3">Nos coordonnées</h3>
                <ul className="space-y-2">
                  <li><strong>📍 Adresse :</strong> ZeDuc@Space, Institut UCAC-ICAM</li>
                  <li><strong>📞 Téléphone :</strong> +237 697 58 76 48</li>
                  <li>
                    <strong>📧 Email :</strong>{" "}
                    <a href="mailto:majournee321@gmail.com" className="text-[#cfbd97] hover:underline">
                      majournee321@gmail.com
                    </a>
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-lg">
                <iframe
                  title="Localisation Institut UCAC-ICAM"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.9110306269115!2d11.518961174768003!3d3.8575697471643834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bcf5d8ac06c71%3A0x427a3c8c2e9dbadc!2sInstitut%20UCAC-ICAM!5e0!3m2!1sfr!2scm!4v1700000000000!5m2!1sfr!2scm"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
