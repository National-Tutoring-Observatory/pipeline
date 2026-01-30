export default function applySchemaToRequest(
  requestParams: any,
  schema?: object,
) {
  if (schema) {
    requestParams.tools = [
      {
        type: "function",
        function: {
          name: "structured_output",
          description: "Return the response in the required structured format",
          parameters: schema,
        },
      },
    ];
    requestParams.tool_choice = {
      type: "function",
      function: { name: "structured_output" },
    };
  } else {
    requestParams.response_format = { type: "json_object" };
  }
}
