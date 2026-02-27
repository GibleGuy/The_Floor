# How to Run "The Floor"

The project is organized into two main applications:
- **Host App**: `host/floor-host.html` (for projecting the grid)
- **Duel App**: `duel/game.html` (for playing the 1v1 game)

## Running Locally (Required)
Modern browsers block local file access, so you must use a local server.

### Option 1: Using Node.js (Recommended)
```bash
npx serve .
```
Then open:
- Host: `http://localhost:3000/host/floor-host.html`
- Duel: `http://localhost:3000/duel/game.html`

### Option 2: Using Python
```bash
python3 -m http.server
```
Then open:
- Host: `http://localhost:8000/host/floor-host.html`
- Duel: `http://localhost:8000/duel/game.html`

### Option 3: VS Code "Live Server"
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
