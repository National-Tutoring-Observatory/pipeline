import fs from "fs";
import fse from "fs-extra";
import path from "path";
const inputDirectory = "./app/storageAdapters";

const init = async () => {
  const storageImports = [];

  const files = fs.readdirSync(inputDirectory);

  files.forEach(async (file) => {
    const stat = fs.lstatSync(`${inputDirectory}/${file}`);

    if (stat.isDirectory()) {
      const filePath = path.join(`${inputDirectory}/${file}`, "index.ts");
      storageImports.push(`import '${filePath}';`);
    }
  });

  let storageImportFile = "";

  storageImports.forEach(async (importString) => {
    storageImportFile += `\n${importString}`;
  });

  await fse.outputFile(`./app/modules/storage/storage.ts`, storageImportFile);
};

init();
