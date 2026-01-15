import Ajv from 'ajv';
import transcriptSchema from '../schemas/json/transcript.schema.json';

const ajv = new Ajv({ allErrors: true, verbose: true });

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Generic validator - checks if data is compliant with a JSON schema
 *
 * @param data - The data to validate
 * @param schema - The JSON schema to validate against
 * @returns ValidationResult with valid status and formatted errors if any
 */
export function validateAgainstSchema(data: any, schema: any): ValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    return { valid: true };
  }

  const errors: ValidationError[] = (validate.errors || []).map(error => {
    const field = error.instancePath || error.schemaPath;
    let message = error.message || 'Validation error';

    // Enhance error messages for common cases
    if (error.keyword === 'required') {
      message = `Missing required field: ${error.params.missingProperty}`;
    } else if (error.keyword === 'type') {
      message = `Field must be of type ${error.params.type}`;
    } else if (error.keyword === 'additionalProperties') {
      message = `Unexpected field: ${error.params.additionalProperty}`;
    }

    return {
      field,
      message,
      value: error.data
    };
  });

  return {
    valid: false,
    errors
  };
}

/**
 * Checks if a transcript object is valid
 *
 * @param transcript - The transcript object to validate
 * @returns ValidationResult with valid status and errors if any
 *
 * @example
 * ```typescript
 * const result = isValidTranscript(transcriptJson);
 * if (!result.valid) {
 *   console.error('Invalid transcript:', result.errors);
 * }
 * ```
 */
export function isValidTranscript(transcript: any): ValidationResult {
  return validateAgainstSchema(transcript, transcriptSchema);
}

export default isValidTranscript;
