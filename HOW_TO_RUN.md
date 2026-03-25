# How to Run "The Floor"

The project is organized into two main applications:
- **Host App**: `host/floor-host.html` (for projecting the grid)
- **Duel App**: `duel/game.html` (for playing the 1v1 game)

## Option 1: Double-Click (Duel Only)
You can open `duel/game.html` directly by double-clicking it in Finder. This uses the `file://` protocol and works without a server.

## Option 2: Local Server
A local server is required for the Host App and recommended for general use.

### Python (Recommended)
```bash
cd /path/to/the_floor
python3 -m http.server 8765
```

# to kill, do

```
kill -9 $(lsof -t -i:8765)
```
Then open:
- Host: `http://localhost:8765/host/floor-host.html`
- Duel: `http://localhost:8765/duel/game.html`

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
