export type createParamsType = { email: string, password: string, account_status: string }

export interface AccountInterface {
  createUser(item: createParamsType): Promise<any>;
  updateUser(id: string, item: {}): Promise<any>;
  getUserById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getUserByResetToken(token: string): Promise<any>;
}