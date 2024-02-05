import fs from "fs";

export default async function renameFile(oldName, newName) {
  try {
    await fs.promises.rename(oldName, newName);
    console.log(`File is renamed to ${newName}.`);
  } catch (error) {
    console.error("Operation failed:", error.message);
  }
}
