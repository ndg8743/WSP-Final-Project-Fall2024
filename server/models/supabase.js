require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

module.exports = {
  getConnection() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase URL or Secret Key is not defined in environment variables");
      throw new Error("Supabase URL or Secret Key is not defined in environment variables");
    }

    console.log("Initializing Supabase client with URL:", supabaseUrl);
    return createClient(supabaseUrl, supabaseKey);
  },
};
