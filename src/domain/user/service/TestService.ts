import { Service } from "typedi";
import TestRepository from '../repository/TestRepository';

interface Test {
  name: string;
}
@Service()
class TestService {
  constructor(private readonly testRepository: TestRepository) {}

  async getAllUsers(): Promise<Test[]> {
    const result = await this.testRepository.getAllUsers();
    return result;
  }
}

export default TestService;