import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";

export const download_file_from_url = async (url: string):Promise<[string|null, string|null|Error]> => {
  console.log(`Downloading file from ${url}`);
  try {
    const allowedExtensions = [
      "flac",
      "mp3",
      "mp4",
      "mpeg",
      "mpga",
      "m4a",
      "ogg",
      "wav",
      "webm",
    ];
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes

    // Get file extension from URL
    const fileExtension = path.extname(url).slice(1).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        console.log(`Invalid file type. Only flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm are allowed.`);
        return [null,  "Invalid file type. Only flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm are allowed."]
    
    }

    // Make a HEAD request to check file size without downloading
    const headResponse = await axios.head(url);
    const fileSize = parseInt(headResponse.headers["content-length"], 10);

    console.log(`File size: ${fileSize} bytes.`);

    if (fileSize > maxSize) {
        console.log("File size exceeds 25MB limit.");
        return [null, "File size exceeds 25MB limit."]
    }

    // Generate a unique filename in the temp directory
    const tempDir = os.tmpdir();
    const fileName = `download_${Date.now()}.${fileExtension}`;
    const filePath = path.join(tempDir, fileName);

    console.log(`Downloading to ${filePath}`);

    // Download the file
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(`Finished downloading ${filePath}`);

    return [filePath, null];
  } catch (error) {
    console.error(`Error downloading file: ${error}`);
    return [null, error as Error];
  }
};
