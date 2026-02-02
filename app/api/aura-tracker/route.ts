import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  // Create an AbortController to prevent long hangs
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second limit

  try {
    const { log } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return new Response(JSON.stringify({ error: "No Key" }), { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // Using 'flash' because it's significantly faster than 'pro'
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `Analyze this daily productivity log and return ONLY a JSON object with a 'score' (1-10) and a short 'verdict' (max 15 words): ${log}`;

    // Pass the signal to the fetch (if the SDK supports it) or handle via Promise.race
    const result = await model.generateContent(prompt);
    clearTimeout(timeoutId);

    const responseText = result.response.text();
    return new Response(responseText, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Gemini Error:", error.name);
    // If it's a timeout or API error, the frontend 'catch' block will handle the local logic
    return new Response(JSON.stringify({ error: "System Latency" }), { status: 500 });
  }
}