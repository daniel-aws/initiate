import * as fs from "fs";
import { glob } from "glob";
import * as path from "path";
import { logError } from "../utils/logger";

const data: any = {};

export async function loadData() {
  glob("./src/data/**/*.json", function (err, files) {
    if (err) {
      logError("ERROR: cannot read the folder, something goes wrong with glob");
    }
    files.forEach(function (file) {
      fs.readFile(file, "utf8", function (err, fileData) {
        // Read each file
        if (err) {
          logError(
            "ERROR: cannot read the file, something goes wrong with the file"
          );
        }
        const obj = JSON.parse(fileData);
        if (obj != undefined) {
          const filename = path.basename(file, path.extname(file));
          data[filename as any] = obj;
        }
      });
    });
  });
}

export { data };
