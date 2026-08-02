export async function invokeGroq(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false,
  maxRetries = 2,
  timeoutMs = 15000
): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  // Default model if GROQ_MODEL isn't set
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  console.log("Using Groq model:", model);

  const payload: Record<string, any> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
  };

  if (jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = await response.text();

      if (!response.ok) {
        if (response.status >= 500 && attempt <= maxRetries) {
           console.warn(`Groq 5xx error, retrying attempt ${attempt}...`);
           await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
           continue;
        }
        console.error("Groq Response Error:", text);
        throw new Error(`Groq API Error (${response.status}): ${text}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Groq returned invalid JSON.");
      }

      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Groq returned an empty response.");
      }

      if (jsonMode) {
        try {
          return JSON.parse(content);
        } catch {
          console.error("Groq JSON Parse Error on Content:", content);
          throw new Error("Groq returned invalid JSON content.");
        }
      }

      return content;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn(`Groq request timed out on attempt ${attempt}`);
        if (attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(`Groq request timed out after ${timeoutMs}ms.`);
      }
      
      // If it's a fetch error or something else we might retry
      if (attempt <= maxRetries && (error.code === 'ECONNRESET' || error.message.includes('fetch'))) {
         console.warn(`Network error calling Groq on attempt ${attempt}:`, error.message);
         await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
         continue;
      }

      throw error;
    }
  }
}