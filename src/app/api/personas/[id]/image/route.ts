import { NextResponse } from "next/server";
import { generateImage } from "ai";
import { getPersonaById } from "@/data/personas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function buildImagePrompt(persona: {
  title: string;
  essence: string;
  traits: string[];
}): string {
  const traitsList = persona.traits.join(", ");
  
  return `A portrait illustration of a camp counselor staff member called "${persona.title}". ${persona.essence} Key traits: ${traitsList}. Setting: Northern wilderness summer camp with pine trees and lake in background. Style: Warm, inviting illustration with soft natural lighting, slightly stylized but approachable. The person should look like a caring outdoor educator in their 20s-30s wearing practical camp attire.`;
}

export async function POST(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  const persona = getPersonaById(id);

  if (!persona) {
    return NextResponse.json(
      { error: "Persona not found" },
      { status: 404 }
    );
  }

  try {
    const prompt = buildImagePrompt(persona);
    
    const result = await generateImage({
      model: "xai/grok-2-image",
      prompt,
    });

    return NextResponse.json({
      personaId: persona.id,
      personaTitle: persona.title,
      imageUrl: result.image.base64 
        ? `data:image/png;base64,${result.image.base64}`
        : result.image.uint8Array 
          ? `data:image/png;base64,${Buffer.from(result.image.uint8Array).toString('base64')}`
          : null,
      prompt,
    });
  } catch (error) {
    console.error("Image generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
