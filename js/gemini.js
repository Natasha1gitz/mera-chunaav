// ============================================
// Mera Chunaav — Gemini API Module
// Streaming chat + quiz scoring
// ============================================

const GeminiModule = {
  getSystemPrompt() {
    const c = AppState.constituency;
    if (!c) return 'You are Mera Chunaav, a civic education guide for Indian elections.';
    const winner = c.candidates.find(x => x.winner);
    return `You are a knowledgeable, warm, and neutral civic guide called "Mera Chunaav".
User context: constituency = [${c.name}], state = [${c.state}],
2024 turnout = ${c.turnout['2024']}%, total electors = ${formatIndianNumber(c.electors.total)}, women electors = ${c.womenElectors}%,
winning margin = ${formatIndianNumber(c.winningMargin)}, sitting MP = ${winner?.name || 'N/A'}, party = ${winner?.party || 'N/A'},
sitting MP criminal cases = ${winner?.criminalCases || 0}, sitting MP assets = ₹${winner?.assets || 0} Cr,
user persona = [${AppState.persona || 'General'}], language preference = [${AppState.language === 'hi' ? 'Hindi' : 'English'}].
Answer their question using this real data where relevant. Be factual and non-partisan. Keep answers concise (under 200 words).`;
  },

  async streamChat(userMessage) {
    const apiKey = window.CONFIG?.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') throw new Error('No API key');

    const model = window.CONFIG?.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = [
      { role: 'user', parts: [{ text: this.getSystemPrompt() }] },
      { role: 'model', parts: [{ text: 'Understood. I am Mera Chunaav, ready to help with election-related questions.' }] },
      ...AppState.conversationHistory.slice(-window.CONFIG?.MAX_CHAT_HISTORY || -20),
      { role: 'user', parts: [{ text: sanitizeHTML(userMessage) }] }
    ];

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 512 } })
    });

    if (!resp.ok) throw new Error(`Gemini API error: ${resp.status}`);

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
              fullResponse += text;
              AiGuideView.onStreamToken(text);
            }
          } catch (e) { /* skip malformed JSON */ }
        }
      }
    }

    AiGuideView.onStreamEnd();
    return fullResponse;
  },

  async scoreQuizAnswer(question, userAnswer, correctAnswer) {
    const apiKey = window.CONFIG?.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return { correct: userAnswer === correctAnswer, explanation: 'Demo mode — connect Gemini API for detailed explanations.', points: userAnswer === correctAnswer ? 10 : 0 };
    }

    const model = window.CONFIG?.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Question: ${question}\nUser answered: ${userAnswer}\nCorrect answer: ${correctAnswer}\nRespond in JSON: {"correct": bool, "explanation": "brief explanation", "points": number (10 if correct, 0 if wrong)}` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 }
      })
    });

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    try {
      return JSON.parse(text.replace(/```json\n?/g, '').replace(/```/g, '').trim());
    } catch {
      return { correct: false, explanation: text, points: 0 };
    }
  }
};
