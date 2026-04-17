export default async function handler(request, response) {
  try {
    const { prompt, type } = request.body;
    // This will pull your Groq key from Vercel
    const API_KEY = process.env.GEMINI_API_KEY; 

    const systemInstruction = type === 'chat' 
        ? "You are Emmy White AI. Elite, witty, Benin City expert. 2 sentences + 1 tip. Max 70 words." 
        : "You are Emmy White, Wedding Strategist. Analyze this budget for Nigeria. 1. Executive Summary (2 sentences). 2. Strategic Risks (3 bullets). Max 160 words.";

    // We are now calling Groq's super-fast Llama 3 model
    const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await apiResponse.json();

    if (data.error) {
        return response.status(500).json({ error: "Groq Error: " + data.error.message });
    }

    // TRANSLATION LAYER: We turn Groq's answer into the format your website expects
    const aiMessage = data.choices[0].message.content;
    const formattedResponse = { 
        candidates: [{ content: { parts: [{ text: aiMessage }] } }] 
    };

    return response.status(200).json(formattedResponse);

  } catch (error) {
    return response.status(500).json({ error: 'Emmy AI is optimizing. Error: ' + error.message });
  }
}
