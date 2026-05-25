import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {

  try {

    // GET TOKEN
    const token = req.headers.token;

    // CHECK TOKEN EXISTS
    if (!token) {

      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });

    }

    // VERIFY TOKEN
    const token_decode = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // SAVE USER ID
    if (!req.body) req.body = {};
    req.body.userId = token_decode.id;

    // NEXT
    next();

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });

  }
};

export default authUser;