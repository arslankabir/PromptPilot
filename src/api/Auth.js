import UserPool from "./UserPool";
import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

export const Register = async (email, password, given_name, family_name) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];
    attributeList.push(
      new CognitoUserAttribute({
        Name: "given_name",
        Value: given_name,
      })
    );
    attributeList.push(
      new CognitoUserAttribute({
        Name: "family_name",
        Value: family_name,
      })
    );
    UserPool.signUp(email, password, attributeList, null, (err, data) => {
      if (err) {
        resolve({ status: 400, err });
      } else {
        resolve({ status: 200, data });
      }
    });
  });
};

export const Signin = async (email, password) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        resolve({ status: 200, data });
      },
      onFailure: (err) => {
        resolve({ status: 400, err });
      },
    });
  });
};

export const ConfirmCognitoUser = (username, confirmationCode) => {
  const userData = {
    Username: username,
    Pool: UserPool,
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(
      confirmationCode,
      true,
      function (err, data) {
        if (err) {
          console.log(err);
          resolve({ status: 400, err });
        } else {
          resolve({ status: 200, data });
        }
      }
    );
  });
};

export const ForgotPassword = (username) => {
  const userData = {
    Username: username,
    Pool: UserPool,
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: function (data) {
        resolve({ status: 200, data });
      },
      onFailure: function (err) {
        resolve({ status: 400, err });
      },
    });
  });
};

export function confirmPassword(email, verificationCode, newPassword) {
  const userData = {
    Username: email,
    Pool: UserPool,
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(verificationCode, newPassword, {
      onSuccess: function (data) {
        resolve({ status: 200, data });
      },
      onFailure: function (err) {
        resolve({ status: 400, err });
      },
    });
  });
}

export async function updateUser(
  firstName,
  lastName,
  nickName,
  phoneNumber,
  picture
) {
  const user = UserPool.getCurrentUser();

  await new Promise((res) => user.getSession(res));

  const attributeList = [];
  attributeList.push(
    new CognitoUserAttribute({
      Name: "given_name",
      Value: firstName,
    })
  );
  attributeList.push(
    new CognitoUserAttribute({
      Name: "family_name",
      Value: lastName,
    })
  );
  attributeList.push(
    new CognitoUserAttribute({
      Name: "nickname",
      Value: nickName,
    })
  );
  attributeList.push(
    new CognitoUserAttribute({
      Name: "phone_number",
      Value: phoneNumber,
    })
  );
  attributeList.push(
    new CognitoUserAttribute({
      Name: "picture",
      Value: picture,
    })
  );

  return new Promise((resolve, reject) => {
    user.updateAttributes(attributeList, function (err, result) {
      if (err) {
        resolve({ status: 400, err });
      } else {
        resolve({ status: 200, result });
      }
    });
  });
}

export const getUserData = () => {
  const user = UserPool.getCurrentUser();

  return new Promise(async (resolve, reject) => {
    if (user !== null) {
      await new Promise((res) => user.getSession(res));
      user.getUserAttributes(function (err, result) {
        if (err) {
          resolve({ status: 400, err });
        } else {
          resolve({ status: 200, result });
        }
      });
    } else {
      resolve(null);
    }
  });
};

export const Logout = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = UserPool.getCurrentUser();
    if (cognitoUser !== null) {
      cognitoUser.signOut();
    }
    resolve();
  });
};
