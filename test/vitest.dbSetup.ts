const poolId = process.env.VITEST_POOL_ID;

const orig = process.env.DOCUMENT_DB_CONNECTION_STRING!;

const m = orig.match(/(.+)\/(.+)\?(.*)/);


if (m) {
  const globalKey = `db_${poolId}`

  if (!(globalThis as any)[globalKey]) {
    const hostName = m[1];
    const dbName = m[2];
    const options = m[3];

    process.env.DOCUMENT_DB_CONNECTION_STRING = `${hostName}/${dbName}_${poolId}?${options}`;
    (globalThis as any)[globalKey] = true;
  }
} else {
  throw new Error("Invalid connection string")
}
