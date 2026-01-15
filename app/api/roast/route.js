import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { resumeText } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 🎯 SUCCESS: Using the exact model name found in your region
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `You are a brutal, sarcastic tech recruiter. Roast this resume text in under 150 words. Be funny but helpful. Use emojis. Resume: ${resumeText}` }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const roastText = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply: roastText });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ 
      reply: "The AI is having a moment. Error: " + error.message 
    }, { status: 500 });
  }
}