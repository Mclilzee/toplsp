import decodeMessage from "./decoder.js";
import encodeMessage from "./encoder.js";
import handleDocumentChangeRequest from "./documentChangeService.js";
import logger from "./logger.js";

const state = new Map();

process.stdin.on("data", (data) => {
  try {
    const msg = decodeMessage(data.toString());
    response(msg);
    logger(msg.params.toString());
  } catch (e) {
    console.error(e);
  }
});

const initalizeResponse = {
  capabilities: {
    textDocumentSync: 1,
  },
  serverInfo: { name: "toplsp", version: "0.06" },
};

function response(msg) {
  const { method } = msg;
  switch (method) {
    case "initialize":
      const response = encodeMessage({ id: msg.id, result: initalizeResponse });
      console.log(response);
      break;
    case "textDocument/didOpen":
      // state.set(msg.params.textDocument.URI, msg.params.textDocument.text);
      logger(state.toString());
      break;
    case "textDocument/didChange":
      handleDocumentChangeRequest(msg, state);
      break;
  }
}
