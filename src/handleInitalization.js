import { encodeMessage } from "./parser.js";
import logger from "./logger.js";

const initalizeResponse = {
  capabilities: {
    textDocumentSync: 1,
    hoverProvider: true,
    completionProvider: {},
    diagnosticProvider: {
      interFileDependencies: false,
      workspaceDiagnostics: true,
    },
  },
  serverInfo: { name: "toplsp", version: "0.06" },
};

export default function (msg) {
  const response = encodeMessage({ id: msg.id, result: initalizeResponse });
  console.log(response);
  logger(msg.method, "Initalization requested");
}
