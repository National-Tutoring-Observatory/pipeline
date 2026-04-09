import type { AnnotationSchemaItem } from "../prompts.types";

interface DefaultPromptDefinition {
  name: string;
  annotationType: "PER_UTTERANCE" | "PER_SESSION";
  userPrompt: string;
  annotationSchema: AnnotationSchemaItem[];
}

export const SYSTEM_FIELDS: AnnotationSchemaItem[] = [
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
    name: "Talk Moves (sample prompt)",
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
    name: "Tutor Moves (sample prompt)",
    annotationType: "PER_UTTERANCE",
    userPrompt: `# Role
You are an expert educational discourse analyst. Your task is to analyze tutoring transcripts and classify the **LEARNING_SUPPORT** using the taxonomy provided below.

# Workflow
1.  **Read the dialogue carefully.**
2.  **For each tutor utterance (Speaker = T)**, identify the most specific Code from the taxonomy.

# Allowed Moves
* PROMPTING_RELATED_CONCEPTS
* PROMPTING_ALTERNATIVE_REPRESENTATION
* PROMPTING_SELF_EXPLANATION
* PROMPTING_NEXT_STEP
* PROMPTING_SELF_CORRECTION
* FEEDBACK_CORRECT
* FEEDBACK_INCORRECT
* FEEDBACK_NEUTRAL
* REVOICING
* RESTATING
* GIVING_HINT
* GIVING_EXAMPLE
* EXPLAINING_CONCEPTUAL
* EXPLAINING_PROCEDURAL
* GIVING_ANSWER

# Move Definitions
* **PROMPTING_RELATED_CONCEPTS**: Tutor asks the student to recall or define a related mathematical concept or term without providing the explanation themselves.
* **PROMPTING_ALTERNATIVE_REPRESENTATION**: Tutor asks the student to show the information in a different way (e.g., drawing a diagram or writing an equation).
* **PROMPTING_SELF_EXPLANATION**: Tutor asks the student to justify their logic or explain "why" they took a certain step.
* **PROMPTING_NEXT_STEP**: Tutor prompts the student to perform the very next logical step in a procedure without giving away new information.
* **PROMPTING_SELF_CORRECTION**: Tutor points out that an error exists and asks the student to find and fix it themselves.
* **FEEDBACK_CORRECT**: Explicitly confirming that the student's specific answer or step is right.
* **FEEDBACK_INCORRECT**: Explicitly stating that a student's answer or step is wrong.
* **FEEDBACK_NEUTRAL**: Acknowledging a student's contribution or presence without confirming if it is mathematically correct.
* **REVOICING**: Repeating what the student said but polishing the language or adding technical terms to be more rigorous.
* **RESTATING**: Repeating the student's contribution almost exactly as they said it.
* **GIVING_HINT**: Providing partial information that guides the student toward the answer without doing the work for them.
* **GIVING_EXAMPLE**: Using a different scenario or set of numbers to illustrate a point that can be applied to the current problem.
* **EXPLAINING_CONCEPTUAL**: Tutor explains the underlying logic, theorem, or "the why" behind a mathematical idea.
* **EXPLAINING_PROCEDURAL**: Tutor provides a step-by-step "how-to" guide or describes the sequence of operations.
* **GIVING_ANSWER**: Tutor directly provides the final solution or the result of a specific calculation.

# Move Examples
* **PROMPTING_RELATED_CONCEPTS**: "First explain what that regression line is."
* **PROMPTING_ALTERNATIVE_REPRESENTATION**: "Can you draw a picture of the rectangle?"
* **PROMPTING_SELF_EXPLANATION**: "How did you get that?"
* **PROMPTING_NEXT_STEP**: "What are you going to do next?"
* **PROMPTING_SELF_CORRECTION**: "Can you recheck the first and third? Middle one is right."
* **FEEDBACK_CORRECT**: "Exactly!"
* **FEEDBACK_INCORRECT**: "Not quite."
* **FEEDBACK_NEUTRAL**: "I see."
* **REVOICING**: "S: It's 10. T: So the total distance covered is 10 meters?"
* **RESTATING**: "S: X is 5. T: X is 5."
* **GIVING_HINT**: "Remember, the angles in a triangle must add up to 180."
* **GIVING_EXAMPLE**: "Think of it like a pizza; if you cut it into 8 slices..."
* **EXPLAINING_CONCEPTUAL**: "We use a square root here because we are finding the side length of a square area."
* **EXPLAINING_PROCEDURAL**: "First, you subtract 5 from both sides, then you divide by 2."
* **GIVING_ANSWER**: "The final answer is 42."

# Clarifications
* All utterances should be coded, only the ones that fit the definitions
* **PROMPTING** is when a a tutor expects and open response answer like an explanation NOT is when a the tutor expects a brief or binary answer (e.g., yes of no)
* **Exclusions**: Do not code student utterances. Focus strictly on the Tutor.`,
    annotationSchema: [
      ...SYSTEM_FIELDS,
      {
        isSystem: false,
        fieldKey: "LEARNING_SUPPORT",
        fieldType: "string",
        value: "",
        codes: [
          "PROMPTING_RELATED_CONCEPTS",
          "PROMPTING_ALTERNATIVE_REPRESENTATION",
          "PROMPTING_SELF_EXPLANATION",
          "PROMPTING_NEXT_STEP",
          "PROMPTING_SELF_CORRECTION",
          "FEEDBACK_CORRECT",
          "FEEDBACK_INCORRECT",
          "FEEDBACK_NEUTRAL",
          "REVOICING",
          "RESTATING",
          "GIVING_HINT",
          "GIVING_EXAMPLE",
          "EXPLAINING_CONCEPTUAL",
          "EXPLAINING_PROCEDURAL",
          "GIVING_ANSWER",
        ],
      },
    ],
  },
  {
    name: "Tutoring Quality Rubric (sample prompt)",
    annotationType: "PER_SESSION",
    userPrompt: `The evidence for the student's action might be from the reaction of the tutor afterwards. Analyze the tutoring transcripts below and score the tutor on the following 6 binary (0 or 1) dimensions. For each dimension, return a binary score (0 or 1) and a short piece of evidence from the transcript.

### RUBRIC DIMENSIONS
For each dimension, return two fields: a score (0 or 1) and evidence (a short quote from the transcript).

1. **reacting_to_errors**: \`0\` = The student made a mistake and the tutor either gave the answer OR pointed out the error directly. \`1\` = The tutor responded to a math error by asking the student to explain their thinking OR prompting them to think again. \`0\` = No evidence of a student making a math error.
   **reacting_to_errors_evidence**: A short quote supporting the score.

2. **giving_praise**: \`1\` = The tutor praises the student for their effort during the problem. \`0\` = The tutor does not praise the student.
   **giving_praise_evidence**: A short quote supporting the score.

3. **determining_what_students_know**: \`1\` = The tutor asks open-ended questions to check what the student already knows on a problem. \`0\` = No attempt to check prior knowledge.
   **determining_what_students_know_evidence**: A short quote supporting the score.

4. **affirming_correct_attempt**: \`1\` = The tutor affirms a correct response or student's correct reasoning. \`0\` = The tutor does not respond to a correct answer or a correct attempt at an explanation of the student's reasoning.
   **affirming_correct_attempt_evidence**: A short quote supporting the score.

5. **asking_guiding_questions**: \`1\` = The tutor asks guiding questions. \`0\` = The tutor only gives instructions or answers without asking questions.
   **asking_guiding_questions_evidence**: A short quote supporting the score.

6. **prompting_explanation**: \`1\` = The tutor prompts the student to explain their thinking. \`0\` = No prompt to explain thinking.
   **prompting_explanation_evidence**: A short quote supporting the score.`,
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
