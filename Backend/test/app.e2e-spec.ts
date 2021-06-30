import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import passport from 'passport';
import session from 'express-session';
import { AppModule } from './../src/app.module';

/**
 * 실제 DB보단 테스트 DB를 만들어 테스트하는 것이 정석
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(
      session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
          httpOnly: true,
        },
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    await app.init();
  });

  it('/users/login (POST)', (done) => {
    return request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        email: 'messi@naver.com',
        password: 'qwe123',
      })
      .expect(201, done);
  });
});
