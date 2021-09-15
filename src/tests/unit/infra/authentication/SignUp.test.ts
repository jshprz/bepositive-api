import SignUp from "./SignUp";

test('Test doSignUp()', async () => {
  const body = {
    username: 'dummyuser',
    email: 'dummyemail',
    name: 'dummyname',
    password: 'dummypass'
  }
  const signUp = new SignUp();

  expect(signUp.doSignUp(body)).resolves.toEqual('resolved!');
});

test('Test verifyUser()', async () => {
  const body = {
    username: 'dummyuser',
    verifyCode: '12345'
  }

  const signUp = new SignUp();

  expect(signUp.verifyUser(body)).resolves.toEqual('resolved!');
});