import type { AnnotationSchemaItem } from "../prompts.types";

interface DefaultPromptDefinition {
  name: string;
  annotationType: "PER_UTTERANCE" | "PER_SESSION";
  userPrompt: string;
  annotationSchema: AnnotationSchemaItem[];
}

const SYSTEM_FIELDS: AnnotationSchemaItem[] = [
  { isSystem: true, fieldKey: "_id", fieldType: "string", value: "" },
  {
    isSystem: true,
    fieldKey: "identifiedBy",
    fieldType: "string",
    value: "AI",
  },
  { isSystem: true, fieldKey: "reasoning", fieldType: "string", value: "" },
];

const DEFAULT_PROMPTS: DefaultPromptDefinition[] = [
  {
    name: "Talk Moves",
    annotationType: "PER_UTTERANCE",
    userPrompt: `# Role
You are an expert educational discourse analyst. Your task is to label each teacher utterance (Speaker = T) with one **TalkMove** from the allowed moves list.

# Workflow
1.  **Read the dialogue carefully.**
2.  **For each teacher utterance (Speaker = T)**, assign up to **ONE** TalkMove from the Allowed Moves list.
3.  If an utterance could fit multiple moves, choose the one that best represents the communicative function in context.

# Allowed Moves
Use only these six moves exactly as written:
1.  Keeping Everyone Together
2.  Getting Students to Relate to Another's Ideas
3.  Restating
4.  Pressing for Accuracy
5.  Revoicing
6.  Pressing for Reasoning

# Move Definitions
* **Keeping Everyone Together**: Teacher prompts students to be active listeners and orienting students to each other.
* **Getting Students to Relate to Another's Ideas**: Teacher prompts students to react to what a classmate said.
* **Restating**: Teacher repeats all or part of what a student said word for word.
* **Pressing for Accuracy**: Teacher prompts students to make a mathematical contribution by requesting correct answers or procedures and holding students to accuracy.
* **Revoicing**: Teacher repeats what a student said but adding on or changing the wording to hold student accountable to rigorous thinking.
* **Pressing for Reasoning**: Teacher prompts students to explain, provide evidence, share their thinking behind a decision, or connect ideas or representations.

# Move Examples
* **Keeping Everyone Together**:
    * "So x equals five dollars, right?"
    * "It's going to be 150, right?"
    * "Are you finished?"
* **Getting Students to Relate to Another's Ideas**:
    * "How do you feel about what they said?"
    * "Does anyone understand how she solved the problem?"
    * "Do you agree or disagree with him?"
* **Restating**:
    * "S: It moves to a different position. T: It moves to a different position."
    * "S: An exponent. T: Exponent."
    * "S: It's four million and then the two. T: Four million two."
* **Pressing for Accuracy**:
    * "What is the answer to number 2?"
    * "How did you solve it?"
    * "What does x stand for?"
* **Revoicing**:
    * "S: It had two. T: So instead of one flat edge, it had two."
    * "S: Oh, Company B. T: It's Company B because that's the one that charges you $2.00 per minute."
    * "S: La respuesta es siete. T: The answer is seven."
* **Pressing for Reasoning**:
    * "Can you explain why?"
    * "How are these ideas connected?"
    * "Where do we see the x + 1 in the tiles?"

# Clarifications
* Do not use synonyms or rephrasings for the TalkMoves.
* Multiple consecutive utterances can have the same TalkMove.
* **Do not code student utterances** or teacher talk that does not elicit or build on student contributions.
* Exclude evaluative remarks (e.g., "Good job!"), off-task talk, or administrative directions.`,
    annotationSchema: [
      ...SYSTEM_FIELDS,
      {
        isSystem: false,
        fieldKey: "TalkMove",
        fieldType: "string",
        value: "",
        codes: [
          "Keeping Everyone Together",
          "Getting Students to Relate to Another's Ideas",
          "Restating",
          "Pressing for Accuracy",
          "Revoicing",
          "Pressing for Reasoning",
        ],
      },
    ],
  },
  {
    name: "Interaction Types",
    annotationType: "PER_UTTERANCE",
    userPrompt: `# Workflow
For each relevant utterance (student or tutor), assign ONE label from Allowed Interactions.
- If multiple codes seem plausible, choose the one that best explains the primary function in context.
- Not every utterance needs a code.
- Return only IDs from Allowed Interactions - no synonyms or casing changes.

# Allowed Interactions
- "STUDENT_CONFUSION"
- "TEACHER_SUPPORT"
- "CRITICAL_THINKING_PROMPT"`,
    annotationSchema: [
      ...SYSTEM_FIELDS,
      {
        isSystem: false,
        fieldKey: "INTERACTION_TYPE",
        fieldType: "string",
        value: "",
        codes: [
          "STUDENT_CONFUSION",
          "TEACHER_SUPPORT",
          "CRITICAL_THINKING_PROMPT",
        ],
      },
    ],
  },
  {
    name: "Tutoring Quality Rubric",
    annotationType: "PER_SESSION",
    userPrompt: `The evidence for the student's action might be from the reaction of the tutor afterwards. Analyze the tutoring transcripts below and score the tutor on the following 6 binary (0 or 1) dimensions. For each dimension, return both a binary score (0 or 1) and a short piece of evidence from the transcript under that dimension name.

### RUBRIC DIMENSIONS (Return 0 or 1 for each)
1.  **reacting_to_errors**: \`0\` = The student made a mistake and the tutor either gave the answer OR pointed out the error directly. \`1\` = The tutor responded to a math error by asking the student to explain their thinking OR prompting them to think again. \`0\` = No evidence of a student making a math error.
2.  **giving_praise**: \`1\` = The tutor praises the student for their effort during the problem. \`0\` = The tutor does not praise the student.
3.  **determining_what_students_know**: \`1\` = The tutor asks open-ended questions to check what the student already knows on a problem. \`0\` = No attempt to check prior knowledge.
4.  **affirming_correct_attempt**: \`1\` = The tutor affirms a correct response or student's correct reasoning. \`0\` = The tutor does not respond to a correct answer or a correct attempt at an explanation of the student's reasoning.
5.  **asking_guiding_questions**: \`1\` = The tutor asks guiding questions. \`0\` = The tutor only gives instructions or answers without asking questions.
6.  **prompting_to_explain**: \`1\` = The tutor prompts the student to explain their thinking. \`0\` = No prompt to explain thinking.`,
    annotationSchema: [
      ...SYSTEM_FIELDS,
      {
        isSystem: false,
        fieldKey: "reacting_to_errors",
        fieldType: "number",
        value: 0,
      },
      {
        isSystem: false,
        fieldKey: "reacting_to_errors_evidence",
        fieldType: "string",
        value: "",
      },
      {
        isSystem: false,
        fieldKey: "giving_praise",
        fieldType: "number",
        value: 0,
      },
      {
        isSystem: false,
        fieldKey: "giving_praise_evidence",
        fieldType: "string",
        value: "",
      },
      {
        isSystem: false,
        fieldKey: "determining_what_students_know",
        fieldType: "number",
        value: 0,
      },
      {
        isSystem: false,
        fieldKey: "determining_what_students_know_evidence",
        fieldType: "string",
        value: "",
      },
      {
        isSystem: false,
        fieldKey: "affirming_correct_attempt",
        fieldType: "number",
        value: 0,
      },
      {
        isSystem: false,
        fieldKey: "affirming_correct_attempt_evidence",
        fieldType: "string",
        value: "",
      },
      {
        isSystem: false,
        fieldKey: "asking_guiding_questions",
        fieldType: "number",
        value: 0,
      },
      {
        isSystem: false,
        fieldKey: "asking_guiding_questions_evidence",
        fieldType: "string",
        value: "",
      },
      {
        isSystem: false,
        fieldKey: "prompting_explanation",
        fieldType: "number",
        value: 0,
      },
      {
        isSystem: false,
        fieldKey: "prompting_explanation_evidence",
        fieldType: "string",
        value: "",
      },
    ],
  },
];

export default DEFAULT_PROMPTS;
export type { DefaultPromptDefinition };
