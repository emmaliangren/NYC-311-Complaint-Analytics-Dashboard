import { describe, it } from "vitest";
import { ENDPOINTS as E, FIXTURES as F } from "../mocks/constants";
import { mock } from "../mocks/mock";
import { checkHealth } from "./api";
import { expectResult } from "../tests/helpers";

describe("checkHealth", () => {
  it("returns parsed health response", async () => {
    mock.success(E.health, F.health.ok);
    await expectResult(checkHealth, F.health.ok);
  });

  it("returns error status on failure", async () => {
    mock.failure(E.health);
    await expectResult(checkHealth, F.health.error);
  });

  it("returns error status on network failure", async () => {
    mock.offline(E.health);
    await expectResult(checkHealth, F.health.error);
  });
});
