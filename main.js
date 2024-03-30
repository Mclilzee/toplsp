import fs from "fs";
import decodeMessage from "./decoder.js";
import encodeMessage from "./encoder.js";

process.stdin.on("data", (data) => {
  const time = new Date().toISOString();
  try {
    const msg = decodeMessage(data.toString());
    response(msg);
    fs.appendFile("./logger.txt", `${time}: ${msg.method}\n`, () => {});
  } catch (e) {
    console.error(e);
  }
});

const initalizeResponse = {
  capabilities: {},
  serverInfo: { name: "toplsp", version: "0.03" },
};

function response(msg) {
  const { method } = msg;
  switch (method) {
    case "initialize":
      console.log(encodeMessage({ id: msg.id, result: initalizeResponse }));
      break;
    case "initialized":
      console.error("Success");
  }
}
