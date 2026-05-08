/**
 * aiService.js
 * Classifies waste items using OpenAI GPT-4o Vision API

 */

const OPENAI_API_KEY = "API_KEY"; // 🔑 Replace this

const SYSTEM_PROMPT = `You are a UK recycling assistant.

1. Identify the object in the image
2. Determine if it is recyclable in the UK
3. Keep explanations under 20 words

Respond ONLY in JSON (no markdown, no explanation outside the JSON):

{
  "item": "name of the item",
  "recyclable": true or false,
  "explanation": "brief reason under 20 words",
  "bin": "Recycling" or "General Waste" or "Garden Waste"
}`;

/**
 * Classify a waste item from a base64-encoded JPEG image.
 *
 * @param {string} imageBase64 - base64-encoded image data (no data URI prefix)
 * @returns {{ item: string, recyclable: boolean, explanation: string, bin: string }}
 */
export async function classifyWaste(imageBase64) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "API_KEY") {
    // Return mock data for development/testing
    return getMockResult();
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "low", // saves tokens, sufficient for item identification
                },
              },
              {
                type: "text",
                text: "What item is this? Is it recyclable in the UK? Reply only with the JSON.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error ${response.status}: ${errorData?.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new Error("No content in API response");
    }

    // Strip markdown fences if present
    const cleaned = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (
      typeof parsed.item !== "string" ||
      typeof parsed.recyclable !== "boolean" ||
      typeof parsed.explanation !== "string"
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return parsed;
  } catch (error) {
    console.error("classifyWaste error:", error);
    throw error;
  }
}

/**
 * Mock result for development when no API key is set
 */
function getMockResult() {
  const mockItems = [
    {
      item: "Plastic bottle",
      recyclable: true,
      explanation: "Clean plastic bottles are accepted in most UK recycling collections.",
      bin: "Recycling",
    },
    {
      item: "Cardboard box",
      recyclable: true,
      explanation: "Flatten and place in recycling bin. Remove any tape first.",
      bin: "Recycling",
    },
    {
      item: "Pizza box",
      recyclable: false,
      explanation: "Grease-contaminated cardboard cannot be recycled — use general waste.",
      bin: "General Waste",
    },
    {
      item: "Tin can",
      recyclable: true,
      explanation: "Rinse cans before placing in recycling bin.",
      bin: "Recycling",
    },
    {
      item: "Crisp packet",
      recyclable: false,
      explanation: "Most crisp packets are not recyclable in standard UK collections.",
      bin: "General Waste",
    },
  ];
  return mockItems[Math.floor(Math.random() * mockItems.length)];
}
