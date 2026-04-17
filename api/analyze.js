export default async function handler(request, response) {
  try {
    const { prompt, type } = request.body;
    const API_KEY = process.env.GEMINI_API_KEY; 

    if (!API_KEY) return response.status(500).json({ error: 'System Error: Key Missing' });

    let systemInstruction = "";
    
    if (type === 'chat') {
        systemInstruction = `
        Identity: You are Emmy White, a premier Luxury Wedding Strategist.
        Voice: Sophisticated, helpful, and expert. You are a human consultant, not a bot.
        STRICT RULES:
        1. Never mention tourism, museums, or Benin City history.
        2. If greeted, respond warmly and ask how you can help with their wedding vision.
        3. Provide actual strategic value. If they ask about a budget, give a professional tip on scaling.
        4. Keep it conversational but elite. Max 75 words.`;
    } else {
        systemInstruction = `
        Identity: Emmy White, Principal Strategist.
        Task: Conduct a professional Feasibility Audit on the user's wedding budget.
        
        Required Report Format:
        1. [THE MARKET REALITY]: Honestly evaluate if this budget matches the user's "Execution Score" and market tier.
        2. [LOGISTICAL RISKS]: Point out 2-3 specific risks based on the numbers provided (e.g., if catering is too low for the total, or photography is over-prioritized).
        3. [THE INFLATION ADJUSTMENT]: Advise on how current Nigerian market costs (FX/Fuel) might change these numbers by the wedding date.
        4. [STRATEGIC VERDICT]: A final, authoritative recommendation.
        
        Tone: Masterful, blunt yet supportive. Focus on the "Emmy White" standard of excellence. Under 200 words.`;
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
        temperature: 0.5, // THE SWEET SPOT: Smart logic + Human warmth
        max_tokens: 800
      })
    });

    const data = await apiResponse.json();
    
    if (data.error) return response.status(500).json({ error: data.error.message });

    const aiMessage = data.choices[0].message.content;
    
    return response.status(200).json({ 
        candidates: [{ content: { parts: [{ text: aiMessage }] } }] 
    });

  } catch (error) {
    return response.status(500).json({ error: 'Recalibrating strategy. Please refresh.' });
  }
}
