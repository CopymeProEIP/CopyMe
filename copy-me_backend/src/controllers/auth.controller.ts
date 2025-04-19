import { Request, Response } from 'express';
import { ValidateUser } from '../models/User';
import { authenticateUser, createUser, getUserInformation } from '../services/users';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response) => {
  const data = {
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role
  }

  const { error, value } = ValidateUser.validate(data);
  if (error) {
    res.send(error.message);
  } else {
    const serviceResponse = await createUser(value);
    res.status(201).json(serviceResponse);
  }
}

export const login = async (req: Request, res: Response) => {
  const data = {
    email: req.body.email,
    password: req.body.password
  }

  const serviceResponse = await authenticateUser(data);
  res.status(200).json(serviceResponse);
}

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const data = {
    id: req.user?.id
  }
  const serviceResponse = await getUserInformation(data);
  res.status(200).json(serviceResponse);
}