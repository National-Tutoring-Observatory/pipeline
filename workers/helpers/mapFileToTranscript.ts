import map from "lodash/map";

export default function mapFileToTranscript(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonFile: Record<string, any>[],
  attributesMapping: Record<string, string>,
) {
  return map(jsonFile, (dataItem, index) => ({
    _id: `${index}`,
    role: dataItem[attributesMapping.role],
    content: dataItem[attributesMapping.content],
    start_time: dataItem.start_time ?? "",
    end_time: dataItem.end_time ?? "",
    timestamp: dataItem.timestamp ?? "",
    session_id: dataItem[attributesMapping.session_id],
    sequence_id: dataItem[attributesMapping.sequence_id],
    annotations: [],
  }));
}
