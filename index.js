const app = require("./app");
const errorHandler = require("./middlewires/errorHandler");
const port = process.env.PORT || 5000;


const userRoutes = require('./routes/v1/user.route')
const authRoutes = require('./routes/v1/auth.route')

//routes
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/auth', authRoutes)


//no route found
app.all("*", (req, res) => {
    res.status(404).send({ success: "false", message: "No API end point found" });
});

app.listen(port, () => {
    console.log("Express is listening in port", port);
})

//handling global errors
app.use(errorHandler)

//can handel "unhandledRejection" bellow like this.
process.on("unhandledRejection", (error) => {
    console.log("unhandledRejection", error.name, error.message);
    return res.status(error.status || 500).json({ success: "false", message: "Internal Server Error" })
    // app.close(() => {
    //     process.exit(1);
    // });
});

