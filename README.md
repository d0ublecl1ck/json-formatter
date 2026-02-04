# JSON Formatter

一个以 **Vercel 风格** 打磨体验的 JSON 工具：**实时格式化 / 压缩 / 排序 / 折叠查看 / 搜索 / 复制 / 去除转义**，支持移动端与桌面端。

> 默认本地处理：你粘贴的 JSON 不会被上传到服务器。

## ✨ Features

- 实时格式化：输入后自动解析并在右侧输出
- 搜索：关键字高亮，`Enter` / `Shift + Enter` 跳转上一处/下一处
- 全屏：仅显示格式化结果（再点还原）
- 折叠：支持按“层级”自动折叠（可输入 1–7），并可手动展开/收起
- 排序：递归按 key 排序（适合 diff）
- 压缩：把格式化后的 JSON **压缩并回填**到左侧输入框（便于复制粘贴）
- 复制：一键复制格式化结果
- 去除转义：对常见 `\"`、`\n`、`\uXXXX` 等做“宽松反转义”，并回填

## 🧱 Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Monaco Editor (`@monaco-editor/react`)
- Lucide Icons
- Sonner (toast)
- Vitest (unit tests)

## 🚀 Getting Started

### 1) 安装依赖

```bash
pnpm install
```

### 2) 本地开发

```bash
pnpm dev
```

打开 `http://localhost:3000`。

## 🧪 Scripts

```bash
pnpm lint
pnpm test
pnpm build
pnpm start
```

## ⚙️ Environment Variables (Optional)

你可以创建 `.env.local`：

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GITHUB_URL=https://github.com/d0ublecl1ck/json-formatter
```

- `NEXT_PUBLIC_SITE_URL`：用于 `metadataBase`、`/sitemap.xml`、`/robots.txt`
- `NEXT_PUBLIC_GITHUB_URL`：页头 GitHub 按钮跳转地址

## 🔒 Privacy

项目默认不上传输入内容；更多说明见站内隐私页面：`/privacy`。

## 🤝 Contributing

欢迎贡献：提 Issue / 提 PR 都可以。

建议在提交前运行：`pnpm lint && pnpm test`。

## 📦 Deploy

推荐使用 Vercel 部署（零配置）。

## 📝 Notes

- 为了避免默认 CDN，本项目会在安装依赖后把 Monaco 静态资源复制到 `public/monaco/vs`（已在 `.gitignore` 中忽略）。
