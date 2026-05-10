import Diagnostic from "./Diagnostic.js";
import markdownIt from "markdown-it";
import { lint } from "markdownlint/sync";
import CodeAction from "./CodeAction.js";
import MarkdownConfig from "./MarkdownConfig.js";

export default class Analyzer {
  #document = new Map();
  #markdownConfig = new MarkdownConfig();

  async initConfigs(uri) {
    await this.#markdownConfig.initConfig(uri);
  }

  updateContent(uri, text) {
    this.#document.set(uri, { text });
  }

  remove(uri) {
    this.#document.delete(uri);
  }

  #generateResults(uri) {
    const document = this.#document.get(uri);
    let results = [];
    let options = this.#markdownConfig.getConfig();
    if (options && document) {
      options.markdownItFactory = () => markdownIt({ html: true });
      options.strings = { content: document.text };
      results = lint(options).content;
      document.results = results;
    }

    return results;
  }

  generateDiagnostics(uri) {
    return this.#generateResults(uri).map((r) => new Diagnostic(r));
  }

  generateCodeActions(uri, range, diagnostics) {
    const document = this.#document.get(uri);
    if (!document || !document.results) {
      return [];
    }

    return document.results
      .filter((r) => this.#validActionResult(r, range))
      .map((r) => new CodeAction(r, uri, diagnostics));
  }

  #validActionResult(result, range) {
    const { start, end } = range;
    const line = result.lineNumber - 1;
    return line >= start.line && line <= end.line && result.fixInfo;
  }
}
