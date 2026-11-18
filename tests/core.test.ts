import test from "node:test";
import assert from "node:assert/strict";
import {
  ALL_QUESTIONS,
  QUESTION_IDS,
  TOPICS,
  TOTAL,
  validQuestionIds,
} from "../lib/data";
import { computeStats } from "../lib/badges";
import { computeStreaks } from "../lib/streak";
import { applyChanges, parseCache } from "../lib/progress";
import {
  daysLeft,
  normalizeHandle,
  normalizeUsername,
  validAvatar,
} from "../lib/profile";
import { InputError, readBody } from "../lib/http";

test("every sheet question has a unique stable ID, valid links, and unique company tags", () => {
  assert.equal(TOTAL, 375);
  assert.equal(QUESTION_IDS.size, TOTAL);
  assert.equal(new Set(TOPICS.map((topic) => topic.slug)).size, TOPICS.length);
  for (const question of ALL_QUESTIONS) {
    assert.equal(
      new Set(question.companies.map((company) => company.name)).size,
      question.companies.length,
    );
    assert.equal(new URL(question.leetcode).pathname, "/problemset/");
    assert.equal(
      new URL(question.leetcode).searchParams.get("search"),
      question.title,
    );
  }
});

test("unknown and duplicate IDs cannot inflate scores", () => {
  assert.deepEqual(validQuestionIds(["0-0", "invalid", null, "0-0"]), ["0-0"]);
  const stats = computeStats(new Set(["invalid", "0-0"]));
  assert.equal(stats.totalSolved, 1);
  assert.equal(stats.badges.includes("legend"), false);
});

test("halfway remains earned and completing the sheet earns topic and sheet badges", () => {
  const halfway = Math.ceil(TOTAL / 2);
  assert.equal(
    computeStats(
      new Set(ALL_QUESTIONS.slice(0, halfway - 1).map((q) => q.id)),
    ).badges.includes("half_way"),
    false,
  );
  assert.equal(
    computeStats(
      new Set(ALL_QUESTIONS.slice(0, halfway).map((q) => q.id)),
    ).badges.includes("half_way"),
    true,
  );
  const stats = computeStats(new Set(QUESTION_IDS));
  for (const badge of ["half_way", "legend", "topic_all"])
    assert.ok(stats.badges.includes(badge));
  assert.equal(stats.topicsDone, TOPICS.length);
});

test("streaks expire, allow yesterday, ignore empty, invalid, and future activity", () => {
  const now = new Date("2026-11-18T01:00:00Z");
  assert.deepEqual(computeStreaks({}, now), { currentStreak: 0, maxStreak: 0 });
  assert.deepEqual(computeStreaks({ "2026-11-16": 2, "2026-11-17": 1 }, now), {
    currentStreak: 2,
    maxStreak: 2,
  });
  assert.deepEqual(computeStreaks({ "2026-11-14": 2, "2026-11-15": 1 }, now), {
    currentStreak: 0,
    maxStreak: 2,
  });
  assert.deepEqual(
    computeStreaks(
      { "2026-11-18": 0, "2026-11-19": 5, invalid: 1, "2026-02-30": 1 },
      now,
    ),
    { currentStreak: 0, maxStreak: 0 },
  );
  assert.deepEqual(
    computeStreaks(
      new Map([
        ["2026-03-07", 1],
        ["2026-03-08", 1],
        ["2026-03-09", 1],
      ]),
      new Date("2026-03-09T23:59:00Z"),
    ),
    { currentStreak: 3, maxStreak: 3 },
  );
});

test("device changes merge with concurrent remote progress, including explicit removals", () => {
  assert.deepEqual(
    applyChanges(["0-0", "0-1"], {
      "0-0": { value: false },
      "0-2": { value: true },
    }),
    ["0-1", "0-2"],
  );
  assert.deepEqual(applyChanges(["0-1"], { invalid: { value: true } }), [
    "0-1",
  ]);
});

test("recovery handles corrupted data without accepting arbitrary IDs or operations", () => {
  for (const raw of [null, "{", "[]", "null", '{"done":[]}'])
    assert.equal(parseCache(raw), null);
  assert.deepEqual(
    parseCache(
      '{"done":["0-0","bad"],"pending":{"0-1":{"value":true},"0-2":{"value":"yes"},"bad":{"value":true}}}',
    ),
    { done: ["0-0"], pending: { "0-1": { value: true } } },
  );
});

test("profile validation rejects unsafe input and accepts service-specific URLs", () => {
  assert.equal(normalizeUsername(" Alice_03 "), "alice_03");
  for (const value of [3, {}, "a", "abc<script>"])
    assert.equal(normalizeUsername(value), null);
  assert.equal(normalizeHandle("https://github.com/alice/", "github"), "alice");
  assert.equal(
    normalizeHandle("https://linkedin.com/in/alice-dev", "linkedin"),
    "alice-dev",
  );
  assert.equal(normalizeHandle("https://evil.example/alice", "github"), null);
  assert.equal(normalizeHandle("https://github.com/in/alice", "github"), null);
  assert.equal(normalizeHandle("https://linkedin.com/alice", "linkedin"), null);
  assert.equal(normalizeHandle("javascript:alert(1)", "github"), null);
  assert.equal(validAvatar("javascript:alert(1)"), false);
  assert.equal(validAvatar("data:image/svg+xml;base64,PHN2Zz4="), false);
  assert.equal(validAvatar("https://example.com/avatar.png"), true);
  assert.equal(validAvatar("a".repeat(350001)), false);
  assert.equal(daysLeft(null), 0);
  assert.equal(daysLeft("2026-11-01", Date.parse("2026-11-18")), 13);
});

test("request bodies reject malformed JSON, arrays, nulls, and excessive payloads", async () => {
  const request = (body: string) =>
    new Request("http://localhost", { method: "PUT", body });
  for (const value of ["{", "[]", "null", "4"])
    await assert.rejects(readBody(request(value)), InputError);
  await assert.rejects(readBody(request('{"text":"long"}'), 5), InputError);
  assert.deepEqual(await readBody(request('{"done":[]}')), { done: [] });
});
