require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// Config JSON response
app.use(express.json());
app.use(cors());

// Open Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a API!" });
});

// Private Route

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // Check if user exists

  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }

  res.status(200).json({ user });
});

// Models

const User = require("./models/User");
const Entry = require("./models/Entry");

// Check token

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);
    res.status(200).json({ msg: "Token válido" });

    next();
  } catch (err) {
    res.status(400).json({ msg: "Token invalid" });
  }
}

// Register user

app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  // validation
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatório" });
  }

  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  // Check if user exists

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
  }

  // Login User

  app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).json({ msg: "O email é obrigatório" });
    }
    if (!password) {
      return res.status(422).json({ msg: "A senha é obrigatório" });
    }

    // Check if user exists

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    // Check if password match

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(422).json({ msg: "Senha incorreta" });
    }

    try {
      const secret = process.env.SECRET;

      const token = jwt.sign(
        {
          id: user._id,
        },
        secret
      );

      res
        .status(200)
        .json({ msg: "Autenticação realizada com sucesso", token });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro interno no servidor, tente novamente mais tarde" });
    }
  });

  try {
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ msg: "Erro interno no servidor, tente novamente mais tarde" });
  }

  // Create password

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ msg: "Erro interno no servidor, tente novamente mais tarde" });
  }
});

// Create entry expends

app.post("/create/entry", async (req, res) => {
  const { title, value, idUser } = req.body;
  const entry = await Entry.findOne({ title: title });

  // Validation

  if (!title) {
    return res.status(422).json({ msg: "O titulo é obrigatório" });
  }
  if (!value) {
    return res.status(422).json({ msg: "O valor é obrigatório" });
  }
  if (!idUser) {
    return res.status(422).json({ msg: "O id do usuário é obrigatório" });
  }

  const newEntry = new Entry({
    title,
    value,
    idUser,
  });

  try {
    await newEntry.save();

    res.status(201).json({ msg: "Valor adicionado com sucesso!" });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ msg: "Erro interno no servidor, tente novamente mais tarde" });
  }
});

// Remove expends (complete)

app.post("/remove/expends/:id", async (req, res) => {

  await Entry.deleteOne({ _id: req.params.id })
  .then((response) => {
    return res.status(200).json(response);
  })
  .catch((error) => {
    return res.status(500).json(error);
  });
});

// Credencials

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.hxfshtp.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectou ao banco!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
