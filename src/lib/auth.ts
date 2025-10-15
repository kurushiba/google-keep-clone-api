import { Request, Response, NextFunction } from 'express';

export const Auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.currentUser == null) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }
  next();
};
