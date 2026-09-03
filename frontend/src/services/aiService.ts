const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-oss-120b';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  action?: 'create' | 'edit' | 'delete';
  member?: {
    id?: number;
    firstName: string;
    surname: string;
    dob: string;
    postalCode: string;
    mobileNumber: string;
  };
  message: string;
}

const systemPrompt = `You are a helpful assistant managing member records. When the user requests to create, edit, or delete a member, respond with a JSON object in this format:

{
  "action": "create|edit|delete",
  "member": {
    "id": "number (only for edit/delete)",
    "firstName": "string",
    "surname": "string",
    "dob": "YYYY-MM-DD",
    "postalCode": "string",
    "mobileNumber": "string"
  },
  "message": "friendly confirmation message"
}

If the user is not asking for a member operation, just respond with:
{
  "action": null,
  "message": "your response"
}`;

export const aiService = {
  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch {
        return { message: content };
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      throw error;
    }
  },
};
