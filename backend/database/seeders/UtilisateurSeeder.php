<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

class UtilisateurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🌱 Seeding utilisateurs...\n";

        // Create staff users (Admin, Gérant, Employé)
        $staffUsers = [
            [
                'nom' => 'Admin',
                'prenom' => 'System',
                'email' => 'admin@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '+237690000001',
                'localisation' => 'ZeDuc@Space - Bureau',
                'points_fidelite' => 0,
                'code_parrainage' => 'ADMIN1234',
                'id_parrain' => null,
                'id_role' => 4, // Administrateur
                'statut_compte' => true,
            ],
            [
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'email' => 'gerant@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '+237690000002',
                'localisation' => 'ZeDuc@Space',
                'points_fidelite' => 0,
                'code_parrainage' => 'GERANT123',
                'id_parrain' => null,
                'id_role' => 3, // Gérant
                'statut_compte' => true,
            ],
            [
                'nom' => 'Martin',
                'prenom' => 'Sophie',
                'email' => 'employe@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '+237690000003',
                'localisation' => 'ZeDuc@Space - Cuisine',
                'points_fidelite' => 0,
                'code_parrainage' => 'EMPLOYE123',
                'id_parrain' => null,
                'id_role' => 3, // Employé
                'statut_compte' => true,
            ],
        ];

        // Create student/customer users with realistic data
        $studentUsers = [
            [
                'nom' => 'Nguyen',
                'prenom' => 'Marie',
                'email' => 'etudiant@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '+237690000004',
                'localisation' => 'Campus A - Résidence',
                'points_fidelite' => 150,
                'code_parrainage' => 'MARIE2024',
                'id_parrain' => null,
                'id_role' => 4, // Étudiant
                'statut_compte' => true,
            ],
            [
                'nom' => 'Kamga',
                'prenom' => 'Paul',
                'email' => 'paul.kamga@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '+237690000005',
                'localisation' => 'Campus B - Douala',
                'points_fidelite' => 320,
                'code_parrainage' => 'PAUL2024',
                'id_parrain' => null,
                'id_role' => 4,
                'statut_compte' => true,
            ],
            [
                'nom' => 'Mbida',
                'prenom' => 'Alice',
                'email' => 'alice.mbida@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '+237690000006',
                'localisation' => 'Campus C - Yaoundé',
                'points_fidelite' => 75,
                'code_parrainage' => 'ALICE2024',
                'id_parrain' => null,
                'id_role' => 4,
                'statut_compte' => true,
            ],
            [
                'nom' => 'Tchoumi',
                'prenom' => 'David',
                'email' => 'david.tchoumi@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '+237690000007',
                'localisation' => 'Campus A - Bloc 3',
                'points_fidelite' => 500,
                'code_parrainage' => 'DAVID2024',
                'id_parrain' => null,
                'id_role' => 4,
                'statut_compte' => true,
            ],
            [
                'nom' => 'Fotso',
                'prenom' => 'Emilie',
                'email' => 'emilie.fotso@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '+237690000008',
                'localisation' => 'Campus B - Résidence Universitaire',
                'points_fidelite' => 200,
                'code_parrainage' => 'EMILIE2024',
                'id_parrain' => null,
                'id_role' => 4,
                'statut_compte' => true,
            ],
        ];

        // Insert staff users
        foreach ($staffUsers as $user) {
            Utilisateur::create($user);
            echo "  ✓ Created staff: {$user['prenom']} {$user['nom']} ({$user['email']})\n";
        }

        // Insert student users and set up referral system
        $firstStudent = Utilisateur::create($studentUsers[0]);
        echo "  ✓ Created student: {$studentUsers[0]['prenom']} {$studentUsers[0]['nom']} ({$studentUsers[0]['email']})\n";

        // Create remaining students with Marie as referrer for some
        for ($i = 1; $i < count($studentUsers); $i++) {
            // Paul and Alice are referred by Marie
            if ($i <= 2) {
                $studentUsers[$i]['id_parrain'] = $firstStudent->id_utilisateur;
            }
            
            $user = Utilisateur::create($studentUsers[$i]);
            echo "  ✓ Created student: {$studentUsers[$i]['prenom']} {$studentUsers[$i]['nom']} ({$studentUsers[$i]['email']})";
            
            if (isset($studentUsers[$i]['id_parrain'])) {
                echo " [Parrainé par Marie]";
            }
            echo "\n";
        }

        echo "✅ Seeded " . count($staffUsers) . " staff and " . count($studentUsers) . " students\n";
        echo "📧 All passwords: password\n";
    }
}