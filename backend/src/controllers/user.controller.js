import User from "../models/user.model.js";

export const getSearchedUsers = async (req, res) => {
    try {
        const name = req.query.name ? {
            $or: [
                { fullName: { $regex: req.query.name, $options: "i" } },
            ],
        } : {};

        // console.log('Name: ', name);

        const users = await User.find(name).find({ _id: { $ne: req.user._id }}).select('-password');

        // console.log('Users: ', users);

        res.status(200).json(users);
    } catch (error) {
        console.log(`Error in getSearchedUsers controller: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
}