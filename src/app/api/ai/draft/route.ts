import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const { topic, tone = 'Haute / Sophisticated Editorial', category = 'Culture' } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // High-quality fallback if no API key in environment
      return NextResponse.json({
        title: `The Architecture of Modernity: Dissecting ${topic || 'Contemporary Design'}`,
        slug: `${(topic || 'contemporary-design').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        excerpt: `An insightful inquiry into the aesthetic, cultural, and philosophical shifts surrounding ${topic || 'modern arts'}.`,
        content: `<h2>The Zenith of Contemporary Craft</h2><p>In an epoch characterized by rapid digital velocity, ${topic || 'haute curation'} commands a deliberate return to permanence, tactile mastery, and architectural clarity.</p><p>Dissecting the nuanced intersections of material honesty and vanguard vision reveals how modern practitioners are reshaping the cultural dialogue.</p>`,
        metaTitle: `${topic || 'Editorial Focus'} | Sereia Gazette`,
        metaDescription: `An authoritative analysis exploring ${topic || 'contemporary luxury and craftsmanship'} in the modern era.`,
        faq: [
          { question: `What distinguishes modern ${topic || 'craft'}?`, answer: 'The union of heritage savoir-faire with progressive architectural precision.' },
        ],
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the editor-in-chief of Sereia, a luxury haute publication covering fashion, horology, culture, and architecture.
Write a comprehensive article draft about: "${topic}". Tone: ${tone}. Category: ${category}.
Return ONLY a valid JSON object with keys:
"title" (string),
"slug" (url friendly slug),
"excerpt" (1-2 sentences),
"content" (HTML string with <h2>, <p>, <blockquote>, <ul>),
"metaTitle" (string under 60 chars),
"metaDescription" (string under 160 chars),
"suggestedTags" (array of 3-5 strings),
"faq" (array of 2 objects with "question" and "answer")`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI generation failed' }, { status: 500 });
  }
}
