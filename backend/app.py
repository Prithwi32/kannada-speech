from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import tempfile
from pydub import AudioSegment
from soda_analysis import perform_soda_analysis

# ✅ Use environment variable for ffmpeg path
FFMPEG_PATH = os.environ.get('FFMPEG_PATH', r"C:\ffmpeg\ffmpeg-8.0-essentials_build\bin\ffmpeg.exe")
AudioSegment.converter = FFMPEG_PATH

app = Flask(__name__)
CORS(app)  # 👈 enables cross-origin requests

UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/analyze_soda", methods=["POST"])
def analyze_soda():
    try:
        target_word = request.form.get("target_word")
        audio_file = request.files.get("audio")

        if not target_word or not audio_file:
            print("🚨 Missing fields:", target_word, audio_file)
            return jsonify({"error": "Missing target word or audio file"}), 400

        temp_path = os.path.join(UPLOAD_FOLDER, "temp_audio")
        audio_file.save(temp_path)

        wav_path = os.path.join(UPLOAD_FOLDER, "recording.wav")
        sound = AudioSegment.from_file(temp_path)
        sound.export(wav_path, format="wav")
        os.remove(temp_path)

        # os.makedirs("results", exist_ok=True)
        # output_path = os.path.join("results", f"{target_word}_analysis.json")

        result = perform_soda_analysis(target_word, wav_path)
        print("✅ SODA Result:", result)
        return jsonify(result)

    except Exception as e:
        print("💥 Exception:", e)
        return jsonify({"error": f"Audio processing failed: {str(e)}"}), 400

# ✅ This block must exist at the end to actually run Flask
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Starting Flask server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)




# # app.py
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# from soda_analysis import perform_soda_analysis





# app = Flask(__name__)
# CORS(app)
# UPLOAD_FOLDER = "uploads"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @app.route("/analyze_soda", methods=["POST"])
# def analyze_soda_api():
#     target_word = request.form.get("target_word")
#     audio_file = request.files.get("audio")

#     if not target_word or not audio_file:
#         return jsonify({"error": "Missing target word or audio file"}), 400

#     audio_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
#     audio_file.save(audio_path)

#     try:
#         # result = perform_soda_analysis(target_word, audio_path)
#         output_path = os.path.join("results", f"{target_word}_analysis.json")
#         os.makedirs("results", exist_ok=True)
#         result = perform_soda_analysis(target_word, audio_path, output_path)

#         return jsonify(result)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)


# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# from pydub import AudioSegment
# from soda_analysis import perform_soda_analysis

# AudioSegment.converter = r"C:\ffmpeg\ffmpeg-8.0-essentials_build\bin\ffmpeg.exe"

# app = Flask(__name__)
# CORS(app)

# UPLOAD_FOLDER = "uploads"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @app.route("/analyze_soda", methods=["POST"])
# def analyze_soda():
#     try:
#         target_word = request.form.get("target_word")
#         audio_file = request.files.get("audio")

#         if not target_word or not audio_file:
#             return jsonify({"error": "Missing target word or audio"}), 400

#         temp_path = os.path.join(UPLOAD_FOLDER, "temp")
#         audio_file.save(temp_path)

#         wav_path = os.path.join(UPLOAD_FOLDER, "recording.wav")
#         AudioSegment.from_file(temp_path).export(wav_path, format="wav")
#         os.remove(temp_path)

#         # os.makedirs("results", exist_ok=True)
#         # output_path = f"results/{target_word}_analysis.json"

#         result = perform_soda_analysis(target_word, wav_path)
#         return jsonify(result)

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)
