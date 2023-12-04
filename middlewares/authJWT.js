

const jwt = require("jsonwebtoken");


const jwtMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send({
      error: true, message: 'Anda harus login'
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch(err) {
    return res.status(401).send({
      error: true, message: 'Token tidak valid'
    });
  }

  req.userId = decoded.id;

  next();
}

/** @return {string} */
jwtMiddleware.sign = (payload) => jwt.sign(payload,process.env.JWT_SECRET)

module.exports = jwtMiddleware

