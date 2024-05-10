import fs from "fs";

const logger = fs.createWriteStream("/tmp/toplsp.log");

export default {
  log: (msg) => {
    if (typeof msg === "object") {
      logger.write(JSON.stringify(msg));
    } else {
      logger.write(msg);
    }
    logger.write("\n");
  },
};