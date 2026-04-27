import { AnthropicBedrockMantle } from '@anthropic-ai/bedrock-sdk'

export const bedrock = new AnthropicBedrockMantle({
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
})

// AWS Bedrock Mantle API のモデルID
export const CLAUDE_MODEL = 'claude-opus-4-5-20251101'
