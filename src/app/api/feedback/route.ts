import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// URL del Apps Script desplegado
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "";

export async function POST(req: Request) {
    try {
        console.log("1. Feedback received");
        const body = await req.json();
        const { type, category, description, contact } = body;

        // 1. AI Analysis with Gemini - Análisis mejorado con porcentaje de sentimiento
        console.log("2. Starting AI analysis");
        let aiResponse = {
            sentimentPercent: 50,
            sentimentLabel: "Neutral",
            analysis: "Error de IA o Cuota excedida",
            recommendations: [] as string[]
        };

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
Eres un analista de experiencia del paciente en un hospital. Analiza el siguiente comentario y proporciona:

1. **Porcentaje de Sentimiento** (0-100%): 
   - 0-30%: Muy negativo (queja grave, insatisfacción alta)
   - 31-50%: Negativo (problemas identificables)
   - 51-70%: Neutral o mixto
   - 71-85%: Positivo (satisfacción general)
   - 86-100%: Muy positivo (felicitación, excelente experiencia)

2. **Etiqueta de Sentimiento**: Una palabra que resuma el sentimiento (ej: "Muy Insatisfecho", "Insatisfecho", "Neutral", "Satisfecho", "Muy Satisfecho")

3. **Análisis breve**: Resumen de 1-2 oraciones del comentario.

4. **Recomendaciones para el personal** (2-4 recomendaciones específicas y accionables):
   - Deben ser claras y aplicables por el personal del hospital
   - Enfocadas en mejorar la experiencia del paciente
   - Basadas específicamente en los problemas o elogios mencionados

**Comentario a analizar:**
- Tipo: ${type}
- Categoría: ${category}
- Descripción: ${description}

Responde ÚNICAMENTE con este JSON (sin texto adicional):
{
  "sentimentPercent": <número 0-100>,
  "sentimentLabel": "<etiqueta>",
  "analysis": "<análisis breve>",
  "recommendations": ["<recomendación 1>", "<recomendación 2>", ...]
}
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
            console.log("3. AI response received:", text);
            aiResponse = JSON.parse(text);
        } catch (aiError: any) {
            console.error("AI Analysis failed (proceeding without it):", aiError.message);
        }

        // 2. Enviar datos a Google Apps Script
        console.log("4. Sending data to Apps Script");
        const payload = {
            type,
            category,
            description,
            contact: {
                name: contact?.name || "Anónimo",
                phone: contact?.phone || "N/A"
            },
            sentiment: `${aiResponse.sentimentPercent}% - ${aiResponse.sentimentLabel}`,
            recommendations: Array.isArray(aiResponse.recommendations)
                ? aiResponse.recommendations.join(". ")
                : aiResponse.recommendations || ""
        };

        console.log("5. Payload:", JSON.stringify(payload));

        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        console.log("6. Apps Script response:", responseText);

        let appsScriptResult;
        try {
            appsScriptResult = JSON.parse(responseText);
        } catch {
            appsScriptResult = { success: response.ok, raw: responseText };
        }

        if (!response.ok || appsScriptResult.success === false) {
            throw new Error(appsScriptResult.error || "Error al guardar en Google Sheets via Apps Script");
        }

        console.log("7. Data saved successfully");
        return new Response(JSON.stringify({ success: true, ai: aiResponse }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("CRITICAL ERROR in feedback API:", error.message, error.stack);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
