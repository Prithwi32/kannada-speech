from .akshara_splitting import split_into_aksharas

import sys
import os

# Add parent directory (IPA folder) to Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)
from audio2text.a2t import convert_audio_to_kannada_text
from txt2ipa.kannada2ipa.ipaconvert import kannada2ipa



def syllabify(kannada_text):
    kannada_aksharas = split_into_aksharas(kannada_text)
    print(kannada_aksharas)
    kannada_ipa_list = [kannada2ipa(ak) for ak in kannada_aksharas]
    return kannada_ipa_list

# print(compare_syllable_lists("bəˈnænə", "bæˈnænə"))
