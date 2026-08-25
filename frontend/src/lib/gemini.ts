'use client';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
  : '';

export async function generateWithGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!GEMINI_ENDPOINT) return '';
  try {
    const contents: any[] = [];
    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: systemInstruction }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const res = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Gemini API request failed, using fallback:', errText);
      return '';
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || '';
  } catch (err) {
    console.warn('Gemini API fetch error:', err);
    return '';
  }
}
