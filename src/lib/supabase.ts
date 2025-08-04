import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gzjwbvfaqtxjbggdgzlj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6andidmZhcXR4amJnZ2RnemxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzQ0MDEsImV4cCI6MjA2NjkxMDQwMX0.Abv6FuCyVnuwFds-e_fBpzhzEWdZl0T5NLWhptYIAWE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);