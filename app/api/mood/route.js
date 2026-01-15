import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { moodDescription } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `User is feeling: "${moodDescription}". 
    Provide a productive and wise response in strictly JSON format.
    Include:
    1. "perspective": A short, wise perspective-shift (Naseeha).
    2. "actionPlan": An array of 3 actionable, productive steps to improve their state.
    3. "focusTask": One specific "Deep Work" task they can do for 25 minutes.
    
    Keep the tone calm, professional, and encouraging. No music/forbidden content.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const cleanedText = rawText.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanedText));

  } catch (error) {
    return NextResponse.json({ error: "System busy. Take a deep breath." }, { status: 500 });
  }
}