const vscode = require("vscode");
const styles = require("./styles");
const fs = require("fs");
const path = require("path");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const selector = [
    { scheme: "file", language: "html" },
    { scheme: "file", language: "javascript" },
    { scheme: "file", language: "javascriptreact" },
    { scheme: "file", language: "typescript" },
    { scheme: "file", language: "typescriptreact" },
  ];

  let provider = vscode.languages.registerCompletionItemProvider(
    selector,
    {
      provideCompletionItems(document, position) {
        const line = document.lineAt(position.line);
        const lineText = line.text;

        // Check if the cursor is inside class="" or className=""
        const classMatch = lineText.match(/class(?:Name)?=["'](.*?)["']/);
        if (!classMatch) {
          return undefined;
        }

        const classValue = classMatch[1];
        let items = [];
        Object.keys(styles).map((item, index) => {
          if (classValue.includes(`tw:${item}`)) {
            Object.values(styles)[index].map((style) => {
              // Get Tailwind prefix if tailwind.config.js file exists
              let tailwindPrefix = ""; // Default prefix
              const workspaceFolders = vscode.workspace.workspaceFolders;
              if (workspaceFolders && workspaceFolders.length > 0) {
                const workspacePath = workspaceFolders[0].uri.fsPath;
                const tailwindConfigPath = path.join(
                  workspacePath,
                  "tailwind.config.js"
                );

                if (fs.existsSync(tailwindConfigPath)) {
                  const configFile = fs.readFileSync(
                    tailwindConfigPath,
                    "utf-8"
                  );
                  const prefixMatch = configFile.match(
                    /prefix:\s*['"](.+?)['"]/
                  );
                  if (prefixMatch) {
                    tailwindPrefix = prefixMatch[1];
                  }
                }
              }
              let completionItem = new vscode.CompletionItem(
                style.value,
                vscode.CompletionItemKind.Value
              );
              completionItem.detail = style.desc;
              completionItem.insertText = `${tailwindPrefix}${style.value}`;
              const rangeToRemove = new vscode.Range(
                position.line,
                lineText.indexOf(`tw:${item}`),
                position.line,
                lineText.indexOf(`tw:${item}`) + `tw:${item}`.length + 1
              );

              completionItem.additionalTextEdits = [
                vscode.TextEdit.delete(rangeToRemove),
              ];
              items.push(completionItem);
            });
          }
        });
        // Provide autocomplete suggestions
        return items;
      },
    },
    '"',
    "'",
    " "
  ); // Trigger characters: ", ', and space

  context.subscriptions.push(provider);
}

module.exports = {
  activate,
};
