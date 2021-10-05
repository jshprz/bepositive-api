module.exports = {
   "type": "postgres",
   "host": process.env.POSTGRES_HOST,
   "port": process.env.POSTGRES_PORT,
   "username": process.env.POSTGRES_USERNAME,
   "password": process.env.POSTGRES_PASSWORD,
   "database": process.env.POSTGRES_DATABASE,
   "synchronize": true,
   "logging": false,
   "entities": [
      "./src/database/postgresql/models/**/*.ts"
   ],
   "migrations": [
      "./src/database/postgresql/migration/**/*.ts"
   ],
   "subscribers": [
      "./src/database/postgresql/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "./src/database/postgresql/models",
      "migrationsDir": "./src/database/postgresql/migration",
      "subscribersDir": "./src/database/postgresql/subscriber"
   }
}