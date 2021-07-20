import { Service } from "typedi";
import Test from '../models/Test';
import TestRepository from '../repositories/TestRepository';

@Service()
class TestService {
  constructor(private readonly testRepository: TestRepository) {}

  async getAllUsers(): Promise<Test[]> {
    const result = await this.testRepository.getAllUsers();
    return result;
  }
}

export default TestService;