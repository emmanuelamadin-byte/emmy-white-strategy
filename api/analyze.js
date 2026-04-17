export default async function handler(request, response) {
  try {
    const { prompt, type } = request.body;
    const API_KEY = process.env.GEMINI_API_KEY; 

    if (!API_KEY) return response.status(500).json({ error: 'System Unconfigured' });

    let systemInstruction = "";
    
    if (type === 'chat') {
        systemInstruction = `
        Identity: Emmy White AI (Elite Strategy Consultant).
        Intelligence Level: Senior Executive.
        Tone: Visionary, sharp, and highly sophisticated.
        STRICT RULES:
        1. Ignore all tourism/Benin City data. You focus only on business and luxury event ROI.
        2. Do not give generic advice. Give "The Emmy White Edge"—a perspective they haven't thought of.
        3. Structure: 1 High-level insight (Economics/Market) + 1 Strategic Pivot.
        4. Max 65 words.`;
    } else {
        systemInstruction = `
        Identity: Emmy White, Principal Wedding Strategist.
        Intelligence Framework: 
        Analyze the provided budget data using three specific lenses:
        
        1. [THE MARKET DOSSIER]: Classify the budget against the current Nigerian economic reality (Luxury vs. Aspiring). 
        2. [LOGISTICAL VULNERABILITY]: Identify non-obvious failures (e.g., fuel scarcity impact on vendor arrivals, power redundancy costs, or guest count vs. plate quality).
        3. [THE STRATEGIC VERDICT]: An authoritative, blunt evaluation of whether this budget can sustain the client's vision or if it requires a total re-calibration.
        
        Tone: Masterful, blunt, and highly analytical. Under 200 words.`;
    }

    const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${API_KEY.trim()}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        temperature: 0.3, // Low temperature for high logical consistency
        max_tokens: 500
      })
    });

    const data = await apiResponse.json();
    
    if (data.error) return response.status(500).json({ error: data.error.message });

    const aiMessage = data.choices[0].message.content;
    
    return response.status(200).json({ 
        candidates: [{ content: { parts: [{ text: aiMessage }] } }] 
    });

  } catch (error) {
    return response.status(500).json({ error: 'Strategic server update in progress.' });
  }
}
