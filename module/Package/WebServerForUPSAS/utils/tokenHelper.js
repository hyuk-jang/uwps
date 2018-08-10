// utils/tokenHelper.js
const jwt = require('jsonwebtoken');

const TOKEN_SECRET = 'secret';
const tokenGenerator = (data, callback) => {
  const token = jwt.sign(data, TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: 60 * 60 * 24 * 7,
  });
  callback(token);
};
const isValid = (token, callback) => {
  jwt.verify(token, TOKEN_SECRET, (err, decode) => {
    if (err) {
      // console.log("=========Token Helper: Can't decode token")
      callback({isValid: false});
    } else {
      const exp = new Date(decode.exp * 1000);
      const now = Date.now();
      const day = 60 * 60 * 24 * 1000;
      if (exp < now) {
        // console.log("=========Token Helper: Expired Token")
        callback({isValid: false});
      } else if (exp < now + 5 * day) {
        // console.log("=========Token Helper: Generate New Token")
        const newToken = module.exports.generateToken(decode.user.id);
        callback({isValid: true, token: newToken, userInfo: decode});
      } else {
        // console.log("=========Token Helper: Token is valid")
        callback({isValid: true, token, userInfo: decode});
      }
    }
  });
};
const tokenHandler = (req, res, next) => {
  const {token} = req.query;
  if (token) {
    module.exports.isValid(token, result => {
      req.userInfo = result;
      next();
    });
  } else {
    req.userInfo = {isValid: false};
    next();
  }
};
export default {
  tokenGenerator,
  isValid,
  tokenHandler,
};
