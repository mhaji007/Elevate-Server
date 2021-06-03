import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";

export const register = async (req, res, next) => {
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
