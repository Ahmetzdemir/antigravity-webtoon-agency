import { NextResponse } from 'next/server';
import { processImageSlice } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: 'Missing imageBase64 or mimeType in request body' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
       return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    // Process the image slice using the Translation Skill (Gemini)
    const result = await processImageSlice(imageBase64, mimeType);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Translation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during translation' },
      { status: 500 }
    );
  }
}

// Increase max duration for Vercel/Next.js edge cases if necessary
// export const maxDuration = 60;
