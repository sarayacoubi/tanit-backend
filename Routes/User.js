const express = require("express");
const uploadUsers = require("../Config/uploidUsers");
const {
  SignIn,
  SignUp,
  GetAllUsers,
  GetUser,
  EditUser,
  DeleteUser,
  CreateProfessionalAccount,
  ActivateAccount ,
} = require("../Controllers/User");
const {
  verifSignUp,
  verifSignIn,
  UserValidation,
} = require("../Middlewares/UserValidation");
const { IsAuth } = require("../Middlewares/IsAuth");
const { CheckRole } = require("../Middlewares/CheckRole");

const userRouter = express.Router();

userRouter.post("/SignUp", verifSignUp, UserValidation, SignUp);

userRouter.post("/SingIn", verifSignIn, UserValidation, SignIn);

userRouter.get("/CurrentUser", IsAuth, (req, res) => {
  res.send(req.user);
});

userRouter.get("/getAllUsers", GetAllUsers);

userRouter.get("/getUser/:id", GetUser);

userRouter.put(
  "/EditUser/:id",

  uploadUsers.single("profilePicture"),

  EditUser,
);

userRouter.delete("/DeleteUser/:id", DeleteUser);

userRouter.post(
  "/CreateProfessionalAccount",
  IsAuth,
  CheckRole("admin"),
  CreateProfessionalAccount,
);

userRouter.post("/ActivateAccount", ActivateAccount);

module.exports = userRouter;
