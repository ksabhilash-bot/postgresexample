import express from "express";
import {
  createUser,
  getSingleUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/createUser", createUser);
router.get("/getUsers", getUsers);
router.get("/user/:email", getSingleUser);
router.put("/updateuser/:email/:password", updateUser);
router.delete(`/deleteuser/:email`,deleteUser);

export default router;
