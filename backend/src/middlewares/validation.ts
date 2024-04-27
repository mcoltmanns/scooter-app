import { Request, Response, NextFunction } from 'express';
import { check, FieldValidationError, validationResult } from 'express-validator';
import { UsersAuth } from '../models/user';

interface ErrorsObject {
  [key: string]: string;
}

export class Validator {
  public async validateRegister(request: Request, response: Response, next: NextFunction): Promise<void> {   
    /* Check if all fields correspond to the expected request body */
    const checks = [
      check('name').trim().escape().notEmpty().withMessage('Please provide a name'),
      check('street').trim().escape().notEmpty().withMessage('Please provide a street'),
      check('houseNumber').trim().escape().notEmpty().withMessage('Please provide a house number').bail().isNumeric().withMessage('Please provide a valid numeric house number'),
      check('zipCode').trim().escape().notEmpty().withMessage('Please provide a zip code').bail().isNumeric().withMessage('Please provide a valid numeric zip code'),
      check('city').trim().escape().notEmpty().withMessage('Please provide a city'),
      check('email').trim().escape().notEmpty().withMessage('Please provide an email').bail().isEmail().withMessage('Please provide a valid email').bail().normalizeEmail().custom(async (email) => {
        const user = await UsersAuth.findOne({ where: { email: email } });
        if (user) {
          throw new Error('Email already in use');
        }
      }),
      check('password').trim().escape().notEmpty().withMessage('Please provide a password').bail().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ];

    /* Run all checks */
    try {
      await Promise.all(checks.map(check => check.run(request)));
    } catch (error) {
      response.status(500).json({ code: 500, message: 'Something went wrong' }); // 500: Internal Server Error
      return;
    }

    /* Catch the validation errors */
    const validationErrors = validationResult(request);

    /* Handle the validation errors if they occurred */
    if (!validationErrors.isEmpty()) {
      const errors: ErrorsObject = {};

      validationErrors.array().forEach(
        (valErr: FieldValidationError) => (errors[valErr.path] = valErr.msg)
      );

      response.status(400).json({ code: 400, validationErrors: errors });
      return;
    }
    
    /* Continue with the next middleware if no validation errors occurred */
    return next();
  }
}