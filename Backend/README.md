# Nest Server

> create nest server

## Install

- npm i
- npm run schema:sync
- npm run seed:run
- npm run start:dev

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

--

## Nest Coding

- Entity를 DB에 저장하는 방식

```ts
// 1. repository의 save method에 Entity 객체를 직접 넣어 주기
const returned = await this.userRepository.save({
  email,
  nickname,
  password: hashedPassword,
});

// 2. Entity 객체를 직접 생성해서 저장하기
const workspaceMembers = new WorkspaceMembers();
workspaceMembers.UserId = returned.id;
workspaceMembers.WorkspaceId = 1;

// 3.repositorydml create()를 사용하여 Entity 생성 후 저장하기
const channelMembers = this.channelMembersRepository.create();
channelMembers.UserId = returned.id;
channelMembers.ChannelId = 1;
```

---

## Error Solution

### `class-valitator` 사용 시 데코레이터의 대소문자 주의

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

### Cannot add or update a child row: a foreign key constraint fails

- 부모키에 있는 값만 참조할 수 있으니 부모 테이블의 값을 확인해보자

### JEST 관련 에러

- 절대 경로를 사용할 때 모듈 에러가 나는 경우

```json
"jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    /**
    * 아래 코드를 추가해준다.
    * <rootDir>은 src 디렉토리를 가리킨다.
    */
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/$1"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }

```

## References

- [Hot Reload](https://docs.nestjs.com/recipes/hot-reload#hot-reload)
- [Configuration](https://docs.nestjs.com/techniques/configuration#getting-started)
- [OpenAPI(Swagger)](https://docs.nestjs.com/openapi/introduction)
- [validation](https://docs.nestjs.com/techniques/validation#transform-payload-objects)
