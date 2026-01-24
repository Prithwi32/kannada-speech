import json
import os
import parselmouth
from utils.alignment import align_phonemes_string, align_phonemes_list
from utils.distortion import detect_distortion
from utils.letter_identification import (
    identify_omission,
    identify_addition,
    identify_substitution,
    identify_distortion,
)
import numpy as np




from audio2text.a2t import convert_audio_to_kannada_text
from syllable_Comparision.syllabify_main import syllabify


from kannada2ipa.ipaconvert import kannada2ipa



def transcribe_audio_to_text(audio_path):
    # audio_path = os.path.join(parent_dir,"backend", "uploads", "recording.wav")
    kannada_text = convert_audio_to_kannada_text(audio_path)
    return kannada_text.strip()


def perform_soda_analysis(target_word: str, audio_path: str):
    """
    Perform SODA analysis for a given target word and child's audio.
    Uses pitch energy and distortion to approximate correctness.
    """

    try:
        sound = parselmouth.Sound(audio_path)
        pitch = sound.to_pitch()
        intensity = sound.to_intensity()

        mean_pitch = float(pitch.selected_array['frequency'].mean())
        mean_intensity = float(intensity.values.mean())
        duration = float(sound.get_total_duration())

        
        target_phonemes = kannada2ipa(target_word)
        spoken_text = transcribe_audio_to_text(audio_path)
        spoken_phonemes = kannada2ipa(spoken_text)

        target_syllable = syllabify(target_word)
        spoken_syllable =  syllabify(spoken_text)

        # ---------------- Default result ----------------
        result = {
            "target_word": target_word,
            "spoken_phonemes": spoken_syllable,
            "error_type": "",
            "distortion_score": 0.0,
            "error_syllables":[]
        }

    

        # spoken_phonemes = target_phonemes.copy()

        if mean_intensity < 20 or mean_pitch < 60:
            accuracy = 0
            remark = "No clear speech detected — please try again."
        else:
            accuracy = 85
            remark = "Speech detected successfully."

        alignment_result = align_phonemes_string(target_phonemes, spoken_phonemes)

        correct_count = alignment_result["summary"].get("Correct", 0)
        spoken_count = len(spoken_phonemes)
        target_count = len(target_phonemes)
        print(len(target_syllable),len(spoken_syllable))
        # print(correct_count, target_count)
        print(alignment_result["summary"])
        print(target_phonemes, spoken_phonemes)
        # ----------------------------------------------------------
        # If mismatch between counts → Regenerate phoneme strings
        # ----------------------------------------------------------
        if correct_count != target_count or correct_count != spoken_count:
            print("🔁 Re-aligning due to mismatch in phoneme count...")

            print(len(target_syllable),len(spoken_syllable))

            if len(target_syllable) > len(spoken_syllable):
                # 🔴 TASK 1: OMISSION
                result["error_type"] = "Omission"
                # Identify specific omitted syllables/letters
                omitted_syllables = identify_omission(target_syllable, spoken_syllable)
                result["error_syllables"] = omitted_syllables
               
            elif len(target_syllable) < len(spoken_syllable):
                # 🔴 TASK 2: ADDITION
                result["error_type"] = "Addition"
                # Identify specific added syllables/letters
                added_syllables = identify_addition(target_syllable, spoken_syllable)
                result["error_syllables"] = added_syllables
               
            else:
                # ✅ SAME LENGTH → NORMAL ALIGNMENT
                alignment_result = align_phonemes_list(
                    target_syllable,
                    spoken_syllable
                )
                
               
                # Distortion detection
                distortion_detected, distortion_score = detect_distortion(audio_path)
                
                if distortion_score > 80 : 
                    result["error_type"] = "Distortion"
                    # Identify specific distorted syllables/letters
                    distorted_syllables = identify_distortion(target_syllable, spoken_syllable)
                    result["error_syllables"] = distorted_syllables
                    
                else : 
                    result["error_type"] = "Substitution"
                    # Identify specific substituted syllables/letters
                    substituted_syllables = identify_substitution(target_syllable, spoken_syllable)
                    result["error_syllables"] = substituted_syllables
                  
                result["distortion_score"] = distortion_score
            
       

        # # ✅ Fixed NumPy bool type handling (np.bool8 removed)
        # if isinstance(distortion_detected, (np.bool_, bool)):
        #     distortion_detected = bool(distortion_detected)
        # if isinstance(distortion_score, (np.floating, np.integer)):
        #     distortion_score = float(distortion_score)

        # result = {
        #     "target_word": target_word,
        #     "spoken_phonemes": spoken_phonemes,
        #     "alignment": alignment_result,
        #     "distortion_detected": bool(distortion_detected),
        #     "distortion_score": float(distortion_score),
        #     "pitch_mean": float(mean_pitch),
        #     "intensity_mean": float(mean_intensity),
        #     "duration_sec": round(duration, 2),
        #     "accuracy_estimate": accuracy,
        #     "remark": remark
        # }

        # os.makedirs(os.path.dirname(output_path), exist_ok=True)
        # with open(output_path, "w", encoding="utf-8") as f:
        #     json.dump(result, f, ensure_ascii=False, indent=2)

        return result

    except Exception as e:
        print("💥 Error in perform_soda_analysis:", e)
        return {"error": f"Audio processing failed: {e}"}






# from utils.alignment import extract_substitutions, align_phonemes_string
# from utils.distortion import detect_distortion
# from utils.addition_or_omission import find_omission_and_addition

# from audio2text.a2t import convert_audio_to_kannada_text
# from syllable_Comparision.syllabify_main import syllabify
# from txt2ipa.kannada2ipa.ipaconvert import kannada2ipa

# import parselmouth
# import numpy as np


# def transcribe_audio_to_text(audio_path):
#     return convert_audio_to_kannada_text(audio_path).strip()


# def perform_soda_analysis(target_word, audio_path, output_path=None):

#     # ---------------- Audio features ----------------
#     sound = parselmouth.Sound(audio_path)
#     pitch = sound.to_pitch()
#     intensity = sound.to_intensity()

#     mean_pitch = float(pitch.selected_array["frequency"].mean())
#     mean_intensity = float(intensity.values.mean())

#     # ---------------- Text & phonemes ----------------
    
#     target_phonemes = kannada2ipa(target_word)
#     spoken_text = transcribe_audio_to_text(audio_path)
#     spoken_phonemes = kannada2ipa(spoken_text)

 

    

#     # ---------------- Default result ----------------
#     result = {
#         "target_word": target_word,
#         "spoken_phonemes": spoken_phonemes,

#         "error_type": "",
#         "distortion_score": 0.0
#     }

    

#     alignment_result = align_phonemes_string(target_phonemes, spoken_phonemes)

#     correct_count = alignment_result["summary"].get("Correct", 0)
#     target_count = len(target_phonemes)
#     print(correct_count,target_count)

#     # ----------------------------------------------------------
#     # If mismatch between counts → Regenerate phoneme strings
#     # ----------------------------------------------------------
#     if correct_count != target_count:
#         print("🔁 Re-aligning due to mismatch in phoneme count...")
#         target_phonemes = syllabify(target_word)
#         spoken_phonemes = syllabify(spoken_text)
#         omitted, added = find_omission_and_addition(target_phonemes, spoken_phonemes)

#         if added:
#             # 🔴 TASK 1: OMISSION
#             result["error_type"] = "Addition"
#             result["addition_phoneme_list"] = added
#             return result               

#         elif omitted:
#             # 🔴 TASK 2: ADDITION
#             result["error_type"] = "Omission"
#             result["omission_phoneme_list"] = omitted
#             return result

#         else:
#             # ✅ SAME LENGTH → NORMAL ALIGNMENT
#             # ---------------- SUBSTITUTION ----------------
#             if len(target_phonemes) == len(spoken_phonemes):
#                 substitutions = extract_substitutions(target_phonemes, spoken_phonemes)

#                 if substitutions:
#                     result["error_type"] = "Substitution"
#                     result["substitution_phoneme_list"] = substitutions
#                     return result

#             # ---------------- DISTORTION ----------------
#             distorted, distortion_score = detect_distortion(audio_path)
#             if distorted:
#                 result["error_type"] = "Distortion"
#                 result["distortion_score"] = float(distortion_score)
#                 return result
    

#     # ---------------- PERFECT MATCH ----------------
#     return result
