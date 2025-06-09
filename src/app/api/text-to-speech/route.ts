import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize the client with credentials
function createTTSClient() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  
  // Check for base64 encoded credentials (preferred for Vercel)
  if (process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64) {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64, 'base64').toString()
    );
    return new TextToSpeechClient({
      projectId,
      credentials,
    });
  }
  
  // Fallback to file-based credentials for local development
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new TextToSpeechClient({
      projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }
  
  // Default initialization (will use Application Default Credentials)
  return new TextToSpeechClient({
    projectId,
  });
}

const client = createTTSClient();

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text || !voice) {
      return NextResponse.json(
        { error: 'Text and voice configuration are required' },
        { status: 400 }
      );
    }

    // Construct the request
    const requestPayload = {
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        sampleRateHertz: 24000,
      },
    };

    // Synthesize speech
    const [response] = await client.synthesizeSpeech(requestPayload);

    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    // Return the audio as a blob
    return new NextResponse(response.audioContent as Uint8Array, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Text-to-Speech API error:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        { error: 'Quota exceeded. Please try again later or use browser TTS.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}