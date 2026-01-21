# import speech_recognition as sr

# def convert_audio_to_kannada_text():
#     recognizer = sr.Recognizer()
#     with sr.Microphone() as inputs:
#         print("Please speak now")
#         listening = recognizer.listen(inputs)
#         print("Analysing...")
#         try:
#             print("Did you say: "+recognizer.recognize_google(listening,language = "kn-IN"))
#             ent = (recognizer.recognize_google(listening,language = "kn-IN"))
#             return ent
#         except:
#             print("please speak again")


import speech_recognition as sr

def convert_audio_to_kannada_text(wav_file_path):
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(wav_file_path) as source:
            print("📥 Loading audio file...")
            audio_data = recognizer.record(source)

        print("🔍 Analysing...")
        text = recognizer.recognize_google(audio_data, language="kn-IN")
        print("✅ Did you say:", text)
        print(wav_file_path)
        return text

    except sr.UnknownValueError:
        print("⚠️ Could not understand audio. Please try again.")
    except sr.RequestError as e:
        print(f"⚠️ Google API error: {e}")
    except FileNotFoundError:
        print(f"⚠️ File not found: {wav_file_path}")

# Example usage:
result = convert_audio_to_kannada_text("recording.wav")
