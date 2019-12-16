const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../Models/user");

module.exports = {
  //async (parents, args) => { --> takhle to funguje u apollo servru
  createUser: async args => {
    try {
      const foundUser = await User.findOne({ email: args.userInput.email });
      console.log("foundUser: ", foundUser);
      if (foundUser) {
        throw new Error("This user already exists");
      } else {
        console.log("Else -> foundUser: ", foundUser);
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      console.log("hashed pass: ", hashedPassword);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error("User does not exist!");
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error("Password is incorrect!");
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        "somesupersecretkey",
        {
          expiresIn: "1h"
        }
      );
      return { userId: user.id, token: token, tokenExpiration: 1 };
    } catch (err) {
      throw err;
    }
  }
};
