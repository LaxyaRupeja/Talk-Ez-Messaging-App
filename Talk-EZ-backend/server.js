const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const port = 8080;
const { v4: uuidv4 } = require("uuid");
const initSocket = require('./Socket.io/socket');
const jwt = require('jsonwebtoken');
const passport = require('./Gauth/google.auth');
const User = require('./Models/User.model');
app.use(express.json());
app.use(cors())
app.use("/user", require("./Routes/Users.routes"))
app.use("/chat", require("./Routes/Chats.routes"))


app.get("/", (req, res) => {
    res.send("Server is running")
})
app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/user/login",
        session: false,
    }),
    async function (req, res) {
        const isUserExits = await User.findOne({ email: req.user.emails[0].value })
        if (isUserExits) {
            const token = jwt.sign({ userId: isUserExits._id }, "your-secret-key", { expiresIn: '7d' });
            res.redirect(`http://localhost:5173/callback?token=${token}`)
        }
        else {
            console.log(req.user);
            console.log("SignUP");
            let user = User({
                name: req.user.displayName,
                email: req.user.emails[0].value,
                password: uuidv4(),
                profileImage: req.user.photos[0].value
            })
            await user.save();
            console.log(user);
            const token = jwt.sign({ userId: user._id }, "JWT_SECRET", { expiresIn: '7d' });
            res.redirect(`http://localhost:5173/callback?token=${token}`)
        }
    }
);


server.listen(port, async () => {
    initSocket(server)
    await mongoose.connect("mongodb+srv://laxya:laksh@cluster0.zwu6tqa.mongodb.net/ChatifySecond?retryWrites=true&w=majority")
    console.log(`Server is running on port ${port}`)
})
