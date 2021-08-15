import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

// AWS config for passing access key and secret, etc.
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.satus(400).send("Name is required");
    }
    if (!password || password.length < 6) {
      return res
        .satus(400)
        .send("Password is required and should be at least 6 characters");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email is taken");

    // hash password

    const hashedPassword = await hashPassword(password);

    // register user

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    console.log("saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return re.status(400).send("Error. Try again");
  }
};

export const login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;

    // Check if user exists in database
    const user = await User.findOne({ email }).exec();
    if (!user) res.status(404).send("No user found");

    // Compare passwords
    const match = await comparePassword(password, user.password);
    if(!match) res.status(404).send("Wrong password")

    // Create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    // Return user and token to client, excluding the hashed password
    user.password = undefined;

    res.cookie("token", token, {
      httpOnly: true,

      // Only works on https
      // secure: true
    });

    //  Send user as json response
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Signout success" });
  } catch (err) {
    console.log(err);
  }
};

// Endpoint for retrieving user with valid (un-expired) token
export const currentUser = async (req, res) => {
  try {
    // user id is made available on req.user by requireSignin middleware
    const user = await User.findById(req.user._id).select("-password").exec();
    // console.log("Current user", user)
    // return res.json(user)
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const sendEmail = async (req, res) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: ["hadjikhanimehdi@gmail.com"],
    },

    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
        <html>
          <h1>
            Reest password link
          </h1>
          <p>
            Please use the following link to rest your password
          </p>
        </html>
      `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Password reset link`,
      },
    },
  };

  const emailSent = SES.sendEmail(params).promise();

  emailSent
    .then((data) => {
      console.log(data);
      res.json({ ok: true });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) return res.status(400).send("User not found");

    // Email params
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
                <html>
                  <h1>Reset Your password</h1>
                  <p>We just received a request for a new password from your account.</p>
                  <p>To reset your password, just enter the code below</p>
                  <h2 style="color:black; background-color:yellow; width: intrinsic; width:-moz-max-content; width:-webkit-max-content;width: max-content;">${shortCode}</h2>
                  <p>If you did NOT request a new password, ignore this email and your password will remain unchanged.</p>
                  <i>Elevate.com</i>
                </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Update Your Password",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // console.table({ email, code, newPassword });
    const hashedPassword = await hashPassword(newPassword);

    const user = User.findOneAndUpdate(
      {
        email,
        passwordResetCode: code,
      },
      {
        password: hashedPassword,
        passwordResetCode: "",
      }
    ).exec();
    /*
    const registeredUser = await User.findOne({ email }).exec();
    if (registeredUser.passwordResetCode.toString() === code) {
      const user = await User.findOneAndUpdate(
        { passwordResetCode: code },
        { password: hashedPassword, passwordResetCode: "" }
      ).exec();
    } else {
      return response.status(400).send("Code does not match.");
    }
    */
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
};
