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
  /**
   * Methoden für das Individualprojekt
   */
  public getJonasInfo(request: Request, response: Response): void{
    response.status(200);
    response.send({
      firstName: 'Jonas',
      lastName: 'Dickhöfer',
      optionalAttribut: 'I study Informatics in the 4th semester, focusing on machine learning. In my free time, I like to do Karate.',
    });
  }

  public getMaximilianJaegerInfo(request: Request, response: Response): void{
    response.status(200);
    response.send({
      firstName: 'Maximilian',
      lastName: 'Jaeger',
      optionalAttribut: 'I study Informatics and i love skiing in my spare time.',
    });
  }

  public getNameInfoOltmanns(request: Request, response: Response): void {
    response.status(200);
    response.send({firstName: 'Max', lastName: 'Oltmanns'});
  }

  public postNameInfoOltmanns(request: Request, response: Response): void {
    console.log(request.params.id);
    console.log(request.body.requestedName);
    response.status(200);
    response.send('ok');
  }

  public getSilvanRongeInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Silvan',
      lastName: 'Ronge',
      optionalAttribut: 'Still believes that computer science is a creative art form.',
    });
  }

  public getIgorZiesmannInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Igor',
      lastName: 'Ziesmann',
      optionalAttribut: 'Ich studiere Informatik mit dem Schwerpunkt Data Science an der Uni Konstanz.'
    });
  }
}
