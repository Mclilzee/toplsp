import logger from "./logger.js";

export default function (state, msg) {
  const uri = msg.params.textDocument.uri;
  const content = msg.params.textDocument.text;

  state.set(uri, content);
  logger(msg.method + " => " + uri, content);
}