import { before, test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { toDateKey } from "../lib/streak";

type ProgressRecord = {
  userId: string;
  done: string[];
  revision: number;
  trackedIds: string[];
  activityLog: Map<string, number>;
  currentStreak?: number;
};
let record: ProgressRecord | null = null;
let user: Record<string, unknown> | null = null;
const harness = { userId: "test-account" as string | null, dbCalls: 0 };
const query = () => ({
  select() {
    return this;
  },
  async lean() {
    return user;
  },
  then(resolve: (value: unknown) => void) {
    return Promise.resolve(user).then(resolve);
  },
});
const models = {
  Progress: {
    async findOne() {
      return record;
    },
    async updateOne() {
      record ??= {
        userId: "test-account",
        done: [],
        revision: 0,
        trackedIds: [],
        activityLog: new Map(),
      };
    },
    async findOneAndUpdate(
      filter: { $or: { revision: number }[] },
      update: { $set: Record<string, unknown>; $inc: { revision: number } },
    ) {
      if (!record || record.revision !== filter.$or[0].revision) return null;
      Object.assign(record, update.$set, {
        activityLog: new Map(
          Object.entries(update.$set.activityLog as Record<string, number>),
        ),
        revision: record.revision + update.$inc.revision,
      });
      return record;
    },
  },
  User: {
    findOne: query,
    findOneAndUpdate(
      _filter: unknown,
      update: { $set: Record<string, unknown> },
    ) {
      user = { ...user, ...update.$set };
      return query();
    },
  },
};
Object.assign(globalThis, { __apiHarness: harness, __apiModels: models });
let progress: typeof import("../app/api/progress/route");
let users: typeof import("../app/api/user/route");

before(async () => {
  for (const name of ["progress", "user"]) {
    await build({
      entryPoints: [`app/api/${name}/route.ts`],
      outfile: `.qa/api/${name}.mjs`,
      bundle: true,
      platform: "node",
      format: "esm",
      packages: "external",
      plugins: [
        {
          name: "isolated-api-dependencies",
          setup(plugin) {
            plugin.onResolve(
              { filter: /^(@clerk\/nextjs\/server|@\/lib\/(db|models))$/ },
              (args) => ({ path: args.path, namespace: "test" }),
            );
            plugin.onLoad({ filter: /.*/, namespace: "test" }, (args) => ({
              contents: args.path.includes("clerk")
                ? "export async function auth(){return {userId:globalThis.__apiHarness.userId}}; export async function currentUser(){return {imageUrl:''}}"
                : args.path.endsWith("models")
                  ? "export const Progress=globalThis.__apiModels.Progress; export const User=globalThis.__apiModels.User;"
                  : "export async function connectDB(){globalThis.__apiHarness.dbCalls++}",
              loader: "js",
            }));
          },
        },
      ],
    });
  }
  progress = await import(pathToFileURL(resolve(".qa/api/progress.mjs")).href);
  users = await import(pathToFileURL(resolve(".qa/api/user.mjs")).href);
});
const request = (body: unknown, method = "PUT") =>
  new Request("http://localhost/api/progress", {
    method,
    body: JSON.stringify(body),
  });

test("all API handlers reject unauthenticated requests before touching data", async () => {
  harness.userId = null;
  const baseline = harness.dbCalls;
  for (const response of [
    await progress.GET(),
    await progress.PUT(request({})),
    await users.GET(),
    await users.POST(request({}, "POST")),
    await users.PATCH(request({}, "PATCH")),
  ])
    assert.equal(response.status, 401);
  assert.equal(harness.dbCalls, baseline);
  harness.userId = "test-account";
});

test("progress endpoint validates bodies and revisions before touching data", async () => {
  const baseline = harness.dbCalls;
  for (const body of [
    { done: ["unknown"], revision: 0 },
    { done: "0-0", revision: 0 },
    { done: [], revision: -1 },
    { done: [], revision: "0" },
    { done: [] },
  ])
    assert.equal((await progress.PUT(request(body))).status, 400);
  assert.equal(harness.dbCalls, baseline);
});

test("progress saves are versioned and toggling cannot inflate daily activity", async () => {
  record = null;
  const first = await progress.PUT(request({ done: ["0-0"], revision: 0 }));
  assert.equal(first.status, 200);
  const saved = await first.json();
  assert.equal(saved.revision, 1);
  assert.equal(saved.activityLog[toDateKey(new Date())], 1);
  const stale = await progress.PUT(request({ done: ["0-1"], revision: 0 }));
  assert.equal(stale.status, 409);
  assert.deepEqual(record!.done, ["0-0"]);
  assert.equal(
    (await progress.PUT(request({ done: [], revision: 1 }))).status,
    200,
  );
  const repeated = await progress.PUT(request({ done: ["0-0"], revision: 2 }));
  assert.equal((await repeated.json()).activityLog[toDateKey(new Date())], 1);
});

test("progress reads recalculate expired streaks instead of returning stale stored values", async () => {
  record = {
    userId: "test-account",
    done: [],
    revision: 0,
    trackedIds: [],
    currentStreak: 99,
    activityLog: new Map([["2020-01-01", 1]]),
  };
  const data = await (await progress.GET()).json();
  assert.equal(data.currentStreak, 0);
  assert.equal(data.maxStreak, 1);
});

test("profile setup cannot bypass rename cooldown and PATCH rejects unsafe fields", async () => {
  user = {
    username: "original_name",
    avatarUrl: "",
    usernameChangedAt: new Date(),
    avatarChangedAt: null,
  };
  const setup = await users.POST(request({ username: "renamed_user" }, "POST"));
  assert.equal(setup.status, 200);
  assert.equal((await setup.json()).user.username, "original_name");
  assert.equal(
    (await users.PATCH(request({ username: "renamed_user" }, "PATCH"))).status,
    429,
  );
  for (const body of [
    { username: {} },
    { avatarUrl: "javascript:alert(1)" },
    { links: [] },
    { links: { github: "https://evil.example/me" } },
  ])
    assert.equal((await users.PATCH(request(body, "PATCH"))).status, 400);
});
