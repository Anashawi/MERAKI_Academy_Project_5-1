const {pool} = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const data = [email.toLowerCase()];
  const query = `SELECT * FROM users WHERE email = $1`;
  pool
    .query(query, data)
    .then((result) => {
      if (result.rows.length) {
        bcrypt.compare(password, result.rows[0].password, (err, response) => {
          if (err) res.json(err);
          if (response) {
            const payload = {
              userId: result.rows[0].id,
              firstName: result.rows[0].firstName,
              role: result.rows[0].role_id,

            };
            const options = { expiresIn: "1d" };
            const secret = process.env.SECRET||"Secury Secret";
            const token = jwt.sign(payload, secret, options);
            if (token) {
              return res.status(200).json({ token, userId: result.rows[0].id,firstName:result.rows[0].firstname,role:result.rows[0].role_id });
            } else {
              throw Error;
            }
          } else {
            res.status(403).json({
              success: false,
              message: `The password you’ve entered is incorrect`,
            });
          }
        });
      } else throw Error;
    })
    .catch((err) => {
      res
        .status(404)
        .json({ success: false, message: "The email doesn't exist", err });
    });
};

module.exports = {
  login,
};
