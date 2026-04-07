import Anthropic from '@anthropic-ai/sdk'

// Singleton client — instantiated once, reused across requests
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
