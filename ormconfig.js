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
      "./dist/src/database/postgresql/models/**/*.js"
   ],
   "migrations": [
      "./dist/src/database/postgresql/migration/**/*.js"
   ],
   "subscribers": [
      "./dist/src/database/postgresql/subscriber/**/*.js"
   ],
   "cli": {
      "entitiesDir": "./dist/src/database/postgresql/models",
      "migrationsDir": "./dist/src/database/postgresql/migration",
      "subscribersDir": "./dist/src/database/postgresql/subscriber"
   }
}