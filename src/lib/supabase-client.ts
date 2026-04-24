import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url') {
      console.warn('⚠️ Supabase 未配置，请设置 .env.local 文件')
      // 返回一个模拟客户端，避免构建失败
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          signUp: async () => ({ data: { user: null }, error: new Error('Supabase 未配置') }),
          signInWithPassword: async () => ({ error: new Error('Supabase 未配置') }),
          signOut: async () => {},
        },
        from: () => ({
          select: async () => ({ data: [], error: null }),
          insert: async () => ({ data: null, error: null }),
        }),
      } as any
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

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
