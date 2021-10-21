import AwsCognito from "../../mocks/infra/authentication/AwsCognito";

class SignUp extends AwsCognito {

  async doSignUp(body: {email: string, name: string, password: string}): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const cognitoAttributeList = this.cognitoUserAttributeList(body.email, body.name);

      this.userPool().signUp(body.email, body.password, cognitoAttributeList, [], (err: any, result: any) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  async verifyUser(body: {email: string, verifyCode: string}) {
    return new Promise((resolve, reject) => {
      this.getCognitoUser(body.email).confirmRegistration(body.verifyCode, true, (err: any, result: any) => {
        if (err) {
          return reject(err);
        }

        return resolve(result);
      });
    });
  }
}

export default SignUp;