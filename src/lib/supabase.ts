import { createClient } from '@supabase/supabase-js';

// These would normally be in .env
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Since this is a demo, we are using a mock state in AppContext.
 * To integrate real Supabase, you would replace the state logic with these calls:
 * 
 * 1. Fetch Products:
 *    const { data: products } = await supabase.from('products').select('*');
 * 
 * 2. Purchase:
 *    const { error } = await supabase.from('orders').insert({ user_id, product_id });
 * 
 * 3. Submit Review & Reward:
 *    // Use a Postgres Function (RPC) to handle the review insertion and coin update atomically
 *    const { error } = await supabase.rpc('submit_review_and_reward', { 
 *      p_product_id: pid, 
 *      p_rating: r, 
 *      p_comment: c 
 *    });
 */
