import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { vibe } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Generate a color palette based on the vibe: "${vibe}". 
    Return ONLY a JSON array of 5 hex codes. No talk, just the array.
    Example: ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF"]`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    // Clean the AI text to make sure it's valid JSON
    const hexArray = JSON.parse(rawText.match(/\[.*\]/s)[0]);
    
    return NextResponse.json({ colors: hexArray });

  } catch (error) {
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}