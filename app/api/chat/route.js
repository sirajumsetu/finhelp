import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = "You are a helpful assistant. Please provide accurate and concise information.";

// POST function to handle incoming requests
export async function POST(req) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const data = await req.json();

    // Check if the data is in the correct format
    if (!Array.isArray(data) || !data.every(msg => msg.role && msg.content)) {
      throw new Error('Invalid request format. Expected an array of messages.');
    }

    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...data],
      stream: true,
    });

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          console.error('Error during streaming:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);

  } catch (error) {
    console.error('Error in API route:', error);

    return NextResponse.json(
      { error: 'An error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
