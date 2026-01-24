#!/usr/bin/env node
/**
 * Syncs hockey.js image paths with actual file extensions in images/hockey/.
 * Run from The_Floor: node update-hockey-extensions.js
 */

const fs = require('fs');
const path = require('path');

const HOCKEY_JS = path.join(__dirname, 'Categories', 'hockey.js');
const IMAGES_DIR = path.join(__dirname, 'images', 'hockey');

const ext = (f) => path.extname(f).toLowerCase();
const base = (f) => path.basename(f, path.extname(f));

const files = fs.readdirSync(IMAGES_DIR)
  .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
  .reduce((acc, f) => {
    acc[base(f).toLowerCase()] = f;
    return acc;
  }, {});

let js = fs.readFileSync(HOCKEY_JS, 'utf8');

// Match each u: "images/hockey/foo.jpg" and replace with actual extension if file exists
js = js.replace(
  /u: "images\/hockey\/([^"]+)\.(jpg|jpeg|png|gif|webp)"/gi,
  (m, baseName, _oldExt) => {
    const key = baseName.toLowerCase().replace(/\s+/g, '-');
    const actual = files[key];
    if (actual) {
      const newPath = 'images/hockey/' + actual;
      return `u: "${newPath}"`;
    }
    return m;
  }
);

fs.writeFileSync(HOCKEY_JS, js, 'utf8');
console.log('Updated hockey.js to match images/hockey/ extensions.');
