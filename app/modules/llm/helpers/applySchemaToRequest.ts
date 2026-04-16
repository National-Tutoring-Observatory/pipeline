export default function applySchemaToRequest(
  requestParams: Record<string, unknown>,
  schema?: object,
) {
  if (schema) {
    requestParams.response_format = {
      type: "json_schema",
      json_schema: {
        name: "structured_output",
        schema,
      },
    };
  } else {
    requestParams.response_format = { type: "json_object" };
  }
}
