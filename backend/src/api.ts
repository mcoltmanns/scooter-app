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

  // want all the information about all the employees
  public getEmployeeInfo(req: Request, resp: Response): void {
    resp.status(200);
    resp.send([
        { name: 'Igor Ziesmann', info: 'Ich studiere Informatik mit dem Schwerpunkt Data Science an der Uni Konstanz.', imgUrl: '/assets/about-us/igorz.jpg' },
        { name: 'Jonas Dickhoefer', info: 'I study Informatics in the 4th semester, focusing on machine learning. In my free time, I like to do Karate.', imgUrl: '/assets/about-us/jonasd.png' },
        { name: 'Max Oltmanns', info: 'I\'m studying computer science at the University of Konstanz, and I like to spend my free time in the mountains.', imgUrl: '/assets/about-us/maxo.png' },
        { name: 'Maximilian Jaeger', info: 'I study Informatics and i love skiing in my spare time.', imgUrl: '/assets/about-us/maximilianj.png' },
        { name: 'Silvan Ronge', info: 'Still believes that computer science is a creative art form.', imgUrl: '/assets/about-us/silvanr.png' }
    ]);
}
}
