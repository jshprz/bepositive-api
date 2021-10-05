import { Connection, createConnection } from "typeorm";

let connection: Connection | null = null;

export async function getConnection() {
  if(connection) {
    return connection;
  }

  connection = await createConnection();

  return connection;
}

export async function closeConnection() {
  await connection?.close();
}

