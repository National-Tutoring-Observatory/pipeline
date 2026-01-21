import fs from "fs";
import fse from "fs-extra";
import readline from "readline";
import path from "path";
import get from "lodash/get";

interface RequestBody {
  contentType: "JSONL";
  inputFile: string;
  outputFolder: string;
  outputFileKey: string;
  sessionLimit: number;
  sessionSkip: number;
}

interface LambdaEvent {
  body: RequestBody;
}

interface LambdaResponse {
  statusCode: number;
  body?: string;
}

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  try {
    const {
      contentType,
      inputFile,
      outputFolder,
      outputFileKey,
      sessionLimit,
      sessionSkip,
    } = event.body;

    if (!fs.existsSync(inputFile)) {
      throw new Error("This input file does not exist");
    }

    if (contentType === "JSONL") {
      const fileStream = fs.createReadStream(inputFile, { encoding: "utf-8" });
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity, // Handle all instances of CR LF ('\r\n') as a single line break.
      });

      let lineNumber = 0;

      rl.on("close", () => {
        console.log("Finished processing the JSONL file.");
      });

      rl.on("error", (err) => {
        console.error("An error occurred while reading the file:", err);
        throw err;
      });

      for await (const line of rl) {
        lineNumber++;
        if (
          lineNumber <= sessionSkip ||
          lineNumber > sessionLimit + sessionSkip
        ) {
          continue;
        }

        const trimmedLine = line.trim();
        if (trimmedLine === "") {
          continue;
        }

        try {
          const jsonObject: any = JSON.parse(trimmedLine);
          const outputFileName = get(
            jsonObject,
            outputFileKey,
            `record_${lineNumber}`,
          );
          const outputFilePath = path.join(
            outputFolder,
            `${outputFileName}.json`,
          );

          await fse.outputJSON(outputFilePath, jsonObject);
        } catch (parseError: any) {
          console.error(
            `Skipping line ${lineNumber} due to JSON parsing error:`,
            parseError.message,
          );
        }
      }
    }

    return {
      statusCode: 200,
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err.message,
      }),
    };
  }
};
