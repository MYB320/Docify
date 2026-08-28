"use server";

import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type AiAction =
  | "improve"
  | "fix_grammar"
  | "summarize"
  | "make_longer"
  | "make_shorter"
  | "change_tone"
  | "translate"
  | "continue_writing"
  | "custom";

export interface AiRequest {
  action: AiAction;
  text: string;
  context?: string;
  tone?: "professional" | "casual" | "academic" | "friendly" | "persuasive";
  language?: string;
  customPrompt?: string;
}

export interface AiResponse {
  result?: string;
  error?: {
    message: string;
  };
}

export async function generateAiContent(
  req: AiRequest
): Promise<AiResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_CLIENT_SECRET; // or check GEMINI_API_KEY

    if (!apiKey) {
      return {
        error: {
          message:
            "GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to your .env file.",
        },
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    let prompt = "";
    switch (req.action) {
      case "improve":
        prompt = `You are an expert editor. Improve the following text for clarity, flow, vocabulary, and readability. Keep the core meaning intact. Output only the improved text with clean semantic HTML tags (e.g. <p>, <strong>, <em>, <ul>, <li>, <h3>) where appropriate, without enclosing markdown code fences.\n\nText to improve:\n${req.text}`;
        break;

      case "fix_grammar":
        prompt = `You are a professional copyeditor. Fix all grammar, spelling, punctuation, and typographical errors in the following text. Do not alter the tone or stylistic choice unnecessarily. Output only the corrected text with clean semantic HTML tags without enclosing markdown code fences.\n\nText:\n${req.text}`;
        break;

      case "summarize":
        prompt = `Summarize the following text concisely, highlighting the key points, main conclusions, and action items. Output only the summary in clean HTML format without enclosing markdown code fences.\n\nText to summarize:\n${req.text}`;
        break;

      case "make_longer":
        prompt = `Expand the following text by adding relevant details, context, depth, and explanatory examples while maintaining a natural flow and the original voice. Output only the expanded text in clean HTML format without enclosing markdown code fences.\n\nText:\n${req.text}`;
        break;

      case "make_shorter":
        prompt = `Make the following text more concise and punchy without losing essential meaning. Remove fluff and redundancies. Output only the shortened text in clean HTML format without enclosing markdown code fences.\n\nText:\n${req.text}`;
        break;

      case "change_tone":
        prompt = `Rewrite the following text with a ${req.tone || "professional"} tone. Ensure the vocabulary and sentence rhythm match this tone. Output only the rewritten text in clean HTML format without enclosing markdown code fences.\n\nText:\n${req.text}`;
        break;

      case "translate":
        prompt = `Translate the following text accurately and naturally into ${req.language || "English"}. Maintain original formatting and tone. Output only the translated text in clean HTML format without enclosing markdown code fences.\n\nText:\n${req.text}`;
        break;

      case "continue_writing":
        prompt = `Continue writing smoothly from where the following text left off, adding logical next paragraphs or sections that follow the existing context. Output only the continuation in clean HTML format without enclosing markdown code fences.\n\nPreceding context:\n${req.text}`;
        break;

      case "custom":
        prompt = `Follow this user instruction: "${req.customPrompt}".\nApply this instruction to the following text:\n${req.text}\n\nOutput only the result in clean semantic HTML tags without enclosing markdown code fences.`;
        break;

      default:
        prompt = `Improve the following text:\n${req.text}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let outputText = response.text || "";

    // Strip markdown fences if any returned (e.g. ```html ... ```)
    outputText = outputText
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    return { result: outputText };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "AI generation failed. Please try again.",
      },
    };
  }
}
