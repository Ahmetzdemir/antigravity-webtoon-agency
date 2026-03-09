import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize the Gemini client
// Note: This requires GEMINI_API_KEY in .env.local
const ai = new GoogleGenAI({});

export interface TranslatedText {
  type: string;
  box_2d: number[];
  original_text: string;
  translated_text: string;
  confidence: number;
}

export interface TranslationResult {
  texts: TranslatedText[];
}

// Define the structured output schema for the translation skill
const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    texts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The type of text detected (speech, thought, sfx, narrative)",
          },
          box_2d: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Bounding box coordinates in format [ymin, xmin, ymax, xmax] scaled 0-1000",
          },
          original_text: {
            type: Type.STRING,
            description: "The original text detected in the image",
          },
          translated_text: {
            type: Type.STRING,
            description: "The natural, idiomatic Turkish translation of the text",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0 and 1",
          },
        },
        required: ["type", "box_2d", "original_text", "translated_text", "confidence"],
      },
      description: "List of all text elements detected in the webtoon panel",
    },
  },
  required: ["texts"],
};

const SYSTEM_PROMPT = `You are an expert, professional Webtoon and Manhwa translator working for a premium agency.
Your task is to analyze the provided image (a slice of a manhwa chapter), identify all text (speech bubbles, thought bubbles, narrative text, and sound effects), and translate it into natural, idiomatic Turkish.
CRITICAL RULES:
1. Do not use robotic language. Adapt slang, idioms, and expressions to sound like a professional Turkish manga/webtoon translation.
2. For sound effects (SFX) or exclamations (e.g., "Gasp!", "Sigh..."), use appropriate Turkish equivalents (e.g., "Ah!", "Hıh...", "İç çeker").
3. Detect the bounding box for each text block. Return coordinates as [ymin, xmin, ymax, xmax] normalized to a 0-1000 scale.`;

/**
 * Calls Gemini Pro Vision to extract and translate text from an image slice.
 */
export async function processImageSlice(base64Image: string, mimeType: string): Promise<TranslationResult> {
  const model = "gemini-2.5-pro"; // Using the latest multimodal model

  // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Extract and translate all text in this webtoon panel." },
            { 
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: translationSchema,
        temperature: 0.2, // Low temp for more accurate structured extraction
      }
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini API");
    }

    return JSON.parse(response.text) as TranslationResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
