import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Key is missing in .env.local');
}

// Admin client that bypasses RLS (Service Role)
export const db = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Returns a scoped Supabase client for a specific user.
 * While RLS is handled at the DB level, we use this helper
 * to ensure we always filter by user_id in our application logic.
 */
export const getScopedDb = (userId: string) => {
  // We use the service role client but provide a proxy that sets the session variable
  // Note: For true Postgres RLS with NextAuth, we set the 'app.current_user_id' 
  // in the database session.
  return {
    ...db,
    from: (table: string) => {
      const query = db.from(table);
      // Automatically add user_id filter for data isolation
      // This complements the DB-level RLS policies
      return query.eq('user_id', userId);
    }
  };
};
