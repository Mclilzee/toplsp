import { parse } from "jsonc-parser";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";

const BASE_CONFIG_FILE = ".markdownlint-cli2.jsonc";
const JSON_PACKAGE = "package.json";

export default class MarkdownConfig {
  #config;

  getConfig() {
    return this.#config;
  }

  async initConfig(uri) {
    if (this.#config) {
      return;
    }

    const paths = this.#getConfigFiles(uri);
    if (paths == null) {
      return;
    }

    const baseConfig = fs.readFileSync(paths.config).toString();
    this.#config = parse(baseConfig);
    const rulePromises = this.#config.customRules.map(
      (r) => import(path.join(paths.fileUrl, r)),
    );

    const customRules = await Promise.all(rulePromises);
    this.#config.customRules = customRules.map((rule) => rule.default);
  }

  #getConfigFiles(uri) {
    let dir = path.dirname(fileURLToPath(uri));
    while (fs.existsSync(dir)) {
      const baseConfig = path.join(dir, BASE_CONFIG_FILE);

      if (fs.existsSync(baseConfig)) {
        try {
          const jsonPackagePath = path.join(dir, JSON_PACKAGE);
          if (!fs.existsSync(jsonPackagePath)) {
            return null;
          }

          const jsonPackage = JSON.parse(fs.readFileSync(jsonPackagePath));
          if (
            jsonPackage.name === "curriculum" &&
            jsonPackage.description.startsWith("[The Odin Project]")
          ) {
            return {
              fileUrl: pathToFileURL(dir).href,
              config: baseConfig,
            };
          } else {
            return null;
          }
        } catch (e) {
          return null;
        }
      }

      const newDir = path.dirname(dir);
      if (dir === newDir) {
        return null;
      }

      dir = newDir;
    }

    return null;
  }
}
