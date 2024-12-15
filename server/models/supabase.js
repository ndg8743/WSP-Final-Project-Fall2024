require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

/**
 * Custom error class for database configuration issues
 */
class DatabaseConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseConfigError';
  }
}

let supabaseClient = null;

/**
 * Gets or creates a Supabase client instance
 * @returns {import('@supabase/supabase-js').SupabaseClient} The Supabase client
 * @throws {DatabaseConfigError} If environment variables are not properly configured
 */
function getConnection() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new DatabaseConfigError(
      'Supabase URL and Secret Key must be defined in environment variables'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

module.exports = {
  getConnection,
  DatabaseConfigError
};
