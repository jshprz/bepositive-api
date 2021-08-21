# Bepositive Back-end

This serves as the back-end for the Bepositive application, a social media application similar to Instagram.

## Requirements
1. Node version v14.17.3

## Project structure

```
<root>
  - src
    - app
     - authentication
     - comment
     - feed
     - media
     - post
     - search
     - user
    - config
    - database
      - migration
      - models
    - infra
      - repositories
      - utils
    - interface
      - repositories
      - ses
    - routes
    - tests
- index.ts
```

## Setup Database
1. PostgreSQL download: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads (Download the version 13 of PostgreSQL)
2. pgAdmin download: https://www.pgadmin.org/download/
3. Setup PostgreSQL locally: https://www.postgresqltutorial.com/install-postgresql/ (For Windows)

## Setup Repository Locally

1. From the root directory, run this command: npm install.
2. Create an ormconfig.json file in the root directory of the project.
3. Copy the content of the ormconfig.json.example, then paste it to ormconfig.json. Kindly input custom values within the line that includes "<>" inside ormconfig.json
4. Build and start the application: npm run start

## Running a test

1. Run this command to run the test: npm run test

## Development Guide
Link: https://smedia-dev-team.atlassian.net/l/c/JXaZQSRn

## Branching Strategy
Link: https://smedia-dev-team.atlassian.net/l/c/7ZEfBJqE

## Helpful links regarding the tech stack and architecture

1. Typescript: https://www.typescriptlang.org/
2. TypeORM: https://typeorm.io/#/
3. Dependency Injection: https://levelup.gitconnected.com/dependency-injection-in-typescript-2f66912d143c | https://alexnault.dev/dependency-inversion-principle-in-functional-typescript | https://www.youtube.com/watch?v=nk3wUKxVDAg
4. TypeDI: https://docs.typestack.community/typedi/v/develop/01-getting-started
5. Unit Testing: https://www.youtube.com/watch?v=NPp2pvhGbkM
6. Jest: https://jestjs.io/docs/mock-functions | https://jestjs.io/docs/getting-started | https://medium.com/nerd-for-tech/testing-typescript-with-jest-290eaee9479d | https://dev.to/muhajirdev/unit-testing-with-typescript-and-jest-2gln