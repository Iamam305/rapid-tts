import ffmpeg from "fluent-ffmpeg";
import ffmpeg_static from "ffmpeg-static";
import ffprobe_static from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpeg_static as string);
ffmpeg.setFfprobePath(ffprobe_static.path);
export const get_duration = async (filePath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, data) => {
        if (err) {
          console.error("Error in ffprobe:", err);
          reject(err);
          return;
        }
  
        console.log("FFprobe data:", JSON.stringify(data, null, 2));
  
        if (!data || !data.format || typeof data.format.duration !== 'number') {
          console.error("Invalid data structure or missing duration");
          reject(new Error("Cannot find duration"));
          return;
        }
  
        resolve(data.format.duration);
      });
    });
  };

get_duration("C:/Users/mwft1/Downloads/7838399223-1722856188-10127-66491906-7547-1722856188.92545.mp3")
  .then(duration => console.log("Duration:", duration))
  .catch(error => console.error("Error:", error));