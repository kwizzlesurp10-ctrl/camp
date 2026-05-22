/**
 * Local AI Gateway smoke test (OIDC via VERCEL_OIDC_TOKEN).
 * Run: npm run ai:gateway:demo
 */
import { streamText } from 'ai'

async function main() {
  if (!process.env.VERCEL_OIDC_TOKEN && !process.env.AI_GATEWAY_API_KEY) {
    console.error(
      'Missing auth: set VERCEL_OIDC_TOKEN (vc env pull .env.local) or AI_GATEWAY_API_KEY.',
    )
    process.exit(1)
  }

  const result = streamText({
    model: 'openai/gpt-5.5',
    prompt: 'Explain quantum computing in simple terms.',
  })

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
  }
  process.stdout.write('\n')
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`AI Gateway demo failed: ${message}`)
  process.exit(1)
})
