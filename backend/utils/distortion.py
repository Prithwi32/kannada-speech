# import parselmouth

# def detect_distortion(audio_path):
#     """
#     Detect speech distortion using pitch and intensity variations.
#     Returns: (bool, float)
#     """
#     try:
#         snd = parselmouth.Sound(audio_path)
#         intensity = snd.to_intensity()
#         mean_intensity = intensity.values.mean()
#         sd_intensity = intensity.values.std()

#         # Basic rule: if variation > 10 dB or mean intensity < 50 → distorted
#         distorted = (sd_intensity > 10 or mean_intensity < 50)
#         score = round((sd_intensity + (100 - mean_intensity)), 2)

#         return distorted, score

#     except Exception as e:
#         print("Distortion check failed:", e)
#         return False, 0.0


import parselmouth

def detect_distortion(audio_path):
    try:
        snd = parselmouth.Sound(audio_path)
        intensity = snd.to_intensity()

        mean_intensity = intensity.values.mean()
        sd_intensity = intensity.values.std()

        distorted = (sd_intensity > 10 or mean_intensity < 50)
        score = round(sd_intensity + (100 - mean_intensity), 2)

        return distorted, score

    except Exception:
        return False, 0.0




