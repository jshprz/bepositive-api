import { Service } from "typedi";

interface Test {
  name: string;
}
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