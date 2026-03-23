#!/usr/bin/env python3
"""
Tiny helper server for the Image Picker tool.
Handles downloading images from URLs and saving them to the correct folder,
bypassing browser CORS restrictions.

Usage:  python3 tools/image-server.py
        Then open http://localhost:8642 in your browser.
"""

import http.server
import json
import os
import urllib.request
import urllib.error
import mimetypes
import sys
from pathlib import Path
from urllib.parse import urlparse

PORT = 8642
# Serve from project root (one level up from tools/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
os.chdir(PROJECT_ROOT)

class ImagePickerHandler(http.server.SimpleHTTPRequestHandler):
    """Extends the static file server with a /api/download endpoint."""

    def do_POST(self):
        if self.path == '/api/download':
            self._handle_download()
        elif self.path == '/api/list-images':
            self._handle_list_images()
        elif self.path == '/api/delete-item':
            self._handle_delete_item()
        elif self.path == '/api/rename-item':
            self._handle_rename_item()
        else:
            self.send_error(404, "Not found")

    def _handle_download(self):
        """Download an image from a URL and save it to the images folder."""
        try:
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length))

            image_url = body['url']
            category = body['category']       # e.g. "historic-events"
            filename = body['filename']        # e.g. "hindenburg-disaster"
            fmt = body.get('format', 'webp')   # desired extension

            # Ensure the images directory exists
            img_dir = PROJECT_ROOT / 'images' / category
            img_dir.mkdir(parents=True, exist_ok=True)

            # Remove any existing file with the same base name (different ext)
            for existing in img_dir.glob(f"{filename}.*"):
                existing.unlink()

            # Download the image
            req = urllib.request.Request(image_url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                              'AppleWebKit/537.36 (KHTML, like Gecko) '
                              'Chrome/120.0.0.0 Safari/537.36'
            })
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                content_type = resp.headers.get('Content-Type', '')

            # Determine actual extension from content type or URL
            ext_map = {
                'image/webp': 'webp',
                'image/png': 'png',
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/avif': 'avif',
                'image/gif': 'gif',
                'image/svg+xml': 'svg',
            }

            # Use the content type to determine actual format
            actual_ext = ext_map.get(content_type.split(';')[0].strip(), '')
            if not actual_ext:
                # Fallback: guess from URL
                url_path = urlparse(image_url).path
                actual_ext = Path(url_path).suffix.lstrip('.') or fmt

            # Save with actual extension (preserving original format)
            save_path = img_dir / f"{filename}.{actual_ext}"
            save_path.write_bytes(data)

            result = {
                'success': True,
                'savedAs': f"{filename}.{actual_ext}",
                'path': str(save_path.relative_to(PROJECT_ROOT)),
                'size': len(data),
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except urllib.error.URLError as e:
            self._send_error(502, f"Failed to fetch image: {e}")
        except Exception as e:
            self._send_error(500, f"Server error: {e}")

    def _handle_list_images(self):
        """List all images in a category folder."""
        try:
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length))
            category = body['category']

            img_dir = PROJECT_ROOT / 'images' / category
            files = {}
            if img_dir.exists():
                for f in img_dir.iterdir():
                    if f.is_file() and not f.name.startswith('.'):
                        stem = f.stem
                        files[stem] = f.name

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(files).encode())

        except Exception as e:
            self._send_error(500, f"Server error: {e}")

    def _handle_delete_item(self):
        """Delete a clue from a category JS file and remove its image."""
        try:
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length))

            script = body['script']        # e.g. "minecraft.js"
            item_name = body['itemName']   # e.g. "TNT"
            category = body['category']    # e.g. "minecraft"

            js_path = PROJECT_ROOT / 'categories' / script
            if not js_path.exists():
                self._send_error(404, f"Script file not found: {script}")
                return

            # Read the JS file and remove the matching line
            lines = js_path.read_text().splitlines(keepends=True)
            new_lines = []
            deleted = False
            deleted_stem = None
            for line in lines:
                # Match lines like:   { n: "TNT", u: "../images/minecraft/tnt.webp" },
                import re
                m = re.search(r'\{\s*n:\s*"' + re.escape(item_name) + r'"\s*,\s*u:\s*"([^"]+)"', line)
                if m and not deleted:
                    deleted = True
                    url_path = m.group(1)
                    # Extract stem and extension
                    parts = url_path.split('/')
                    filename = parts[-1]
                    deleted_stem = filename
                    continue  # Skip this line (delete it)
                new_lines.append(line)

            if not deleted:
                self._send_error(404, f"Item '{item_name}' not found in {script}")
                return

            # Write updated JS file
            js_path.write_text(''.join(new_lines))

            # Delete the image file if it exists
            if deleted_stem:
                img_path = PROJECT_ROOT / 'images' / category / deleted_stem
                if img_path.exists():
                    img_path.unlink()

            result = {'success': True, 'deleted': deleted_stem or ''}
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except Exception as e:
            self._send_error(500, f"Server error: {e}")

    def _handle_rename_item(self):
        """Rename a clue in a category JS file and rename its image file."""
        try:
            import re

            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length))

            script = body['script']        # e.g. "minecraft.js"
            old_name = body['oldName']     # e.g. "TNT"
            new_name = body['newName']     # e.g. "DYNAMITE"
            category = body['category']    # e.g. "minecraft"

            js_path = PROJECT_ROOT / 'categories' / script
            if not js_path.exists():
                self._send_error(404, f"Script file not found: {script}")
                return

            # Derive new stem from new name: "DYNAMITE" -> "dynamite"
            # "IRON GOLEM" -> "iron-golem", "GHOSTS 'N GOBLINS" -> "ghosts-n-goblins"
            new_stem = re.sub(r"[^\w\s-]", '', new_name.lower()).strip()
            new_stem = re.sub(r'\s+', '-', new_stem)

            content = js_path.read_text()
            old_stem = None
            old_ext = None
            new_content = None

            # Find the line with the old name and update it
            pattern = re.compile(
                r'(\{\s*n:\s*")' + re.escape(old_name) +
                r'("\s*,\s*u:\s*"\.\./images/)[^/]+/([^"]+?)(\.[a-zA-Z]+)(")'
            )
            def replace_match(m):
                nonlocal old_stem, old_ext
                old_filename = m.group(3)
                old_stem = old_filename
                old_ext = m.group(4)
                return (m.group(1) + new_name + m.group(2) +
                        category + '/' + new_stem + old_ext + m.group(5))

            new_content = pattern.sub(replace_match, content, count=1)

            if old_stem is None:
                self._send_error(404, f"Item '{old_name}' not found in {script}")
                return

            # Write updated JS file
            js_path.write_text(new_content)

            # Rename the image file if it exists
            renamed_image = False
            if old_stem and old_ext:
                old_img = PROJECT_ROOT / 'images' / category / f"{old_stem}{old_ext}"
                new_img = PROJECT_ROOT / 'images' / category / f"{new_stem}{old_ext}"
                if old_img.exists() and old_img != new_img:
                    old_img.rename(new_img)
                    renamed_image = True

            result = {
                'success': True,
                'oldStem': old_stem,
                'newStem': new_stem,
                'newExt': old_ext,
                'renamedImage': renamed_image,
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except Exception as e:
            self._send_error(500, f"Server error: {e}")

    def _send_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'success': False, 'error': message}).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        # Quieter logging — only show API calls
        try:
            msg = str(args[0]) if args else ''
            if '/api/' in msg:
                super().log_message(format, *args)
        except Exception:
            pass


if __name__ == '__main__':
    print(f"🖼️  Image Picker Server running at http://localhost:{PORT}")
    print(f"📂 Project root: {PROJECT_ROOT}")
    print(f"   Open http://localhost:{PORT}/tools/image-picker.html")
    print(f"   Press Ctrl+C to stop\n")

    server = http.server.HTTPServer(('', PORT), ImagePickerHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")
        server.server_close()
