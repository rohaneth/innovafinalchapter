export async function invokeGroq(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false
): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  // Default model if GROQ_MODEL isn't set
  const model =
    process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  console.log("Using Groq model:", model);

  const payload: Record<string, any> = {
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.1,
  };

  if (jsonMode) {
    payload.response_format = {
      type: "json_object",
    };
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    console.error("Groq Response:", text);
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
      console.error("Groq JSON Response:", content);
      throw new Error("Groq returned invalid JSON.");
    }
  }

  return content;
}