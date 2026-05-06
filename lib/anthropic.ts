import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk'

export const bedrock = new AnthropicBedrock({
  apiKey: process.env.AWS_BEARER_TOKEN_BEDROCK,
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
})

export const CLAUDE_MODEL = 'us.anthropic.claude-opus-4-5-20251101-v1:0'
