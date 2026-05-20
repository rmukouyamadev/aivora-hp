/* ===== チャットボット ===== */
const chatbot = document.getElementById('chatbot');
const toggle = document.getElementById('chatbotToggle');
const panel = document.getElementById('chatbotPanel');
const messagesEl = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSend');

let history = [];
let isLoading = false;

toggle.addEventListener('click', () => {
  chatbot.classList.toggle('open');
  if (chatbot.classList.contains('open')) input.focus();
});

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `chatbot__message chatbot__message--${role}`;
  const p = document.createElement('p');
  p.innerHTML = text.replace(/\n/g, '<br>');
  div.appendChild(p);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function showTyping() {
  const div = addMessage('入力中...', 'bot chatbot__message--typing');
  return div;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text || isLoading) return;

  input.value = '';
  isLoading = true;
  sendBtn.disabled = true;

  addMessage(text, 'user');
  history.push({ role: 'user', content: text });

  const typing = showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    // JSONでないレスポンス（エラーページ等）にも対応
    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      typing.remove();
      addMessage('申し訳ありません。エラーが発生しました。しばらくしてから再度お試しください。', 'bot');
      return;
    }

    typing.remove();

    if (!res.ok || data.error) {
      addMessage(data.error || '申し訳ありません。エラーが発生しました。しばらくしてから再度お試しください。', 'bot');
    } else {
      addMessage(data.content, 'bot');
      history.push({ role: 'assistant', content: data.content });
    }
  } catch {
    typing.remove();
    addMessage('通信エラーが発生しました。ページを再読み込みしてお試しください。', 'bot');
  }

  isLoading = false;
  sendBtn.disabled = false;
  input.focus();
}
