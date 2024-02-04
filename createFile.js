import fs from "fs";
import path from "path";

export default async function createFile(directory, fileName) {
  const filePath = path.join(directory, fileName);
  try {
    await fs.promises.writeFile(filePath, "");
    console.log(`File is created.`);
  } catch (error) {
    console.error("Operation failed:", error.message);
  }
}
