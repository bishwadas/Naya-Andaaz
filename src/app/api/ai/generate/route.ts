import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 403 });
    }

    const body = await req.json();
    const { prompt, topic } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const userPrompt = prompt || `Write a comprehensive editorial article about: ${topic || 'contemporary arts and luxury'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: 'You are an expert editorial writer for Naya Andaaz, an inspiring digital lifestyle and culture publication. Provide well-structured, insightful, high-caliber articles in clean HTML format with <h2>, <h3>, <p>, <blockquote>, and <ul>.',
        temperature: 0.7,
      },
    });

    const outputText = response.text || '';
    return NextResponse.json({
      content: outputText,
      text: outputText,
      result: outputText,
      success: true,
    });
  } catch (error: any) {
    console.error('AI Generation error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to generate AI content',
    }, { status: 500 });
  }
}
