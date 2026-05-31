#!/usr/bin/env node

/**
 * Performance Guardrail Validator (Vision 2026)
 * Rapid static AST/regex code check preventing LCP/FCP regression in git commits.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
let errorsDetected = false;

function logError(msg) {
    console.error(`\x1b[31m[PERF REGRESSION ERROR] ${msg}\x1b[0m`);
    errorsDetected = true;
}

function logSuccess(msg) {
    console.log(`\x1b[32m[GUARDRAIL PASSED] ${msg}\x1b[0m`);
}

// 1. Validate index.html (Strict CDN ban)
const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    const content = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Check for unpkg or other blocking CDNs in scripts
    if (/script.*src=["'].*(unpkg\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)/i.test(content)) {
        logError('index.html contains blocking external CDN scripts (unpkg/cdnjs/jsdelivr). Keep all scripts local.');
    } else {
        logSuccess('index.html CDN script check passed (Clean local imports).');
    }
}

// 2. Validate app.js (Strict JIT dynamic load enforcement)
const appJsPath = path.join(ROOT_DIR, 'app.js');
if (fs.existsSync(appJsPath)) {
    const content = fs.readFileSync(appJsPath, 'utf8');
    
    // Check for direct synchronous imports/requires of heavy libs
    if (/import.*['"]imask['"]/i.test(content) || /require\(['"]imask['"]\)/i.test(content)) {
        logError('app.js contains static synchronous imports of imask. Heavy libraries must remain dynamic JIT loaded.');
    } else {
        logSuccess('app.js JIT dynamic loading check passed (Clean deferral).');
    }
}

// 3. Validate webgpu-fx.js (Strict Main Thread blocking protection)
const webgpuJsPath = path.join(ROOT_DIR, 'webgpu-fx.js');
if (fs.existsSync(webgpuJsPath)) {
    const content = fs.readFileSync(webgpuJsPath, 'utf8');
    
    // Ensure WebGPUVisuals starts strictly under non-blocking requestIdleCallback or setTimeout
    const hasIdleCallback = /requestIdleCallback/i.test(content);
    const hasTimeout = /setTimeout/i.test(content);
    
    if (!hasIdleCallback && !hasTimeout) {
        logError('webgpu-fx.js does not contain non-blocking wrappers (requestIdleCallback / setTimeout). Avoid blocking the Main Thread.');
    } else {
        logSuccess('webgpu-fx.js main thread protection check passed.');
    }
}

if (errorsDetected) {
    console.log('\n\x1b[31m[STATUS] Commit rejected due to Performance Regression.\x1b[0m\n');
    process.exit(1);
} else {
    console.log('\n\x1b[32m[STATUS] All performance guardrails passed. Clean to commit!\x1b[0m\n');
    process.exit(0);
}
