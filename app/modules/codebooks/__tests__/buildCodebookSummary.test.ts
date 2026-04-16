import { describe, expect, it } from "vitest";
import type { CodebookCategory } from "../codebooks.types";
import {
  buildAnnotationSchemaFromCategories,
  buildCodebookSummary,
} from "../helpers/buildCodebookSummary";

const categories: CodebookCategory[] = [
  {
    _id: "cat1",
    name: "Engagement",
    description: "Level of student engagement",
    codes: [
      {
        _id: "code1",
        code: "high",
        description: "",
        definition: "Student is fully engaged",
        examples: [
          {
            _id: "ex1",
            example: "Student asks follow-up questions",
            exampleType: "HIT",
          },
          {
            _id: "ex2",
            example: "Student gives one word answers",
            exampleType: "MISS",
          },
        ],
      },
      {
        _id: "code2",
        code: "low",
        description: "",
        definition: "Student shows minimal engagement",
        examples: [],
      },
    ],
  },
  {
    _id: "cat2",
    name: "Praise Given",
    description: "Whether the tutor gave praise",
    codes: [
      {
        _id: "code3",
        code: "yes",
        description: "",
        definition: "Tutor praised the student",
        examples: [
          { _id: "ex3", example: "Great job!", exampleType: "HIT" },
          { _id: "ex4", example: "Almost there", exampleType: "NEAR_HIT" },
        ],
      },
      {
        _id: "code4",
        code: "no",
        description: "",
        definition: "Tutor did not praise",
        examples: [],
      },
    ],
  },
];

describe("buildAnnotationSchemaFromCategories", () => {
  it("generates system fields and category fields with codes", () => {
    const result = buildAnnotationSchemaFromCategories(categories);

    expect(result).toHaveLength(5);

    expect(result[0]).toEqual({
      isSystem: true,
      fieldKey: "_id",
      fieldType: "string",
      value: "",
    });
    expect(result[1]).toEqual({
      isSystem: true,
      fieldKey: "identifiedBy",
      fieldType: "string",
      value: "AI",
    });
    expect(result[2]).toEqual({
      isSystem: true,
      fieldKey: "reasoning",
      fieldType: "string",
      value: "",
    });

    expect(result[3]).toEqual({
      isSystem: false,
      fieldKey: "ENGAGEMENT",
      fieldType: "string",
      value: "",
      codes: ["high", "low"],
    });

    expect(result[4]).toEqual({
      isSystem: false,
      fieldKey: "PRAISE_GIVEN",
      fieldType: "string",
      value: "",
      codes: ["yes", "no"],
    });
  });

  it("skips categories with no codes", () => {
    const emptyCategory: CodebookCategory = {
      _id: "cat3",
      name: "Empty",
      description: "No codes here",
      codes: [],
    };

    const result = buildAnnotationSchemaFromCategories([emptyCategory]);
    expect(result).toHaveLength(3);
  });
});

describe("buildCodebookSummary", () => {
  it("includes codebook name and description", () => {
    const result = buildCodebookSummary({
      codebookName: "Test Codebook",
      codebookDescription: "A test codebook",
      categories,
    });

    expect(result).toContain("Codebook: Test Codebook");
    expect(result).toContain("A test codebook");
  });

  it("includes categories, codes, definitions, and examples", () => {
    const result = buildCodebookSummary({
      codebookName: "Test Codebook",
      codebookDescription: "",
      categories,
    });

    expect(result).toContain("## Engagement");
    expect(result).toContain("Level of student engagement");
    expect(result).toContain("### high");
    expect(result).toContain("Student is fully engaged");
    expect(result).toContain('HIT: "Student asks follow-up questions"');
    expect(result).toContain('MISS: "Student gives one word answers"');
    expect(result).toContain("## Praise Given");
    expect(result).toContain('NEAR_HIT: "Almost there"');
  });

  it("handles codes with no examples", () => {
    const noExamples: CodebookCategory[] = [
      {
        _id: "cat4",
        name: "Simple",
        description: "",
        codes: [
          {
            _id: "code5",
            code: "present",
            description: "",
            definition: "Is present",
            examples: [],
          },
        ],
      },
    ];

    const result = buildCodebookSummary({
      codebookName: "Test",
      codebookDescription: "",
      categories: noExamples,
    });

    expect(result).toContain("### present");
    expect(result).toContain("Is present");
  });
});
