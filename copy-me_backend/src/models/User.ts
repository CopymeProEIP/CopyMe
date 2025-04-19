import { Schema, model } from 'mongoose';
import Joi from 'joi';
import bcrypt from 'bcrypt';
export const ValidateUser = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid('user', 'admin').required()
});

interface IUsers {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
}

const usersSchema = new Schema<IUsers>({
    email: {
      type: String,
      required: true,
      unique: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    firstName: { 
      type: String, 
      required: true 
    },
    lastName: { 
      type: String, 
      required: true
    },
    role: { type: String,
      enum: ['user', 'admin'],
      required: true
    }
});

usersSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export const User = model<IUsers>('Users', usersSchema);