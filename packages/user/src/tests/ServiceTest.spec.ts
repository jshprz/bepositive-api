import TestService from "../services/TestService";
import TestRepository from "../repositories/TestRepository";

it("should return", async () => {
  const myService = new TestService(new TestRepository);
  expect(myService.getAllUsers()).resolves.toStrictEqual([ { name: 'a' }, { name: 'b' }, { name: 'c' } ]);
});
