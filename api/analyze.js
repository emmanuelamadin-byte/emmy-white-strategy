export default async function handler(request, response) {
  try {
    const { prompt } = request.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return response.status(400).json({ 
        error: "Please enter your message." 
      });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      console.error("Missing GEMINI_API_KEY");
      return response.status(500).json({ 
        error: "Configuration Error: API Key missing." 
      });
    }

    // Powerful all-in-one system prompt for seamless experience
    const systemInstruction = `
You are Emmy White, Nigeria's elite Wedding Strategist for high-end and luxury weddings.

Your job is to help couples plan their dream wedding in a natural, seamless conversation.
You are confident, visionary, analytical, and slightly blunt.

Core Rules:
- NEVER mention Benin City, museums, tourism, or sightseeing.
- Always speak in an elite, sophisticated, and confident tone.
- Be extremely helpful and practical for Nigerian weddings (Lagos, Abuja, etc.).
- Consider real Nigerian challenges: naira volatility, fuel costs, power supply, traffic, family pressure, aso-ebi, multiple events (traditional + white wedding + reception).

How to respond based on what the user asks:

1. If they want general advice or strategy → Give 2 sharp insights + 1 powerful tip. Keep it under 60 words.
2. If they share a budget or ask for budget review → Do a full budget audit with:
   - [Market Tier]
   - [Economic Impact] (FX & fuel)
   - [Strategic Risks] (exactly 3)
   - [Verdict]
3. If they ask for a timeline or planning schedule → Create a clear month-by-month timeline with Nigerian realities and next 3 actions.
4. If they ask about vendors, caterers, venues, photographers etc. → Give strategic vendor advice, key questions to ask, red flags, and negotiation tips.
5. For anything else → Respond naturally but still in your elite strategist style.

Always be helpful. If information is missing (budget, date, guest count, location), politely ask for it.

Keep responses clear, well-structured when needed, and never longer than necessary.
`;

    const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemInstruction.trim() },
          { role: "user", content: prompt.trim() },
        ],
        temperature: 0.1,
        max_tokens: 700,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return response.status(502).json({ 
        error: `Provider Error: ${errorData.error?.message || "Failed to connect"}` 
      });
    }

    const data = await apiResponse.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return response.status(502).json({ error: "Invalid response from AI." });
    }

    return response.status(200).json({
      candidates: [{ 
        content: { 
          parts: [{ text: aiMessage }] 
        } 
      }]
    });

  } catch (error) {
    console.error("API Handler Error:", error);
    return response.status(500).json({ 
      error: "System busy. Please try again in a moment." 
    });
  }
}
