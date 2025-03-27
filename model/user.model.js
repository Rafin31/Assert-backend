import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from 'validator';

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        lowercase: true,
        validate: {
            validator: async function (value) {
                if (this.isNew) { //only check when creating user for the first time
                    const user = await this.model('User').findOne({ email: value });
                    return !user;
                }
                return true;
            },
            message: props => `${props.value} is already used by another user`
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        validate: {
            validator: (value) =>
                validator.isStrongPassword(value, {
                    minLength: 8,
                }),
            message: "Password should be 8 characters long and should contain minimum of one lowercase, number, uppercase and symbol!"
        },
    },
    walletAddress: {
        type: String,
        sparse: true // Allows it to be added later
    },
    lastLoginReward: {
        type: Date,
        default: null
    },
    totalToken: {
        type: String,
        default: "0"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });



UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // ✅ Now it won't re-hash every update
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model("User", UserSchema);
export default User;
