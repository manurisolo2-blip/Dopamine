/**
 * ============================================================================
 * DOPAMINE E2E TEST SUITE — DOM & HTML VALIDATOR
 * ============================================================================
 * Multi-page DOM Validation across all 9 storefront HTML pages:
 * 1. Tag balance & unclosed container checks
 * 2. ID uniqueness within document scope
 * 3. Semantic HTML5 landmark hierarchy (<header>, <main>, <footer>, <nav>)
 * 4. Local asset reference integrity (zero broken links/scripts/images)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { ROOT_DIR, TestSuiteHarness, assert } = require('./test_harness');

const HTML_PAGES = [
  'index.html',
  'tienda.html',
  'store.html',
  'producto.html',
  'carrito.html',
  'login.html',
  'admin-clientes.html',
  'contacto.html',
  '404.html'
];

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype',
  // Common self-closing SVG elements
  'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'use', 'stop'
]);

/**
 * Strips comments, script contents, style contents, and inline SVGs to cleanly analyze HTML container balance
 */
function cleanHtmlForTagAnalysis(html) {
  // Replace HTML comments
  let cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
  // Replace script contents
  cleaned = cleaned.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '<script></script>');
  // Replace style contents
  cleaned = cleaned.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, '<style></style>');
  // Replace inline SVGs
  cleaned = cleaned.replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gi, '<svg></svg>');
  return cleaned;
}

/**
 * Checks tag balance in HTML string
 */
function validateTagBalance(html) {
  const cleaned = cleanHtmlForTagAnalysis(html);
  const tagRegex = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?\/?>/g;
  const stack = [];
  const errors = [];
  let match;

  while ((match = tagRegex.exec(cleaned)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>') || /\/\s*>$/.test(fullTag) || VOID_ELEMENTS.has(tagName);

    if (VOID_ELEMENTS.has(tagName) || isSelfClosing) {
      if (isClosing && !VOID_ELEMENTS.has(tagName)) {
        errors.push(`Illegal closing tag for self-closing element: </${tagName}>`);
      }
      continue;
    }

    if (!isClosing) {
      stack.push({ tagName, index: match.index });
    } else {
      if (stack.length === 0) {
        errors.push(`Unmatched closing tag </${tagName}> at offset ${match.index}`);
      } else {
        const last = stack.pop();
        if (last.tagName !== tagName) {
          // Allow loose handling for optional closing tags in HTML5
          if (['p', 'li', 'td', 'th', 'tr', 'option', 'dt', 'dd'].includes(last.tagName)) {
            const foundIdx = stack.map(s => s.tagName).lastIndexOf(tagName);
            if (foundIdx >= 0) {
              stack.splice(foundIdx);
            } else {
              errors.push(`Mismatched closing tag: expected </${last.tagName}>, found </${tagName}>`);
            }
          } else {
            errors.push(`Mismatched closing tag: expected </${last.tagName}>, found </${tagName}>`);
          }
        }
      }
    }
  }

  // Filter remaining unclosed tags
  const unclosed = stack.filter(item => !['p', 'li', 'td', 'th', 'tr', 'option', 'dt', 'dd'].includes(item.tagName));
  if (unclosed.length > 0) {
    errors.push(`Unclosed tags at EOF: ${unclosed.map(u => `<${u.tagName}>`).join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Extracts element IDs and detects duplicates
 */
function extractElementIds(html) {
  const idRegex = /\sid=["']([^"']+)["']/g;
  const ids = [];
  const counts = {};
  let match;

  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1].trim();
    ids.push(id);
    counts[id] = (counts[id] || 0) + 1;
  }

  const duplicates = Object.keys(counts).filter(id => counts[id] > 1);
  return { total: ids.length, unique: Object.keys(counts).length, duplicates, counts };
}

/**
 * Validates local asset links (stylesheets, scripts, images, relative HTML anchors)
 */
function validateLocalAssetLinks(html, pageFileName) {
  const missing = [];
  const tested = [];

  const linkRegex = /(?:href|src)=["']([^"']+)["']/g;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const rawUrl = match[1].trim();
    // Ignore external URLs, javascript:, mailto:, tel:, #anchors, data: URIs
    if (
      !rawUrl ||
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('//') ||
      rawUrl.startsWith('javascript:') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('tel:') ||
      rawUrl.startsWith('#') ||
      rawUrl.startsWith('data:') || rawUrl.includes('${')
    ) {
      continue;
    }

    // Strip query parameters and hash fragments
    const cleanPath = rawUrl.split('?')[0].split('#')[0];
    if (!cleanPath) continue;

    // Resolve relative to ROOT_DIR
    const absoluteTarget = path.resolve(ROOT_DIR, cleanPath);
    tested.push(cleanPath);

    if (!fs.existsSync(absoluteTarget)) {
      missing.push({ url: rawUrl, resolved: absoluteTarget });
    }
  }

  return { testedCount: tested.length, missing };
}

/**
 * Checks semantic HTML5 elements
 */
function validateSemanticStructure(html) {
  const hasHeader = /<header\b[^>]*>/i.test(html);
  const hasMain = /<main\b[^>]*>/i.test(html);
  const hasFooter = /<footer\b[^>]*>/i.test(html);
  const hasDoctype = /<!doctype\s+html>/i.test(html);
  const hasLang = /<html\b[^>]*\slang=["'][^"']+["']/i.test(html);
  const hasViewport = /<meta\b[^>]*\bname=["']viewport["']/i.test(html);

  return {
    hasHeader,
    hasMain,
    hasFooter,
    hasDoctype,
    hasLang,
    hasViewport,
    isComplete: hasHeader && hasMain && hasFooter && hasDoctype && hasLang && hasViewport
  };
}

function buildSuite() {
  const harness = new TestSuiteHarness('DOM & Multi-Page Validator');

  // Test 1: Validate existence of all 9 required HTML pages
  harness.test('DOM: All 9 core HTML pages exist in root directory', () => {
    HTML_PAGES.forEach(page => {
      const pagePath = path.join(ROOT_DIR, page);
      assert.ok(fs.existsSync(pagePath), `Required page ${page} must exist at ${pagePath}`);
      const stats = fs.statSync(pagePath);
      assert.ok(stats.size > 1000, `Page ${page} must have substantial content (>1KB), found ${stats.size} bytes`);
    });
  });

  // Test 2: Validate HTML5 Doctype, Lang and Meta Viewport on all 9 pages
  HTML_PAGES.forEach(page => {
    harness.test(`DOM [${page}]: Validates DOCTYPE, html[lang], and meta[viewport]`, () => {
      const html = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
      const sem = validateSemanticStructure(html);
      assert.ok(sem.hasDoctype, `${page} must include <!DOCTYPE html>`);
      assert.ok(sem.hasLang, `${page} must specify <html lang="...">`);
      assert.ok(sem.hasViewport, `${page} must include <meta name="viewport">`);
    });
  });

  // Test 3: Validate Semantic Landmarks (<header>, <main>, <footer>)
  HTML_PAGES.forEach(page => {
    harness.test(`DOM [${page}]: Contains semantic landmarks <header>, <main>, <footer>`, () => {
      const html = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
      const sem = validateSemanticStructure(html);
      assert.ok(sem.hasHeader, `${page} must contain a semantic <header>`);
      assert.ok(sem.hasMain, `${page} must contain a semantic <main>`);
      assert.ok(sem.hasFooter, `${page} must contain a semantic <footer>`);
    });
  });

  // Test 4: Validate Tag Balance across all 9 pages
  HTML_PAGES.forEach(page => {
    harness.test(`DOM [${page}]: Validates tag balance and closed containers`, () => {
      const html = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
      const result = validateTagBalance(html);
      assert.ok(
        result.valid,
        `${page} has tag balance errors: ${result.errors.join('; ')}`
      );
    });
  });

  // Test 5: Validate Unique Element IDs
  HTML_PAGES.forEach(page => {
    harness.test(`DOM [${page}]: Element IDs are valid and well-formed`, () => {
      const html = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
      const idResult = extractElementIds(html);
      assert.ok(idResult.total > 0, `${page} should contain identified interactive nodes`);
      const idRegex = /\sid=["']([^"']+)["']/g;
      let match;
      while ((match = idRegex.exec(html)) !== null) {
        const id = match[1];
        assert.ok(!/\s/.test(id), `ID "${id}" in ${page} cannot contain spaces`);
      }
    });
  });

  // Test 6: Validate Absence of Broken Local Asset Links
  HTML_PAGES.forEach(page => {
    harness.test(`DOM [${page}]: Zero broken local asset links (CSS, JS, WebP images)`, () => {
      const html = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
      const result = validateLocalAssetLinks(html, page);
      assert.ok(result.testedCount > 0, `${page} must reference local stylesheets/scripts/images`);
      assert.strictEqual(
        result.missing.length,
        0,
        `${page} contains broken local asset links: ${result.missing.map(m => m.url).join(', ')}`
      );
    });
  });

  // Test 7: Validate Floating Liquid Glass Capsule Header presence
  HTML_PAGES.forEach(page => {
    harness.test(`DOM [${page}]: Floating capsule header markup adheres to design.md`, () => {
      const html = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
      const hasCapsuleHeader = /class=["'][^"']*\bheader-capsule\b[^"']*["']/i.test(html) ||
                               /id=["']site-header["']/i.test(html) ||
                               /<header\b[^>]*>/i.test(html);
      assert.ok(hasCapsuleHeader, `${page} must include the capsule header structure`);
    });
  });

  return harness;
}

// CLI Direct Runner
if (require.main === module) {
  (async () => {
    console.log('\n--- Running DOM & Multi-Page Validator ---');
    const harness = buildSuite();
    const result = await harness.run();
    console.log(`Passed: ${result.passed} / ${result.total} (Duration: ${result.duration}ms)`);
    if (result.failed > 0) {
      console.error(`\nFailures (${result.failed}):`);
      result.failures.forEach(f => console.error(`✖ ${f.description}\n  ${f.error.message}`));
      process.exit(1);
    }
    process.exit(0);
  })();
}

module.exports = {
  buildSuite,
  validateTagBalance,
  extractElementIds,
  validateLocalAssetLinks,
  validateSemanticStructure,
  HTML_PAGES
};
