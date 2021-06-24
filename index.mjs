import fs from 'fs';
import { $ } from 'zx';
import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';

const writeFile = util.promisify(fs.writeFile);
const fileUrl = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileUrl);
const [, , renameArg] = process.argv;

if (!renameArg) throw new Error('Must provide a name to replace (things) with.');

export const modifyFile = async (filePath, rename = renameArg) => {
  const contents = fs.readFileSync(filePath, 'utf8');
  writeFile(
    filePath,
    contents
      .replace(/thing/g, rename)
      .replace(/Thing/g, `${rename[0].toUpperCase()}${rename.slice(1)}`)
  );
};

export const recurseFolders = async (directoryFilePath = dirName) => {
  const directoryFiles = fs
    .readdirSync(directoryFilePath)
    .filter((e) => !/^(.git|node_modules)$/.test(e));

  const [folders, files] = directoryFiles.reduce(
    ([foldersSum, filesSum], fileName) => {
      const filePath = `${directoryFilePath}/${fileName}`;
      const isFolder = fs.lstatSync(filePath).isDirectory();

      if (isFolder) return [[...foldersSum, filePath], filesSum];
      return [foldersSum, [...filesSum, filePath]];
    },
    [[], []]
  );

  await Promise.all(folders.map(recurseFolders));
  await Promise.all(files.map(modifyFile));
};

await recurseFolders();
await $`npm uninstall solosis-codemod`;
