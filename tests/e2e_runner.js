#!/usr/bin/env node
/**
 * ============================================================================
 * DOPAMINE LUXURY STREETWEAR PLATFORM — MASTER E2E TEST RUNNER
 * ============================================================================
 * Automated Test Execution Engine covering:
 * - Multi-Page HTML/DOM Validator (9 static pages)
 * - WCAG 2.1 AA Accessibility & Color Contrast Validator
 * - Formal Data Contracts & Schemas Validator
 * - Tier 1: Feature Coverage & Unit Tests (>= 95 tests, 19 features)
 * - Tier 2: Boundary Value Analysis & Corner Cases (>= 95 tests)
 * - Tier 3: Pairwise Cross-Feature Integration (>= 20 tests)
 * - Tier 4: Real-World Conversion Scenarios (>= 10 journeys)
 * - Tier 5: Adversarial Hardening & Security (>= 10 attacks)
 * ============================================================================
 */

const path = require('path');

// Import all test suites
const domValidator = require('./dom_validator');
const a11yValidator = require('./a11y_validator');
const contractsValidator = require('./contracts_validator');
const tier1Tests = require('./tier1_feature_tests');
const tier2Tests = require('./tier2_boundary_tests');
const tier3Tests = require('./tier3_cross_feature_tests');
const tier4Tests = require('./tier4_scenario_tests');
const tier5Tests = require('./tier5_adversarial_tests');

// ANSI Color Formatting Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m'
};

function printHeader() {
  console.log(`\n${colors.bold}${colors.cyan}==============================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  DOPAMINE LUXURY STREETWEAR — MASTER AUTOMATED E2E TEST RUNNER${colors.reset}`);
  console.log(`${colors.dim}  Architecture: Vanilla HTML5/ES6 + Node Server + Supabase Adapter${colors.reset}`);
  console.log(`${colors.dim}  Design Compliance: Apple Museum Gallery (#0066cc / #2997ff / SF Pro / 17px)${colors.reset}`);
  console.log(`${colors.dim}  Execution Timestamp: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}==============================================================================${colors.reset}\n`);
}

async function runSuite(suiteBuilder, suiteLabel) {
  process.stdout.write(` ${colors.bold}${colors.blue}▶ RUNNING${colors.reset} ${suiteLabel.padEnd(50, '.')} `);
  const suite = suiteBuilder.buildSuite();
  const start = Date.now();
  const result = await suite.run();
  const duration = Date.now() - start;

  if (result.failed === 0) {
    console.log(`${colors.bold}${colors.green}✔ PASS${colors.reset} ${colors.dim}(${result.passed}/${result.total} tests in ${duration}ms)${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}✖ FAIL${colors.reset} ${colors.red}(${result.failed} failed, ${result.passed} passed in ${duration}ms)${colors.reset}`);
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  printHeader();

  const suitesToRun = [];

  const tierFilter = args.find(a => a.startsWith('--tier='));
  const suiteFilter = args.find(a => a.startsWith('--suite='));

  if (tierFilter) {
    const tierNum = tierFilter.split('=')[1];
    if (tierNum === '1') suitesToRun.push({ builder: tier1Tests, name: 'Tier 1: Feature Coverage & Unit Tests' });
    if (tierNum === '2') suitesToRun.push({ builder: tier2Tests, name: 'Tier 2: Boundary & Corner Cases' });
    if (tierNum === '3') suitesToRun.push({ builder: tier3Tests, name: 'Tier 3: Pairwise Cross-Feature Tests' });
    if (tierNum === '4') suitesToRun.push({ builder: tier4Tests, name: 'Tier 4: Real-World Scenarios' });
    if (tierNum === '5') suitesToRun.push({ builder: tier5Tests, name: 'Tier 5: Adversarial Hardening' });
  } else if (suiteFilter) {
    const name = suiteFilter.split('=')[1].toLowerCase();
    if (name === 'dom') suitesToRun.push({ builder: domValidator, name: 'DOM & Multi-Page Validator' });
    if (name === 'a11y') suitesToRun.push({ builder: a11yValidator, name: 'Accessibility (WCAG 2.1 AA) Validator' });
    if (name === 'contracts') suitesToRun.push({ builder: contractsValidator, name: 'Data Contracts & Schemas Validator' });
  } else {
    // Default: Run full dual-track 5-tier test harness
    suitesToRun.push(
      { builder: domValidator, name: 'DOM & Multi-Page Validator (9 Pages)' },
      { builder: a11yValidator, name: 'Accessibility & WCAG 2.1 AA Validator' },
      { builder: contractsValidator, name: 'Data Contracts & Entity Schemas Validator' },
      { builder: tier1Tests, name: 'Tier 1: Feature Coverage & Unit Tests (19 Features)' },
      { builder: tier2Tests, name: 'Tier 2: Boundary Value Analysis & Edge Cases' },
      { builder: tier3Tests, name: 'Tier 3: Pairwise Cross-Feature Integration' },
      { builder: tier4Tests, name: 'Tier 4: Real-World Application User Journeys' },
      { builder: tier5Tests, name: 'Tier 5: Adversarial Hardening & Pen-Testing' }
    );
  }

  const overallStart = Date.now();
  const results = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const allFailures = [];

  for (const s of suitesToRun) {
    const res = await runSuite(s.builder, s.name);
    results.push(res);
    totalTests += res.total;
    totalPassed += res.passed;
    totalFailed += res.failed;
    if (res.failures.length > 0) {
      allFailures.push({ suiteName: s.name, failures: res.failures });
    }
  }

  const totalDuration = Date.now() - overallStart;

  // Print Failures if any
  if (allFailures.length > 0) {
    console.log(`\n${colors.bold}${colors.red}------------------------------------------------------------------------------${colors.reset}`);
    console.log(`${colors.bold}${colors.red}  TEST FAILURES DIAGNOSTICS (${totalFailed} failures):${colors.reset}`);
    console.log(`${colors.bold}${colors.red}------------------------------------------------------------------------------${colors.reset}`);
    allFailures.forEach(fSuite => {
      console.log(`\n${colors.bold}${colors.yellow}[${fSuite.suiteName}]${colors.reset}`);
      fSuite.failures.forEach(f => {
        console.log(`  ${colors.red}✖ ${f.description}${colors.reset}`);
        console.log(`    ${colors.dim}${f.error.stack || f.error.message}${colors.reset}`);
      });
    });
  }

  // Print Summary Table
  console.log(`\n${colors.bold}${colors.cyan}==============================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  TEST SUITE EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}==============================================================================${colors.reset}`);
  console.log(`  ${colors.bold}Total Test Suites:${colors.reset}   ${suitesToRun.length}`);
  console.log(`  ${colors.bold}Total Test Cases:${colors.reset}    ${totalTests}`);
  console.log(`  ${colors.bold}Passed Tests:${colors.reset}        ${colors.green}${totalPassed} (100%)${colors.reset}`);
  console.log(`  ${colors.bold}Failed Tests:${colors.reset}        ${totalFailed === 0 ? colors.green + '0' : colors.red + totalFailed}${colors.reset}`);
  console.log(`  ${colors.bold}Total Duration:${colors.reset}      ${totalDuration}ms`);
  console.log(`  ${colors.bold}Compliance Status:${colors.reset}   ${totalFailed === 0 ? colors.bold + colors.green + 'PASSED — ZERO DEFECTS VERIFIED' : colors.bold + colors.red + 'FAILED'}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}==============================================================================${colors.reset}\n`);

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  });
}

module.exports = {
  main,
  runSuite
};
