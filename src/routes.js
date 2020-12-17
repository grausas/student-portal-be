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

router.post("/students", (req, res) => {
  const data = req.body;
  if (data.name && data.surname) {
    con.query(
      `INSERT INTO students (name, surname) VALUES (${mysql.escape(
        data.name
      )}, ${mysql.escape(data.surname)})`,
      (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(400)
            .json({ msg: "Internal server error adding student details" });
        } else {
          console.log(result);
          return res.status(201).json({ msg: "Student successufully added" });
        }
      }
    );
  } else {
    return res.status(400).json({ msg: "Passed values are incorrect" });
  }
});

router.get("/view-students", (req, res) => {
  con.query(`SELECT * FROM students`, (err, result) => {
    if (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: "Internal server error getting the details" });
    } else res.json(result);
  });
});

router.post("/groups", (req, res) => {
  const data = req.body;

  if (data.studentId) {
    con.query(
      `INSERT INTO groups (student_id) VALUES (${mysql.escape(
        data.studentId
      )})`,
      (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(400)
            .json({ msg: "Internal server error adding student to group" });
        } else {
          console.log(result);
          return res
            .status(201)
            .json({ msg: "Student successufully added to group" });
        }
      }
    );
  } else {
    return res.status(400).json({ msg: "Passed values are incorrect" });
  }
});

router.get("/view-groups", (req, res) => {
  con.query(`SELECT * FROM groups`, (err, result) => {
    if (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: "Internal server error getting the details" });
    } else res.json(result);
  });
});
module.exports = router;
