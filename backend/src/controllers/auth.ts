import { Request, Response } from 'express';
import { User } from '../models/user';
import { Session } from '../models/session';

export class AuthController {
  // User mit gehashten Passwörten (bcrypt)
  public users: User[] = [
    { id: 1, email: 'tulpe@uni.kn', password: '$2b$10$46nOBhJ3IsKJ7Cu.tP02rOCbWuNTkWIlD8oE/vCTRR3/OcBSiLruG', firstName: 'Thomas', lastName: 'Tulpe' }, // Passwort: test
    { id: 2, email: 'halm@uni.kn', password: '$2a$10$hPS.A0J.EQYg0.tRXMfyg.Dx5BsgDYvtAk4uoBts.dBvJs8Uoi7uu', firstName: 'Hanna', lastName: 'Halm' } // Passwort: blume
  ];

  public sessions: Session[] = [];

  public register(request: Request, response: Response): void {
    // TODO

    // Passwort hashen
    // const hash = bcrypt.hashSync(password, 10);

    response.status(201);
    response.send({ code: 201, message: 'Registration successful' });
    return;
  }
}
