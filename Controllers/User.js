const User = require("../Models/User");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../Config/mailer");

exports.SignUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const found = await User.findOne({ email });

    if (found) {
      return res.status(400).send({ errors: [{ msg: "Email already exist" }] });
    }

    const newUser = new User(req.body);

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    newUser.password = hashedPassword;
    await newUser.save();

    // token
    const payload = { id: newUser._id };
    var token = jwt.sign(payload, process.env.privateKey, { expiresIn: "1d" });

    res.status(200).send({ msg: "Account created", newUser, token });
  } catch (error) {
    res.status(500).send({ errors: [{ msg: "Could not create account" }] });
  }
};

exports.SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const found = await User.findOne({ email }).select("+password");
    if (!found) {
      return res
        .status(400)
        .send({ errors: [{ mas: "Email does not exist" }] });
    }

    const matched = bcrypt.compareSync(password, found.password);

    if (!matched) {
      return res.status(400).send({ errors: [{ msg: "Wrong password" }] });
    }

    // token
    const payload = { id: found._id };
    var token = jwt.sign(payload, process.env.privateKey, { expiresIn: "1d" });

    res.status(200).send({ msg: "Logged in ", found, token });
  } catch (error) {
    res.status(500).send({ errors: [{ mas: "Cound not loggin" }] });
  }
};

exports.GetAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({ msg: "Users list", users });
  } catch (error) {
    res.status(500).send({ errors: [{ msg: "could not get all users" }] });
  }
};

exports.GetUser = async (req, res) => {
  try {
    const { id } = req.params;

    const found = await User.findById(id);
    if (!found) {
      return res.status(400).send({ errors: [{ msg: "wrong id" }] });
    }
    res.status(200).send({ msg: "The User :", found });
  } catch (error) {
    res.status(500).send({ errors: [{ msg: "Could not find the user" }] });
  }
};

exports.EditUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, phone, address } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({
        errors: [{ msg: "User not found" }],
      });
    }

    user.name = name;
    user.email = email;
    user.address = address;

    user.phone = phone;
    user.role = role;
    user.isActive = isActive === "true";

    if (req.file) {
      user.profilePicture = req.file.filename;
    }
    await user.save();
    return res.status(200).send({
      msg: "user updated with success",
      user,
    });
  } catch (error) {
    res.status(500).send({ errors: [{ msg: "Could not find the user" }] });
  }
};

exports.DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.statys(404).send({ errors: [{ msg: "User not found" }] });
    }
    res.status(200).send({ msg: "User deleted", deletedUser });
  } catch (error) {
    res.status(500).send({ errors: [{ msg: "Cound not delete the user" }] });
  }
};

exports.CurrentUser = async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send({
      errors: [{ msg: "Could not get current user" }],
    });
  }
};

exports.CreateProfessionalAccount = async (req, res) => {
  try {
    const { name, email, phone, address, role } = req.body;

    // Vérifier les champs obligatoires
    if (!name || !email || !role) {
      return res.status(400).send({
        errors: [{ msg: "Name, email and role are required" }],
      });
    }

    // Autoriser uniquement artisan et livreur
    if (!["artisan", "livreur"].includes(role)) {
      return res.status(400).send({
        errors: [{ msg: "Invalid professional role" }],
      });
    }

    // Vérifier si l'email existe déjà
    const found = await User.findOne({ email: email.toLowerCase() });

    if (found) {
      return res.status(400).send({
        errors: [{ msg: "This email already exists" }],
      });
    }

    // Générer un token d'activation sécurisé
    const activationToken = crypto.randomBytes(32).toString("hex");

    // Stocker uniquement le hash du token
    const hashedToken = crypto
      .createHash("sha256")
      .update(activationToken)
      .digest("hex");

    // Générer un mot de passe temporaire aléatoire
    const temporaryPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Créer le compte professionnel
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      role,
      password: hashedPassword,
      isActive: true,
      isVerified: false,
      activationToken: hashedToken,
      activationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    await newUser.save();

    // Construire le lien d'activation
    const activationLink = `${process.env.CLIENT_URL}/activate-account?token=${activationToken}&email=${encodeURIComponent(email)}`;

    // Envoyer l'email d'invitation
    try {
      await sendEmail(
        email,
        "Bienvenue sur Tanit - Activation de votre compte",
        `
          <div style="font-family: Arial; padding: 20px;">
            <h2>Bienvenue sur Tanit !</h2>

            <p>Bonjour ${name},</p>

            <p>
              Votre compte ${role === "artisan" ? "artisan" : "livreur"}
              a été créé par l'administrateur de Tanit.
            </p>

            <p>
              Pour activer votre compte et choisir votre mot de passe,
              cliquez sur le bouton ci-dessous :
            </p>

            <a href="${activationLink}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background-color: #8b78b8;
                color: white;
                text-decoration: none;
                border-radius: 6px;
              ">
              Activer mon compte
            </a>

            <p>Ce lien expire dans 24 heures.</p>

            <p>À bientôt sur Tanit !</p>
          </div>
        `,
      );
    } catch (emailError) {
      // Supprimer le compte si l'email n'a pas pu être envoyé
      await User.findByIdAndDelete(newUser._id);
      throw emailError;
    }

    res.status(201).send({
      msg: "Professional account created. Invitation email sent successfully.",
    });
  } catch (error) {
    console.error("Create professional account error:", error);

    res.status(500).send({
      errors: [{ msg: "Could not create professional account" }],
    });
  }
};

exports.ActivateAccount = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    // Vérifier les données reçues
    if (!token || !email || !password) {
      return res.status(400).send({
        errors: [{ msg: "Tous les champs sont obligatoires." }],
      });
    }

    // Vérifier la longueur du mot de passe
    if (password.length < 8) {
      return res.status(400).send({
        errors: [
          { msg: "Le mot de passe doit contenir au moins 8 caractères." },
        ],
      });
    }

    // Hacher le token reçu
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Chercher le compte correspondant
    const user = await User.findOne({
      email: email.toLowerCase(),
      activationToken: hashedToken,
      activationTokenExpires: { $gt: Date.now() },
      isVerified: false,
    });

    if (!user) {
      return res.status(400).send({
        errors: [
          {
            msg: "Lien d'activation invalide ou expiré.",
          },
        ],
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Activer le compte
    user.password = hashedPassword;
    user.isVerified = true;
    user.activationToken = null;
    user.activationTokenExpires = null;

    await user.save();

    return res.status(200).send({
      msg: "Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Activate account error:", error);

    return res.status(500).send({
      errors: [{ msg: "Impossible d'activer le compte." }],
    });
  }
};
