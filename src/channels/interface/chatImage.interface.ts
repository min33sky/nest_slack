import { Users } from 'src/entities/Users';

export interface ChatImage {
  url: string;
  name: string;
  user: Users;
  files: Express.Multer.File[];
}
