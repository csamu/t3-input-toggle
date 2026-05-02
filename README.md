# T3 Chat Input Toggle

A Firefox extension that adds a collapse/expand button to the input box on [t3.chat](https://t3.chat).

## Features

- Toggle button in the input form to collapse/expand the chat input
- Floating button appears when collapsed for easy re-expansion
- Smooth animations
- Remembers collapsed state across page reloads

## Installation

### From source

Since this isn't an officially signed extension (yet), it must be sideloaded by installing it as a "Temporary Add-on", and to be installed every time the browser restarts, or by using Firefox Developer Edition.

1. Clone or download this repo
2. Run `npm install` to install web-ext
3. Run `npm run build` to create the extension package ZIP in `web-ext-artifacts/`
4. Open `about:debugging` and click "This Firefox"
5. Click "Load Temporary Add-on" and select the ZIP file

Now a collapse button will appear in the T3.chat input field.

If you use Firefox Developer Edition, you can set `xpinstall.signatures.required` to `false` in `about:config`, and then install the extension permanently via "Install Add-on From File". It will then persist despite being unsigned.

## License

MIT
