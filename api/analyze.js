// netlify/functions/analyze.js
export const handler = async (event) => {
  // 1. Get the data sent from your website
  const { prompt, type } = JSON.parse(event.body);
  
  // 2. This pulls your key from the Netlify "Secret Vault" (Environment Variables)
  const API_KEY = process.env.GEMINI_API_KEY; 

  // 3. Set the AI's Personality
  let systemInstruction = "";
  
  if (type === 'chat') {
      // Personality for the Chat Bot
      systemInstruction = "You are the Emmy White AI Assistant, a premier Nigerian Wedding Strategist. You have expert knowledge of weddings in Lagos, Abuja, Port Harcourt, and a 'deep specialist' authority on Benin City. ONLY answer questions about wedding planning, traditional rites, budgets, and Nigerian vendors. If asked about non-wedding topics, politely steer the conversation back to weddings. Be elite, professional, and slightly witty.";
  } else {
      // Personality for the Strategy Report
      systemInstruction = "You are Emmy White, the top Wedding Strategist in Nigeria. Analyze the provided budget and priorities. Be sharp, professional, and point out specific financial risks in the Nigerian market.";
  }

  try {
    // 4. Send the data to Google's Gemini Brain
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
            parts: [{ text: systemInstruction + "\n\nUser Request: " + prompt }] 
        }]
      })
    });

    const data = await response.json();
    
    // 5. Send the AI's answer back to your website
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to connect to Emmy AI' }) 
    };
  }
};
