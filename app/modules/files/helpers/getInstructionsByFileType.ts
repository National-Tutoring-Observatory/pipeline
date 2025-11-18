import type { FileType } from "../files.types";

export default function getInstructionsByFileType({ fileType }: { fileType: FileType }) {
  switch (fileType) {
    case 'CSV':
      return {
        overview: `Upload a CSV file with the required <code>session_id</code>, <code>role</code>, <code>content</code> and <code>sequence_id</code> columns.`,
        link: 'https://docs.google.com/document/d/16dSQp_MopRPLGYYgjgaWsXaJId3oufjvvgDqEWQfiDU'
      }
    case 'JSONL':
      return {
        overview: `Upload a JSONL file, ensuring each line is an object with the required <code>session_id</code>, <code>speaker</code>, <code>content</code> and <code>sequence_id</code> keys.`,
        link: 'https://docs.google.com/document/d/1x6kMZ2cpBuysJMlta7dVoRQ--G06PpWT26LenTex4R4'
      }
    default:
      return {
        overview: '',
        link: ''
      }
  }
}
