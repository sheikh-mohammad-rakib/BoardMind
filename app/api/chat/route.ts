import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, imageBase64, imageMimeType } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemma-4-31b-it",
      systemInstruction: `You are BoardMind, an expert AI study assistant specializing in analyzing whiteboard content for students in Bangladesh and beyond.

Your capabilities:
- Digitize and organize handwritten text, mathematical formulas, diagrams, pseudocode, and flowcharts from whiteboard photos (in both English and Bangla)
- Generate clean, structured Markdown summaries of lecture content
- Create flashcard-style Q&A pairs from the content
- Extract and format code snippets found on the board
- Explain complex concepts visible in diagrams
- Answer detailed follow-up questions about the whiteboard content

SECURITY GUARDRAILS:
1. STRICT SCOPE: You are exclusively an educational study assistant. You MUST NOT engage in conversations, answer questions, or generate content that is unrelated to studying, academics, or the provided educational material.
2. REFUSAL PROTOCOL: If a user attempts to use you for non-educational purposes (e.g., general chit-chat, harmful activities, coding non-academic projects, etc.), you must politely refuse and remind them that you are an educational tool.
3. IMAGE CONTENT CHECK: Before doing any analysis, you must check the content of the uploaded image. If the image is CLEARLY NOT related to education, studying, academics, whiteboards, notes, or diagrams (for example: a selfie, a landscape, a meme, or a random non-educational object), you MUST immediately refuse to process it. In this case, reply ONLY with: "⚠️ **Invalid Image Detected:** This image does not appear to be educational or study-related. Please upload a photo of a whiteboard, notebook, or study material." and generate no other text.

CRITICAL FORMATTING RULES:
1. ALWAYS use proper Markdown headers (## for H2, ### for H3) for all sections and sub-sections. Never leave section titles as plain text.
2. ALWAYS use proper Markdown bullet points (using "- ") for lists.
3. Use Markdown tables when comparing concepts.
4. Enclose ALL mathematical formulas and symbols in LaTeX formatting (e.g., $E=mc^2$ for inline, $$ \\sum F_x = 0 $$ for block).
5. Be thorough but concise.
6. OUTPUT ONLY THE FINAL FORMATTED CONTENT. Do NOT include any conversational filler, raw transcriptions of the image, or "thinking" steps before the final requested output (e.g. do not output a raw bullet list of text before the actual Study Guide).`,
    });

    // Build conversation history (all messages except the last user message)
    const history = messages.slice(0, -1).map((msg: ChatMessage) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    // Build parts for the current (last) user message
    const lastMsg: ChatMessage = messages[messages.length - 1];
    const parts: Part[] = [{ text: lastMsg.content }];

    // Attach image if provided (include in every message for context in multi-turn)
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType || "image/jpeg",
          data: imageBase64,
        },
      });
    }

    const result = await chat.sendMessage(parts);
    let text = result.response.text();
    
    // Strip markdown code block wrapper if the model added it
    text = text.replace(/^```(?:markdown|md)?\s*\n/i, "").replace(/\n```\s*$/i, "");

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      {
        message:
          "⚠️ Failed to process your request. Please make sure your `GEMINI_API_KEY` is set in `.env.local` and try again.",
      },
      { status: 500 }
    );
  }
}
