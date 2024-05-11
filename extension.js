const vscode = require("vscode");
const styles = require("./styles");

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
              let completionItem = new vscode.CompletionItem(
                style.value,
                vscode.CompletionItemKind.Value
              );
              completionItem.detail = style.desc;
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
