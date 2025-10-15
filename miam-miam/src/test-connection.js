import { supabase } from './lib/supabase.js'

async function testConnection() {
    try {
        // Test 1: Récupérer les catégories
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
        
        if (error) throw error
        
        console.log('✅ Connexion réussie!')
        console.log('Catégories:', categories)
        
        // Test 2: Récupérer les paramètres
        const { data: params } = await supabase
            .from('parametres')
            .select('*')
        
        console.log('Paramètres:', params)
        
    } catch (error) {
        console.error('❌ Erreur:', error.message)
    }
}

testConnection()