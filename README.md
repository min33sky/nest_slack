# Nest Practice

> create nest server

## Typeorm 관련 참고

1. 기존 DB가 없을 때는 Schema를 직접 생성한 후 `npm run schema:sync` 실행
2. 기존 DB가 존재할 땐 `npx typeorm-model-generator -h localhost -d 스키마이름 -u DB유저이름 -x 비밀번호 -e 데이터베이스종류(mysql)` 실행

**참고**

- [typeorm-model-generator](https://www.npmjs.com/package/typeorm-model-generator)

## Script Description

- npm run seed:run

  - DB의 sample Data를 넣어주는 script

  - [typeorm-seeding](https://github.com/w3tecch/typeorm-seeding) 모듈을 사용한다.

- npm run schema:drop

  - DB의 Schema를 날려버린다.

- npm run schema:sync

  - DB의 Schema를 생성 및 동기화

- npm run db:create-migration [파일이름]

  - `migration`을 위한 코드를 생성함
  - migration: 테이블과 엔티티를 수정할 때 사용

- npm run db:generate-migration [파일이름]

  - query를 자동으로 작성해줌. (`Drop`이 있을 경우 위험)

- npm run db:migrate

  - migrate를 실행하는 스크립트

- npm run db:migrate:revert

  - rollback 스크립트

**참고**

- TypeORM은 ts 파일을 인식할 수 없기 때문에 `npm run typeorm` 스크립트를 활용하였다.

## Error Solution

- `class-valitator` 사용 시 데코레이터의 대소문자 주의

```js
// Error
@isEmail()
email?: string;
// Success
@IsEmail()
email?: string;
```

**[참고 링크](https://stackoverflow.com/questions/67045344/unable-to-resolve-signature-of-property-decorator-when-called-as-an-expression)**

- Error: Authentication strategies must have a name
  - passport-local 대신 passport를 import 했는지 체크

## References

- [Hot Reload](https://docs.nestjs.com/recipes/hot-reload#hot-reload)
- [Configuration](https://docs.nestjs.com/techniques/configuration#getting-started)
- [OpenAPI(Swagger)](https://docs.nestjs.com/openapi/introduction)
- [validation](https://docs.nestjs.com/techniques/validation#transform-payload-objects)
