
import { GoogleGenAI } from "@google/genai";
import { GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Edit an image using Gemini 2.5 Flash Image
 */
export async function editInventoryImage(base64Image: string, prompt: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: 'image/png',
            },
          },
          { text: `Lakukan pengeditan gambar sesuai permintaan berikut (dalam konteks inventaris logistik): ${prompt}` },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image editing error:", error);
    throw error;
  }
}

/**
 * Get market insights using Gemini 3 Flash Preview with Search Grounding
 */
export async function getMarketInsights(query: string): Promise<{ text: string; sources: GroundingSource[] }> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan analisis pasar dan logistik yang detail dalam Bahasa Indonesia untuk query: ${query}. Fokus pada harga terkini (gunakan Rupiah jika relevan), ketersediaan stok global, dan tren rantai pasokan. Gunakan format yang rapi.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Tidak ada wawasan yang ditemukan.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Sumber",
        uri: chunk.web?.uri || "#"
      }));

    return { text, sources };
  } catch (error) {
    console.error("Market insights error:", error);
    throw error;
  }
}
