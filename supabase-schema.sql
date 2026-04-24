-- PPWR 合规检查工具 - Supabase 数据库 Schema
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 1. 用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  product_category TEXT NOT NULL DEFAULT 'food',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 检查记录表
CREATE TABLE IF NOT EXISTS check_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  packaging_type TEXT NOT NULL,
  material TEXT NOT NULL,
  void_space_percent INTEGER,
  overall_status TEXT NOT NULL CHECK (overall_status IN ('compliant', 'warning', 'non_compliant')),
  high_risk_count INTEGER DEFAULT 0,
  medium_risk_count INTEGER DEFAULT 0,
  low_risk_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_check_records_user_id ON check_records(user_id);
CREATE INDEX IF NOT EXISTS idx_check_records_created_at ON check_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company ON user_profiles(company);

-- 4. 行级安全策略 (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_records ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和编辑自己的档案
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 用户只能查看自己的检查记录
CREATE POLICY "Users can view own check records"
  ON check_records FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建检查记录
CREATE POLICY "Users can create check records"
  ON check_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. 自动创建用户档案的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, name, company, email, product_category)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'product_category', 'food')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 监听用户注册事件
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
