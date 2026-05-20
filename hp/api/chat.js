const Anthropic = require('@anthropic-ai/sdk');

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

【料金】
- 基本プラン（AI導入コンサルティング）：月額9,800円
- オプション
  ・業務フロー自動化：月額12,800円〜
  ・チャットボット構築：月額9,800円〜
  ・AIツール研修：応相談

【営業時間・連絡先】
- 営業時間：平日 9:00〜17:00
- メール：support@aivora.co.jp

【対応方針】
- 丁寧・親しみやすく、専門用語を避けてわかりやすく説明する
- 料金を聞かれた場合は上記の料金情報をもとに正確に回答する
- 営業時間外の問い合わせにはメールでの連絡を案内する
- 詳細な相談には「まずは無料相談をご利用ください」と案内する
- 回答は簡潔に、200文字以内を目安にする
- Aivora以外の会社や競合の話題は避ける`;

module.exports = async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  // 入力バリデーション
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages が必要です' });
  }
  if (messages.length > 20) {
    return res.status(400).json({ error: 'メッセージ履歴が長すぎます' });
  }
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg?.content || typeof lastMsg.content !== 'string' || lastMsg.content.length > 1000) {
    return res.status(400).json({ error: 'メッセージは1000文字以内で入力してください' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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
};
