//@ts-check

const vscode = require('vscode');
const uncss = require('uncss');
const fs = require('fs');

const is_windows = process.platform;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.uncssFile', async function () {
        let files = [await fileOpenDialog()];
        if (files[0] == undefined)
            return;

        let savePath = await fileSaveDialog();
        if (savePath == undefined)
            return;

        await processCss(files, savePath);
    });

    let disposable2 = vscode.commands.registerCommand('extension.uncssUrl', async function () {
        let options = {
            placeHolder: "http://example.com"
        };
        let url = [await vscode.window.showInputBox(options)];
        if (url[0] == undefined)
            return;

        let savePath = await fileSaveDialog();
        if (savePath == undefined)
            return;

        await processCss(url, savePath);
    });

    context.subscriptions.push(disposable, disposable2);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}

async function fileOpenDialog() {
    let fileName;
    let workFolder = vscode.workspace.workspaceFolders;

    let options = {
        canSelectMany: false,
        defaultUri: workFolder == undefined ? "" : workFolder[0].uri,
        filters: {
            'HTML files': ['html']
        }
    };

    await vscode.window.showOpenDialog(options).then(fileUri => {
        if (fileUri && fileUri[0]) {
            fileName = fileUri[0].path;
            if (is_windows == "win32")
                fileName = fileName.slice(1);
        }
    });
    return fileName;
}

async function fileSaveDialog() {
    let fileName;
    let workFolder = vscode.workspace.workspaceFolders;

    let options = {
        defaultUri: workFolder == undefined ? "" : workFolder[0].uri,
        filters: {
            'CSS files': ['css']
        }
    };

    await vscode.window.showSaveDialog(options).then(fileUri => {
        if (fileUri) {
            fileName = fileUri.path;
            if (is_windows == "win32")
                fileName = fileName.slice(1);
        }
    });
    return fileName;
}

async function writeFile(path, data) {
    let error;
    await fs.writeFile(path, data, function (err) {
        error = err;
    });
    return error;
}

async function processCss(source, savePath) {
    vscode.window.showInformationMessage('vscode-UnCSS: Processing...');
    let options = {
        timeout: 1000,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X)'
    };

    uncss(source, options, async (error, output) => {
        if (error == null) {
            let result = await writeFile(savePath, output);
            if (result)
                vscode.window.showErrorMessage(result);
            else
                vscode.window.showInformationMessage('vscode-UnCSS: Output of CSS file is complete!');
        } else {
            vscode.window.showErrorMessage(error);
        }
    });
}