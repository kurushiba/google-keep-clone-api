import { User } from './modules/users/user.entity';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
      file?: Express.Multer.File;
    }
  }
}
