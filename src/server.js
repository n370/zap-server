const { remote } = require('webdriverio');
const WebSocket = require('ws');

(async () => {
    const wss = new WebSocket.Server({ port: 8080 });
    const browser = await remote({
        logLevel: 'trace',
        capabilities: {
            browserName: 'chrome'
        }
    });

    try {
        await browser.url('https://web.whatsapp.com/')
        await browser.pause(60 * 1e3)

        const inputElem = await browser.$(`span[title*='${process.argv[2]}']`)
        await inputElem.click();

        wss.on('connection', function connection(ws) {
            ws.on('message', async function incoming(message) {
                await browser.keys([...message, 'Enter']);
            });
        });

        process.on('SIGINT', async () => {
            await browser.deleteSession();
            process.exit();
        });
    } finally {
        await browser.deleteSession();
        process.exit();
    }
})();
