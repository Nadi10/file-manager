import fs from "fs";
import path from "path";

export default async function showTable(currentDirectory) {
  const data = await fs.promises.readdir(currentDirectory);
  const items = [];
  for (const item of data) {
    const itemPath = path.join(currentDirectory, item);
    try {
      const stats = await fs.promises.stat(itemPath);
      const type = stats.isDirectory() ? "directory" : "file";

      items.push({
        Name: item,
        Type: type,
      });
    } catch (error) {
      console.error("Operation failed:", error.message);
    }
  }

  items.sort((a, b) => {
    if (a.Type === "directory" && b.Type === "file") {
      return -1;
    } else if (a.Type === "file" && b.Type === "directory") {
      return 1;
    } else {
      return a.Name.localeCompare(b.Name);
    }
  });
  console.log("\n");
  console.table(items);
}
