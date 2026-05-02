# T3 Chat Input Toggle

A Firefox extension that adds a collapse/expand button to the input box on [t3.chat](https://t3.chat).

## Features

- Toggle button in the input form to collapse/expand the chat input
- Floating button appears when collapsed for easy re-expansion
- Smooth animations
- Remembers collapsed state across page reloads

## Installation

### From source

Since this isn't an officially signed extension (yet), it must be sideloaded by installing it as Temporary, and to be installed every time the browser restarts, or by using Firefox Developer Edition.

1. Clone or download this repo
2. Run `npm install` to install web-ext
3. Run `npm run build` to create the extension package ZIP
4. Goto `about:debugging#/runtime/this-firefox`
5. Click "Load Temporary Add-on" and choose the ZIP

Now a collapse button will appear in the T3.chat input field.

## License

MIT
