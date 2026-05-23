const API_BASE = "http://localhost:3000";

const chatBox = document.getElementById('chat-box-area');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const fileInput = document.getElementById('file-upload-input');
const uploadBtn = document.getElementById('upload-trigger-btn');
const filePreview = document.getElementById('file-preview-box');
const previewName = document.getElementById('preview-file-name');
const previewIcon = document.getElementById('preview-file-icon');
const removeFileBtn = document.getElementById('remove-file-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const sendBtn = document.getElementById('send-chat-btn');

// State percakapan
let conversationHistory = [];
let selectedFile = null;

// Mengatur trigger upload file
uploadBtn.addEventListener('click', () => {
  fileInput.click();
});

// Menangani pemilihan file
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile = file;
  previewName.textContent = file.name;
  
  // Menentukan ikon preview berdasarkan tipe file
  if (file.type.startsWith('image/')) {
    previewIcon.textContent = '🖼️';
  } else if (file.type.startsWith('audio/')) {
    previewIcon.textContent = '🎵';
  } else if (file.type === 'application/pdf') {
    previewIcon.textContent = '📄';
  } else {
    previewIcon.textContent = '📁';
  }

  filePreview.classList.remove('hidden');
  userInput.focus();
});

// Menghapus file terpilih
removeFileBtn.addEventListener('click', () => {
  clearSelectedFile();
});

function clearSelectedFile() {
  selectedFile = null;
  fileInput.value = '';
  filePreview.classList.add('hidden');
}

// Mulai ulang percakapan
clearChatBtn.addEventListener('click', () => {
  conversationHistory = [];
  clearSelectedFile();
  
  // Hapus semua pesan kecuali welcome-message
  const welcomeMessage = document.getElementById('welcome-msg-element');
  chatBox.innerHTML = '';
  if (welcomeMessage) {
    chatBox.appendChild(welcomeMessage);
  }
});

// Form submit handler
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const messageText = userInput.value.trim();
  if (!messageText && !selectedFile) return;

  // Nonaktifkan form agar tidak terjadi double submit
  setFormDisabled(true);

  // Tampilkan pesan user ke UI
  let userDisplayMessage = messageText;
  if (selectedFile) {
    userDisplayMessage = `📎 [Berkas: ${selectedFile.name}] ${messageText}`.trim();
  }
  appendMessage('user', userDisplayMessage);

  // Kosongkan input teks
  userInput.value = '';

  // Tambahkan bubble loading "thinking" secara langsung
  const thinkingBubble = appendThinkingBubble();

  try {
    let responseText = "";

    if (selectedFile) {
      // Kirim file ke endpoint /generate-from-file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('prompt', messageText);

      const res = await fetch(`${API_BASE}/generate-from-file`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error (status: ${res.status})`);
      }

      const data = await res.json();
      responseText = data.result;

      // Masukkan ke history agar giliran teks berikutnya model memiliki konteks file ini
      conversationHistory.push({
        role: "user",
        text: `[User mengunggah file bernama "${selectedFile.name}"] ${messageText}`.trim()
      });
      conversationHistory.push({
        role: "model",
        text: responseText
      });

      // Bersihkan file yang diunggah
      clearSelectedFile();
    } else {
      // Kirim riwayat percakapan ke /generate-text
      conversationHistory.push({
        role: "user",
        text: messageText
      });

      const res = await fetch(`${API_BASE}/generate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversation: conversationHistory })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error (status: ${res.status})`);
      }

      const data = await res.json();
      responseText = data.result;

      conversationHistory.push({
        role: "model",
        text: responseText
      });
    }

    // Ganti bubble thinking dengan respons sukses
    updateThinkingBubble(thinkingBubble, responseText, false);

  } catch (error) {
    console.error("[AgroBot] Gagal mengambil respons:", error);
    // Hapus pesan terakhir dari history jika gagal (supaya percakapan tidak rancu)
    if (!selectedFile && conversationHistory.length > 0) {
      conversationHistory.pop();
    }
    // Ganti bubble thinking dengan error message
    updateThinkingBubble(thinkingBubble, "Maaf, terjadi gangguan. Silakan coba beberapa saat lagi atau pastikan server AgroBot sedang aktif.", true);
  } finally {
    setFormDisabled(false);
  }
});

// Menambahkan balon chat ke dalam box
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  
  const content = document.createElement('div');
  content.classList.add('message-content');
  
  if (sender === 'bot') {
    // Render markdown sederhana
    content.innerHTML = parseMarkdown(text);
  } else {
    content.textContent = text;
  }

  msg.appendChild(content);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Menambahkan loading bubble
function appendThinkingBubble() {
  const msg = document.createElement('div');
  msg.classList.add('message', 'bot', 'thinking-bubble');
  msg.innerHTML = `
    <div class="message-content">
      <span class="thinking-text">AgroBot sedang menganalisis</span>
      <span class="thinking-dot-container">
        <span class="thinking-dot"></span>
        <span class="thinking-dot"></span>
        <span class="thinking-dot"></span>
      </span>
    </div>
  `;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

// Mengganti isi balon loading secara dinamis
function updateThinkingBubble(bubbleElement, text, isError = false) {
  bubbleElement.innerHTML = '';
  bubbleElement.classList.remove('thinking-bubble');
  
  if (isError) {
    bubbleElement.classList.add('error');
  }

  const content = document.createElement('div');
  content.classList.add('message-content');
  
  if (isError) {
    content.textContent = text;
  } else {
    content.innerHTML = parseMarkdown(text);
  }

  bubbleElement.appendChild(content);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Mengaktifkan/menonaktifkan form
function setFormDisabled(disabled) {
  userInput.disabled = disabled;
  fileInput.disabled = disabled;
  uploadBtn.disabled = disabled;
  sendBtn.disabled = disabled;
  clearChatBtn.disabled = disabled;
}

// Parser markdown sederhana untuk menampilkan format teks lebih rapi
function parseMarkdown(text) {
  let html = text;

  // Escaping HTML dasar
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (pre/code)
  html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');

  // Lists
  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // Paragraphs
  html = html.split('\n\n').map(p => {
    if (p.trim().startsWith('<pre>') || p.trim().startsWith('<ul>') || p.trim().startsWith('<li>')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}
