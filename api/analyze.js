export default async function handler(request, response) {
  try {
    const { prompt, type } = request.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    let systemInstruction = "";
    
    if (type === 'chat') {
        systemInstruction = `You are the Emmy White AI Assistant. 
        Personality: Elite, slightly witty, Benin City expert. 
        Rule: Provide a smart, 2-sentence response followed by a single helpful tip. 
        Constraint: Maximum 70 words.`;
    } else {
        systemInstruction = `You are Emmy White, Nigeria's premier Wedding Strategist. 
        Task: Analyze the budget provided. 
        Format: 
        1. 'Executive Summary' (2 sentences on the overall feasibility).
        2. 'Strategic Risks' (3 short bullet points focusing on Nigerian inflation, vendor quality, and venue logistics).
        Constraint: Be sharp and authoritative. Total response must be under 160 words to ensure fast delivery.`;
    }

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
            parts: [{ text: systemInstruction + "\n\nUser Data: " + prompt }] 
        }]
      })
    });

    const data = await apiResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: 'Emmy AI is currently optimizing. Please try again.' });
  }
}
