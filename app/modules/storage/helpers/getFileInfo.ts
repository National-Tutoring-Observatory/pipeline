export default async (file: Blob) => {
  const type = file.type;
  const size = file.size;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return { buffer, type, size };
};
