from faster_whisper import WhisperModel
import io

model = WhisperModel("small", device="cpu", compute_type="int8")

async def transcribe_audio(audio_file_path: str) -> str:
    with open(audio_file_path, "rb") as audio_file:
        audio_data = audio_file.read()
    audio = io.BytesIO(audio_data)

    segments, _ = model.transcribe(audio, language="ru")
    transcription = " ".join([segment.text for segment in segments])

    return transcription


