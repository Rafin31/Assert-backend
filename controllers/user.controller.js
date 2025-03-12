export const getAllUsers = async (req, res, next) => {
    res.status(200).json({ success: "true", message: "users" })
}

export const getSingleUser = async (req, res, next) => {
    const { id } = req.params
    res.status(200).json({ success: "true", message: `user with id ${id}` })
}