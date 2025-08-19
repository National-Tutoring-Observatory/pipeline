export default async (file: any) => {

  const contentType = file.type;
  const size = file.size;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return { buffer, contentType, size };

}