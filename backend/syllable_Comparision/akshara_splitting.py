def is_kannada_consonant(ch):
    return '\u0C95' <= ch <= '\u0CB9'   # ಕ to ಹ

def is_kannada_vowel_sign(ch):
    return '\u0CBE' <= ch <= '\u0CCC' or ch in ['\u0CD5', '\u0CD6']  # ಾ to ೌ + ೕ ೖ

def is_kannada_diacritic(ch):
    return ch in ['\u0C82', '\u0C83']  # ಂ (anusvara), ಃ (visarga)

def split_into_aksharas(word):
    aksharas = []
    i = 0

    while i < len(word):
        akshara = word[i]     # First letter
        i += 1

        # Handle consonant clusters: ತ್ + ತ , ಭ್ + ಯ etc.
        while (
            i + 1 < len(word) and
            word[i] == '್' and
            is_kannada_consonant(word[i + 1])
        ):
            akshara += word[i]      # halant
            akshara += word[i + 1]  # next consonant
            i += 2

        # Add vowel sign (ಾ ಿ ೀ ು ೂ ೆ ೇ ೈ ೊ ೋ ೌ)
        if i < len(word) and is_kannada_vowel_sign(word[i]):
            akshara += word[i]
            i += 1

        # Add diacritics like ಂ or ಃ
        while i < len(word) and is_kannada_diacritic(word[i]):
            akshara += word[i]
            i += 1

        aksharas.append(akshara)

    return aksharas
