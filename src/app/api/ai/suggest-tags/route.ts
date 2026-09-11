import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        tags: ['Contemporary Design', 'Haute Horlogerie', 'Architecture', 'Sereia Curated'],
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Suggest 5 relevant taxonomy tags for this article title: "${title}" and content snippet: "${content?.slice(0, 300)}". Return ONLY a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const tags = JSON.parse(response.text || '[]');
    return NextResponse.json({ tags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
