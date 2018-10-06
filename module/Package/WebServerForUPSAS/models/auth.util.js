/**
 * auth.js
 */

const jwt = require('jsonwebtoken');
const compose = require('composable-middleware');

const SECRET = 'token_secret';
const EXPIRES = 60; // 1 hour

// JWT 토큰 생성 함수
function signToken(id) {
  return jwt.sign({ id }, SECRET, { expiresInMinutes: EXPIRES });
}

// 토큰을 해석하여 유저 정보를 얻는 함수
function isAuthenticated() {
  return (
    compose()
      // Validate jwt
      .use((req, res, next) => {
        const decoded = jwt.verify(req.headers.authorization, SECRET);
        console.log(decoded); // '{id: 'user_id'}'
        req.user = decode;
      })
      // Attach user to request
      .use((req, res, next) => {
        req.user = {
          id: req.user.id,
          name: `name of ${req.user.id}`,
        };
        next();
      })
  );
}

exports.signToken = signToken;
exports.isAuthenticated = isAuthenticated;
