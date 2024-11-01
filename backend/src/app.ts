/**
 *  In dieser Datei konfigurieren wir einen Express Webserver, der es uns ermöglicht,
 *  verschiedene Routen anzugeben und zu programmieren.
 *  Hier verzichten wir auf die Klassendefinition, da diese nicht nötig ist.
 *
 *  Weiterführende Links:
 *  https://expressjs.com/en/starter/basic-routing.html
 */

import errorHandler from 'errorhandler';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { ApiController } from './controllers/api';
import { AuthController } from './controllers/auth';
import { Validator } from './middlewares/validation';
import { ScooterController } from './controllers/scooter';
import { PaymentController } from './controllers/payment';
import { OptionController } from './controllers/option';
import { BookingsController } from './controllers/bookings';
import { CheckoutController } from './controllers/checkout';

// Express server instanziieren
const app = express();

/**
 *  Express Konfiguration.
 *  Normalerweise benutzt man Port 80 für HTTP (d.h. der Server wäre unter http://localhost erreichbar),
 *  aber da Ports unter 1024 nur von Administratoren geöffnet werden können, benutzen wir hier Port 8000.
 *  D.h. der Server ist unter http://localhost:8000 erreichbar. Für das Frontend werden alle Anfragen an
 *  '/api/' automatisch an diesen Server weitergeleitet (siehe "proxy.conf.json" im Frontend Projekt).
 */
app.set('port', 8000);

// "JSON" Daten verarbeiten falls der Request zusätzliche Daten im Request hat
app.use(express.json());
// "UrlEncoded" Daten verarbeiten falls in der Request URL zusätzliche Daten stehen (normalerweise nicht nötig für Angular)
app.use(express.urlencoded({ extended: true }));
// Wir erlauben alle "Cross-Origin Requests". Normalerweise ist man hier etwas strikter, aber für den Softwareprojekt Kurs
// erlauben wir alles um eventuelle Fehler zu vermeiden.
app.use(cors({ origin: '*' }));

// Parse Cookies in the request headers and make them available in the request object
app.use(cookieParser());


/**
 *  API Routen festlegen
 *  Hier legen wir in dem "Express" Server neue Routen fest. Wir übergeben die Methoden
 *  unseres "ApiControllers", die dann aufgerufen werden sobald jemand die URL aufruft.
 *  Beispiel
 *  app.get('/api', api.getInfo);
 *       ↑     ↑          ↑
 *       |     |     Diese Methode wird aufgerufen, sobald ein Nutzer die angebene
 *       |     |     URL über einen HTTP GET Request aufruft.
 *       |     |
 *       |   Hier definieren sie die "Route", d.h. diese Route
 *       |   ist unter "http://localhost/api" verfügbar
 *       |
 *   Für diese Route erwarten wir einen GET Request.
 *   Auf derselben Route können wir auch einen POST
 *   Request angeben, für den dann eine andere Methode
 *   aufgerufen wird.
 *
 *  Weiterführende Links:
 *  - Übersicht über verschiedene HTTP Request methoden (GET / POST / PUT / DELETE) https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
 *  - REST Architektur: https://de.wikipedia.org/wiki/Representational_State_Transfer
 *
 *  Bitte schaut euch das Tutorial zur Backend-Entwicklung an für mehr Infos bzgl. REST
 */

const validator = new Validator();
const auth = new AuthController();
const api = new ApiController();
const scooter = new ScooterController();
const payment = new PaymentController();
const option = new OptionController();
const bookings = new BookingsController();
const checkout = new CheckoutController();

app.get('/api', api.getInfo); // DEBUG testing route

/* ROUTES WITHOUT AUTHENTICATION */
app.post('/api/register', validator.validateRegister, auth.register.bind(auth));
app.post('/api/login', validator.validateLogin, auth.login.bind(auth));
app.get('/api/employees', api.getEmployeeInfo); // map about/employees to the function for getting employee info

/* Run authentication middleware for all api routes below */
app.all('/api/*', validator.validateSessionCookie, auth.authorize.bind(auth));

/* ROUTES WITH AUTHENTICATION */
/* Routes to manage user information */
app.delete('/api/logout', auth.logout.bind(auth)); // log the user out
app.get('/api/authenticate', auth.getAuth.bind(auth)); // get the user's authentification status TODO: seems redundant? No.
app.get('/api/user', auth.getUser.bind(auth)); // get a user's information
app.put('/api/user', validator.validateUpdateUser, auth.updateUser.bind(auth)); // set a user's information

/* Routes to manage scooter information */
app.get('/api/map', scooter.getAvailableScooters.bind(auth));
app.get('/api/singleScooter/:scooterId', scooter.getScooterById); // get scooter information by scooterId
app.get('/api/product', scooter.getAllProducts.bind(auth)); // get all product information
app.get('/api/productInfo/:scooterId', scooter.getProductByScooterId); //get for a specific scooter the products info
app.get('/api/bookScooterHistory', bookings.getUserRentals); // get all the rentals for a specific user
app.get('/api/bookScooterProducts', bookings.getProductsByRentals); // get all products + scooterId for all bookings
app.post('/api/bookings/generateInvoice', validator.validateInvoice, bookings.generateInvoice); // geneartes the invoice pdf in the backend

/* Routes to manage payment methods */
app.get('/api/payment', payment.getAllPaymentMethods);
app.post('/api/payment/bachelorcard', validator.validateBachelorcard, payment.addBachelorcard);
app.post('/api/payment/hcipal', validator.validateHcipal, payment.addHcipal);
app.post('/api/payment/swpsafe', validator.validateSwpsafe, payment.addSwpsafe);
app.delete('/api/payment/:paymentId', validator.validatePaymentId, payment.deletePayment);

/* Routes to manage user preferences */
app.get('/api/preferencesForUser', option.getUserPreferenceByUserId); // get the preferences for a user
app.post('/api/updateUserPreferences', option.updateUserPreferences); // update the preferences for a user

/* Route to process reservations/checkout (book a scooter) */
app.post('/api/reserve', validator.validateReservation, bookings.reserveScooter); // start a reservation
app.get('/api/reserve', bookings.getUserReservation); // get a user's active reservation
app.delete('/api/reserve', bookings.endUserReservation); // end a user's active reservation
app.post('/api/checkout', validator.validateCheckout, checkout.processCheckout);
app.post('/api/rental/end', validator.validateEndRental, checkout.endDynamicRental);


// Falls ein Fehler auftritt, gib den Stack trace aus
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

/**
 *  Dateien aus dem "public" und "img" Ordner werden direkt herausgegeben.
 *  D.h. falls eine Datei "myFile.txt" in dem "public" Ordner liegt, schickt der Server
 *  diese Datei wenn die "http://localhost/myFile.txt" URL aufgerufen wird.
 *  Dateien, die im 'img' Ordner liegen, können über den Pfad 'http://localhost/img/'
 *  abgerufen werden.
 *
 *  Das 'frontend/' Projekt wurde so konfiguriert, dass der 'build' Befehl (bzw. 'npm run build')
 *  im Frontend Projekt die 'transpilierten' Dateien in den 'public' Ordner des backend Projekt legen.
 *  Das kann nützlich sein, falls das ganze Projekt via Docker laufbar sein soll
 *  (erst nach Aushandeln für Bonuspunkte via User Story!)
 */
app.use('/', express.static('public'));
app.use('/img', express.static('img'));

/**
 *  Hier wird die "default Route" angegeben, d.h. falls der Server nicht weiß wie er auf "/random-request" antworten soll
 *  wird diese Methode aufgerufen. Das Frontend Angular hat selbst ein eigenes Routing, weswegen wir immer die "index" Seite
 *  von Angular schicken müssen. Falls eine der zuvor angegebenen Routen passt, wird diese Methode nicht aufgerufen.
 *  Diese Route funktioniert erst, sobald der 'build' Schritt im Frontend ausgeführt wurde und ist nur von Relevanz, falls
 *  das Projekt via Docker laufbar sein soll (siehe oben).
 */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Wir machen den konfigurierten Express Server für andere Dateien verfügbar, die diese z.B. Testen oder Starten können.
export default app;
