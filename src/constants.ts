import { Difficulty } from './types';

export const TEXT_SAMPLES: Record<Difficulty, string[]> = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "Practice makes perfect in everything you do."
  ],
  medium: [
    "Programming is not about what you know; it is about what you can figure out.",
    "The best way to predict the future is to invent it.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "In the middle of difficulty lies opportunity.",
    "Your time is limited, so don't waste it living someone else's life."
  ],
  hard: [
    "The complexity of modern software systems often leads to unforeseen emergent behaviors that challenge our understanding of deterministic logic.",
    "Quantum entanglement suggests a profound interconnectedness at the subatomic level, defying classical notions of locality and causality.",
    "The juxtaposition of industrial brutalism and organic minimalism creates a striking visual tension in contemporary architectural discourse.",
    "Cryptographic protocols rely on the computational hardness of mathematical problems to ensure the integrity and confidentiality of digital communications.",
    "Asynchronous event loops allow for high-concurrency processing without the overhead of traditional multi-threading architectures."
  ]
};

export const TIME_LIMITS = [15, 30, 60, 120];
