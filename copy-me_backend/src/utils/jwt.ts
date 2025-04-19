// import jwt from 'jsonwebtoken';
// import { IUser } from '../models/User';

// export const generateToken = (user: IUser): string => {
//     return jwt.sign(
//         { id: user._id, role: user.role },
//         process.env.JWT_SECRET || 'votre_secret_jwt_ultra_securise',
//         { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//     );
// }; 