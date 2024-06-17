/**
 *  In dieser Datei schreiben wir einen Controller, der Webrequests von
 *  dem in "app.ts" definierten Webserver beantwortet. Die Methoden werden
 *  in "app.ts" mit einer entsprechenden Webroute verknüpft.
 *  Jede Methode, die mit einer Webroute verknüpft wird, muss einen
 *  "Request" (was angefragt wird) und eine "response" (was unser Server antwortet)
 *  entgegennehmen.
 *  *Wichtig ist, dass jede Response zeitgemäß abgeschlossen wird*, z.B. via
 *  response.send(...data...)
 *  oder response.end()
 */
import { Request, Response } from 'express';
import { ALL_EMPLOYEES } from '../static-data/employees';
import jobManager from '../services/job-manager';

export class ApiController {

  public getInfo(request: Request, response: Response): void {
    console.log(jobManager.toString());
    response.status(200);
    response.send('ok');
  }

  // want all the information about all the employees
  public getEmployeeInfo(req: Request, resp: Response): void {
    resp.status(200);
    resp.send(ALL_EMPLOYEES);
  }
}
