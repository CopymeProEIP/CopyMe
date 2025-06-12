import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const generateToken = (user: any) => {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
};  

export async function createUser(data: any) {
    try {
        const user = await User.create(data);
        console.log(user);

        return {
            status: 'success',
            message: 'User created successfully',
            data: user
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to create user',
            error: error
        };
    }
}

export async function authenticateUser(data: any) {
    try {
        const user = await User.findOne({ email: data.email })
        .select('+password')
        .exec();

        if (!user) {
            return {
                status: 'error',
                message: 'User not found'
            };
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            return {
                status: 'error',
                message: 'Invalid password'
            };
        }
        return {
            status: 'success',
            message: 'User authenticated successfully',
            token: generateToken(user)
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to authenticate user',
            error: error
        };
    }
}

export async function getUserInformation(data: any) {
    try {
        const user = await User.findById(data.id).select('-password -role -_id -__v -createdAt -updatedAt');
        return {
            status: 'success',
            message: 'User information retrieved successfully',
            data: user
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to get user information',
            error: error
        };
    }
}