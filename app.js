const express = require("express");

const mongoose = require("mongoose");

const path = require("path");

const { v4: uuidv4 } = require("uuid");

require("dotenv").config({ override: true });
 
const upload = require("./upload");

const bucket = require("./storage");

const connectDB = require("./db");
 
const app = express();

const port = process.env.PORT || 3000;
 
// Middlewares

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
 
// Connect MongoDB

connectDB();
 
// User schema

const UserSchema = new mongoose.Schema({

  name: String,

  email: String,

});
 
const User = mongoose.model("User", UserSchema);
 


app.get("/", (req, res) => {

  res.send(`
<html>
<head>
<title>User Form</title>
<style>

        body {

          font-family: Arial;

          background: #f4f6f8;

          display: flex;

          height: 100vh;

          align-items: center;

          justify-content: center;

          flex-direction: column;

        }

        .box {

          background: white;

          padding: 25px;

          border-radius: 8px;

          width: 320px;

          box-shadow: 0 0 10px rgba(0,0,0,0.1);

          margin-bottom: 20px;

        }

        input, button {

          width: 100%;

          padding: 10px;

          margin: 8px 0;

        }

        button {

          background: #007bff;

          color: white;

          border: none;

          cursor: pointer;

        }

        a {

          display: block;

          margin-top: 10px;

          text-align: center;

        }
</style>
</head>
<body>
 
      <div class="box">
<h2>Add User</h2>
<form method="POST" action="/users">
<input type="text" name="name" placeholder="Name" required />
<input type="email" name="email" placeholder="Email" required />
<button type="submit">Save</button>
</form>
</div>
 
      <a href="/users">View Users</a>
<a href="/upload">Upload Image</a>
 
    </body>
</html>

  `);

});
 


app.post("/users", async (req, res) => {

  await User.create(req.body);

  res.redirect("/users");

});
 
app.get("/users", async (req, res) => {

  const users = await User.find();
 
  const rows = users

    .map(

      (u, i) => `
<tr>
<td>${i + 1}</td>
<td>${u.name}</td>
<td>${u.email}</td>
</tr>`

    )

    .join("");
 
  res.send(`
<html>
<head>
<title>User List</title>
<style>

        body { font-family: Arial; padding: 30px; }

        table { width: 60%; border-collapse: collapse; }

        th, td { border: 1px solid #ccc; padding: 10px; }

        th { background: #007bff; color: white; }
</style>
</head>
<body>
<h2>Users List</h2>
<table>
<tr>
<th>#</th>
<th>Name</th>
<th>Email</th>
</tr>

        ${rows}
</table>
<a href="/">⬅ Back</a>
</body>
</html>

  `);

});
 


app.get("/upload", (req, res) => {

  res.send(`
<html>
<head><title>Upload Image</title></head>
<body>
<h2>Upload Image to GCP Cloud Storage</h2>
<form action="/upload" method="POST" enctype="multipart/form-data">
<input type="file" name="image" accept="image/*" required />
<br /><br />
<button type="submit">Upload</button>
</form>
<br />
<a href="/">⬅ Back</a>
</body>
</html>

  `);

});
 


app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const fileName = `uploads/${uuidv4()}-${req.file.originalname}`;
    const file = bucket.file(fileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
      resumable: false,
    });

    stream.on("error", (err) => {
      console.error(err);
      return res.status(500).send("Upload failed");
    });

    stream.on("finish", async () => {
      // ❌ DO NOT call file.makePublic()

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      res.send(`
        <h2>Upload successful ✅</h2>
        <img src="${publicUrl}" width="300"/>
        <p><a href="/upload">Upload another</a></p>
        <p><a href="/">Home</a></p>
      `);
    });

    stream.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


app.listen(port, () => {

  console.log(`🚀 App running on port http://localhost:${port}`);

});

 