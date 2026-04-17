export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const ip = request.headers["x-forwarded-for"] || request.socket.remoteAddress;

  if (!rateLimit(ip)) {
    return response.status(429).json({ error: "Too many requests." });
  }

  try {
    const { prompt } = request.body || {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return response.status(400).json({ error: "Invalid message." });
    }

    if (prompt.length > 2000) {
      return response.status(400).json({ error: "Message too long." });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return response.status(500).json({ error: "Server config error." });
    }

    const systemInstruction = `
You are Emmy White, an elite Nigerian wedding strategist.

IMPORTANT:
Always respond in JSON format:
{
  "type": "advice | budget | timeline | vendor | general",
  "content": "your response"
}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const apiResponse = await fetchWithRetry(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemInstruction.trim() },
            { role: "user", content: prompt.trim() },
          ],
          temperature: 0.2,
          max_tokens: 200,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!apiResponse.ok) {
      return response.status(502).json({ error: "Provider error." });
    }

    const data = await apiResponse.json();
    const aiMessage = data?.choices?.[0]?.message?.content?.trim();

    if (!aiMessage) {
      return response.status(502).json({ error: "Empty AI response." });
    }

    let parsed;

    try {
      parsed = JSON.parse(aiMessage);
    } catch {
      return response.status(502).json({
        error: "AI format error",
        raw: aiMessage, // helpful for debugging
      });
    }

    return response.status(200).json(parsed);

  } catch (error) {
    if (error.name === "AbortError") {
      return response.status(504).json({ error: "Timeout." });
    }

    return response.status(500).json({ error: "Server error." });
  }
}
