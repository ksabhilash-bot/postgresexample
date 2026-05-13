import pool from "../db.js";
import bcrypt from "bcrypt";
export const createUser = async (req, res) => {
  try {
    console.log("admin table creation");
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({
        message: "please provide all the credentials",
      });
    }
    const existingUser = await pool.query(
      `
        SELECT * FROM users WHERE email =$1
        `,
      [email],
    );
    console.log(existingUser);
    if (existingUser.rows.length > 0) {
      return res.status(404).json({
        message: "Invalid credentials",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
        INSERT INTO users(username , email, password) VALUES($1,$2,$3)
        RETURNING id ,username,email,created_at
        `,
      [username, email, hashedPassword],
    );
    return res.status(201).json({
      message: "user created",
      data: result.rows,
    });
  } catch (error) {
    console.log("error occured in admin controller:", error);
    return res.json({ error });
  }
};

export async function getUsers(req, res) {
  try {
    const results = await pool.query(`
        
        SELECT * FROM users`);

    if (results.rows.length === 0) {
      return res.status(200).json({
        data: results.rows,

        message: "No users to show",
      });
    }

    return res.status(200).json({
      message: "retrieved users from users table",
      data: results.rows,
      rows: results.rowCount,
    });
  } catch (error) {
    console.log("Error occured in getUsers:", error);
  }
}

export async function getSingleUser(req, res) {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        message: "please provide email",
      });
    }
    const result = await pool.query(
      `
        SELECT * FROM users WHERE email = $1
        `,
      [email],
    );
    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "No user exists",
      });
    }
    return res.status(201).json({
      message: "User exists",
      data: result.rows,
    });
  } catch (error) {
    console.log("Error occured while retrieving singl user:", error);
  }
}

export async function updateUser(req, res) {
  try {
    const { email, password } = req.params;
    const { updateemail } = req.body;
    const result = await pool.query(
      `
        UPDATE users SET email = $1 WHERE email = $2 RETURNING id,email,created_at
        `,
      [updateemail, email],
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No user found matching that email." });
    }
    return res.json({ data: result });
  } catch (error) {
    console.log("update put error:", error);
  }
}

export async function deleteUser(req, res) {
  try {
    const { email } = req.params;

    const result = await pool.query(
      `
            DELETE FROM users WHERE email = $1 RETURNING *
            `,
      [email],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not exist",
      });
    }
    return res.status(200).json({
      message: "user deleted successfully",
    });
  } catch (error) {
    console.log("error from delete user:", error);
  }
}
