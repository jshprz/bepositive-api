export type createParamsType = { email: string, password: string, account_status: string }

export interface AccountInterface {
  createUser(item: createParamsType): Promise<boolean>;
  updateUser(id: string, item: {}): any;
}