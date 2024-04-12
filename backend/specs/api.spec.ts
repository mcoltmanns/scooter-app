/**
 *  Hier definieren wir verschiedene Unittests.
 *  Jeder Unittest muss in dem "specs" Ordner liegen und mit ".spec.ts" enden.
 *  Weitere Information im "Unit Testing" Video in Sprint 4 und der Softwar Engineering Vorlesung.
 */

import request from 'supertest';
import app from '../src/app';

describe('GET /api', () => {
  it('should return 200 OK', () => {
    return request(app).get('/api').expect(200);
  });
});
