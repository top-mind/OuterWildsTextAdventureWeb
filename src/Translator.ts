export class Translator {
  private static instance: Translator;
  private cache: Map<string, Promise<string>> = new Map();

  private constructor() {}

  public static getInstance(): Translator {
    if (!Translator.instance) {
      Translator.instance = new Translator();
    }
    return Translator.instance;
  }

  public async translate(text: string): Promise<string> {
    if(!this.cache.has(text)) {
      this.cache.set(text, this.fetchTranslation(text));
    }
    return this.cache.get(text);
  }

  private async getToken(): Promise<string> {
    try {
      const tokenResponse = await fetch('https://edge.microsoft.com/translate/auth');
      if (!tokenResponse.ok) {
        throw new Error('获取 token 失败');
      }
      return await tokenResponse.text();
    } catch (error) {
      console.error('获取 token 失败:', error);
      throw error;
    }
  }

  private async fetchTranslation(text: string): Promise<string> {
    try {
      const response = await fetch('https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=zh-Hans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify([{
          text: text
        }])
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const translation = result[0].translations[0].text;
      console.log('原文:', text);
      console.log('译文:', translation);
      
      return translation;
    } catch (error) {
      console.error('翻译失败:', error);
      return '翻译失败';
    }
  }
} 