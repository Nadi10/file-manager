import crypto from "crypto";
import fs from "fs";
import { pipeline } from "node:stream/promises";
import os from "os";
import path from "path";
import readline from "readline";
import compressFile from "./compressFile.js";
import createFile from "./createFile.js";
import decompressFile from "./decompressFile.js";
import readFile from "./readFile.js";
import renameFile from "./rename.js";
import showTable from "./showTable.js";

const args = process.argv.slice(2);

let username = "";
args.forEach((arg) => {
  arg.startsWith("--username=") ? (username = arg.split("=")[1]) : null;
});

username
  ? console.log(`Welcome to the File Manager, ${username}!`)
  : console.log("Welcome to the File Manager!");

process.on("exit", () => {
  username
    ? console.log(`Thank you for using File Manager, ${username}, goodbye!`)
    : console.log("Thank you for using File Manager, goodbye!");
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentDirectory = process.cwd();

function showCurrentDirectory() {
  console.log(`You are currently in ${currentDirectory}`);
}

async function navDirectory(dirPath) {
  const newPath = path.resolve(currentDirectory, dirPath);
  console.log(newPath);
  try {
    await fs.promises.access(newPath);
    currentDirectory = newPath;
    showCurrentDirectory();
  } catch (error) {
    console.error("Operation failed:", error.message);
  }
}

function goUp() {
  const higherDirectory = path.dirname(currentDirectory);
  currentDirectory === higherDirectory
    ? console.log(
        "Invalid input. You cannot go higher than the root directory."
      )
    : (currentDirectory = higherDirectory);

  showCurrentDirectory();
}

async function copyFile(sourceFileName, finalDirectory) {
  try {
    const sourceFilePath = path.resolve(currentDirectory, sourceFileName);
    const finalFilePath = path.join(
      path.resolve(currentDirectory, finalDirectory),
      path.basename(sourceFilePath)
    );
    const sourceStream = fs.createReadStream(sourceFilePath);
    const finalStream = fs.createWriteStream(finalFilePath);

    await pipeline(sourceStream, finalStream);

    console.log("File is copied!");
  } catch (error) {
    console.error("Operation failed:", error.message);
  }
}

async function moveFile(sourceFileName, finalDirectory) {
  try {
    const sourceFilePath = path.resolve(currentDirectory, sourceFileName);
    const finalFilePath = path.join(
      path.resolve(currentDirectory, finalDirectory),
      path.basename(sourceFilePath)
    );
    const sourceStream = fs.createReadStream(sourceFilePath);
    const finalStream = fs.createWriteStream(finalFilePath);
    await pipeline(sourceStream, finalStream);
    await fs.promises.unlink(sourceFilePath);
    console.log("File is moved!");
  } catch (error) {
    console.error("Operation failed:", error.message);
  }
}

async function deleteFile(filePath) {
  try {
    const deletePath = path.resolve(currentDirectory, filePath);
    await fs.promises.unlink(deletePath);
    console.log(` ${deletePath} is deleted`);
  } catch (error) {
    console.error("Operation failed:", error.message);
  }
}

function getOperatingSystemInfo() {
  console.log(`Operating System Information:`);
  console.log(`Platform: ${os.platform()}`);
  console.log(`Release: ${os.release()}`);
  console.log(`Architecture: ${os.arch()}`);
  console.log(`End-Of-Line: ${os.EOL}`);
}

function getCpuInfo() {
  console.log(`CPU Information:`);
  console.log(`Number of CPUs: ${os.cpus().length}`);
  os.cpus().forEach((cpu, index) => {
    console.log(`CPU ${index + 1}:`);
    console.log(`Model: ${cpu.model}`);
    console.log(`Speed: ${cpu.speed / 1000} GHz`);
  });
}

function getHomeDirectory() {
  console.log(`Home Directory: ${os.homedir()}`);
}

function getCurrentUsername() {
  console.log(`Current User Name: ${os.userInfo().username}`);
}

function getNodejsArchitecture() {
  console.log(`Node.js Architecture: ${process.arch}`);
}

async function calculateFileHash(filePath) {
  try {
    const fullPath = path.resolve(currentDirectory, filePath);
    const hash = crypto.createHash("sha256");

    const fileStream = fs.createReadStream(fullPath);

    fileStream.on("data", (data) => {
      hash.update(data);
    });

    fileStream.on("end", () => {
      const fileHash = hash.digest("hex");
      console.log(`Hash '${filePath}': ${fileHash}`);
    });

    fileStream.on("error", (error) => {
      console.log(error);
    });
  } catch (error) {
    console.error("Operation failed:", error.message);
  }
}

showCurrentDirectory();

rl.prompt();
rl.on("line", async (input) => {
  if (input.trim() === ".exit") {
    process.exit(0);
  }
  const [command, ...args] = input.trim().split(" ");
  const line = args.join(" ");
  switch (command) {
    case "nwd":
      showCurrentDirectory();
      break;
    case "up":
      goUp();
      break;
    case "cd":
      await navDirectory(line);
      break;
    case "ls":
      showTable(currentDirectory);
      break;
    case "cat":
      readFile(line, currentDirectory);
      break;
    case "add":
      createFile(currentDirectory, line);
      break;
    case "rn":
      const [oldName, newName] = line.trim().split(" ");
      await renameFile(oldName, newName);
      break;
    case "cp":
      const [sourceDirectory, finalDirectory] = line.trim().split(" ");
      await copyFile(sourceDirectory, finalDirectory);
      break;
    case "mv":
      const [moveSourceDirectory, moveFinalDirectory] = line.trim().split(" ");
      await moveFile(moveSourceDirectory, moveFinalDirectory);
      break;
    case "rm":
      await deleteFile(line);
      break;
    case "hash":
      calculateFileHash(line);
      break;
    case "compress":
      const [compressSource, compressDestination] = line.trim().split(" ");
      await compressFile(compressSource, compressDestination, currentDirectory);
      break;

    case "decompress":
      const [decompressSource, decompressDestination] = line.trim().split(" ");
      await decompressFile(
        decompressSource,
        decompressDestination,
        currentDirectory
      );
      break;
    case "os":
      switch (line) {
        case "--EOL":
          getOperatingSystemInfo();
          break;
        case "--cpus":
          getCpuInfo();
          break;
        case "--homedir":
          getHomeDirectory();
          break;
        case "--username":
          getCurrentUsername();
          break;
        case "--architecture":
          getNodejsArchitecture();
          break;
        default:
          console.log("Invalid input. Unknown operating system command.");
          break;
      }
      break;

    default:
      console.log("Invalid input. Unknown operation.");
      break;
  }

  rl.prompt();
}).on("close", () => {
  if (username) {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  } else {
    console.log("Thank you for using File Manager, goodbye!");
  }
  process.exit(0);
});
