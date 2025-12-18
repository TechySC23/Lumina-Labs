import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DefinitionResult, GroundingMetadata, AIModelMode, AISettings } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askPhysicsTutor = async (prompt: string, context: string, mode: AIModelMode = 'fast', settings: AISettings): Promise<string> => {
  try {
    let modelName = 'gemini-flash-lite-latest';
    let config: any = {};

    switch (mode) {
      case 'instant':
        modelName = 'gemini-flash-lite-latest';
        config = { thinkingConfig: { thinkingBudget: 0 } };
        break;
      case 'fast':
        modelName = 'gemini-flash-latest';
        config = { thinkingConfig: { thinkingBudget: 1024 } };
        break;
      case 'balanced':
        modelName = 'gemini-3-flash-preview';
        config = { thinkingConfig: { thinkingBudget: 2048 } };
        break;
      case 'genius':
        modelName = 'gemini-3-flash-preview';
        config = { thinkingConfig: { thinkingBudget: 4096 } };
        break;
      default:
        modelName = 'gemini-flash-latest';
    }

    const systemInstruction = `
    You are a friendly, expert physics tutor specialized in optics.
    
    Current Simulation Context: ${context}
    
    Target Audience Level: ${settings.level}
    Desired Response Length: ${settings.length}
    
    Instructions:
    1. Adapt your vocabulary and depth of explanation to the "${settings.level}" level.
    2. Strictly adhere to the "${settings.length}" length constraint.
    3. Use Markdown formatting (bold, lists) and LaTeX for math (e.g., $f = 100$).
    4. If the user asks about the simulation, refer to the provided context.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: `User Question: ${prompt}`,
      config: {
        ...config,
        systemInstruction: systemInstruction
      }
    });
    return response.text || "I'm having trouble thinking about that right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I couldn't connect to the physics mainframe. Please try again.";
  }
};

export const getDefinitionWithGrounding = async (term: string, settings: AISettings): Promise<DefinitionResult> => {
  try {
    const systemInstruction = `
    Define the physics term provided by the user in the context of geometric optics.
    
    Target Audience Level: ${settings.level}
    Desired Definition Length: ${settings.length}
    
    Format: Use Markdown and LaTeX where appropriate.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Define the term: "${term}"`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction
      }
    });

    const text = response.text || "Definition not found.";
    
    const sources: GroundingMetadata[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            web: {
              uri: chunk.web.uri,
              title: chunk.web.title
            }
          });
        }
      });
    }

    return {
      term,
      definition: text,
      sources
    };

  } catch (error) {
    console.error("Gemini Grounding Error:", error);
    return {
      term,
      definition: "Could not retrieve definition at this moment.",
      sources: []
    };
  }
};