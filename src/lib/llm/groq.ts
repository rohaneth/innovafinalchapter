export async function invokeGroq(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
  }

  const payload: any = {
    model: "llama3-70b-8192", // Groq fast LLM
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.1, 
  };

  if (jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  if (jsonMode) {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse Groq JSON response:", content);
      throw new Error("Invalid JSON returned by Groq.");
    }
  }

  return content;
}
