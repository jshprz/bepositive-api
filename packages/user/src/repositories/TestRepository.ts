import { Service } from "typedi";
import Test from '../models/Test';

@Service()
class TestRepository {
  private readonly users: Test[] = [
    { name: 'a' },
    { name: 'b' },
    { name: 'c' },
  ];

  async getAllUsers(): Promise<Test[]> {
    return this.users;
  }
}

export default TestRepository;