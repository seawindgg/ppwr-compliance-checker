import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserProfile = {
  id: string
  name: string
  company: string
  email: string
  product_category: string
  created_at: string
}

export type CheckRecord = {
  id: string
  user_id: string
  product_name: string
  product_category: string
  packaging_type: string
  material: string
  void_space_percent: number | null
  overall_status: string
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  created_at: string
}
