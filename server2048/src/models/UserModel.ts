// UserModel.ts
import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Logger } from '../utils/Logger';

interface IUser extends Document {
    username: string; // 用户名字段
    password: string; // 密码字段
    nickname: string; // 昵称字段
    createdAt: Date;   // 注册时间字段
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    nickname: { type: String, required: true, default: function () { return this.username; } },
    createdAt: { type: Date, required: true, default: Date.now }
});

UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        if (error instanceof Error) {
            next(error);
        } else {
            Logger.error("An unexpected error occurred:", error);
            next(new Error("An unexpected error occurred."));
        }
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export class UserModel {
    private _model: Model<IUser>;

    constructor() {
        this._model = model<IUser>('User', UserSchema);
    }

    public get model(): Model<IUser> {
        return this._model;
    }
}
