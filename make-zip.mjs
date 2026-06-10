#!/usr/bin/env node
/**
 * make-zip.mjs
 * Creates a standard .zip archive of the standalone HTML using only Node.js built-ins.
 * No external dependencies needed.
 */
import { readFileSync, writeFileSync } from "fs";
import { deflateRawSync } from "zlib";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_FILE = path.resolve(__dirname, "..", "forensic-simulator.html");
const ZIP_FILE  = path.resolve(__dirname, "..", "forensic-simulator.zip");

/* CRC-32 (ISO 3309) */
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = (crc >>> 8) ^ crcTable[(crc ^ b) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function w16(buf, off, v) { buf.writeUInt16LE(v, off); }
function w32(buf, off, v) { buf.writeUInt32LE(v >>> 0, off); }

function createZip(entries) {
  const localParts = [];
  const cdParts = [];
  let offset = 0;

  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const compressed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);

    /* Local file header (30 + name) */
    const lh = Buffer.alloc(30 + nameBuf.length);
    w32(lh, 0, 0x04034b50);  // signature
    w16(lh, 4, 20);            // version needed
    w16(lh, 6, 0);             // flags
    w16(lh, 8, 8);             // compression: deflate
    w32(lh, 10, 0);            // mod time + date
    w32(lh, 14, crc);
    w32(lh, 18, compressed.length);
    w32(lh, 22, data.length);
    w16(lh, 26, nameBuf.length);
    w16(lh, 28, 0);            // extra length
    nameBuf.copy(lh, 30);

    /* Central directory entry (46 + name) */
    const cd = Buffer.alloc(46 + nameBuf.length);
    w32(cd, 0, 0x02014b50);   // signature
    w16(cd, 4, 20);            // version made by
    w16(cd, 6, 20);            // version needed
    w16(cd, 8, 0);             // flags
    w16(cd, 10, 8);            // compression
    w32(cd, 12, 0);            // mod time + date
    w32(cd, 16, crc);
    w32(cd, 20, compressed.length);
    w32(cd, 24, data.length);
    w16(cd, 28, nameBuf.length);
    w16(cd, 30, 0);            // extra length
    w16(cd, 32, 0);            // comment length
    w16(cd, 34, 0);            // disk start
    w16(cd, 36, 0);            // internal attrs
    w32(cd, 38, 0);            // external attrs
    w32(cd, 42, offset);       // local header offset
    nameBuf.copy(cd, 46);

    localParts.push(lh, compressed);
    cdParts.push(cd);
    offset += lh.length + compressed.length;
  }

  const cdBuf = Buffer.concat(cdParts);
  const eocd = Buffer.alloc(22);
  w32(eocd, 0, 0x06054b50);  // signature
  w16(eocd, 4, 0);            // disk number
  w16(eocd, 6, 0);            // cd disk
  w16(eocd, 8, cdParts.length);
  w16(eocd, 10, cdParts.length);
  w32(eocd, 12, cdBuf.length);
  w32(eocd, 16, offset);
  w16(eocd, 20, 0);           // comment length

  return Buffer.concat([...localParts, cdBuf, eocd]);
}

const html = readFileSync(HTML_FILE);
console.log(`  HTML size: ${(html.length / 1024 / 1024).toFixed(1)} MB`);

const zip = createZip([["forensic-simulator.html", html]]);
writeFileSync(ZIP_FILE, zip);

const sizeKB = (zip.length / 1024).toFixed(0);
console.log(`✅  ${ZIP_FILE}`);
console.log(`    Size: ${(zip.length / 1024 / 1024).toFixed(1)} MB\n`);
