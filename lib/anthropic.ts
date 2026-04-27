import AnthropicBedrock from '@anthropic-ai/bedrock-sdk'

export const bedrock = new AnthropicBedrock({
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID as string,
  awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
})

// AWS BedrockでのモデルID
export const CLAUDE_MODEL = 'us.anthropic.claude-opus-4-5-20251101-v1:0'
