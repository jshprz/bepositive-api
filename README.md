# Bepositive Back-end

This serves as the back-end for the Bepositive application, a social media application similar to Instagram.

## Requirements
1. Node version v14.17.3

## Project structure

<root>
  - packages
    - comment
    - feed
    - media_file
    - post
    - search
    - user
      - src
        - controllers
        - models
        - repositories
        - routes
        - services
        - tests
      - index.ts
  - kill_ports.js
  - lerna.json

## Setup Locally

1. From the root, run this command: npm install
2. Go to the respective packages folder to set them up individually eg. go to ./packages/user or ./packages/post etc..

Note: Since this project is a modular monolith inspired by package by component architecture, we have individual codebase sources for every package (user, post, comment, etc..). Being that said, we are going to set up the packages one by one.


3. From the package directory, run this command: npm install
4. From the package directory, run this command: npx lerna clean -y
5. From the package directory, run this command: npx lerna bootstrap --hoist
6. Go back to the root of the project.
7. Start the application: npm run start

## Compiling, Testing, and Starting a package

1. Go to the project package folder. Eg. ./packages/user
2. To run the tslint and compile the package typescript files, run this command: npm run build
3. To compile and start a package, run this command right on the package directory(eg. ./packages/user): npm run start
4. To run the test of the package, run this command right on the package directory(eg. ./packages/user): npm run test