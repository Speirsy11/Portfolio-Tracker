#!/usr/bin/env node
/**
 * checkapp - A visual verification tool for checking app changes
 *
 * This script uses Playwright to:
 * 1. Launch a browser instance
 * 2. Navigate to the specified page (optionally with authentication)
 * 3. Take a screenshot
 * 4. Save it to a temporary folder for agent review
 *
 * Usage:
 *   pnpm checkapp [page] [options]
 *
 * Arguments:
 *   page              Page path to navigate to (default: "/dashboard")
 *
 * Options:
 *   --url, -u         Base URL (default: "http://localhost:3000")
 *   --no-auth         Skip authentication
 *   --auth-state      Path to auth state file for pre-authenticated session
 *   --full-page       Capture full page screenshot
 *   --wait            Wait time in ms after page load (default: 2000)
 *   --output, -o      Output directory for screenshots (default: ".checkapp-screenshots")
 *   --help, -h        Show this help message
 *
 * Examples:
 *   pnpm checkapp                          # Screenshot dashboard
 *   pnpm checkapp /settings                # Screenshot settings page
 *   pnpm checkapp /assets/AAPL             # Screenshot asset detail page
 *   pnpm checkapp / --no-auth              # Screenshot home without auth
 *   pnpm checkapp /dashboard --full-page   # Full page screenshot
 */
import * as fs from "node:fs";
import * as path from "node:path";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";

interface CheckAppOptions {
  page: string;
  baseUrl: string;
  noAuth: boolean;
  authState?: string;
  fullPage: boolean;
  waitTime: number;
  outputDir: string;
}

function parseArgs(args: string[]): CheckAppOptions {
  const options: CheckAppOptions = {
    page: "/dashboard",
    baseUrl: "http://localhost:3000",
    noAuth: false,
    authState: undefined,
    fullPage: false,
    waitTime: 2000,
    outputDir: ".checkapp-screenshots",
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      console.log(
        `
checkapp - Visual verification tool for checking app changes

Usage:
  pnpm checkapp [page] [options]

Arguments:
  page              Page path to navigate to (default: "/dashboard")

Options:
  --url, -u         Base URL (default: "http://localhost:3000")
  --no-auth         Skip authentication (for public pages)
  --auth-state      Path to auth state file for pre-authenticated session
  --full-page       Capture full page screenshot
  --wait            Wait time in ms after page load (default: 2000)
  --output, -o      Output directory for screenshots (default: ".checkapp-screenshots")
  --help, -h        Show this help message

Examples:
  pnpm checkapp                          # Screenshot dashboard
  pnpm checkapp /settings                # Screenshot settings page
  pnpm checkapp /assets/AAPL             # Screenshot asset detail page
  pnpm checkapp / --no-auth              # Screenshot home without auth
  pnpm checkapp /dashboard --full-page   # Full page screenshot

The screenshot will be saved to the output directory with a timestamp.
      `.trim(),
      );
      process.exit(0);
    }

    if (arg === "--url" || arg === "-u") {
      options.baseUrl = args[++i] ?? options.baseUrl;
    } else if (arg === "--no-auth") {
      options.noAuth = true;
    } else if (arg === "--auth-state") {
      options.authState = args[++i];
    } else if (arg === "--full-page") {
      options.fullPage = true;
    } else if (arg === "--wait") {
      options.waitTime = parseInt(args[++i] ?? "2000", 10);
    } else if (arg === "--output" || arg === "-o") {
      options.outputDir = args[++i] ?? options.outputDir;
    } else if (arg && !arg.startsWith("-")) {
      // Positional argument - page path
      options.page = arg.startsWith("/") ? arg : `/${arg}`;
    }

    i++;
  }

  return options;
}

async function ensureOutputDir(outputDir: string): Promise<string> {
  const absolutePath = path.isAbsolute(outputDir)
    ? outputDir
    : path.join(process.cwd(), outputDir);

  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
    console.log(`Created output directory: ${absolutePath}`);
  }

  return absolutePath;
}

function generateScreenshotName(pagePath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const sanitizedPath =
    pagePath.replace(/\//g, "_").replace(/^_/, "") || "home";
  return `screenshot_${sanitizedPath}_${timestamp}.png`;
}

async function waitForAppReady(page: Page, baseUrl: string): Promise<boolean> {
  const maxAttempts = 30;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await page.goto(baseUrl, {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });

      if (response && response.ok()) {
        return true;
      }
    } catch {
      console.log(
        `Waiting for app to be ready... (attempt ${attempt}/${maxAttempts})`,
      );
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return false;
}

async function takeScreenshot(options: CheckAppOptions): Promise<void> {
  console.log("\n=== checkapp - Visual Verification Tool ===\n");

  const outputDir = await ensureOutputDir(options.outputDir);
  const fullUrl = `${options.baseUrl}${options.page}`;

  console.log(`Target URL: ${fullUrl}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Auth: ${options.noAuth ? "disabled" : "enabled"}`);
  console.log(`Full page: ${options.fullPage}`);
  console.log("");

  let browser: Browser | null = null;

  try {
    // Launch browser
    console.log("Launching browser...");
    browser = await chromium.launch({
      headless: true,
    });

    // Create context with optional auth state
    const contextOptions: Parameters<Browser["newContext"]>[0] = {
      viewport: { width: 1280, height: 720 },
    };

    if (options.authState && fs.existsSync(options.authState)) {
      console.log(`Loading auth state from: ${options.authState}`);
      contextOptions.storageState = options.authState;
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    // Wait for app to be ready
    console.log("Checking if app is ready...");
    const appReady = await waitForAppReady(page, options.baseUrl);

    if (!appReady) {
      console.error(
        "\nError: App is not responding at " +
          options.baseUrl +
          "\n\nMake sure the development server is running:\n  pnpm dev\n",
      );
      process.exit(1);
    }

    console.log("App is ready!");

    // Navigate to target page
    console.log(`Navigating to: ${fullUrl}`);
    await page.goto(fullUrl, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for any additional rendering
    if (options.waitTime > 0) {
      console.log(`Waiting ${options.waitTime}ms for page to settle...`);
      await page.waitForTimeout(options.waitTime);
    }

    // Take screenshot
    const screenshotName = generateScreenshotName(options.page);
    const screenshotPath = path.join(outputDir, screenshotName);

    console.log("Taking screenshot...");
    await page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage,
    });

    console.log(`\nScreenshot saved: ${screenshotPath}`);

    // Also save a "latest" symlink/copy for easy access
    const latestPath = path.join(outputDir, "latest.png");
    if (fs.existsSync(latestPath)) {
      fs.unlinkSync(latestPath);
    }
    fs.copyFileSync(screenshotPath, latestPath);
    console.log(`Latest screenshot: ${latestPath}`);

    // Output summary for agent consumption
    console.log("\n=== Summary ===");
    console.log(
      JSON.stringify(
        {
          success: true,
          url: fullUrl,
          screenshot: screenshotPath,
          latest: latestPath,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    await context.close();
  } catch (error) {
    console.error("\nError taking screenshot:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Main execution
const args = process.argv.slice(2);
const options = parseArgs(args);
takeScreenshot(options).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
