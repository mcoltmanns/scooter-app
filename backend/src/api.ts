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

export class ApiController {
  public getInfo(request: Request, response: Response): void {
    response.status(200);
    response.send('ok');
  }

  public getNameInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Max',
      lastName: 'Mustermann',
    });
  }

  public postNameInfo(request: Request, response: Response): void {
    console.log(request.params.id);
    console.log(request.body.requestedName);
    response.status(200);
    response.send('ok');
  }

  public getMaximilianJaegerInfo(request: Request, response: Response): void{
    response.status(200);
    response.send({
      firstName: 'Maximilian',
      lastName: 'Jaeger',
      optionalAttribut: 'I study Informatics and i love skiing in my spare time.',
    });
  }

}
