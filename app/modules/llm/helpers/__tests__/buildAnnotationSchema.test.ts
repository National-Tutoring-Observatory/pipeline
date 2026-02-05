import { describe, expect, it } from "vitest";
import buildAnnotationSchema from "../buildAnnotationSchema";

describe("buildAnnotationSchema", () => {
  it("should build schema from string properties", () => {
    const input = {
      annotations: [{ name: "test", value: "hello" }],
    };

    const result = buildAnnotationSchema(input);

    expect(result).toEqual({
      type: "object",
      properties: {
        annotations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              value: { type: "string" },
            },
            required: ["name", "value"],
          },
        },
      },
      required: ["annotations"],
    });
  });

  it("should detect boolean types", () => {
    const input = {
      annotations: [{ isActive: true }],
    };

    const result = buildAnnotationSchema(input);

    expect(result).toMatchObject({
      properties: {
        annotations: {
          items: {
            properties: {
              isActive: { type: "boolean" },
            },
          },
        },
      },
    });
  });

  it("should detect number types", () => {
    const input = {
      annotations: [{ count: 42, score: 3.14 }],
    };

    const result = buildAnnotationSchema(input);

    expect(result).toMatchObject({
      properties: {
        annotations: {
          items: {
            properties: {
              count: { type: "number" },
              score: { type: "number" },
            },
          },
        },
      },
    });
  });

  it("should detect array types", () => {
    const input = {
      annotations: [{ tags: ["a", "b", "c"] }],
    };

    const result = buildAnnotationSchema(input);

    expect(result).toMatchObject({
      properties: {
        annotations: {
          items: {
            properties: {
              tags: { type: "array" },
            },
          },
        },
      },
    });
  });

  it("should detect object types", () => {
    const input = {
      annotations: [{ metadata: { key: "value" } }],
    };

    const result = buildAnnotationSchema(input);

    expect(result).toMatchObject({
      properties: {
        annotations: {
          items: {
            properties: {
              metadata: { type: "object" },
            },
          },
        },
      },
    });
  });

  it("should handle mixed property types", () => {
    const input = {
      annotations: [
        {
          name: "test",
          count: 5,
          active: false,
          tags: [],
          meta: {},
        },
      ],
    };

    const result = buildAnnotationSchema(input);

    expect(result).toMatchObject({
      properties: {
        annotations: {
          items: {
            properties: {
              name: { type: "string" },
              count: { type: "number" },
              active: { type: "boolean" },
              tags: { type: "array" },
              meta: { type: "object" },
            },
            required: ["name", "count", "active", "tags", "meta"],
          },
        },
      },
    });
  });

  it("should throw error when annotations array is empty", () => {
    const input = {
      annotations: [],
    };

    expect(() => buildAnnotationSchema(input)).toThrow(
      "buildAnnotationSchema: expected annotationSchema.annotations[0] to exist",
    );
  });

  it("should throw error when annotations is undefined", () => {
    const input = {} as any;

    expect(() => buildAnnotationSchema(input)).toThrow(
      "buildAnnotationSchema: expected annotationSchema.annotations[0] to exist",
    );
  });

  it("should treat null values as string type", () => {
    const input = {
      annotations: [{ nullField: null }],
    };

    const result = buildAnnotationSchema(input);

    expect(result).toMatchObject({
      properties: {
        annotations: {
          items: {
            properties: {
              nullField: { type: "string" },
            },
          },
        },
      },
    });
  });
});
