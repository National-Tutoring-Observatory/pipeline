import { describe, expect, it } from "vitest";
import applySchemaToRequest from "../applySchemaToRequest";

describe("applySchemaToRequest", () => {
  it("should add tools and tool_choice when schema is provided", () => {
    const requestParams: any = {};
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    };

    applySchemaToRequest(requestParams, schema);

    expect(requestParams.tools).toEqual([
      {
        type: "function",
        function: {
          name: "structured_output",
          description: "Return the response in the required structured format",
          parameters: schema,
        },
      },
    ]);
    expect(requestParams.tool_choice).toEqual({
      type: "function",
      function: { name: "structured_output" },
    });
  });

  it("should not add response_format when schema is provided", () => {
    const requestParams: any = {};
    const schema = { type: "object" };

    applySchemaToRequest(requestParams, schema);

    expect(requestParams.response_format).toBeUndefined();
  });

  it("should add response_format when schema is undefined", () => {
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
    expect(requestParams.tools).toBeDefined();
  });

  it("should overwrite existing tools when schema is provided", () => {
    const requestParams: any = {
      tools: [{ type: "existing_tool" }],
    };
    const schema = { type: "object" };

    applySchemaToRequest(requestParams, schema);

    expect(requestParams.tools).toHaveLength(1);
    expect(requestParams.tools[0].type).toBe("function");
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

    expect(requestParams.tools[0].function.parameters).toEqual(schema);
  });
});
