#!/usr/bin/env node
// generate-audio.js — generates MP3 voice lines for PAA Aritmética Nivel 1
// Run from project root: node worker/generate-audio.js
// Never deployed — local tooling only.

'use strict';

const fs   = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

if (!API_KEY || !VOICE_ID) {
  console.error('Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in .env');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'frontend', 'audio');

const lines = [
  { file: 'paa-arit-n1-01.mp3', text: 'Hoy estudiaremos el orden de las operaciones. Este nos dice el orden en que debemos resolver cualquier expresión matemática.' },
  { file: 'paa-arit-n1-02.mp3', text: 'Aquí está nuestro problema. Vamos a resolverlo paso a paso usando el orden de las operaciones.' },
  { file: 'paa-arit-n1-03.mp3', text: 'La primera P es de Paréntesis. Siempre resolvemos primero lo que está dentro del paréntesis.' },
  { file: 'paa-arit-n1-04.mp3', text: 'Seis dividido entre tres es dos. Reemplazamos el paréntesis con ese resultado.' },
  { file: 'paa-arit-n1-05.mp3', text: 'Ahora viene la M de Multiplicación. Va antes que la suma y la resta.' },
  { file: 'paa-arit-n1-06.mp3', text: 'Cuatro por dos es ocho. Reemplazamos esa parte de la expresión.' },
  { file: 'paa-arit-n1-07.mp3', text: 'Por último, la S de Suma y Resta. Las resolvemos de izquierda a derecha.' },
  { file: 'paa-arit-n1-08.mp3', text: 'Tres más ocho menos dos. Resuelve esto de izquierda a derecha y dime el resultado.' },
  { file: 'paa-arit-n1-09.mp3', text: '¡Perfecto! La respuesta es nueve. Hemos aplicado así el orden de las operaciones correctamente.' },
];

async function generateLine(line) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const res  = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key':   API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text:           line.text,
      model_id:       'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`ElevenLabs error ${res.status} for ${line.file}: ${msg}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const dest   = path.join(OUTPUT_DIR, line.file);
  fs.writeFileSync(dest, buffer);
  console.log(`  ✓ ${line.file} (${buffer.length} bytes)`);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created ${OUTPUT_DIR}`);
  }

  console.log(`\nGenerating ${lines.length} audio files → frontend/audio/\n`);

  for (const line of lines) {
    await generateLine(line);
  }

  console.log('\nDone.\n');
}

main().catch(err => { console.error(err.message); process.exit(1); });
