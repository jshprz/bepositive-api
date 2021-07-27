# Bepositive Back-end

This serves as the back-end for the Bepositive application, a social media application similar to Instagram.

## Requirements
1. Node version v14.17.3

## Project structure

```
<root>
  - packages
    - comment
    - feed
    - media_file
    - post
    - search
    - user
      - src
        - config
        - controllers
        - database
          - migration
          - models
        - repositories
        - routes
        - services
        - tests
      - index.ts
  - kill_ports.js
  - lerna.json
```

## Setup Database
1. PostgreSQL download: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads (Download the version 13 of PostgreSQL)
2. pgAdmin download: https://www.pgadmin.org/download/
3. Setup PostgreSQL locally: https://www.postgresqltutorial.com/install-postgresql/ (For Windows)

## Setup Repository Locally

1. From the root directory, run this command: npm install
2. Go to the respective packages folder to set them up individually eg. go to ./packages/user or ./packages/post etc..

Note: Since this project is a modular monolith inspired by package by component architecture, we have individual codebase sources for every package (user, post, comment, etc..). Being that said, we are going to set up the packages one by one.

3. From the package directory, run this command: npm install
4. Create ormconfig.json file
5. Copy the content of ormconfig.json.example then paste it to ormconfig.json
6. Build the package by running: npm run build
7. Go back to the root of the project.
8. Start the application: npm run start

## Compiling, Testing, and Starting a package

1. Go to the project package folder. Eg. ./packages/user
2. To run the tslint and compile the package typescript files, run this command: npm run build
3. To compile and start a package, run this command right on the package directory(eg. ./packages/user): npm run start
4. To run the test of the package, run this command right on the package directory(eg. ./packages/user): npm run test

## Branching Strategy
- master: this is the head of our development. We perform a merge request to this branch from our * task branch *, which means our changes are ready to be tested on our staging environment(release-candidate).

- develop: this is our branch for the development environment (We only merge our * task branch * here for development testing purposes only).

- release-candidate: this is our branch for the staging or UAT environment. We merge the master branch here when our * task branch * is approved and reviewed to test it along with product owners.

- release: this is our branch for the production environment (We merge the release-candidate here for production releases).

- task branch: this one is the branch where we do our development work. We have three types of development work: feature, bugfix, and configuration. You might name your task branch "feature/bep-1-user-login" when you are working on a feature, "bugfix/bep-2-login-failed" when you are working on a bugfix, and "config/bep-3-aws-params" when you are working on some configuration. 

Note: please put a "WIP" on your commit message when you commit a change that is still a work in progress. E.g., "WIP: adding login access token."

Branching sequence: * task branch * > master > release-candidate > release

## Helpful links regarding the tech stack and architecture

1. Typescript: https://www.typescriptlang.org/
2. TypeORM: https://typeorm.io/#/
3. Package by component: http://www.codingthearchitecture.com/2015/03/08/package_by_component_and_architecturally_aligned_testing.html | https://www.youtube.com/watch?v=5OjqD-ow8GE | https://blog.ttulka.com/package-by-component-with-clean-modules-in-java
4. Dependency Injection: https://levelup.gitconnected.com/dependency-injection-in-typescript-2f66912d143c | https://alexnault.dev/dependency-inversion-principle-in-functional-typescript | https://www.youtube.com/watch?v=nk3wUKxVDAg
5. Monorepo with Lerna: https://www.youtube.com/watch?v=j0FiMekdeOs
6. Unit Testing: https://www.youtube.com/watch?v=NPp2pvhGbkM
7. Jest: https://jestjs.io/docs/mock-functions | https://jestjs.io/docs/getting-started | https://medium.com/nerd-for-tech/testing-typescript-with-jest-290eaee9479d | https://dev.to/muhajirdev/unit-testing-with-typescript-and-jest-2gln