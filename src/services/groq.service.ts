import Groq from "groq-sdk";
import OpenAI from "openai";
import { readAndEncode } from "./fs.service";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { FileJson2 } from "lucide-react";

/*
const client = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });
const model = "llava-v1.5-7b-4096-preview";
*/
const client = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
const model = "gpt-4o-2024-08-06";

// Initial image uplaod that generates description for image uploaded and extracts
// important features
export type Value = string[] | string | boolean | number;
const zFeatureSchema = z.object({
  name: z.string().describe("a concise description of this entry"),
  imagePath: z.string().optional(),
  features: z.array(z.object({
    name: z.string().describe("display name for the feature"),
    feature: z.string().describe("feature name given in snake case"),
    value: z.union([
      z.array(z.string()),
      z.string(),
      z.boolean(),
      z.number(),
    ])
  }))
});
export type FeatureSchema = z.infer<typeof zFeatureSchema>;

// map of all created categories
const zCategorySchema = z.record(z.string(), z.boolean());
export type CategorySchema = z.infer<typeof zCategorySchema>;

// history of requests made with given category
const zFeatureHistorySchema = z.array(zFeatureSchema);
export type FeatureHistorySchema = z.infer<typeof zFeatureHistorySchema>;

const zHistoryMapSchema = z.record(z.string(), zFeatureHistorySchema);
export type HistoryMapSchema = z.infer<typeof zHistoryMapSchema>;

export async function chatCompletion() {
  return client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "Explain the importance of fast language models",
      },
    ],
    model: model,
  });
}


const summaryPrompt = `Please provide a detailed and high-quality summarization of the image's
most noteworthy features. Focus on describing the key objects, their relationships, and any notable
patterns, emotions, or unique aspects that stand out. If applicable, explain any potential
significance or context that could make these features interesting or important. Output your summary
as a single paragraph with no special formatting.
`
export async function imageSummarization(path: string) {

  const base64_image = await readAndEncode(path);

  const res = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: summaryPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/webp;base64,${base64_image}`,
            },
          },
        ],
      },
    ],
    model: model,
  });
  return res.choices[0].message.content;
}

const featurePrompt = `
You are an expert at structured data extraction.

Extract a list of relevant features given the image shown and a description, respond in JSON
with as an array of key value pairs. Each key value pair is an object with the keys
- \`feature\`: the name of the feature as a string
- \`type\`: indicate the type of value
- \`value\`: the value associated with the feature as any value. When the value is a comma separated list, try to display it as an array

Given the conversation history, try to match previously defined features as much as possible. Try to avoid introducing new features.

For example
{
  "name": "Holiday Inn on Church St.",
  "features": [
    {
      "name": "Price",
      "feature": "price",
      "value": 299,
    },
    {
      "name": "Company",
      "feature": "company",
      "value": "Holiday Inn",
    },
    {
      "name": "Pool",
      "feature": "pool",
      "value": false,
    },
    {
      "name": "toiletries",
      "feature": "toiletries",
      "value": ["shampoo", "conditioner", "body wash"],
    }
  ]
}
`;

export async function imageFeatures(path: string, history: FeatureHistorySchema, description: string): FeatureSchema {

  const base64_image = await readAndEncode(path);

  let messages = [
    {
      role: "system",
      content: featurePrompt,
    },
  ]

  let chatHistory = history.map((entry) => ({
    role: "user",
    content: JSON.stringify(entry)
  }));

  messages.push(...chatHistory);
  messages.push({ 
    role: "user",
    content: [
      { type: "text", text: description },
      {
        type: "image_url",
        image_url: {
          url: `data:image/webp;base64,${base64_image}`,
        },
      },
    ],
  });
  // console.log(messages);

  const res = await client.beta.chat.completions.parse({
    messages: messages,
    response_format: zodResponseFormat(zFeatureSchema, "features"),
    model: model,
  });

  return res.choices[0].message.parsed;
}