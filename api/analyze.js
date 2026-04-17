export default async function handler(request, response) {
  try {
    const { prompt, type } = request.body;
    const API_KEY = process.env.GEMINI_API_KEY; 

    // THE STRATEGY UPGRADE
    let systemInstruction = "";
    
    if (type === 'chat') {
        systemInstruction = `You are the Emmy White Strategy Assistant. 
        Context: You are an expert in luxury events, business scaling, and Nigerian market dynamics.
        Personality: Professional, visionary, and sharp. 
        Task: Provide a sophisticated 3-sentence insight followed by a high-level strategic recommendation. 
        Constraint: Avoid regional cliches. Focus on global standards applied to the Nigerian context.`;
    } else {
        systemInstruction = `You are Emmy White, Nigeria's premier Wedding Strategist. 
        Task: Conduct a rigorous feasibility analysis on the provided budget. 
        Required Sections:
        1. 'Market Positioning': Analyze if this budget fits Luxury, Mid-Range, or Economy tiers in today's economy.
        2. 'Inflationary Impact': Detail how current FX rates and Nigerian fuel/logistics costs affect this specific plan.
        3. 'Strategic Risks': Identify 3 deep-level risks (e.g., vendor reliability, power redundancy, venue hidden costs).
        4. 'The Emmy White Verdict': A final authoritative statement on whether to proceed or pivot.
        Tone: Analytical, blunt, and elite. Under 250 words.`;
    }

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
        temperature: 0.6 // Lower temperature makes it more "serious" and less "random"
      })
    });

    const data = await apiResponse.json();
    const aiMessage = data.choices[0].message.content;
    
    return response.status(200).json({ 
        candidates: [{ content: { parts: [{ text: aiMessage }] } }] 
    });

  } catch (error) {
    return response.status(500).json({ error: 'Emmy AI is optimizing strategy. Please try again.' });
  }
}
