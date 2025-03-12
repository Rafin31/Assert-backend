module.exports.getAllUsers = async (req, res, next) => {
    res.status(200).json({ success: "true", message: "users" })
}

module.exports.getSingleUser = async (req, res, next) => {
    const { id } = req.params
    res.status(200).json({ success: "true", message: `user with id ${id}` })
}