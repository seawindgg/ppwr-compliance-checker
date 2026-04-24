# Supabase 配置指南

## 🚀 快速设置（5 分钟）

### 1. 创建 Supabase 项目

1. 访问 https://supabase.com
2. 注册/登录账号
3. 点击 "New Project"
4. 填写：
   - **Project name**: `ppwr-compliance-checker`
   - **Database Password**: 自动生成（记住它！）
   - **Region**: 选择最近的（Singapore 或 Amsterdam）
5. 点击 "Create new project"

### 2. 获取 API 密钥

1. 进入项目 Dashboard
2. 点击左侧菜单 **Project Settings** → **API**
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 配置环境变量

编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 创建数据库表

1. 在 Supabase Dashboard 点击 **SQL Editor**
2. 复制 `supabase-schema.sql` 的全部内容
3. 粘贴并点击 **Run**
4. 确认表创建成功

### 5. 配置认证

1. 点击左侧菜单 **Authentication** → **Providers**
2. 确保 **Email** 已启用
3. 点击 **Email** 配置：
   - ✅ 启用邮箱确认（推荐）
   - 或者禁用以简化注册流程

### 6. 测试

```bash
npm run dev
```

访问 http://localhost:3000，点击"登录/注册"测试流程。

---

## 📊 数据库表结构

### user_profiles（用户档案）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户 ID（关联 auth.users） |
| name | TEXT | 姓名 |
| company | TEXT | 公司名称 |
| email | TEXT | 邮箱 |
| product_category | TEXT | 主要产品类别 |
| created_at | TIMESTAMP | 注册时间 |

### check_records（检查记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 记录 ID |
| user_id | UUID | 用户 ID |
| product_name | TEXT | 产品名称 |
| product_category | TEXT | 产品类别 |
| packaging_type | TEXT | 包装类型 |
| material | TEXT | 材质 |
| void_space_percent | INTEGER | 空隙率 |
| overall_status | TEXT | 合规状态（compliant/warning/non_compliant） |
| high_risk_count | INTEGER | 高风险数量 |
| medium_risk_count | INTEGER | 中风险数量 |
| low_risk_count | INTEGER | 低风险数量 |
| created_at | TIMESTAMP | 检查时间 |

---

## 🔒 安全说明

- ✅ 已启用行级安全（RLS）
- ✅ 用户只能查看自己的数据
- ✅ 使用 anon key（前端安全）
- ✅ 密码加密存储（Supabase 自动处理）

---

## 💰 费用

- **免费计划**：
  - 50,000 月活用户
  - 500MB 数据库
  - 足够 MVP 使用

- **超出后**：
  - Pro 计划 $25/月
  - 按需付费

---

## 📈 后续优化

1. **邮箱通知**：集成 Resend 发送检查报告
2. **数据分析**：在 Supabase Dashboard 查看用户行为
3. **导出功能**：导出用户列表为 CSV
4. **合规咨询**：根据用户公司/产品类别自动发送针对性建议
