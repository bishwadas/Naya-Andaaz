import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const { prompt, action, topic } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'GEMINI_API_KEY is not configured. Please set the key in settings or environment.',
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    let systemInstruction = 'You are an expert editorial AI writing assistant for Naya Andaaz, an inspiring digital lifestyle magazine and news portal. Return concise, high-impact journalism content.';
    let userPrompt = prompt || '';

    if (action === 'generate_title') {
      userPrompt = `Generate 5 compelling, modern editorial headlines and SEO titles for an article about: "${topic || prompt}". Return a clean JSON array of strings or list.`;
    } else if (action === 'generate_summary') {
      userPrompt = `Write a punchy, 2-sentence journalistic excerpt and meta description for the following article draft:\n\n${prompt}`;
    } else if (action === 'generate_tags') {
      userPrompt = `Suggest 6 relevant, high-traffic magazine tags for an article with this title and content: "${topic || prompt}". Return only comma-separated tag names.`;
    } else if (action === 'generate_faqs') {
      userPrompt = `Generate 3 frequently asked questions (FAQ) and clear answers based on this article topic: "${topic || prompt}". Format as JSON: [{"question": "...", "answer": "..."}]`;
    } else if (action === 'improve_content') {
      userPrompt = `Polish, format with journalistic tone and improve readability of this article draft while preserving core facts:\n\n${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || '';
    return NextResponse.json({
      success: true,
      result: outputText,
    });
  } catch (error: any) {
    console.error('AI Generation error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to generate AI content',
    }, { status: 500 });
  }
}
