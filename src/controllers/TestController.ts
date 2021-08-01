import { Request, Response } from 'express';
import { Service } from 'typedi';
import TestService from '../domain/user/service/TestService';
import TestRepository from '../domain/user/repository/TestRepository';

@Service()
class TestController {
  private readonly _testService: TestService;

  constructor() {
    this._testService = new TestService(new TestRepository());
  }
  async getAllUsers(_req: Request, res: Response) {
    const result = await this._testService.getAllUsers();
    return res.json(result);
  }
}

export default TestController;