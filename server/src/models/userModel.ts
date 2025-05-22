import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserBase {
    name: string;
    email: string;
    password?: string;
    isAdmin: boolean;
    isBlocked: boolean;
    googleId?: string;
    avatarUrl: string;
    bio?: string;
}

export interface IUser extends IUserBase, Document {
    comparePassword(candidatePassword: string): Promise<boolean>
    isModified(field: string): boolean;
}


const userSchema: Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: function (this: IUser) {
                return !this.googleId;
            },
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        googleId: {
            type: String,
            default: null,
        },
        avatarUrl: {
            type: String,
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcDdrIJuxsoeWIjwPqSfcL9PFqVdc5-F6Urm4CjOcfCMPH752K-36Xj0tjyazZqKWWk8g"
        },
        bio: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

// password hashing middleware
userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;