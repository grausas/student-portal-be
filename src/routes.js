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
                msg: "Internal server error hashing lecturer details",
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
                      return res.status(200).json({
                        msg: "Lecturer has been successfully registered",
                      });
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
                    "The provided details are incorrect or the user does not exist",
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

//add students
router.post("/students", middleware.isLoggedIn, (req, res) => {
  const data = req.body;
  if (
    data.name.length > 2 &&
    data.name.length < 50 &&
    data.surname.length > 2 &&
    data.surname.length < 50 &&
    data.email.length > 5 &&
    data.email.length < 256 &&
    data.phone
  ) {
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

//get all students
router.get("/view-students", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `SELECT a.*, b.course_name FROM students a LEFT JOIN courses b on a.group_id = b.group_id `,
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

//edit student
router.post("/editstudent/:id", middleware.isLoggedIn, (req, res) => {
  const data = req.body;
  if (
    data.name.length > 2 &&
    data.name.length < 50 &&
    data.surname.length > 2 &&
    data.surname.length < 50 &&
    data.email.length > 5 &&
    data.email.length < 256 &&
    data.phone
  ) {
    database((db) =>
      db.query(
        `UPDATE students SET name = ${mysql.escape(
          data.name
        )}, surname = ${mysql.escape(data.surname)}, email = ${mysql.escape(
          data.email
        )}, phone = ${mysql.escape(data.phone)} WHERE id = '${req.params.id}'`,
        (err) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ msg: "Internal server error" });
          } else {
            return res
              .status(200)
              .json({ msg: "User has been updated succesfully" });
          }
        }
      )
    );
  } else {
    return res.status(400).json({ msg: "Passed values are incorrect" });
  }
});

//add group
router.post("/groups", middleware.isLoggedIn, (req, res) => {
  const data = req.body;
  database((db) =>
    db.query(
      `SELECT * FROM student_groups WHERE student_id = ${mysql.escape(
        data.studentId
      )}`,
      (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Internal server error checking groups validity" });
        } else if (result.length !== 0) {
          return res
            .status(400)
            .json({ msg: "This student is already in a group" });
        } else {
          if (data.studentId && data.groupId) {
            db.query(
              `INSERT INTO student_groups (groupId, student_id) VALUES (${mysql.escape(
                data.groupId
              )}, ${mysql.escape(data.studentId)})`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).json({
                    msg: "Internal server error adding student to group",
                  });
                } else {
                  db.query(
                    `UPDATE students a INNER JOIN student_groups b SET a.group_id = b.groupId WHERE a.id = b.student_id`,
                    (err, result) => {
                      if (err) {
                        console.log(err);
                        res.status(400).json({
                          msg: "Internal server error updating group",
                        });
                      } else {
                        console.log(result);
                        return res.status(201).json({
                          msg: "Student successufully added to group",
                        });
                      }
                    }
                  );
                }
              }
            );
          } else {
            return res.status(400).json({ msg: "Passed values are incorrect" });
          }
        }
      }
    )
  );
});

//get groups
router.get("/view-groups", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `SELECT a.id, a.groupId, GROUP_CONCAT(distinct ' ', b.name, ' ', b.surname ) AS student FROM student_groups a JOIN students b ON a.student_id = b.id GROUP BY groupId`,
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

//add course
router.post("/courses", middleware.isLoggedIn, (req, res) => {
  const data = req.body;
  if (
    data.courseName.length > 2 &&
    data.description &&
    data.lecturerId &&
    data.groupId
  ) {
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

//get courses
router.get("/view-courses", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `SELECT a.id, a.course_name, a.description, group_concat(distinct ' ', d.name, ' ', d.surname ) AS students,  group_concat(distinct c.name, " ", c.surname) AS lecturer FROM courses a, student_groups b, lecturers c, students d  WHERE a.group_id = b.groupId AND b.student_id = d.id AND a.lecturer_id = c.id group by a.id`,
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

//get lecturers
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

//delete student
router.delete("/delete/:id", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `DELETE FROM students WHERE id = '${req.params.id}'`,
      (err, result) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.json(result);
        }
      }
    )
  );
});

//delete group
router.delete("/deletegroup/:id", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `DELETE FROM student_groups WHERE groupId = '${req.params.id}'`,
      (err, result) => {
        if (err) {
          res.status(400).json(err);
        } else {
          db.query(
            `UPDATE students set group_id = "" WHERE group_id = '${req.params.id}'`,
            (err, result) => {
              if (err) {
                res.status(400).json(err);
              } else {
                res.json(result);
              }
            }
          );
        }
      }
    )
  );
});

module.exports = router;
