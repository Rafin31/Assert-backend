const errorHandler = (err, req, res, next) => {
    res.status(400).json({ status: "false", message: "Something went wrong" })
}

export default errorHandler;