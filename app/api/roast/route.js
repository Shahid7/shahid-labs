import { NextResponse } from "next/server";
const pdf = require('pdf-parse-fork');

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // --- MODE 1: PDF UPLOAD (Just extract text) ---
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get('file');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const pdfData = await pdf(buffer);
      
      // We return the TEXT only. No AI call yet!
      return NextResponse.json({ text: pdfData.text });
    }

    // --- MODE 2: JSON REQUEST (Perform the Roast) ---
    const body = await req.json();
    const { resumeText } = body;

    if (!resumeText) {
      return NextResponse.json({ reply: "I need text to roast!" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `You are a brutal, sarcastic career coach. Analyze the field and roast this resume text in under 150 words. Be funny but helpful. Use emojis. resume: ${resumeText}` }]
        }]
      })
    });

    const data = await aiResponse.json();

    if (data.error) throw new Error(data.error.message);

    const roastText = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply: roastText });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ reply: "Error: " + error.message }, { status: 500 });
  }
}