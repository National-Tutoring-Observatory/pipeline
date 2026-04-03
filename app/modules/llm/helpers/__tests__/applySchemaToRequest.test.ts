import { describe, expect, it } from "vitest";
import applySchemaToRequest from "../applySchemaToRequest";

describe("applySchemaToRequest", () => {
  it("should set response_format with json_schema when schema is provided", () => {
    const requestParams: any = {};
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    };

    applySchemaToRequest(requestParams, schema);

    expect(requestParams.response_format).toEqual({
      type: "json_schema",
      json_schema: {
        name: "structured_output",
        schema,
      },
    });
  });

  it("should not add tools or tool_choice when schema is provided", () => {
    const requestParams: any = {};
    const schema = { type: "object" };

    applySchemaToRequest(requestParams, schema);

    expect(requestParams.tools).toBeUndefined();
    expect(requestParams.tool_choice).toBeUndefined();
  });

  it("should add response_format with json_object when schema is undefined", () => {
    const requestParams: any = {};

    applySchemaToRequest(requestParams, undefined);

    expect(requestParams.response_format).toEqual({ type: "json_object" });
  });

  it("should not add tools when schema is undefined", () => {
    const requestParams: any = {};

    applySchemaToRequest(requestParams, undefined);

    expect(requestParams.tools).toBeUndefined();
    expect(requestParams.tool_choice).toBeUndefined();
  });

  it("should preserve existing properties on requestParams", () => {
    const requestParams: any = {
      model: "gpt-4",
      messages: [{ role: "user", content: "Hello" }],
    };
    const schema = { type: "object" };

    applySchemaToRequest(requestParams, schema);

    expect(requestParams.model).toBe("gpt-4");
    expect(requestParams.messages).toEqual([
      { role: "user", content: "Hello" },
    ]);
    expect(requestParams.response_format).toBeDefined();
  });

  it("should handle complex schema", () => {
    const requestParams: any = {};
    const schema = {
      type: "object",
      properties: {
        annotations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              score: { type: "number" },
            },
            required: ["label", "score"],
          },
        },
      },
      required: ["annotations"],
    };

    applySchemaToRequest(requestParams, schema);

    expect(requestParams.response_format.json_schema.schema).toEqual(schema);
  });
});
