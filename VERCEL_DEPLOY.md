# Vercel 部署指南

## 🚀 快速部署（5 分钟）

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 `ppwr-compliance-checker` 仓库
   - 点击 "Import"

3. **配置环境变量**
   - 在 "Environment Variables" 部分添加：
   
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://bwppbyaglpamxawumqfr.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cHBieWFnbHBhbXhhd3VtcWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDIxODQsImV4cCI6MjA5MjYxODE4NH0.CJ-cgmqp-qqZy5bNeyZToEGlvjH7yP6ehMbL8LLFuC0` |

4. **部署**
   - 点击 "Deploy"
   - 等待 1-2 分钟
   - 部署完成后会生成一个 URL

---

### 方法二：通过 CLI

```bash
cd /root/.openclaw/workspace/ppwr-compliance-checker

# 登录 Vercel
vercel login

# 部署（生产环境）
vercel --prod
```

---

## 🔧 配置环境变量（CLI 方式）

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 输入：https://bwppbyaglpamxawumqfr.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 输入：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 部署后检查清单

- [ ] 访问部署 URL，确认页面正常加载
- [ ] 点击"登录/注册"，测试注册流程
- [ ] 注册成功后，填写表单并点击"开始检查"
- [ ] 检查记录是否保存到 Supabase
- [ ] 在 Supabase Dashboard 查看数据

---

## 🌐 自定义域名（可选）

1. 在 Vercel Dashboard → 项目设置 → Domains
2. 添加你的域名（如 `ppwr.yourdomain.com`）
3. 配置 DNS 记录（CNAME 或 A 记录）

---

## 💰 费用

- **Hobby 计划**：免费（个人/非商用）
- **Pro 计划**：$20/月（商业用途）

⚠️ 注意：如果用于获客/商业目的，建议使用 Pro 计划。
