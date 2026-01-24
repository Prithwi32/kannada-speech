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


import whisper

model = whisper.load_model("tiny")

def convert_audio_to_kannada_text(wav_file_path):
    try:
        print("📥 Loading audio file for transcription...")
        result = model.transcribe(wav_file_path, language="kn")
        text = result["text"].strip()
        print("✅ Transcribed text:", text)
        return text
    except Exception as e:
        print(f"⚠️ Transcription error: {e}")
        return ""

# Example usage:
result = convert_audio_to_kannada_text("recording.wav")
