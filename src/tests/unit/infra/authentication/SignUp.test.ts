import SignUp from "./SignUp";

test('Test doSignUp()', async () => {
  const body = {
    email: 'dummyemail',
    name: 'dummyname',
    password: 'dummypass'
  }
  const signUp = new SignUp();

  expect(signUp.doSignUp(body)).resolves.toEqual('resolved!');
});

test('Test verifyUser()', async () => {
  const body = {
    email: 'dummyuser',
    verifyCode: '12345'
  }

  const signUp = new SignUp();

  expect(signUp.verifyUser(body)).resolves.toEqual('resolved!');
});