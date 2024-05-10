import Diagnostic from "./Diagnostic.js";
import { parse } from "jsonc-parser";
import markdownlint from "markdownlint";
import fs from "fs";
import CodeAction from "./CodeAction.js";

export default class Analyzer {
  #document = new Map();
  #options = undefined;

  updateContent(uri, text) {
    this.#document.set(uri, { text });
  }

  remove(uri) {
    this.#document.delete(uri);
  }

  async initOptions(uri) {
    const rootPath = this.#getConfigurationPath(uri);
    const configPath = rootPath + ".markdownlint-cli2.jsonc";
    const config = fs.readFileSync(configPath).toString();
    const options = parse(config);
    const rulePromises = options.customRules.map(
      (r) => import(rootPath + r.slice(2)),
    );

    const customRules = await Promise.all(rulePromises);
    options.customRules = customRules.map((rule) => rule.default);
    this.#options = options;
  }

  #generateResults(uri) {
    const document = this.#document.get(uri);
    let results = [];
    if (this.#options && document) {
      this.#options.strings = { content: document.text };
      results = markdownlint.sync(this.#options).content;
      document.results = results;
    }
    return results;
  }

  generateDiagnostics(uri) {
    return this.#generateResults(uri).map((r) => new Diagnostic(r));
  }

  generateCodeActions(uri, range, diagnostics) {
    return this.#document
      .get(uri)
      .results.filter((r) => this.#validActionResult(r, range))
      .map((r) => new CodeAction(r, uri, diagnostics));
  }

  #validActionResult(result, range) {
    const { start, end } = range;
    const line = result.lineNumber - 1;
    return line >= start.line && line <= end.line && result.fixInfo;
  }

  #getConfigurationPath(uri) {
    let startIndex = 0;
    if (uri.startsWith("file://")) {
      startIndex = "file://".length;
    }
    const endIndex = uri.indexOf("curriculum/");
    return uri.slice(startIndex, endIndex + "curriculum/".length);
  }
}