# Nest Practice

> create nest server

## Script Description

1. npm run seed:run

- DB의 sample Data를 넣어주는 script
- [typeorm-seeding](https://github.com/w3tecch/typeorm-seeding) 모듈을 사용한다.

2. npm run schema:drop

- DB의 Schema를 날려버린다.

3. npm run schema:sync

- DB의 Schema를 생성 및 동기화

4. npm run db:create-migration [파일이름]

- `migration`을 위한 코드를 생성함
- migration: 테이블과 엔티티를 수정할 때 사용

5. npm run db:generate-migration [파일이름]

- query를 자동으로 작성해줌. (`Drop`이 있을 경우 위험)

6. npm run db:migrate

- migrate를 실행하는 스크립트

7. npm run db:migrate:revert

- rollback 스크립트

**참고**
TypeORM은 ts 파일을 인식할 수 없기 때문에 `npm run typeorm` 스크립트를 활용하였다.

## References

- [Hot Reload](https://docs.nestjs.com/recipes/hot-reload#hot-reload)
- [Configuration](https://docs.nestjs.com/techniques/configuration#getting-started)
- [OpenAPI(Swagger)](https://docs.nestjs.com/openapi/introduction)
