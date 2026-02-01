import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { image, flavor } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a UI Alchemist. Convert this screenshot into a single-file Tailwind CSS component.
      STYLE FLAVOR: ${flavor}
      
      RULES:
      - Use ONLY Tailwind CSS.
      - If icons are needed, use simple colored <div> shapes.
      - Return ONLY raw HTML/Tailwind. No markdown backticks.
    `;

    const imageData = {
      inlineData: { data: image.split(",")[1], mimeType: "image/png" },
    };

    // Use generateContentStream instead of generateContent
    const result = await model.generateContentStream([prompt, imageData]);
    
    // Create a ReadableStream to pipe to the frontend
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}