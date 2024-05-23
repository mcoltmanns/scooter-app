import { Request, Response, NextFunction } from 'express';
import { check, FieldValidationError, validationResult, ValidationChain } from 'express-validator';
import { UsersAuth } from '../models/user';

interface ErrorsObject {
  [key: string]: string;
}

export class Validator {
  private static async runAllChecks(errorCode: number, checks: ValidationChain[], request: Request, response: Response, next: NextFunction): Promise<void> {
    /* Run all checks */
    try {
      await Promise.all(checks.map(check => check.run(request)));
    } catch (error) {
      response.status(500).json({ code: 500, message: 'Etwas ist schief gelaufen.' }); // 500: Internal Server Error
      return;
    }

    /* Catch the validation errors */
    const validationErrors = validationResult(request);

    /* Handle the validation errors if they occurred */
    // TODO: refactor into a universal error handler maybe?
    if (!validationErrors.isEmpty()) {
      const errors: ErrorsObject = {};

      validationErrors.array().forEach(
        (valErr: FieldValidationError) => (errors[valErr.path] = valErr.msg)
      );

      response.status(errorCode).json({ code: errorCode, validationErrors: errors });
      return;
    }
    
    /* Continue with the next middleware if no validation errors occurred */
    return next();
  }

  public async validateRegister(request: Request, response: Response, next: NextFunction): Promise<void> {   
    /* Check if all fields correspond to the expected request body */
    const checks = [
      check('name').trim().escape().notEmpty().withMessage('Bitte geben Sie einen Namen ein.'),
      check('street').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Straße ein.'),
      check('houseNumber').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Hausnummer ein.').bail().isNumeric().withMessage('Bitte geben Sie eine gültige numerische Hausnummer ein.'),
      check('zipCode').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Postleitzahl ein.').bail().isNumeric().withMessage('Bitte geben Sie eine gültige numerische Postleitzahl ein.'),
      check('city').trim().escape().notEmpty().withMessage('Bitte geben Sie einen Ort ein.'),
      check('email').trim().escape().notEmpty().withMessage('Bitte geben Sie eine E-Mail-Adresse ein.').bail().isEmail().withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.').bail().normalizeEmail().custom(async (email) => {
        const user = await UsersAuth.findOne({ where: { email: email } });
        if (user) {
          throw new Error('E-Mail wird bereits verwendet.');
        }
      }),
      check('password').escape().notEmpty().withMessage('Bitte geben Sie ein Passwort ein.').bail().isLength({ min: 8 }).withMessage('Das Passwort muss mindestens 8 Stellen haben.')
    ];

    /* Run all checks */
    await Validator.runAllChecks(400, checks, request, response, next);
  }

  public async validateLogin(request: Request, response: Response, next: NextFunction): Promise<void> {  
    /* Check if all fields correspond to the expected request body */
    const checks = [
      check('sessionId').trim().escape(),
      check('email').trim().escape().notEmpty().withMessage('Bitte geben Sie eine E-Mail-Adresse ein.').bail().isEmail().withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.').bail().normalizeEmail(),
      check('password').escape().notEmpty().withMessage('Bitte geben Sie ein Passwort ein.')
    ];

    /* Run all checks */
    await Validator.runAllChecks(400, checks, request, response, next);
  }

  public async validateUpdateUser(request: Request, response: Response, next: NextFunction): Promise<void> {  
    /* Check if all fields correspond to the expected request body */
    const checks: ValidationChain[] = [
      check('name').trim().escape().notEmpty().withMessage('Bitte geben Sie einen Namen ein.'),
      check('street').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Straße ein.'),
      check('houseNumber').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Hausnummer ein.').bail().isNumeric().withMessage('Bitte geben Sie eine gültige numerische Hausnummer ein.'),
      check('zipCode').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Postleitzahl ein.').bail().isNumeric().withMessage('Bitte geben Sie eine gültige numerische Postleitzahl ein.'),
      check('city').trim().escape().notEmpty().withMessage('Bitte geben Sie einen Ort ein.'),
      /* TODO: If the email will be updatable in the future, you can simply uncomment the following check: */
      // check('email').trim().escape().notEmpty().withMessage('Bitte geben Sie eine E-Mail-Adresse ein.').bail().isEmail().withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.').bail().normalizeEmail().custom(async (email) => {
      //   const user = await UsersAuth.findOne({ where: { email: email } });
      //   if (!user) {
      //     throw new Error('E-Mail-Adresse nicht gefunden.');
      //   }
      // }),
      check('password').optional().escape().isLength({ min: 8 }).withMessage('Das Passwort muss mindestens 8 Stellen haben.')
    ];

    /* Run all checks */
    await Validator.runAllChecks(400, checks, request, response, next);
  }

  /**
   * validate a user's session
   */
  public async validateSessionCookie(request: Request, response: Response, next: NextFunction): Promise<void> {
    /* Check if all fields correspond to the expected request body */
    const checks = [
      check('sessionId').trim().escape().notEmpty().withMessage('Keine Session, bitte melden Sie sich an.').bail().isLength({ min: 32, max: 32 }).withMessage('Die Session-ID ist ungültig.').matches(/^[a-zA-Z0-9_-]*$/).withMessage('Die Session-ID ist ungültig.')
    ];

    /* Run all checks */
    await Validator.runAllChecks(401, checks, request, response, next);
  }

  public async validateBookScooter(request: Request, response: Response, next: NextFunction): Promise<void> {
    /* Check if all fields correspond to the expected request body */
    const checks = [
      check('scooterId').trim().escape().notEmpty().withMessage('Keine Scooter ID.').bail().isNumeric().withMessage('Ungültige Scooter ID.')
    ];

    /* Run all checks */
    await Validator.runAllChecks(400, checks, request, response, next);
  }
  
}
