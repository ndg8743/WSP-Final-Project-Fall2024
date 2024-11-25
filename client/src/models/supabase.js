const {createClient} = require('@supabase/supabase-js')

module.exports = {
    getConnection() {
        const supabaseUrl = process.env.SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SECRET_KEY
        const supabase = createClient(supabaseUrl, supabaseKey)
        return supabase
    }
}