import { Request, Response, NextFunction } from 'express';
import { check, FieldValidationError, validationResult, ValidationChain } from 'express-validator';
import { UsersAuth } from '../models/user';

interface ErrorsObject {
  [key: string]: string;
}

export class Validator {
  private static checkHouseNumber(houseNumber: string): boolean {
    const re = /^[0-9]+(([A-Za-z])|([-/.]([0-9]|[A-Za-z])))?$/; // start of line followed by at least one digit followed by ((any upper or lower case) or (a separator followed by (a digit or an upper case or lower case letter))) 0 or 1 times followed by end of line

    if (!re.test(houseNumber)) {
      throw new Error('Bitte geben Sie eine gültige Hausnummer ein.'); // throw if not a house number
    }
    else return true;
  }

  private static checkZipCode(zipCode: string): boolean {
    const re = /^[0-9][0-9][0-9][0-9][0-9]$/; // match 5 digits

    if(!re.test(zipCode)) {
      throw new Error('Bitte geben Sie eine 5-stellige PLZ ein.'); // throw if the input is not a zip code
    }
    else return true;
  }

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

      // validationErrors.array().forEach(
      //   (valErr: FieldValidationError) => (errors[valErr.path] = `${valErr.msg}: ${valErr.value} at ${valErr.location}`)
      // );
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
      check('houseNumber').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Hausnummer ein.').bail().custom(code => Validator.checkHouseNumber(code)),
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
      check('houseNumber').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Hausnummer ein.').bail().custom(code => Validator.checkHouseNumber(code)),
      check('zipCode').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Postleitzahl ein.').bail().custom(check => Validator.checkZipCode(check)),
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

  public async validateBachelorcard(request: Request, response: Response, next: NextFunction): Promise<void> {
    const checks = [
      check('name').trim().escape().notEmpty().withMessage('Bitte geben Sie einen Namen ein.'),
      check('cardNumber').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Kartennummer ein.').bail().matches(/^\d{4}-\d{4}-\d{4}-\d{4}$/).withMessage('Bitte geben Sie eine gültige Kartennummer ein.'),
      check('securityCode').trim().escape().notEmpty().withMessage('Bitte geben Sie eine Prüfziffer ein.').bail().matches(/^\d{3}$/).withMessage('Bitte geben Sie eine gültige Prüfziffer ein.'),
      check('expirationDate').trim().notEmpty().withMessage('Bitte geben Sie ein Ablaufdatum ein.').bail().matches(/^(1[0-2]|[1-9])\/\d{2}$/).withMessage('Bitte geben Sie ein gültiges Ablaufdatum (MM/YY) ein.')
    ];

    await Validator.runAllChecks(400, checks, request, response, next);
  }

  public async validateHcipal(request: Request, response: Response, next: NextFunction): Promise<void> {
    const checks = [
      check('accountName').trim().escape().notEmpty().withMessage('Bitte geben Sie einen Kontonamen ein.').bail().isEmail().withMessage('Ungültige E-Mail-Adresse.').bail().normalizeEmail(),
      check('accountPassword').trim().escape().notEmpty().withMessage('Bitte geben Sie ein Kontopasswort ein.')
    ];

    await Validator.runAllChecks(400, checks, request, response, next);
  }

  public async validateSwpsafe(request: Request, response: Response, next: NextFunction): Promise<void> {
    const checks = [
      check('swpCode').trim().notEmpty().withMessage('Bitte geben Sie einen SWP-Code ein.').bail().isLength({ min: 12, max: 12 }).withMessage('Der SWP-Code muss aus 12 Stellen bestehen.')
    ];

    await Validator.runAllChecks(400, checks, request, response, next);
  }

  public async validatePaymentId(request: Request, response: Response, next: NextFunction): Promise<void> {
    const checks = [
      check('paymentId').trim().escape().notEmpty().withMessage('Bitte geben Sie die ID für eine Zahlungsmethode an.').bail().isNumeric().withMessage('Ungültige Zahlungsmethoden-ID.')
    ];

    await Validator.runAllChecks(400, checks, request, response, next);
  }

  public async validateBookScooter(request: Request, response: Response, next: NextFunction): Promise<void> {
    /* Check if all fields correspond to the expected request body */
    const checks = [
      check('scooterId').trim().escape().notEmpty().withMessage('Keine Scooter ID.').bail().isNumeric().withMessage('Ungültige Scooter ID.')
    ];

    /* Run all checks */
    await Validator.runAllChecks(400, checks, request, response, next);
  }
  
  public async validateCheckout(request: Request, response: Response, next: NextFunction): Promise<void> {
    /* Check if all fields correspond to the expected request body */
    const checks = [
      check('scooterId').trim().escape().notEmpty().withMessage('Bitte eine Scooter-ID angeben.').bail().isInt({min: 0}).withMessage('Ungültige Scooter ID.'),
      check('paymentMethodId').trim().escape().notEmpty().withMessage('Bitte eine Zahlungsmethode angeben.').bail().isInt({min: 0}).withMessage('Die ID der Zahlungsmethode ist ungültig.'),
      check('duration').optional().trim().escape().notEmpty().withMessage('Bitte eine Buchungsdauer angeben (in Stunden).').bail().isNumeric().withMessage('Bitte die Buchungsdauer als Zahl angeben.').bail().isInt({ min: 1, max: 48 }).withMessage('Die Buchungsdauer muss zwischen 1 und 48 Stunden liegen.'),
    ];

    /* Run all checks */
    await Validator.runAllChecks(400, checks, request, response, next);
  }

  public async validateReservation(request: Request, response: Response, next: NextFunction): Promise<void> {
    const checks = [
      check('scooterId').trim().escape().notEmpty().withMessage('Bitte eine Scooter-ID angeben.').bail().isInt({min: 0}).withMessage('Ungültige Scooter ID.'),
    ];

    await Validator.runAllChecks(400, checks, request, response, next);
  }

  /* Validates the rental id from the frontend request */
  public async validateInvoice(request: Request, response: Response, next: NextFunction): Promise<void> {
    const checks = [
      check('rentalId').trim().escape().notEmpty().withMessage('Bitte eine Rental-ID angeben.').bail().isInt({min: 0}).withMessage('Ungültige Rental-ID.'),
      check('selectedCurrency').optional().trim().escape().notEmpty().withMessage('Bitte eine Währung angeben.').bail().isIn(['€', '$']).withMessage('Ungültige Währung.')
    ];

    await Validator.runAllChecks(400, checks, request, response, next);
  }

  public async validateEndRental(request: Request, response: Response, next: NextFunction): Promise<void> {
    const checks = [
      check('rentalId').trim().escape().notEmpty().withMessage('Bitte eine Rental-ID angeben.').bail().isInt({min: 0}).withMessage('Ungültige Rental-ID.')
    ];

    await Validator.runAllChecks(400, checks, request, response, next);
  }
}
