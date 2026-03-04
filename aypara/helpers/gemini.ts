import { File } from 'expo-file-system';

// TODO: Replace with your actual Gemini API Key or use an environment variable
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

export type AnalyzeResult = {
    title: string;
    date?: string;
    error?: 'missing_key' | 'rate_limit' | 'network_error' | 'parse_error' | 'unknown';
};

export const analyzeAudio = async (uri: string): Promise<AnalyzeResult | null> => {
    if (!GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing!");
        return { title: '', error: 'missing_key' };
    }

    try {
        const file = new File(uri);
        const base64Audio = await file.base64();

        const body = {
            contents: [
                {
                    parts: [
                        {
                            text: `You are an expert multilingual task extractor. Listen to the audio and extract the task.
                            The user will speak in Azerbaijani, English, or Russian.

                            CURRENT LOCAL TIME: ${new Date().toLocaleString('en-US', { hour12: false })}
                            TODAY IS: ${new Date().toDateString()}

                            CRITICAL RULES (STRICT COMPLIANCE REQUIRED):
                            1. **NO TRANSLATION**: The "title" MUST be in the EXACT language the user spoke. 
                               - If user says: "Sabah saat 5-də idmana get" -> title: "idmana get"
                               - NEVER translate to English or Russian if the user speaks Azerbaijani.
                            
                            2. **AZERBAIJANI LANGUAGE NUANCES**: 
                               - "Sabah" = Tomorrow
                               - "Birisi gün" = Day after tomorrow
                               - "Gələn həftə" = Next week
                               - "Axşam" = Evening (usually 18:00-21:00)
                               - "Günorta" = Afternoon (usually 13:00-15:00)

                            3. **DATE CALCULATION**: Use the CURRENT LOCAL TIME provided above to calculate relative dates. Return a full ISO 8601 string for the "date" field.

                            4. **OUTPUT FORMAT**: Return ONLY a valid JSON object. No markdown blocks.
                            
                            EXPECTED JSON STRUCTURE:
                            { 
                                "title": "Original language task description", 
                                "date": "ISO_8601_STRING_OR_NULL" 
                            }

                            EXAMPLES:
                            - User: "Axşam evə gələndə çörək al" 
                              Result: {"title": "çörək al", "date": "2026-02-16T19:00:00.000Z"}
                            - User: "Sabah saat 10-da iclas var" 
                              Result: {"title": "iclas var", "date": "2026-02-17T10:00:00.000Z"}`
                        },
                        {
                            inline_data: {
                                mime_type: "audio/m4a",
                                data: base64Audio
                            }
                        }
                    ]
                }
            ]
        };

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("Gemini API Error:", response.status, errorText);
            if (response.status === 429) return { title: '', error: 'rate_limit' };
            return { title: '', error: 'network_error' };
        }

        const result = await response.json();
        console.log("Gemini Response:", JSON.stringify(result, null, 2));

        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts) {
            const text = result.candidates[0].content.parts[0].text;
            try {
                // Find JSON object boundaries in case the model adds extra text
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : text;
                const parsed = JSON.parse(jsonStr);
                return { ...parsed, error: undefined };
            } catch (jsonError) {
                console.error("JSON parsing error:", jsonError, text);
                return { title: '', error: 'parse_error' };
            }
        }
        return { title: '', error: 'unknown' };

    } catch (error) {
        console.error("Gemini analysis error:", error);
        return { title: '', error: 'network_error' };
    }
};
