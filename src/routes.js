const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware");
const database = require("./db");

// register lecturer
router.post("/register", middleware.validateUserData, (req, res) => {
  const email = req.body.email.toLowerCase();
  const data = req.body;
  database((db) =>
    db.query(
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
              console.log(err);
              return res.json({
                msg: "Internal server error hashing user details",
              });
            } else {
              if (email && hash && data.name && data.surname) {
                db.query(
                  `INSERT INTO lecturers (email, password, name, surname) VALUES (${mysql.escape(
                    email
                  )}, ${mysql.escape(hash)}, ${mysql.escape(
                    data.name
                  )}, ${mysql.escape(data.surname)})`,
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
    )
  );
});

// lecturers login
router.post("/login", middleware.validateUserData, (req, res) => {
  const email = req.body.email.toLowerCase();
  database((db) =>
    db.query(
      `SELECT * FROM lecturers WHERE email = ${mysql.escape(email)}`,
      (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Internal server error gathering user details" });
        } else if (result.length !== 1) {
          return res.status(400).json({
            msg:
              "The provided details are incorrect or the user does not exist",
          });
        } else {
          bcrypt.compare(
            req.body.password,
            result[0].password,
            (bErr, bResult) => {
              if (bErr || !bResult) {
                return res.status(400).json({
                  msg:
                    "The provided details are incorect or the user does not exits",
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
    )
  );
});

router.post("/students", middleware.isLoggedIn, (req, res) => {
  const data = req.body;
  if (data.name && data.surname && data.email && data.phone) {
    database((db) =>
      db.query(
        `INSERT INTO students (name, surname, email, phone, studing) VALUES (${mysql.escape(
          data.name
        )}, ${mysql.escape(data.surname)}, ${mysql.escape(
          data.email
        )}, ${mysql.escape(data.phone)}, ${mysql.escape(data.studing)})`,
        (err, result) => {
          if (err) {
            console.log(err);
            res
              .status(400)
              .json({ msg: "Internal server error adding student details" });
          } else {
            console.log(result);
            return res.status(201).json({ msg: "Student successfully added" });
          }
        }
      )
    );
  } else {
    return res.status(400).json({ msg: "Passed values are incorrect" });
  }
});

router.get("/view-students", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(`SELECT * FROM students`, (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .json({ msg: "Internal server error getting the details" });
      } else res.json(result);
    })
  );
});

router.post("/groups", middleware.isLoggedIn, (req, res) => {
  const data = req.body;

  if (data.studentId && data.groupId) {
    database((db) =>
      db.query(
        `INSERT INTO student_groups (groupId, student_id) VALUES (${mysql.escape(
          data.groupId
        )}, ${mysql.escape(data.studentId)})`,
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
      )
    );
  } else {
    return res.status(400).json({ msg: "Passed values are incorrect" });
  }
});

router.get("/view-groups", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `SELECT a.id, a.groupId, GROUP_CONCAT(distinct ' ', b.name, ' ', b.surname ) AS student FROM student_groups a INNER JOIN students b ON a.student_id = b.id GROUP BY groupId`,
      // `SELECT * from groups `,
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
    )
  );
});

router.post("/courses", middleware.isLoggedIn, (req, res) => {
  const data = req.body;
  if (data.courseName && data.description && data.lecturerId && data.groupId) {
    database((db) =>
      db.query(
        `INSERT INTO courses (course_name, description, lecturer_id, group_id) VALUES (${mysql.escape(
          data.courseName
        )}, ${mysql.escape(data.description)}, ${mysql.escape(
          data.lecturerId
        )}, ${mysql.escape(data.groupId)})`,
        (err, result) => {
          if (err) {
            console.log(err);
            res
              .status(400)
              .json({ msg: "Internal server error adding course" });
          } else {
            console.log(result);
            return res
              .status(201)
              .json({ msg: "Course successfully added to database" });
          }
        }
      )
    );
  } else {
    return res.status(400).json({ msg: "Passed values are incorrect" });
  }
});

router.get("/view-courses", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `select a.id, a.course_name, a.description, group_concat(distinct ' ', d.surname, ' ', d.name ) as students,  group_concat(distinct c.name, " ", c.surname) as lecturer from courses a, student_groups b, lecturers c, students d  where a.group_id = b.groupId and b.student_id = d.id and a.lecturer_id = c.id group by a.id`,
      (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(400)
            .json({ msg: "Internal server error getting the details" });
        } else res.json(result);
      }
    )
  );
});

router.get("/view-lecturers", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(`SELECT * FROM lecturers`, (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .json({ msg: "Internal server error getting the details" });
      } else res.json(result);
    })
  );
});

router.delete("/delete/:id", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `DELETE FROM students WHERE id = '${req.params.id}'`,
      (err, result) => {
        console.log(req.params.id);
        if (err) {
          res.status(400).json(err);
        } else {
          res.json(result);
        }
      }
    )
  );
});

module.exports = router;
