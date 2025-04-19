import Notification from "../model/notifications.modal.js";


export const createNotification = async (userId, { title, message }) => {
    Notification.create({ user: userId, title, message });
}



export const create = async (req, res) => {
    try {
        const { userId, title, message } = req.body;


        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "userId, title and message are required",
            });
        }

        const notif = await Notification.create({
            user: userId,
            title,
            message
        });

        return res.status(201).json({
            success: true,
            message: "Notification created",
            data: notif,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const list = async (req, res) => {
    try {
        const id = req.body.id
        const notes = await Notification.find({ user: id }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            data: notes,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const id = req.body.id
        await Notification.updateMany(
            { user: id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (err) {
        res.status(500).json({ success: false, error: error.message });
    }
};
