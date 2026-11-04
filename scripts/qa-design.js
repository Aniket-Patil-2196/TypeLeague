import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('client', 'src');

const BANNED_PATTERNS = [
  /\brounded\b/i,
  /\brounded-[a-z0-9]+/i,
  /\bshadow\b/i,
  /\bshadow-[a-z0-9]+/i,
  /\bgradient\b/i,
  /\bbg-gradient/i,
  /\bbackdrop\b/i,
  /\bblur\b/i,
];

// Exceptions allowed in specific design system files:
// e.g., index.css defines chamfer utilities or resets
const ALLOWED_FILES_FOR_PATTERNS = [
  path.normalize('styles/chamfer.css'),
  path.normalize('index.css')
];

// Emoji ranges: U+1F300-1FAFF, U+2600-27BF, U+FE0F
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

// Hex colors inside components (must use tokens, hex values only allowed in index.css, tailwind config, tokens.css)
const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,8}\b/;
const ALLOWED_FILES_FOR_HEX = [
  path.normalize('index.css'),
  path.normalize('styles/tokens.css'),
  path.normalize('constants/tokens.js'),
  path.normalize('tailwind.config.js')
];

let errors = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (/\.(jsx?|tsx?|css)$/.test(file)) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const relPath = path.relative(SRC_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Check Emoji
    if (EMOJI_REGEX.test(line)) {
      errors.push(`[EMOJI VIOLATION] ${relPath}:${lineNum}: Found emoji or banned unicode pictograph: "${line.trim()}"`);
    }

    // Check Banned CSS patterns (rounded, shadow, gradient, backdrop, blur)
    const isAllowedPatternFile = ALLOWED_FILES_FOR_PATTERNS.some(f => relPath.endsWith(f));
    if (!isAllowedPatternFile) {
      for (const pattern of BANNED_PATTERNS) {
        if (pattern.test(line)) {
          // ignore comments or token explanations if any
          if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
            errors.push(`[BANNED PATTERN ${pattern}] ${relPath}:${lineNum}: "${line.trim()}"`);
          }
        }
      }
    }

    // Check Hex colors in component/feature/page files
    const isAllowedHexFile = ALLOWED_FILES_FOR_HEX.some(f => relPath.endsWith(f));
    if (!isAllowedHexFile && filePath.includes(path.normalize('components/')) || filePath.includes(path.normalize('features/')) || filePath.includes(path.normalize('app/'))) {
      if (HEX_COLOR_REGEX.test(line)) {
        if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
          errors.push(`[HEX COLOR VIOLATION] ${relPath}:${lineNum}: Hardcoded hex color found (use design tokens): "${line.trim()}"`);
        }
      }
    }
  });
}

console.log('--- TYPELEAGUE DESIGN QA GATE SCAN ---');
if (fs.existsSync(SRC_DIR)) {
  walk(SRC_DIR);
} else {
  console.log('client/src not yet populated. Skipping scan.');
}

if (errors.length > 0) {
  console.error(`FAILED: Found ${errors.length} design rule violations:`);
  errors.forEach(err => console.error('  ' + err));
  process.exit(1);
} else {
  console.log('PASSED: 0 violations found. Strict blueprint rules satisfied.');
  process.exit(0);
}
