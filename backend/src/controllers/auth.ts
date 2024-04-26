import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import uid from 'uid-safe';
import { User } from '../models/user';
import { Session } from '../models/session';

export class AuthController {
  // User mit gehashten Passwörten (bcrypt)
  public users: User[] = [
    { id: 1, name: 'Thomas Tulpe', street: 'Musterstr.', houseNumber: 12, zipCode: 78464, city: 'Konstanz', email: 'tulpe@uni.kn', password: '$2b$10$46nOBhJ3IsKJ7Cu.tP02rOCbWuNTkWIlD8oE/vCTRR3/OcBSiLruG' }, // Passwort: test
    { id: 2, name: 'Hanna Halm', street: 'Marktstr.', houseNumber: 3, zipCode: 78467, city: 'Konstanz', email: 'halm@uni.kn', password: '$2a$10$hPS.A0J.EQYg0.tRXMfyg.Dx5BsgDYvtAk4uoBts.dBvJs8Uoi7uu' } // Passwort: blume
  ];

  public sessions: Session[] = [];

  public register(request: Request, response: Response): Promise<void> {
    /* Extracting the received client data from the request body. */
    const { name, street, houseNumber, zipCode, city, email, password } = request.body;

    /* Convert Numbers from type string to type number */
    const houseNumberInt = Number(houseNumber);
    const zipCodeInt = Number(zipCode);

    /* Hash the provided password */
    let passwordHash;
    try {
      passwordHash = bcrypt.hashSync(password, 10); // Hash password
    } catch (error) {
      response.status(500).json({ code: 500, message: 'Something went wrong' }); // 500: Internal Server Error
      return;
    }

    /* Create a new user object */
    const newUser = {
      id: this.users.length + 1,
      name,
      street,
      houseNumber: houseNumberInt,
      zipCode: zipCodeInt,
      city,
      email,
      password: passwordHash
    };

    /* Save the new user object */
    this.users.push(newUser);

    console.log(this.users);

    /* Start a new session for the user (to automatically log in the user after registration) */
    const sessionId = uid.sync(24);
    const session: Session = { sessionId: sessionId, userId: newUser.id };
    this.sessions.push(session);
    /*
     * Cookie Optionen:
     * Für Cookies die nicht per JavaScript abgefragt werden können: "httpOnly: true"
     * Für Cookies die nur über HTTPS gesendet werden dürfen: "secure: true"
     * Für Basisschutz vor CSRF: "sameSite: 'lax'" oder "sameSite: 'strict'" (Bei lax sind gewisse Anfragen von anderen Webseiten noch erlaubt z.B. GET)
     * Für ein Ablaufzeitpunkt des Cookies (z.B. in einer Stunde): "maxAge: 60 * 60 * 1000" oder "expires: new Date(Date.now() + 60 * 60 * 1000)"
     */
    response.cookie('sessionId', sessionId, { httpOnly: true });

    console.log(this.sessions);

    /* Send a success message */
    response.status(201).json({ code: 201, message: 'Registration successful' });
    return;
  }
}
