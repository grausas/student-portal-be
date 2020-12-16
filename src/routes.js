const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const con = require("./db");

// lecturers login
router.post("/login", (req, res) => {
  const email = req.body.email.toLowerCase();
  con.query(
    `SELECT * FROM lecturers WHERE email = ${mysql.escape(email)}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Internal server error gathering user details" });
      } else if (result.length !== 1) {
        return res.status(400).json({
          msg: "The provided email are incorrect or the user does not exist",
        });
      } else {
        if (req.body.password !== result[0].password) {
          res.status(400).json({ msg: "The provided password is incorrect" });
        } else {
          res.status(200).json({ msg: "Logged In" });
        }
      }
    }
  );
});

module.exports = router;
