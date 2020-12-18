const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware");
const con = require("./db");

// register lecturer
router.post("/register", middleware.validateUserData, (req, res) => {
  const email = req.body.email.toLowerCase();
  const data = req.body;
  con.query(
    `SELECT * FROM lecturers WHERE email = ${mysql.escape(email)}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Internal server error checking username validity" });
      } else if (result.length !== 0) {
        return res.status(400).json({ msg: "This email already exits" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            comsole.log(err);
            return res.json({
              msg: "Internal server error hashing user details",
            });
          } else {
            if (email && hash && data.name && data.surname && data.lectures) {
              con.query(
                `INSERT INTO lecturers (email, password, name, surname, lectures) VALUES (${mysql.escape(
                  email
                )}, ${mysql.escape(hash)}, ${mysql.escape(
                  data.name
                )}, ${mysql.escape(data.surname)}, ${mysql.escape(
                  data.lectures
                )})`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.status(400).json({
                      msg: "Internal server error saving user details",
                    });
                  } else {
                    return res
                      .status(200)
                      .json({ msg: "User has been successfully registered" });
                  }
                }
              );
            } else {
              return res
                .status(400)
                .json({ msg: "Passed values are incorrect" });
            }
          }
        });
      }
    }
  );
});

// lecturers login
router.post("/login", middleware.validateUserData, (req, res) => {
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
          msg: "The provided details are incorrect or the user does not exist",
        });
      } else {
        bcrypt.compare(
          req.body.password,
          result[0].password,
          (bErr, bResult) => {
            if (bErr || !bResult) {
              return res.status(400).json({
                msg:
                  "The provided details are incorect or the user doesnt not exits",
              });
            } else if (bResult) {
              const token = jwt.sign(
                {
                  userId: result[0].id,
                  email: result[0].email,
                },
                process.env.SECRET_KEY,
                {
                  expiresIn: "7d",
                }
              );
              console.log(token);

              return res.status(200).json({
                msg: "Logged In",
                token,
              });
            }
          }
        );
      }
    }
  );
});

router.post("/students", (req, res) => {
  const data = req.body;
  if (data.name && data.surname && data.email) {
    con.query(
      `INSERT INTO students (name, surname, email) VALUES (${mysql.escape(
        data.name
      )}, ${mysql.escape(data.surname)}, ${mysql.escape(data.email)})`,
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

  if (data.studentId && data.groupId) {
    con.query(
      `INSERT INTO groups (groupId, student_id) VALUES (${mysql.escape(
        data.studentId
      )}, ${mysql.escape(data.groupId)})`,
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
  con.query(
    `SELECT groupId, name, surname FROM groups t1 INNER JOIN students t2 ON t1.student_id = t2.id`,
    (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .json({ msg: "Internal server error getting the details" });
      } else {
        console.log(result);
        res.json(result);
      }
    }
  );
});

router.get("/view-courses", (req, res) => {
  con.query(
    `SELECT a.name, a.description, b.name, b.surname, c.id FROM courses a INNER JOIN lecturers b ON a.lecturer_id = b.id Inner JOIN groups c ON a.group_id = c.id `,
    (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .json({ msg: "Internal server error getting the details" });
      } else res.json(result);
    }
  );
});

router.get("/view-lecturers", (req, res) => {
  con.query(`SELECT * FROM lecturers`, (err, result) => {
    if (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: "Internal server error getting the details" });
    } else res.json(result);
  });
});

module.exports = router;
