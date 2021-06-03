import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken";

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
    const User = await User.findOne({ email }).exec();
    if (!user) res.status(404).send("No user found");

    // Compare passwords
    const match = await comparePassword(password, user.password);

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
