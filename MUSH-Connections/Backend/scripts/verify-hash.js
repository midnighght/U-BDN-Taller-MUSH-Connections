#!/usr/bin/env node

//no me funciona esta wea aun

const bcrypt = require('bcrypt');

async function main() {
  const [, , argPlaintext, argHash] = process.argv;

  // Helper to read a line from stdin
  const ask = (prompt) => {
    return new Promise((resolve) => {
      const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  };

  // Determine plaintext: CLI arg, env, or prompt
  const plaintext = process.env.PLAINTEXT || "password123";
//   const plaintext = argPlaintext || process.env.PLAINTEXT || (await ask('Plaintext password (will not be shown): '));

  // Determine hash: CLI arg, env, or prompt
  const hash = process.env.HASH || "$2b$10$6jXRP4NP8DZJXEoOG9RYzOzRp4kIwNZP9Ym9fJ9M0o3p1XQ1K1d2W";
//   const hash = argHash || process.env.HASH || (await ask('Bcrypt hash (paste value): '));

  if (!plaintext || !hash) {
    console.error('Usage: node scripts/verify-hash.js <plaintext> <hash> OR set PLAINTEXT and HASH env vars, or run interactively');
    process.exit(2);
  }

  try {
    const match = await bcrypt.compare(plaintext, hash);
    console.log(`Match: ${match}`);
    process.exit(match ? 0 : 1);
  } catch (err) {
    console.error('Error comparing hash:', err);
    process.exit(3);
  }
}

main();
