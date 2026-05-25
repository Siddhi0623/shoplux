import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

import userModel from "../models/UserModel.js";


// TOKEN CREATION
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};



// REGISTER USER
const registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    // CHECK USER EXISTS
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    // VALIDATE EMAIL
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter valid email",
      });
    }

    // PASSWORD CHECK
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be 8 characters",
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // CREATE USER
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // TOKEN
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email },
    });

  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};




// LOGIN USER
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User doesn't exist",
      });
    }

    // PASSWORD MATCH
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (isMatch) {

      const token = createToken(user._id);

      res.json({
        success: true,
        token,
        user: { name: user.name, email: user.email },
      });

    } else {

      res.json({
        success: false,
        message: "Invalid credentials",
      });

    }

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });

  }
};




// EXPORTS
export {
  loginUser,
  registerUser,
};