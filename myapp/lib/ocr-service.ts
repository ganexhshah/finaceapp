// OCR Service for Bill/Receipt Processing using Groq Vision
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_VISION_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface BillData {
  amount: number;
  items: Array<{
    name: string;
    price: number;
  }>;
  merchantName?: string;
  date?: string;
  category?: string;
  confidence: number;
}

class OCRService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processBillImage(imageUri: string): Promise<BillData | null> {
    try {
      // Convert image to base64 if needed
      const base64Image = await this.getBase64FromUri(imageUri);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      // Use Groq's vision model to analyze the bill
      const response = await fetch(GROQ_VISION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this bill/receipt image and extract the following information in JSON format:
{
  "amount": total amount (number),
  "items": [{"name": "item name", "price": price}],
  "merchantName": "store/restaurant name",
  "date": "date if visible",
  "category": "Food & Dining" or "Shopping" or "Transportation" or "Entertainment" or "Other",
  "confidence": confidence score 0-1
}

Focus on:
- Total amount (most important)
- Item names and prices
- Merchant/store name
- Date
- Categorize based on merchant type

Return ONLY valid JSON, no other text.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 1024,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        console.error('Groq Vision API Error:', error);
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        return null;
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const billData: BillData = JSON.parse(jsonMatch[0]);
      return billData;
    } catch (error) {
      console.error('OCR Processing Error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Request timed out - image may be too large or network is slow');
        } else if (error.message.includes('timeout')) {
          console.error('Network timeout - please check your connection');
        }
      }
      
      return null;
    }
  }

  private async getBase64FromUri(uri: string): Promise<string> {
    try {
      // For React Native, we need to read the file
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data:image/...;base64, prefix
          const base64Data = base64.split(',')[1];
          
          // Check size and warn if too large
          const sizeInMB = (base64Data.length * 3) / 4 / (1024 * 1024);
          if (sizeInMB > 3) {
            console.warn(`Image size is ${sizeInMB.toFixed(2)}MB - may cause timeout. Consider reducing image quality.`);
          }
          
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  // Fallback: Simple text extraction using Groq
  async extractTextFromImage(imageUri: string): Promise<string> {
    try {
      const base64Image = await this.getBase64FromUri(imageUri);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(GROQ_VISION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract all text from this image. Return only the text, nothing else.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 1024,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return '';
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Text extraction error:', error);
      return '';
    }
  }
}

const ocrService = new OCRService(GROQ_API_KEY || '');

export default ocrService;
