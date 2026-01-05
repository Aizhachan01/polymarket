import { describe, it, expect } from "@jest/globals";
import { supabase } from "../../src/config/database.js";

describe("Database Connection", () => {
  it("should connect to Supabase successfully", async () => {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("should be able to query users table", async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, username")
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should be able to query markets table", async () => {
    const { data, error } = await supabase
      .from("markets")
      .select("id, title, status")
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should be able to query bets table", async () => {
    const { data, error } = await supabase
      .from("bets")
      .select("id, user_id, market_id, side, amount")
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should handle invalid queries gracefully", async () => {
    const { data, error } = await supabase
      .from("nonexistent_table")
      .select("*");

    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
});
