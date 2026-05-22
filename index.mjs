import { streamText, generateImage } from 'ai'

// Text generation example
const textResult = streamText({
  model: 'openai/gpt-5.5',
  prompt: 'Explain quantum computing in simple terms.',
})

console.log('--- Text Generation ---')
for await (const chunk of textResult.textStream) {
  process.stdout.write(chunk)
}
console.log('\n')

// Image generation example
console.log('--- Image Generation ---')
const imageResult = await generateImage({
  model: 'xai/grok-imagine-image',
  prompt: 'A photorealistic image of the Transamerica Pyramid in San Francisco at golden hour'
})

console.log('Generated image URL:', imageResult.image.url)
