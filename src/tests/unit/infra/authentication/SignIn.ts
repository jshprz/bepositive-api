import AwsCognito from "../../mocks/infra/authentication/AwsCognito";

class SignIn extends AwsCognito {

  async doSignIn(body: {email: string, password: string}): Promise<any> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = this.getAuthenticationDetails(body);

      this.getCognitoUser(body.email).authenticateUser(authenticationDetails, (err: any, result: any) => {
        if (err) {
          reject (err);
        }

        resolve(result);
      });
    });
  }

}

export default SignIn;