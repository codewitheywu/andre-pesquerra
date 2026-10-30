import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

const SECTIONS = ["projects", "experience", "github", "certifications", "contact"];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    // Firefox flags localhost as a "bounce tracker" when tests open it
    // repeatedly without user activation; that is the harness, not the page.
    if (message.text().includes("has been classified as a bounce tracker")) return;
    if (message.type() === "error" || message.type() === "warning") {
      errors.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`);
  });
  return errors;
}

function reveal(page: Page, id: string) {
  return page.locator(`#${id} [data-reveal]`);
}

/** Scroll each section into view and wait for its fade-in, like a reader would. */
async function revealAllSections(page: Page) {
  for (const id of SECTIONS) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(reveal(page, id)).toHaveCSS("opacity", "1");
  }
}

/**
 * Open a page in the given color scheme. Some engines (Playwright's Windows
 * Firefox build) ignore scheme emulation; skip rather than silently test the
 * wrong theme.
 */
async function pageInScheme(browser: Browser, colorScheme: "light" | "dark") {
  const context = await browser.newContext({ colorScheme });
  const page = await context.newPage();
  await page.goto("/");
  const applied = await page.evaluate(
    (scheme) => matchMedia(`(prefers-color-scheme: ${scheme})`).matches,
    colorScheme
  );
  test.skip(!applied, `This engine cannot emulate prefers-color-scheme: ${colorScheme}`);
  return { context, page };
}

/** Event listeners attach on hydration; wait for it before interacting. */
async function waitForHydration(page: Page) {
  // The theme is unknown during SSR, so one coffee button is pressed only
  // once the client has taken over. Present on every route.
  await expect(page.locator('[role="group"][aria-label="Theme"] [aria-pressed="true"]').first()).toBeAttached();
}

async function openPalette(page: Page) {
  await waitForHydration(page);
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("homepage", () => {
  test("renders with metadata and one h1", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Andre V\. Pesquerra/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Andre Pesquerra");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-cover\.jpg$/);
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
  });

  test("has no console errors, warnings or failed requests", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await revealAllSections(page);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("every section becomes visible", async ({ page }) => {
    await page.goto("/");
    await revealAllSections(page);
  });

  test("shows all content with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    for (const id of SECTIONS) await expect(reveal(page, id)).toHaveCSS("opacity", "1");
    await context.close();
  });

  test("shows all content when JavaScript fails to load", async ({ page }) => {
    await page.route("**/_next/static/chunks/*.js", (route) => route.abort());
    await page.goto("/");
    for (const id of SECTIONS) {
      await expect(reveal(page, id)).toHaveCSS("opacity", "1", { timeout: 5000 });
    }
  });

  test("does not scroll horizontally", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("the GitHub section shows the activity graph or a fallback link", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#github");
    const graph = section.getByRole("img", { name: /contribution/ });
    const fallback = section.getByText("The activity graph is unavailable right now");
    await expect(graph.or(fallback)).toBeVisible();
    await expect(section.getByRole("link", { name: /@codewitheywu/ })).toHaveAttribute(
      "href",
      "https://github.com/codewitheywu"
    );
  });

  test("contact points to real destinations", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(contact.getByRole("link", { name: "andrevpesquerra@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:andrevpesquerra@gmail.com"
    );
    for (const link of await page.locator('a[target="_blank"]').all()) {
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });
});

test.describe("layout", () => {
  test("desktop shows the sidebar; smaller screens show the top bar", async ({ page }) => {
    await page.goto("/");
    const width = page.viewportSize()?.width ?? 0;
    const sidebar = page.getByRole("complementary", { name: "Site" });
    const menu = page.getByRole("button", { name: "Menu" });

    if (width >= 1024) {
      await expect(sidebar).toBeVisible();
      await expect(menu).toBeHidden();
    } else {
      await expect(sidebar).toBeHidden();
      await expect(menu).toBeVisible();
    }
  });

  test("sidebar links scroll to and mark the current section", async ({ page }) => {
    await page.goto("/");
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "Sidebar is desktop-only");

    const link = page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: /Certifications/ });
    await link.click();
    await expect(page.locator("#certifications")).toBeInViewport();
    await expect(link).toHaveAttribute("aria-current", "location");
  });

  test("interactive targets are at least 44px tall on touch screens", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Touch target size applies to touch layouts");
    await page.goto("/");
    await revealAllSections(page);

    const small = await page.evaluate(() =>
      [...document.querySelectorAll("header a, header button, main a, main button")]
        .filter((el) => el.getClientRects().length > 0)
        .map((el) => ({ text: (el.textContent ?? "").trim().slice(0, 30), h: el.getBoundingClientRect().height }))
        .filter((target) => target.h < 44)
    );
    expect(small).toEqual([]);
  });
});

test.describe("command palette", () => {
  test("opens with Ctrl+K, filters, and jumps to a section", async ({ page }) => {
    await page.goto("/");
    const dialog = await openPalette(page);
    const input = dialog.getByRole("combobox");
    await expect(input).toBeFocused();

    await input.fill("cert");
    await expect(dialog.getByRole("option")).toHaveCount(1);
    await page.keyboard.press("Enter");

    await expect(dialog).toBeHidden();
    await expect(page.locator("#certifications")).toBeInViewport();
    await expect(page.locator("#certifications-heading")).toBeFocused();
    await expect(page).toHaveURL(/#certifications$/);
  });

  test("arrow keys move the active option", async ({ page }) => {
    await page.goto("/");
    const dialog = await openPalette(page);
    const input = dialog.getByRole("combobox");
    const options = dialog.getByRole("option");

    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(input).toHaveAttribute("aria-activedescendant", (await options.nth(1).getAttribute("id")) ?? "");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(options.last()).toHaveAttribute("aria-selected", "true");
  });

  test("Escape closes it and returns focus to the trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("button", { name: /Jump anywhere|Menu/ })
      .filter({ visible: true })
      .first();
    // Open from the keyboard: Safari does not focus buttons on click, and focus
    // return is what keyboard users rely on.
    await waitForHydration(page);
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("shows a helpful empty state", async ({ page }) => {
    await page.goto("/");
    const dialog = await openPalette(page);
    await dialog.getByRole("combobox").fill("zzzz");
    await expect(dialog.getByRole("option")).toHaveCount(0);
    await expect(dialog).toContainText("Nothing matches");
  });

  test("the mobile menu button opens it", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Menu button is the mobile entry point");
    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("button", { name: "Menu" }).tap();
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  });

  test("has no WCAG A/AA violations while open", async ({ page }) => {
    await page.goto("/");
    await openPalette(page);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).include("dialog").analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});

test.describe("copy email", () => {
  test("confirms the copy for 1.5s", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Clipboard permissions are Chromium-only in Playwright");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    const button = page.getByRole("button", { name: /Copy email address/ });
    await waitForHydration(page);
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await expect(button).toContainText("copied ✓");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("andrevpesquerra@gmail.com");
    await expect(button).toContainText("copy", { timeout: 3000 });
    await expect(button).not.toContainText("copied");
  });
});

test.describe("accessibility", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`no WCAG A/AA violations in ${colorScheme} mode once content is visible`, async ({ browser }) => {
      const { context, page } = await pageInScheme(browser, colorScheme);
      await revealAllSections(page);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(
        results.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target.join(" ")),
        }))
      ).toEqual([]);
      await context.close();
    });
  }

  test("the 404 page has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/missing-page");
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});

// WebKit leaves links out of the tab order unless the user enables Safari's
// "Press Tab to highlight each item", so Tab order is a browser setting there.
const WEBKIT_TAB_ORDER = "WebKit only tabs to links when the user enables it";

test.describe("keyboard", () => {
  test("skip link is the first tab stop and moves focus into main", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile, "Keyboard flow is checked on desktop and tablet");
    test.skip(browserName === "webkit", WEBKIT_TAB_ORDER);
    await page.goto("/");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    const focusedInMain = await page.evaluate(
      () => document.querySelector("main")?.contains(document.activeElement) ?? false
    );
    expect(focusedInMain).toBe(true);
  });

  test("a focused link shows the focus ring", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard flow is checked on desktop and tablet");
    await page.goto("/");
    const link = page.locator("main a").first();
    await link.focus();
    await expect(link).toHaveCSS("outline-style", "solid");
    await expect(link).toHaveCSS("outline-width", "2px");
  });
});

test.describe("routing", () => {
  test("a direct link to a section lands on it", async ({ page }) => {
    await page.goto("/#experience");
    await expect(page.locator("#experience")).toBeInViewport();
  });

  test("refresh keeps the page intact", async ({ page }) => {
    await page.goto("/#contact");
    await page.reload();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("back returns to the previous section after a palette jump", async ({ page }) => {
    await page.goto("/");
    const dialog = await openPalette(page);
    await dialog.getByRole("combobox").fill("certifications");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#certifications$/);
    await page.goBack();
    await expect(page).not.toHaveURL(/#certifications$/);
  });
});

test.describe("themes and motion", () => {
  for (const [colorScheme, background] of [
    ["light", "rgb(246, 239, 230)"],
    ["dark", "rgb(23, 17, 13)"],
  ] as const) {
    test(`follows the system ${colorScheme} scheme`, async ({ browser }) => {
      const { context, page } = await pageInScheme(browser, colorScheme);
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe(background);
      await context.close();
    });
  }

  test("the coffee buttons switch the theme and remember it", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    const background = () => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    const hot = page.getByRole("button", { name: "Hot coffee (dark theme)" });
    const iced = page.getByRole("button", { name: "Iced coffee (light theme)" });

    // The switch animates (View Transitions), so wait for it to land.
    await hot.click();
    await expect(hot).toHaveAttribute("aria-pressed", "true");
    await expect(iced).toHaveAttribute("aria-pressed", "false");
    await expect.poll(background).toBe("rgb(23, 17, 13)");

    await page.reload();
    await waitForHydration(page);
    expect(await background()).toBe("rgb(23, 17, 13)");
    await expect(hot).toHaveAttribute("aria-pressed", "true");

    await iced.click();
    await expect.poll(background).toBe("rgb(246, 239, 230)");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition", /.+/);
  });

  test("the palette can switch the theme", async ({ page }) => {
    await page.goto("/");
    const dialog = await openPalette(page);
    await dialog.getByRole("combobox").fill("hot coffee");
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(dialog).toContainText("Hot coffee it is");
  });

  test("sound effects are off by default and the choice persists", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    const sound = page.getByRole("button", { name: "Sound effects" });
    await expect(sound).toHaveAttribute("aria-pressed", "false");
    await sound.click();
    await expect(sound).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await waitForHydration(page);
    await expect(sound).toHaveAttribute("aria-pressed", "true");
  });

  test("the tools row moves on screen and holds still on hover", async ({ page, isMobile }) => {
    await page.goto("/");
    await waitForHydration(page);
    const marquee = page.locator("#experience .marquee");
    const track = marquee.locator(".marquee-track").first();
    await expect(marquee).toHaveAttribute("data-running", "false");

    await marquee.scrollIntoViewIfNeeded();
    await expect(marquee).toHaveAttribute("data-running", "true");
    if (!isMobile) {
      await page.mouse.move(0, 0);
      await expect(track).toHaveCSS("animation-play-state", "running");
      await marquee.hover();
      await expect(track).toHaveCSS("animation-play-state", "paused");
    }
    // The duplicate track exists only for the loop; assistive tech hears each tool once.
    await expect(marquee.getByRole("list")).toHaveCount(1);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("content fades in without movement", async ({ page }) => {
      await page.goto("/");
      await revealAllSections(page);
      await expect(reveal(page, "projects")).toHaveCSS("transform", "none");
    });

    test("the tools row is a static list", async ({ page }) => {
      await page.goto("/");
      await waitForHydration(page);
      const tracks = page.locator("#experience .marquee-track");
      await expect(tracks.first()).toHaveCSS("animation-name", "none");
      await expect(tracks.nth(1)).toBeHidden();
    });

    test("the theme switches instantly, without the reveal", async ({ page }) => {
      await page.goto("/");
      await waitForHydration(page);
      await page.getByRole("button", { name: "Hot coffee (dark theme)" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition", /.+/);
    });
  });
});

test.describe("stack page", () => {
  test("view all opens the full stack, grouped by category", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.locator("#experience .marquee").scrollIntoViewIfNeeded();
    await page.getByRole("link", { name: "view all" }).click();

    await expect(page).toHaveURL(/[/]stack$/);
    await expect(page).toHaveTitle(/^Stack — /);
    await expect(page.getByRole("heading", { level: 1, name: "Stack" })).toBeVisible();
    for (const category of ["languages", "frameworks & libraries", "databases", "tools & hosting"]) {
      await expect(page.getByRole("heading", { level: 2, name: category })).toBeVisible();
    }
    await expect(page.getByRole("listitem").filter({ hasText: /^PDO$/ })).toBeVisible();
  });

  test("section links lead back to the home page", async ({ page }) => {
    await page.goto("/stack");
    await waitForHydration(page);
    const width = page.viewportSize()?.width ?? 0;
    if (width >= 1024) {
      await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: /Projects/ }).click();
    } else {
      const dialog = await openPalette(page);
      await dialog.getByRole("combobox").fill("projects");
      await page.keyboard.press("Enter");
    }
    await expect(page).toHaveURL(/[/]#projects$/);
    await expect(page.locator("#projects")).toBeInViewport();
  });

  test("has no WCAG A/AA violations", async ({ page }) => {
    // The stack page has no scroll reveals: everything is visible on load.
    await page.goto("/stack");
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});

test.describe("errors and headers", () => {
  test("unknown routes render the styled 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("doesn't exist");
    await expect(page.getByRole("link", { name: /back to the homepage/i })).toHaveAttribute("href", "/");
  });

  test("security headers are set", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["content-security-policy"]).not.toContain("upgrade-insecure-requests");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("robots.txt and sitemap.xml are served", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
  });
});
