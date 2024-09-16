import ffmpeg from "fluent-ffmpeg";
import ffmpeg_static from "ffmpeg-static";
import path from "path";
import os from "os";

ffmpeg.setFfmpegPath(ffmpeg_static as string);

function downsample_audio(input_file_path: string) {
  return new Promise((resolve, reject) => {
    const output_file_name = `downsampled_${Date.now()}.mp3`;
    const output_file_path = path.join(os.tmpdir(), output_file_name);

    ffmpeg(input_file_path)
      .outputOptions([
        "-ar 16000", // Set sample rate to 16,000 Hz
        "-ac 1", // Set to mono (1 audio channel)
        "-c:a libmp3lame", // Set audio codec to MP3
      ])
      .output(output_file_path)
      .on("end", () => {
        resolve(output_file_path);
      })
      .on("error", (err: any) => {
        reject(err);
      })
      .run();
  });
}


console.log(
  await downsample_audio(
    "C:/Users/mwft1/Downloads/7838399223-1722856188-10127-66491906-7547-1722856188.92545.mp3"
  )
);
