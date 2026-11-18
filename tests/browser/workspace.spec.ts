import { test, expect, type Page } from "@playwright/test";
import { ALL_QUESTIONS, TOPICS } from "../../lib/data";

const profile = {
  username: "test_learner",
  avatarUrl: "",
  joinedAt: "2026-01-01",
  usernameChangedAt: null,
  avatarChangedAt: null,
  links: { leetcode: "", github: "", linkedin: "" },
};

async function mockWorkspace(
  page: Page,
  options: { setup?: boolean; failUser?: boolean } = {},
) {
  const state = {
    done: [] as string[],
    revision: 0,
    activityLog: {},
    currentStreak: 0,
    maxStreak: 0,
  };
  const control = {
    offline: false,
    failSave: false,
    conflict: false,
    failUser: options.failUser ?? false,
    user: options.setup ? null : { ...profile },
    delaySave: 0,
  };
  await page.route("https://www.google.com/**", (route) => route.abort());
  await page.route("**/api/user", async (route) => {
    if (control.failUser)
      return route.fulfill({
        status: 503,
        json: { error: "Profile connection unavailable" },
      });
    if (route.request().method() !== "GET")
      control.user = { ...profile, ...route.request().postDataJSON() };
    await route.fulfill({ json: { user: control.user } });
  });
  await page.route("**/api/progress", async (route) => {
    if (control.offline) return route.abort();
    if (route.request().method() === "PUT") {
      if (control.failSave)
        return route.fulfill({
          status: 503,
          json: { error: "Save unavailable" },
        });
      if (control.conflict) {
        control.conflict = false;
        state.done = ["0-1"];
        state.revision++;
        return route.fulfill({ status: 409, json: { error: "Conflict" } });
      }
      const body = route.request().postDataJSON();
      if (control.delaySave)
        await new Promise((resolve) => setTimeout(resolve, control.delaySave));
      if (body.revision !== state.revision)
        return route.fulfill({ status: 409, json: { error: "Conflict" } });
      state.done = body.done;
      state.revision++;
    }
    await route.fulfill({ json: state });
  });
  await page.route("**/api/leaderboard", (route) =>
    route.fulfill({ json: { rows: [] } }),
  );
  return { state, control };
}

test("overview, navigation, exports, and responsive layout", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockWorkspace(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your next chapter/ }),
  ).toBeVisible();
  await expect(page.locator(".topic-card")).toHaveCount(TOPICS.length);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `.qa/overview-${info.project.name}.png`,
    fullPage: true,
  });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  expect((await download).suggestedFilename()).toBe("dsa-sheet-progress.csv");
  await page.getByRole("button", { name: "Membership", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /A better practice routine/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to your workspace" }).click();
  await expect(
    page.getByRole("heading", { name: /Your next chapter/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("solving, filters, safe reset, and reload persistence", async ({
  page,
}, info) => {
  const { state } = await mockWorkspace(page);
  await page.goto("/#arrays");
  const first = page.getByRole("checkbox").first();
  await first.check();
  await expect.poll(() => state.done).toEqual(["0-0"]);
  await page.getByRole("button", { name: "Done 1", exact: true }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await page.getByRole("button", { name: "Reset topic", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(first).toBeChecked();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `.qa/topic-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Reset topic", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset topic", exact: true })
    .click();
  await expect.poll(() => state.done).toEqual([]);
  await page
    .getByRole("searchbox", { name: "Search questions" })
    .fill("no-such-problem");
  await expect(
    page.getByRole("heading", { name: "No questions match" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(
    TOPICS[0].questions.length,
  );
});

test("global search deep-links to the matching question", async ({ page }) => {
  await mockWorkspace(page);
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Search all questions" })
    .fill("Valid Anagram");
  await page.getByRole("button", { name: /Valid Anagram Strings/ }).click();
  await expect(
    page.getByRole("heading", { name: "Strings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search questions" }),
  ).toHaveValue("Valid Anagram");
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: /Search LeetCode/ }),
  ).toHaveAttribute("href", /problemset\/\?search=/);
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Strings", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: /Your next chapter/ }),
  ).toBeVisible();
});

test("failed saves recover after reload without silently losing edits", async ({
  page,
}) => {
  const { state, control } = await mockWorkspace(page);
  await page.goto("/#arrays");
  control.failSave = true;
  await page.getByRole("checkbox").first().check();
  await expect(page.getByRole("alert")).toContainText("saved on this device");
  expect(state.done).toEqual([]);
  control.offline = true;
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  control.offline = false;
  control.failSave = false;
  await page.getByRole("button", { name: "Retry sync" }).click();
  await expect.poll(() => state.done).toEqual(["0-0"]);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("concurrent device edits merge and edits made during a save stay queued", async ({
  page,
}) => {
  const { state, control } = await mockWorkspace(page);
  await page.goto("/#arrays");
  control.conflict = true;
  await page.getByRole("checkbox").first().check();
  await expect.poll(() => [...state.done].sort()).toEqual(["0-0", "0-1"]);
  control.delaySave = 600;
  const request = page.waitForRequest((request) => request.method() === "PUT");
  await page.getByRole("checkbox").nth(2).check();
  await request;
  await page.getByRole("checkbox").nth(2).uncheck();
  await expect.poll(() => [...state.done].sort()).toEqual(["0-0", "0-1"]);
  await expect(page.locator(".sync-status")).toContainText("All changes saved");
  await page.reload();
  await expect(page.getByRole("checkbox").nth(2)).not.toBeChecked();
});

test("a second account never receives another account's recovery data", async ({
  page,
}) => {
  const { control } = await mockWorkspace(page);
  await page.goto("/#arrays");
  control.failSave = true;
  await page.getByRole("checkbox").first().check();
  await expect(page.getByRole("alert")).toBeVisible();
  control.failSave = false;
  await page.goto("/?account=second-user#arrays");
  await expect(page.getByRole("checkbox").first()).not.toBeChecked();
});

test("disabled browser storage never claims edits are safely cached", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  const { control } = await mockWorkspace(page);
  await page.goto("/#arrays");
  control.failSave = true;
  await page.getByRole("checkbox").first().check();
  await expect(page.getByRole("alert")).toContainText("only in this tab");
});

test("profile errors retry, canceled edits reset, and activity stays within the viewport", async ({
  page,
}, info) => {
  const { control } = await mockWorkspace(page);
  await page.goto("/");
  await expect(page.locator(".topic-card")).toHaveCount(TOPICS.length);
  control.failUser = true;
  await page.getByRole("button", { name: "My profile" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Profile connection unavailable",
  );
  control.failUser = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "@test_learner" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.getByLabel("Username", { exact: true }).fill("unsaved_name");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await expect(page.getByLabel("Username", { exact: true })).toHaveValue(
    "test_learner",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.screenshot({
    path: `.qa/profile-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Leaderboard", exact: true }).click();
  await page.getByRole("button", { name: "Your badges", exact: true }).click();
  await expect(page.locator(".badge-card")).toHaveCount(14);
});

test("setup only submits valid usernames and recovers from failed requests", async ({
  page,
}) => {
  const { control } = await mockWorkspace(page, { setup: true });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your journey starts here." }),
  ).toBeVisible();
  await page.getByLabel("Your username", { exact: true }).fill("ab");
  await expect(
    page.getByRole("button", { name: "Let's get started" }),
  ).toBeDisabled();
  await page.getByLabel("Your username", { exact: true }).fill("learner_03");
  control.failUser = true;
  await page.getByRole("button", { name: "Let's get started" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Profile connection unavailable",
  );
  control.failUser = false;
  await page.getByRole("button", { name: "Let's get started" }).click();
  await expect(page.locator(".topic-card")).toHaveCount(TOPICS.length);
  expect(ALL_QUESTIONS.length).toBe(375);
});
