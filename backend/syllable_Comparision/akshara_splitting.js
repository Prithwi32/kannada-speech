function splitIntoAksharas(word) {
  const aksharas = [];
  let i = 0;

  while (i < word.length) {
    let akshara = '';
    akshara += word[i]; // First letter
    i++;

    // Build consonant clusters like ಭ್ + ಯ
    while (i + 1 < word.length && word[i] === '್' && isKannadaConsonant(word[i + 1])) {
      akshara += word[i];     // Add halant
      akshara += word[i + 1]; // Add next consonant
      i += 2;
    }

    // Add vowel sign if present
    if (i < word.length && isKannadaVowelSign(word[i])) {
      akshara += word[i];
      i++;
    }

    aksharas.push(akshara);
  }

  return aksharas;
}

function isKannadaConsonant(ch) {
  return ch >= '\u0C95' && ch <= '\u0CB9'; // ಕ to ಹ
}

function isKannadaVowelSign(ch) {
  return /[\u0CBE-\u0CCC\u0CD5\u0CD6]/.test(ch); // ಾ to ೌ, etc.
}

function launchConfetti() {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 2000);
}

