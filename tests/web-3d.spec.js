const { test, expect } = require("@playwright/test");
const crypto = require("node:crypto");

const prototypeUrl = "http://127.0.0.1:4173";

test.setTimeout(60_000);

test("renders, builds, and starts a 3D race", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(prototypeUrl);
  await expect(page.locator("#loadingState")).toHaveClass(/ready/);

  const canvas = page.locator("#sandbox");
  const before = crypto.createHash("sha256").update(await canvas.screenshot()).digest("hex");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box.x + box.width * .25, box.y + box.height * .58);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) {
    await page.mouse.move(box.x + box.width * (.25 + i * .04), box.y + box.height * (.58 + Math.sin(i * .7) * .12));
  }
  await page.mouse.up();

  const after = crypto.createHash("sha256").update(await canvas.screenshot()).digest("hex");
  expect(after).not.toBe(before);

  await page.locator('[data-tool="double"]').click();
  await page.mouse.click(box.x + box.width * .72, box.y + box.height * .28);
  const placement = await page.evaluate(() => window.__sandboxMotoDebug.placementState());
  expect(placement.obstacles).toHaveLength(1);
  expect(placement.obstacles[0].snapped).toBe(true);
  expect(Number.isFinite(placement.obstacles[0].rotation)).toBe(true);

  await page.locator("#raceButton").click();
  await expect(page.locator("#modeLabel")).toHaveText("The sandbox is alive");
  await page.waitForTimeout(1200);
  expect(pageErrors).toEqual([]);
});

test("keeps the 3D sandbox usable at a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(prototypeUrl);
  await expect(page.locator("#loadingState")).toHaveClass(/ready/);
  const box = await page.locator("#sandbox").boundingBox();
  expect(box.width).toBeGreaterThan(350);
  expect(box.height).toBeGreaterThan(500);
  await page.screenshot({ path: "tests/prototype-3d-mobile.png", fullPage: true });
});
