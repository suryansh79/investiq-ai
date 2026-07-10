// ============================================================================
// InvestIQ AI — Gemini LLM Client
// Uses @langchain/google-genai to create a ChatGoogleGenerativeAI instance
// ============================================================================

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import type { BaseMessage } from '@langchain/core/messages';

/**
 * Creates a configured Gemini 2.5 Flash model instance for use with LangGraph agents.
 * Configured with JSON mode and low temperature to guarantee structured, valid responses.
 */
export function createGeminiModel(temperature = 0.3): ChatGoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in your .env.local file.'
    );
  }

  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey,
    temperature,
    maxOutputTokens: 8192, // Increased output token headroom to prevent truncation
    maxRetries: 2,
    json: true, // Force native API JSON output
  });
}

/**
 * Centrally parses agent responses using LangChain's JsonOutputParser.
 * Validates that the response was not truncated before parsing, and logs token usage.
 */
export async function parseAgentResponse<T extends Record<string, any>>(
  response: BaseMessage,
  agentName: string
): Promise<T> {
  const content = typeof response.content === 'string' ? response.content : '';
  const metadata = (response.response_metadata as any) || {};
  const usage = (response as any).usage_metadata || metadata.usage || {};

  const tokenCount = usage.output_tokens || usage.outputTokenCount || 0;
  const rawLength = content.length;

  // Extract finish reason if available
  const finishReason = metadata.finishReason || (metadata.prompt_feedback && metadata.prompt_feedback.block_reason) || 'STOP';
  const isTruncatedReason = finishReason === 'MAX_TOKENS' || finishReason === 'max_tokens' || finishReason === 'LENGTH' || finishReason === 'length';

  // Perform bracket closure check to detect incomplete JSON strings
  const trimmed = content.trim();
  const isTruncatedBracket = !trimmed.endsWith('}') && !trimmed.endsWith(']');
  const isTruncated = isTruncatedReason || isTruncatedBracket;

  console.log(`\n--- [${agentName}] API Response Metrics ---`);
  console.log(`- Output Token Count: ${tokenCount} tokens`);
  console.log(`- Raw Response Length: ${rawLength} characters`);
  console.log(`- Finish Reason: ${finishReason}`);
  console.log(`- Truncated Status: ${isTruncated ? 'TRUNCATED (ERROR)' : 'Complete'}`);
  console.log(`-------------------------------------------\n`);

  if (isTruncated) {
    console.error(`\n=== JSON TRUNCATION DETECTED IN AGENT: ${agentName} ===`);
    console.error('RAW CONTENT:', content);
    console.error('=======================================================\n');
    throw new Error(
      `[${agentName}] JSON Truncation Error: The Gemini response was truncated before completion (Finish reason: ${finishReason}, length: ${rawLength} chars).`
    );
  }

  const parser = new JsonOutputParser<T>();
  try {
    return await parser.parse(content);
  } catch (error) {
    console.error(`\n=== JSON PARSE FAIL IN AGENT: ${agentName} ===`);
    console.error('RAW CONTENT:', content);
    console.error('===========================================\n');
    throw new Error(
      `[${agentName}] JSON Syntax Error: ${(error as Error).message}. Raw LLM Response: ${content}`
    );
  }
}
