# PPWR 包装合规检查工具

🇪🇺 帮助中国企业快速评估产品包装是否符合欧盟 PPWR 法规 (Regulation EU 2025/40)

**在线演示**: [即将部署到 Vercel]

## 🎯 功能特性

### ✅ 核心功能

- **材质合规检查** - 自动评估包装材质的可回收等级 (A/B/C/D/E)
- **再生含量计算** - 检查塑料包装的再生料含量是否符合 2030/2040 目标
- **空余空间评估** - 计算包装空余空间是否超过 50% 限制
- **PFAS 风险检测** - 评估总 PFAS 含量是否超过 50ppm 阈值
- **可堆肥要求** - 检查茶包、咖啡包、水果标签的可堆肥性
- **DRS 押金系统** - 识别需要符合 DRS 要求的饮料包装

### 📊 输出报告

- 红/黄/绿三色风险等级
- 详细合规检查结果
- 具体改进建议
- 材质和包装类型分析

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 自动部署完成

```bash
# 构建生产版本
npm run build

# 本地预览生产版本
npm start
```

## 📋 检查项目

### 2030 年生效要求

- [x] 可回收等级 A/B/C (2038 年起仅 A/B)
- [x] 塑料再生含量 (PET 30%, 其他 10-35%)
- [x] 空余空间 ≤ 50%

### 2028 年生效要求

- [x] 茶包/咖啡包可工业堆肥
- [x] 水果/蔬菜标签可堆肥

### 即时生效要求

- [x] PFAS 含量 ≤ 50ppm
- [x] DRS 押金回收系统 (饮料包装)

## 🛠️ 技术栈

- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS
- **类型**: TypeScript
- **部署**: Vercel

## 📁 项目结构

```
ppwr-compliance-checker/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 主页面 (表单 + 报告)
│   │   └── api/
│   │       └── check/
│   │           └── route.ts      # 合规检查 API
│   └── lib/
│       ├── ppwr-rules.ts         # PPWR 法规规则库
│       └── compliance-calculator.ts  # 合规检查计算器
├── public/
└── package.json
```

## 📖 PPWR 法规背景

**Packaging and Packaging Waste Regulation (PPWR)**
- **法规编号**: Regulation (EU) 2025/40
- **生效日期**: 2025 年 2 月 11 日
- **适用日期**: 2026 年 8 月 12 日起
- **官方链接**: [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2025/40/oj/eng)

### 关键时间节点

- **2026 年 8 月** - 合规证明和技术文档必须就绪
- **2028 年 2 月** - 茶包/咖啡包/水果标签必须可堆肥
- **2030 年 1 月** - 仅允许 A/B/C 级可回收包装
- **2038 年 1 月** - 仅允许 A/B 级可回收包装

## ⚠️ 免责声明

本工具提供的检查结果仅供参考，不构成法律意见。PPWR 法规复杂且可能更新，建议在正式出口前咨询专业合规顾问或第三方检测机构。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

- GitHub Issues: [提交问题](https://github.com/yourusername/ppwr-compliance-checker/issues)
- 邮箱：[待添加]

---

**Made with ❤️ for Chinese exporters**
