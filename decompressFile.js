import fs from "fs";
import { pipeline } from "node:stream/promises";
import path from "path";
import zlib from "zlib";

export default async function decompressFile(
  sourcePath,
  destinationDirectory,
  currentDirectory
) {
  try {
    const sourceFile = path.resolve(currentDirectory, sourcePath);
    const sourceFileName = path.basename(sourceFile);
    const destinationFile = path.join(
      destinationDirectory,
      path.basename(sourceFile, ".br")
    );

    const sourceStats = await fs.promises.stat(sourceFile);
    if (!sourceStats.isFile()) {
      console.error("Invalid input. Only files can be decompressed.");
      return;
    }

    const sourceStream = fs.createReadStream(sourceFile);
    const destinationStream = fs.createWriteStream(destinationFile);

    const decompressStream = zlib.createBrotliDecompress();

    await pipeline(sourceStream, decompressStream, destinationStream);

    console.log(
      `File '${sourceFileName}' decompressed to '${destinationFile}'.`
    );
  } catch (error) {
    console.log(`Invalid input: ${error.message}`);
  }
}
