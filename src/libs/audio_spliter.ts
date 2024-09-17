import fs from "fs";
import path from "path";
import os from "os";
async function splitFileIntoChunks(filePath: string) {
  const CHUNK_SIZE = 4 * 1024 * 1024; // 24 MB in bytes
  const chunkFilePaths = [];

  try {
    // Get file stats to determine the total size
    const stats = await fs.promises.stat(filePath);
    const totalSize = stats.size;

    // Open the file for reading
    const fd = await fs.promises.open(filePath, "r");

    let bytesReadTotal = 0;
    let chunkIndex = 0;

    try {
      while (bytesReadTotal < totalSize) {
        // Determine the size of the next chunk
        const bufferSize = Math.min(CHUNK_SIZE, totalSize - bytesReadTotal);
        const buffer = Buffer.alloc(bufferSize);

        // Read a chunk from the file
        const { bytesRead } = await fd.read(
          buffer,
          0,
          bufferSize,
          bytesReadTotal
        );

        // Generate a chunk file name
        const chunkFileName = `chunk_${crypto.randomUUID()}${path.extname(filePath)}`;

        const chunkFilePath = path.join(os.tmpdir(), chunkFileName);

        // Write the chunk to a new file
        await fs.promises.writeFile(chunkFilePath, buffer.slice(0, bytesRead));

        // Add the chunk file path to the array
        chunkFilePaths.push(chunkFilePath);

        // Update counters
        bytesReadTotal += bytesRead;
        chunkIndex++;
      }
    } finally {
      // Ensure the file descriptor is closed
      await fd.close();
    }

    // Return the array of chunk file paths
    return chunkFilePaths;
  } catch (err) {
    console.error("Error during file splitting:", err);
    throw err;
  }
}

console.log(
  await splitFileIntoChunks(
    "C:/Users/mwft1/Downloads/7838399223-1722856188-10127-66491906-7547-1722856188.92545.mp3"
  )
);
