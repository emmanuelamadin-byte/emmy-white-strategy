export default async function handler(request, response) {
  try {
    const { prompt, type } = request.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // Check if the key even exists in Vercel
    if (!API_KEY) {
        return response.status(500).json({ error: 'System Error: GEMINI_API_KEY is missing in Vercel settings.' });
    }

    let systemInstruction = "";
    if (type === 'chat') {
        systemInstruction = "You are Emmy White AI. Be elite and concise (under 60 words).";
    } else {
        systemInstruction = "You are Emmy White, Wedding Strategist. Analyze this budget for feasibility in Nigeria. Under 150 words.";
    }

    const targetUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;

    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
            parts: [{ text: systemInstruction + "\n\nUser Data: " + prompt }] 
        }]
      })
    });

    const data = await apiResponse.json();

    // If Google sends back an error, show us what it is!
    if (data.error) {
        return response.status(500).json({ error: "Google API Error: " + data.error.message });
    }

    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: 'Emmy AI is optimizing. Error: ' + error.message });
  }
}
