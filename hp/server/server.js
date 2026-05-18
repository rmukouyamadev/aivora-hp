const express = require('express');
const path = require('path');
// .env を UTF-8 で明示的に読み込む
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.trim().split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
}
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());

// .env・機密ファイルへのHTTPアクセスをブロック
app.use((req, res, next) => {
  if (/\.(env|key|pem|secret)$/i.test(req.path) || req.path.includes('/.')) {
    return res.status(403).end();
  }
  next();
});

app.use(express.static(path.join(__dirname, '..')));

const SYSTEM_PROMPT = `あなたはAivoraのAIアシスタントです。Aivoraは「AIを活用した業務効率化コンサルティング」を提供する会社です。

【会社概要】
- 社名：Aivora（アイボラ）
- サービス：AI導入コンサルティング（伴走型・月額制）
- ターゲット：業務効率化を求める経営者・管理職

【提供サービス】
1. AI導入コンサルティング（メイン）：現状ヒアリングから導入・定着まで伴走
2. 業務フロー自動化：書類処理・メール対応・データ集計の自動化
3. チャットボット構築：社内FAQ・顧客問い合わせ対応の自動化
4. AIツール研修：ChatGPT等のAIツール活用研修

【対応方針】
- 丁寧・親しみやすく、専門用語を避けてわかりやすく説明する
- 問い合わせや相談には「まずは無料相談をご利用ください」と案内する
- 料金は「お問い合わせください」と案内する
- 回答は簡潔に、200文字以内を目安にする
- Aivora以外の会社や競合の話題は避ける`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages が必要です' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });
    res.json({ content: response.content[0].text });
  } catch (err) {
    console.error('Claude API エラー:', err.message);
    res.status(500).json({ error: 'エラーが発生しました。しばらくしてから再度お試しください。' });
  }
});

app.listen(PORT, () => {
  console.log(`Aivora サーバー起動中: http://localhost:${PORT}`);
});
