# How to Run "The Floor"

The project is organized into two main applications:
- **Host App**: `host/floor-host.html` (for projecting the grid)
- **Duel App**: `duel/game.html` (for playing the 1v1 game)

## Option 1: Double-Click (Duel Only)
You can open `duel/game.html` directly by double-clicking it in Finder. This uses the `file://` protocol and works without a server.

## Option 2: Local Server

A local server is required for the Host App and recommended for general use. **You choose which server to run depending on your task.**

### Standard Server (for Playing)
Use this if you just want to run the Game or Host App.
```bash
python3 -m http.server 8765
```
Then open:
- Host: `http://localhost:8765/host/floor-host.html`
- Duel: `http://localhost:8765/duel/game.html`

### Image Picker Server (for Editing)
Use this if you are using the **Image Tool** to source or rename category images. **This server also hosts the rest of the game, so you don't need to run the standard server at the same time.**
```bash
python3 tools/image-server.py
```
Then open: `http://localhost:8642/tools/image-picker.html`


## Troubleshooting: Port Already in Use
If you see an error like `OSError: [Errno 48] Address already in use`, it means a server is already running! You can either:
1.  **Stop the running command**: Find the terminal tab where the server is running and press `Ctrl + C`.
2.  **Force Close with a command**: Run these commands in your terminal to clear the ports:
    ```bash
    kill -9 $(lsof -t -i:8765)  # for port 8765 (Standard)
    kill -9 $(lsof -t -i:8642)  # for port 8642 (Image Tool)
    ```

### Node.js
```bash
npx serve .
```
Then open:
- Host: `http://localhost:3000/host/floor-host.html`
- Duel: `http://localhost:3000/duel/game.html`

### VS Code "Live Server"
1.  Install "Live Server" extension.
2.  Right-click `host/floor-host.html` or `duel/game.html`.
3.  Select "Open with Live Server".

## Image Picker Tool (for sourcing category images)
When creating or updating categories, use the Image Picker to quickly search, download, and auto-rename images.

```bash
python3 tools/image-server.py
```
Then open: `http://localhost:8642/tools/image-picker.html`

Select a category → click **🔍 Search Google** → find an image → copy image address → paste → click **⬇ Save**. The image is automatically saved with the correct filename to `images/<category>/`.

> **Troubleshooting:** If code changes aren't taking effect, hard-refresh the page with `Cmd+Shift+R` to clear the browser cache.
