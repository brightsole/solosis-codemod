#!/usr/bin/env node
import fs from 'fs';
import { $ } from 'zx';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);
const [, fullPath, renameArg] = process.argv;

const [dirName] = fullPath.split('/node_modules');

if (!renameArg) throw new Error('Must provide a singular name to replace (thing)s with.');

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
  await Promise.all(files.map((f) => modifyFile(f)));
};

await recurseFolders();
await $`npm uninstall @brightsole/solosis-codemod`;
