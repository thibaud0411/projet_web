import { useState, useEffect } from 'react';
import { User, Shield, Briefcase, GraduationCap, Crown } from 'lucide-react';

type RoleView = 'administrateur' | 'gerant' | 'employe' | 'etudiant';

interface RoleCard {
  role: RoleView;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const Demo = () => {
  const [selectedRole, setSelectedRole] = useState<RoleView>('administrateur');

  // Activate demo mode when component mounts
  useEffect(() => {
    sessionStorage.setItem('demo_mode', 'true');
    console.log('🎭 Demo mode activated - all pages are accessible!');
    
    // Cleanup: remove demo mode when leaving
    return () => {
      // Don't remove here - we want it to persist during navigation
    };
  }, []);

  const roles: RoleCard[] = [
    {
      role: 'administrateur',
      title: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités du système',
      icon: <Crown className="w-12 h-12" />,
      color: 'from-purple-500 to-indigo-600',
      features: [
        'Gestion complète des utilisateurs',
        'Configuration système',
        'Rapports et statistiques avancés',
        'Gestion des rôles et permissions',
        'Accès à toutes les données',
        'Paramètres de sécurité',
        'Logs d\'activité système',
        'Backup et restauration'
      ]
    },
    {
      role: 'gerant',
      title: 'Gérant',
      description: 'Gestion du restaurant et supervision des opérations',
      icon: <Shield className="w-12 h-12" />,
      color: 'from-blue-500 to-cyan-600',
      features: [
        'Tableau de bord des ventes',
        'Gestion des employés',
        'Statistiques de performance',
        'Gestion des produits et menus',
        'Validation des commandes',
        'Gestion des promotions',
        'Rapports financiers',
        'Gestion des horaires'
      ]
    },
    {
      role: 'employe',
      title: 'Employé',
      description: 'Gestion des commandes et service client',
      icon: <Briefcase className="w-12 h-12" />,
      color: 'from-green-500 to-emerald-600',
      features: [
        'Traitement des commandes',
        'Gestion des réclamations',
        'Suivi des livraisons',
        'Communication avec clients',
        'Mise à jour statuts commandes',
        'Consultation du menu',
        'Historique des transactions',
        'Support client'
      ]
    },
    {
      role: 'etudiant',
      title: 'Étudiant / Client',
      description: 'Interface client pour commander et gérer son compte',
      icon: <GraduationCap className="w-12 h-12" />,
      color: 'from-orange-500 to-red-600',
      features: [
        'Parcourir le menu',
        'Passer des commandes',
        'Suivi des commandes en temps réel',
        'Programme de fidélité',
        'Historique des commandes',
        'Code de parrainage',
        'Participer aux événements',
        'Gérer son profil'
      ]
    }
  ];

  const currentRole = roles.find(r => r.role === selectedRole)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎭 Page de Démonstration
          </h1>
          <p className="text-xl text-gray-600">
            Explorez toutes les interfaces utilisateur sans restriction
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-yellow-800">
              ⚠️ Mode Démonstration - Toutes les fonctionnalités sont accessibles à tous
            </p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {roles.map((role) => (
            <button
              key={role.role}
              onClick={() => setSelectedRole(role.role)}
              className={`p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                selectedRole === role.role
                  ? `bg-gradient-to-br ${role.color} text-white shadow-2xl scale-105`
                  : 'bg-white text-gray-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={selectedRole === role.role ? 'text-white' : 'text-gray-600'}>
                  {role.icon}
                </div>
                <h3 className="text-lg font-bold">{role.title}</h3>
                <p className={`text-sm text-center ${
                  selectedRole === role.role ? 'text-white/90' : 'text-gray-500'
                }`}>
                  {role.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Role Details */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className={`bg-gradient-to-r ${currentRole.color} p-8 text-white`}>
            <div className="flex items-center space-x-4">
              {currentRole.icon}
              <div>
                <h2 className="text-3xl font-bold">{currentRole.title}</h2>
                <p className="text-white/90 mt-2">{currentRole.description}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Fonctionnalités Disponibles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentRole.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`mt-1 bg-gradient-to-r ${currentRole.color} rounded-full p-1`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Actions */}
          <div className="p-8 bg-gray-50 border-t">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Accéder aux Pages Réelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedRole === 'administrateur' && (
                <>
                  <a href="/admin" className={`py-3 px-6 rounded-lg font-medium text-center text-white bg-gradient-to-r ${currentRole.color} hover:shadow-lg transition-all block`}>
                    📊 Dashboard Admin
                  </a>
                  <a href="/admin/employees" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    👥 Gestion Employés
                  </a>
                  <a href="/admin/menu" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    🍽️ Gestion Menu
                  </a>
                  <a href="/admin/orders" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    📦 Commandes
                  </a>
                  <a href="/admin/promotions" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    🎁 Promotions
                  </a>
                  <a href="/admin/events" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    🎉 Événements
                  </a>
                  <a href="/admin/complaints" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    💬 Réclamations
                  </a>
                  <a href="/admin/settings" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    ⚙️ Paramètres
                  </a>
                </>
              )}
              
              {selectedRole === 'gerant' && (
                <>
                  <a href="/manager" className={`py-3 px-6 rounded-lg font-medium text-center text-white bg-gradient-to-r ${currentRole.color} hover:shadow-lg transition-all block`}>
                    📊 Dashboard Gérant
                  </a>
                  <a href="/manager/orders" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    📦 Gestion Commandes
                  </a>
                  <a href="/manager/claims" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    💬 Validation Réclamations
                  </a>
                  <a href="/manager/create-employee" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    👤 Créer Employé
                  </a>
                </>
              )}
              
              {selectedRole === 'employe' && (
                <>
                  <a href="/employee" className={`py-3 px-6 rounded-lg font-medium text-center text-white bg-gradient-to-r ${currentRole.color} hover:shadow-lg transition-all block`}>
                    📊 Dashboard Employé
                  </a>
                  <a href="/employee/menu" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    🍽️ Consulter Menu
                  </a>
                  <a href="/employee/orders" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    📦 Gérer Commandes
                  </a>
                  <a href="/employee/claims" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    💬 Traiter Réclamations
                  </a>
                  <a href="/employee/stats" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    📈 Statistiques
                  </a>
                </>
              )}
              
              {selectedRole === 'etudiant' && (
                <>
                  <a href="/student" className={`py-3 px-6 rounded-lg font-medium text-center text-white bg-gradient-to-r ${currentRole.color} hover:shadow-lg transition-all block`}>
                    🏠 Page d'Accueil
                  </a>
                  <a href="/student/menu" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    🍽️ Commander
                  </a>
                  <a href="/student/orders" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    📦 Mes Commandes
                  </a>
                  <a href="/student/loyalty" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    ⭐ Programme Fidélité
                  </a>
                  <a href="/student/profile" className="py-3 px-6 rounded-lg font-medium text-center text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all block">
                    👤 Mon Profil
                  </a>
                </>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️ <strong>Mode Démonstration:</strong> Vous pouvez accéder à ces pages sans authentification.
                Les protections sont désactivées pour cette démo.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-12 bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Comparaison des Rôles
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 text-gray-700 font-bold">Fonctionnalité</th>
                    <th className="text-center py-4 px-6 text-purple-600 font-bold">Admin</th>
                    <th className="text-center py-4 px-6 text-blue-600 font-bold">Gérant</th>
                    <th className="text-center py-4 px-6 text-green-600 font-bold">Employé</th>
                    <th className="text-center py-4 px-6 text-orange-600 font-bold">Étudiant</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Gestion utilisateurs', admin: '✅', gerant: '✅', employe: '❌', etudiant: '❌' },
                    { name: 'Voir les commandes', admin: '✅', gerant: '✅', employe: '✅', etudiant: '✅' },
                    { name: 'Modifier les produits', admin: '✅', gerant: '✅', employe: '❌', etudiant: '❌' },
                    { name: 'Statistiques avancées', admin: '✅', gerant: '✅', employe: '❌', etudiant: '❌' },
                    { name: 'Traiter réclamations', admin: '✅', gerant: '✅', employe: '✅', etudiant: '❌' },
                    { name: 'Programme fidélité', admin: '✅', gerant: '✅', employe: '❌', etudiant: '✅' },
                    { name: 'Passer commandes', admin: '✅', gerant: '✅', employe: '❌', etudiant: '✅' },
                    { name: 'Configuration système', admin: '✅', gerant: '❌', employe: '❌', etudiant: '❌' },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-gray-700 font-medium">{row.name}</td>
                      <td className="text-center py-4 px-6 text-2xl">{row.admin}</td>
                      <td className="text-center py-4 px-6 text-2xl">{row.gerant}</td>
                      <td className="text-center py-4 px-6 text-2xl">{row.employe}</td>
                      <td className="text-center py-4 px-6 text-2xl">{row.etudiant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            💡 Cette page est uniquement à but démonstratif. 
            En production, les accès sont strictement contrôlés selon les rôles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Demo;
