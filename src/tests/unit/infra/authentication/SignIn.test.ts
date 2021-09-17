import SignIn from "./SignIn";

test('Test doSignIn()', async () => {
  const body = {
    email: 'dummyemail',
    password: 'dummypassword',
  }
  const signin = new SignIn();

  expect(signin.doSignIn(body)).resolves.toEqual('resolved!');
});