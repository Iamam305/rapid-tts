// import { execSync } from "child_process";
// import fs from "fs";
// import path from "path";
// import ffprobeStatic from "ffprobe-static";
// import ffmpegStatic from "ffmpeg-static";

// interface AudioChunk {
//   splitPath: string;
//   startTime: number;
//   endTime: number;
// }

// export async function splitAudioFile(
//   inputFilePath: string
// ): Promise<AudioChunk[]> {
//   const outputDir = path.join(path.dirname(inputFilePath), "chunks");
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir);
//   }

//   const chunkSize = 25 * 1024 * 1024; // 25 MB in bytes
//   const totalDuration = await getAudioDuration(inputFilePath);
//   const chunks: AudioChunk[] = [];

//   let startTime = 0;
//   let chunkIndex = 0;

//   while (startTime < totalDuration) {
//     const endTime = Math.min(
//       startTime + (await calculateChunkDuration(inputFilePath, chunkSize)),
//       totalDuration
//     );
//     const outputPath = path.join(outputDir, `chunk_${chunkIndex}.mp3`);

//     await splitAudioChunk(inputFilePath, outputPath, startTime, endTime);

//     chunks.push({
//       splitPath: outputPath,
//       startTime,
//       endTime,
//     });

//     startTime = endTime;
//     chunkIndex++;
//   }

//   return chunks;
// }

// async function getAudioDuration(filePath: string): Promise<number> {
//   try {
//     const output = execSync(
//       `"${ffprobeStatic.path}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
//     );
//     return parseFloat(output.toString());
//   } catch (error) {
//     console.error("Error getting audio duration:", error);
//     throw error;
//   }
// }

// async function calculateChunkDuration(
//   filePath: string,
//   chunkSize: number
// ): Promise<number> {
//   const fileSizeBytes = fs.statSync(filePath).size;
//   const totalDuration = await getAudioDuration(filePath);
//   return (chunkSize / fileSizeBytes) * totalDuration;
// }

// async function splitAudioChunk(
//   inputPath: string,
//   outputPath: string,
//   startTime: number,
//   endTime: number
// ): Promise<void> {
//   try {
//     execSync(
//       `"${ffmpegStatic}" -i "${inputPath}" -ss ${startTime} -to ${endTime} -c copy "${outputPath}"`
//     );
//   } catch (error) {
//     console.error("Error splitting audio chunk:", error);
//     throw error;
//   }
// }

// console.log(
//   splitAudioFile(
//     "C:/Users/mwft1/Downloads/9995039357-1722853641-10127-66484009-7547-1722853641.89648.mp3"
//   )
// );



import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegStatic as string);



ffmpeg()

  // Input file
  .input("C:/Users/mwft1/Downloads/7723897504_Bhopal _IMG_5321.mov")

  // Audio bit rate
  .outputOptions('-ab', '192k')

  // Output file
  .saveToFile('./audio.mp3')

  // Log the percentage of work completed
  .on('progress', (progress) => {
    if (progress.percent) {
      console.log(`Processing: ${Math.floor(progress.percent)}% done`);
    }
  })

  // The callback that is run when FFmpeg is finished
  .on('end', () => {
    console.log('FFmpeg has finished.');
  })

  // The callback that is run when FFmpeg encountered an error
  .on('error', (error) => {
    console.error(error);
  });