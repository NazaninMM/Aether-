import { GoogleGenAI } from '@google/genai'
import { type NextRequest } from 'next/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? ''

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You generate short, personal, motivating daily intentions for a goal-planning app. Each one should feel like a quiet personal commitment — specific enough to feel real, not generic. One sentence, no quotes, no em dashes.\n\nGenerate a single motivating daily intention for ${date || 'today'}. Make it feel grounded and personal — something like "Show up fully for the conversations that matter today" or "Do one hard thing before noon." Just the sentence, nothing else.`,
    })

    const text = response.text?.trim() ?? ''
    return Response.json({ sentence: text })
  } catch {
    return Response.json({ sentence: '' }, { status: 500 })
  }
}
