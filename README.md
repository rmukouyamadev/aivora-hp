# Aivora コーポレートサイト（チャットボット付き）

AI 企業 Aivora 向けのコーポレート LP。サービス紹介・料金・FAQ に加え、Claude API を用いた埋め込みチャットボットを搭載。

🌐 **ライブデモ：** https://aivora-hp.vercel.app

## 機能

- レスポンシブ対応のコーポレート LP（スマートフォン・タブレット・PC 対応）
- スクロールアニメーション・FAQ アコーディオン・ハンバーガーメニュー
- Claude API を使ったリアルタイムチャットボット（サービス案内・問い合わせ対応）
- Vercel サーバーレス関数でバックエンド API を構成

## 技術スタック

| カテゴリ | 採用技術 |
|---------|---------|
| フロントエンド | HTML / CSS / JavaScript |
| バックエンド | Node.js（サーバーレス関数） |
| AI | Anthropic API（チャットボット） |
| インフラ | Vercel（静的ホスティング + API Routes） |

## セットアップ・起動

```bash
cd site
npm install
npm start
```

`.env` に以下を設定（リポジトリには含めない）：

```
ANTHROPIC_API_KEY=...
```
