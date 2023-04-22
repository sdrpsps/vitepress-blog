---
title: Nest.JS 博客后端学习记录
date: 2022-10-12 17:43:03
---

# Nest.JS 博客后端学习记录

::: info
身为一名前端，除了要本职工作外，还要懂得后端知识。不然在国内如此卷的环境中，迟早被后浪拍死在沙滩上。

本篇文章尝试记录我自己构建基于 Nest.JS 博客后端的过程，也是学习的过程，希望能够坚持下去～
:::
>

<!-- more -->

## 〇、[项目代码同步更新仓库](https://github.com/sdrpsps/nest-blog)

## 一、准备工作

1. ### 安装官方脚手架

   ```shell
   pnpm add -g @nestjs/cli
   ```

   

2. ### 项目依赖

   ```shell
   pnpm add prisma-binding @prisma/client mockjs @nestjs/config class-validator class-transformer argon2 @nestjs/passport passport passport-local @nestjs/jwt passport-jwt lodash multer dayjs express redis @nestjs/throttler
   
   pnpm add -D prisma typescript @types/node @types/mockjs @nestjs/mapped-types @types/passport-local @types/passport-jwt @types/express @types/lodash @types/multer @types/node
   ```

   

3. ### 安装 VSCode 插件

   - [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)

   - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

4. ### 代码格式化配置 ( ``.prettierrc`` 文件 )

   ```json
   {
     "arrowParens": "always",
     "bracketSameLine": true,
     "bracketSpacing": true,
     "embeddedLanguageFormatting": "auto",
     "htmlWhitespaceSensitivity": "css",
     "insertPragma": false,
     "jsxSingleQuote": false,
     "printWidth": 120,
     "proseWrap": "never",
     "quoteProps": "as-needed",
     "requirePragma": false,
     "semi": false,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "all",
     "useTabs": false,
     "vueIndentScriptAndStyle": false,
     "singleAttributePerLine": false
   }
   ```

## 二、项目初始化

1. ### 使用脚手架 new 一个新项目

      ```shell
      nest new nest-blog
      ```

2. ### 安装依赖包

3. ### 初始化 [Prisma](https://www.prisma.io/docs/concepts/overview/what-is-prisma)

      1. 初始化

         ```shell
         npx prisma init
         ```

      2. 在 `.env` 文件中定义数据库账号密码和地址

      3. 如果是本地开发数据库，只需填写 `DATABASE_URL` 即可

         ```json
         DATABASE_URL="mysql://账号:密码@服务器:端口/表名"
         ```

      4. 如果是云端服务器数据库，需要填写 `SHADOWS_DATABASE_URL`

         ```json
         DATABASE_URL=mysql://账号:密码@服务器:端口/表名"
         SHADOW_DATABASE_URL="mysql://账号:密码@服务器:端口/表名"
         ```

      5. 在 `package.json` 文件中定义数据自动填充 (scripts 上面 )

         ```json
         "prisma":{
             "seed": "ts-node prisma/seed.ts"
           }
         ```

      

4. ### 创建数据库模型 `prisma/schema.prisma` 文件

      1. 修改 Prisma 默认数据库类型

            ```txt
            datasource db {
              provider = "mysql"
              url      = env("DATABASE_URL")
            	// 如果是云端服务器数据库，需要加上shadowDatabaseUrl
              shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
            }
            ```

      2. 创建用户表和文章模型(表)

            ```txt
            model user {
              id       Int    @id @default(autoincrement()) @db.UnsignedInt
              name     String @unique
              password String
            }
            
            model article {
              id      Int    @id @default(autoincrement()) @db.UnsignedInt
              title   String
              content String @db.Text
            }
            ```


5. ### 生成 Prisma [迁移文件](https://www.prisma.io/docs/concepts/components/prisma-migrate/migration-histories)

   ```shell
   npx prisma migrate dev
   ```
6. ### 输入迁移文件名称

   ```shell
   Environment variables loaded from .env
   Prisma schema loaded from prisma/schema.prisma
   Datasource "db": MySQL database "blog" at "x.x.x.x:3306"
   
   ✔ Enter a name for the new migration: … init
   Applying migration `20221013023738_init`
   
   The following migration(s) have been created and applied from new schema changes:
   
   migrations/
     └─ 20221013023738_init/
      └─ migration.sql
      
   Your database is now in sync with your schema.
   ```

7. ### 生成成功后，数据库上就会自动生成对应的表和字段

   - 数据表

     ![](https://i.imgur.com/lKzUclt.png)

   - 字段

     ![image-20221013104628314](https://i.imgur.com/sb5I6nZ.png)



8. ### 写入自动填充数据，在 `prsima/seed.ts` 

   ```typescript
   import { PrismaClient } from '@prisma/client'
   import { hash } from 'argon2'
   import { Random } from 'mockjs'
   
   const prisma = new PrismaClient()
   async function run() {
       await prisma.user.create({
           data: {
               name: 'admin',
               password: await hash('123456')
           }
       })
   
       for (let i = 0; i < 50; i++) {
           await prisma.article.create({
               data: {
                   title: Random.ctitle(10, 30),
                   content: Random.cparagraph(30, 40)
               }
           })
       }
   }
   
   run()
   ```

   

9. ### 重新运行迁移文件，该操作会清除原始数据

   ```shell
   npx prisma migrate reset
   ```
   
10. ### 确认操作

    ```shell
    Environment variables loaded from .env
    Prisma schema loaded from prisma/schema.prisma
    Datasource "db": MySQL database "blog" at "x.x.x.x:3306"
    
    ✔ Are you sure you want to reset your database? All data will be lost. … yes
    
    Applying migration `20221013023738_init`
    
    Database reset successful
    
    The following migration(s) have been applied:
    
    migrations/
      └─ 20221013023738_init/
        └─ migration.sql
    
    ✔ Generated Prisma Client (4.4.0 | library) to ./node_modules/.pnpm/@prisma+client@4.4.0_prisma@4.4.0/node_modules/@prisma/client in 595ms
    
    Running seed command `ts-node prisma/seed.ts` ...
    
    🌱  The seed command has been executed.
    ```

11. ### 生成后的数据![image-20221013111542159](https://i.imgur.com/6isSQhV.png)

12. ### 删除自动生成的 `app.controller.ts` 、 `app.services.ts` 和 `app.controller.spec`

13. ### `app.modules.ts` 删除对应的引入



## 三、登录注册接口

1. ### auth 模块

   1. 创建[模块](https://docs.nestjs.com/modules)

      ```shell
      nest g mo auth --no-spec
      ```

   2. 创建[控制器](https://docs.nestjs.com/controllers)

      ```shell
   nest g co auth --no-spec
      ```
   
   3. 创建[服务](https://docs.nestjs.com/providers#services)

      ```shell
      nest g s auth --no-spec
      ```

2. ### 创建[路由](https://docs.nestjs.com/controllers#routing)

   `auth.controller.ts`

   ```typescript
   import { Controller, Post } from '@nestjs/common';
   import { AuthService } from './auth.service';
   
   @Controller('auth')
   export class AuthController {
       constructor(private auth: AuthService) {
   
       }
   
       @Post('register')
       register() {
   
       }
   
       @Post('login')
       login() {
   
       }
   }
   ```

3. ### 创建 [DTO](https://docs.nestjs.com/controllers#request-payloads)

   1. 在 auth 文件夹下创建 dto 文件夹

   2. 新建 `register.dto.ts` 和 `login.dto.ts` 文件

   3. `register.dto.ts`

      ```typescript
      import { IsNotEmpty } from "class-validator";
      
      export default class RegisterDto {
          @IsNotEmpty({ message: "用户名不能为空" })
          name: string
      
          @IsNotEmpty({ message: "密码不能为空" })
          password: string
      
          @IsNotEmpty({ message: "确认密码不能为空" })
          password_confirm: string
      }
      ```
   4. `login.dto.ts`
      
      ```typescript
      import { IsNotEmpty } from "class-validator"
      
      export default class LoginDto {
          @IsNotEmpty({ message: "用户名不能为空" })
          name: string
      
          @IsNotEmpty({ message: "密码不能为空" })
          password: string
      }
      ```

4. ### 配置 DTO

   `auth.controller.ts`

   ```typescript
   import { Body, Controller, Post } from '@nestjs/common';
   import { AuthService } from './auth.service';
   import LoginDto from './dto/login.dto';
   import RegisterDto from './dto/register.dto';
   
   @Controller('auth')
   export class AuthController {
       constructor(private auth: AuthService) {
   
       }
   
       @Post('register')
       register(@Body() dto: RegisterDto) {
           return dto
       }
   
       @Post('login')
       login(@Body() dto: LoginDto) {
           return dto
       }
   }
   ```

5. ### 创建自定义验证类

   新建 `common/validate.ts` 文件

   ```typescript
   import { ValidationPipe } from "@nestjs/common";
   
   export default class Validate extends ValidationPipe {}
   ```

6. ### 配置全局管道

   `main.ts`

   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';
   import Validate from './common/validate';
   
   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     // 验证传入的参数是否符合条件
     app.useGlobalPipes(new Validate())
     await app.listen(3000);
   }
   bootstrap();
   ```

7. ### 接口测试

   - 登录接口  `/login`

     - 正确情况![image-20221013135613093](https://i.imgur.com/8N0vQ0U.png)

       

     - 异常情况
     
       ![image-20221013135632909](https://i.imgur.com/CwJT6Wz.png)

   - 注册接口 `/register`
     - 正确情况![image-20221013135402998](https://i.imgur.com/lTRUASB.png)
     
       
     
     - 异常情况![image-20221013135322867](https://i.imgur.com/FpxKVGp.png)
     
       

   - 如果以上跟我显示的一样，恭喜你上线了两个简单的接口了 ( 虽然还没做更多的验证功能 ) 


## 四、[自定义表单验证类](https://github.com/typestack/class-validator#custom-validation-decorators)

1. ### 在 `common` 文件夹下创建 `rules` 文件夹

2. ### 创建 `IsNotExists.ts` 文件实现查找数据库中是否存在用户

   ```typescript
   import { PrismaClient } from '@prisma/client';
   import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
   
   export function IsNotExists(property: string, validationOptions?: ValidationOptions) {
       return function (object: Object, propertyName: string) {
           registerDecorator({
               name: 'IsNotExists',
               target: object.constructor,
               propertyName: propertyName,
               constraints: [property],
               options: validationOptions,
               validator: {
                   async validate(value: any, args: ValidationArguments) {
                       const prisma = new PrismaClient()
                       const res = await prisma.user.findFirst({
                           where: {
                               name: value
                           }
                       })
                       return !Boolean(res);
                   },
               },
           });
       };
   }
   ```

   

3. ### 创建 `IsConfirm.ts` 文件验证确认密码是否一致

   ```typescript
   import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
   
   export function IsConfirm(validationOptions?: ValidationOptions) {
     return function (object: Object, propertyName: string) {
       registerDecorator({
         name: 'IsConfirm',
         target: object.constructor,
         propertyName: propertyName,
         constraints: [],
         options: validationOptions,
         validator: {
           async validate(value: any, args: ValidationArguments) {
             return Boolean(value === args.object[args.property])
           },
         },
       });
     };
   }
   ```

   

4. ### 在注册 DTO 中引用

   `register.dto.ts`

   ```typescript
   import { IsNotEmpty } from "class-validator";
   import { IsNotExists } from "src/common/rules/IsNotExists";
   
   export default class RegisterDto {
       @IsNotEmpty({ message: "用户名不能为空" })
       @IsNotExists('user', { message: '用户已存在' })
       name: string
   
       @IsNotEmpty({ message: "密码不能为空" })
       password: string
   
       @IsNotEmpty({ message: "确认密码不能为空" })
       @IsConfirm({ message: "两次密码不一致" })
       password_confirm: string
   }
   ```

5. ### 自定义管道返回错误信息

   `common/validate.ts`

   ```typescript
   import { HttpException, HttpStatus, ValidationError, ValidationPipe } from "@nestjs/common";
   
   
   export default class Validate extends ValidationPipe {
       protected flattenValidationErrors(validationErrors: ValidationError[]): string[] {
           const message = {}
           validationErrors.forEach((error) => {
               message[error.property] = Object.values(error.constraints)[0]
           })
   
           throw new HttpException({
               success: false,
               code: 422,
               message
           },
               HttpStatus.UNPROCESSABLE_ENTITY)
       }
   }
   ```

6. ### 接口测试

   ![image-20221013160602109](https://i.imgur.com/0IuiTQt.png)

   ![image-20221013160630385](https://i.imgur.com/TP9bTrV.png)

   

## 五、完成注册功能

1. #### 创建 Prisma 模块用于写入数据库
   
   1. 创建模块
   
      ```shell
      nest g mo prisma --no-spec
      ```
      
   2. 创建服务
   
      ```shell
      nest g s prisma --no-spec
      ```
2. #### 注册 Prisma 模块为全局模块

   `prisma.module.ts`

   ```typescript
   import { Global, Module } from '@nestjs/common';
   import { PrismaService } from './prisma.service';
   
   @Global()
   @Module({
     providers: [PrismaService],
     exports: [PrismaService]
   })
   export class PrismaModule {}
   ```

   

3. #### Prisma 服务继承 `PrismaClient`

   `prisma.service.ts`

   ```typescript
   import { Injectable } from '@nestjs/common';
   import { PrismaClient } from '@prisma/client';
   
   @Injectable()
   export class PrismaService extends PrismaClient {
       constructor() {
           // 打印执行 SQL 语句
           super({ log: ['query'] })
       }
   }
   ```


4. #### Auth 服务引入 Prisma 服务并写入注册方法

   `auth.service.ts`

   ```typescript
   import { Injectable } from '@nestjs/common';
   import { hash } from 'argon2';
   import { PrismaService } from 'src/prisma/prisma.service';
   import RegisterDto from './dto/register.dto';
   
   @Injectable()
   export class AuthService {
       constructor(private prisma: PrismaService) {
   
       }
       async register(dto: RegisterDto) {
           const user = await this.prisma.user.create({
               data: {
                   name: dto.name,
                   password: await hash(dto.password)
               }
           })
   
           const res = {
               success: true,
               code: 201,
               message: "注册成功"
           }
   
           return res
       }
   }
   ```

5. #### Auth 控制器中的调用 Auth 服务传递注册 DTO 到注册方法

   `auth.controller.ts`

   ```typescript
   import { Body, Controller, Post } from '@nestjs/common';
   import { AuthService } from './auth.service';
   import LoginDto from './dto/login.dto';
   import RegisterDto from './dto/register.dto';
   
   @Controller()
   export class AuthController {
       constructor(private auth: AuthService) {
   
       }
   
       @Post('register')
       register(@Body() dto: RegisterDto) {
           return this.auth.register(dto)
       }
   
       @Post('login')
       login(@Body() dto: LoginDto) {
           return dto
       }
   }
   ```

6. #### 接口测试

   ![image-20221013171839389](https://i.imgur.com/0b9VXR5.png)

   - 查看数据库，用户已添加

     ![image-20221013171904961](https://i.imgur.com/PQRJxS4.png)

## 六、Jwt 模块

1. ### 引用在 Auth 模块中引入并注册 JwtModule 模块

   `auth.module.ts`

   ```typescript
   import { ConfigModule, ConfigService } from '@nestjs/config';
   import { JwtModule } from '@nestjs/jwt';
   
   @Module({
     imports: [JwtModule.registerAsync({
       imports: [ConfigModule],
       inject: [ConfigService],
       useFactory: (config: ConfigService) => {
         return {
           secret: config.get('TOKEN_SECRET'),
           signOptions: { expiresIn: '1d' }
         }
       }
     })],
     controllers: [AuthController],
     providers: [AuthService]
   })
   ```

2. ### 写入 Token 密钥

   - 因为加密 Token 需要密钥，而密钥通过 ConfigModule 模块来引入

   - 在 `.env` 文件中写入 `TOKEN_SECRET` 字段作为 Token 密钥

     ```json
     TOKEN_SECRET="你的密钥"
     ```

   - 通过 ConfigService 读取 `.env` 文件的 `TOKEN_SECRET` 字段

3. ### 在 `Auth` 服务中引入 `JwtService`

   `auth.service.ts`

   ```typescript
   import { JwtService } from '@nestjs/jwt';
   
   // ...
   constructor(private prisma: PrismaService, private jwt: JwtService) {
   
       }
   // ...
   ```

4. ### 在 `Auth` 服务中写入生成 Token 函数

   `auth.service.ts`

   ```typescript
   // ...
   // 生成 Jwt Token
       async token({ name, id }) {
           return {
               token: await this.jwt.signAsync({
                   name,
                   sub: id
               })
           }
       }
   // ...
   ```

## 七、利用全局拦截器完善接口返回结果

1. ### 在 src 目录下创建 `transform.interceptor.ts` 文件

   ```typescript
   import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
   import { map } from 'rxjs/operators'
   
   @Injectable()
   export class TransformInterceptor implements NestInterceptor {
       intercept(context: ExecutionContext, next: CallHandler) {
           return next.handle().pipe(
               map((data) => {
                   return {
                       data,
                   }
               }),
           )
       }
   }
   ```

2. ### 在 `main.ts` 文件中应用全局拦截器

   ```typescript
   import { TransformInterceptor } from './transform.interceptor';
   
   // ...
   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     // 验证传入的参数是否符合条件
     app.useGlobalPipes(new Validate())
     // 全局拦截器
     app.useGlobalInterceptors(new TransformInterceptor())
     await app.listen(3000);
   }
   // ...
   ```

3. ### 接口测试

   - 返回结果包含在 `data` 对象当中

     ![image-20221014103451676](https://i.imgur.com/jP4lK4H.png)

## 八、完成登录功能

1. ### 在 `common/rules` 文件夹下创建 `IsExists.ts` 文件

2. ### 在 `IsExists.ts` 实现查找数据库中是否存在用户

   ```typescript
   import { PrismaClient } from '@prisma/client';
   import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
   
   export function IsExists(property: string, validationOptions?: ValidationOptions) {
       return function (object: Object, propertyName: string) {
           registerDecorator({
               name: 'IsExists',
               target: object.constructor,
               propertyName: propertyName,
               constraints: [property],
               options: validationOptions,
               validator: {
                   async validate(value: any, args: ValidationArguments) {
                       const prisma = new PrismaClient()
                       const res = await prisma.user.findFirst({
                           where: {
                               name: value
                           }
                       })
                       return Boolean(res);
                   },
               },
           });
       };
   }
   ```

3. ### 在登录 DTO 引用

   `login.dto.ts`

   ```typescript
   import { IsExists } from "src/common/rules/IsExists"
   
   // ...
       @IsNotEmpty({ message: "用户名不能为空" })
       @IsExists('user', { message: "用户不存在" })
       name: string
   // ...
   ```

4. ### 登录成功返回 Token

   1. Auth 模块控制器调用 Auth 模块服务

      `auth.controller.ts`

      ```typescript
      // ...
      // 登录
          @Post('login')
          login(@Body() dto: LoginDto) {
              return this.auth.login(dto)
          }
      // ...
      ```

   2. Auth 模块服务校验密码

      `auth.service.ts`

      ```typescript
      // ...
      // 登录
          async login(dto: LoginDto) {
              const user = await this.prisma.user.findUnique({
                  where: {
                      name: dto.name
                  }
              })
              // 校验密码
              if (!(await verify(user.password, dto.password))) {
                  throw new BadRequestException("密码错误")
              }
              return this.token(user)
          }
      // ...
      ```

5. ### 接口测试

   - 正常情况

     ![image-20221014110032065](https://i.imgur.com/oeHQa49.png)

     

   - 异常情况![image-20221014104700222](https://i.imgur.com/KXmsDOP.png)
   
      ![image-20221014105956215](https://i.imgur.com/f2IzjJz.png)

## 九、一键生成文件模块增删改查接口

假设你通过前面文档的学习，已经了解了模块、控制器、服务等概念知识。如果像前面那样还要一个模块一个服务创建的话有就点麻烦了。

Nest.JS 提供了一键生成增删改查的命令，这里拿生成文章模块来举例。

```shell
nest g res article

? What transport layer do you use? (Use arrow keys)
❯ REST API 
  GraphQL (code first) 
  GraphQL (schema first) 
  Microservice (non-HTTP) 
  WebSockets 

? Would you like to generate CRUD entry points? (Y/n) Y

CREATE src/article/article.controller.spec.ts (586 bytes)
CREATE src/article/article.controller.ts (946 bytes)
CREATE src/article/article.module.ts (261 bytes)
CREATE src/article/article.service.spec.ts (467 bytes)
CREATE src/article/article.service.ts (649 bytes)
CREATE src/article/dto/create-article.dto.ts (33 bytes)
CREATE src/article/dto/update-article.dto.ts (181 bytes)
CREATE src/article/entities/article.entity.ts (24 bytes)
UPDATE src/app.module.ts (334 bytes)
```

![image-20221014142034780](https://i.imgur.com/Mmx2shB.png)

非常方便快捷

## 十、文章列表接口

1. ### Article 服务引入 Prisma 服务和 ConfigModule 服务

   `article.service.ts`

   ```typescript
   import { ConfigService } from '@nestjs/config';
   import { PrismaService } from 'src/prisma/prisma.service';
   
   // ...
     constructor(private prisma: PrismaService, private config: ConfigService) {
   
     }
     // ...
   }
   ```

   

2. ### 查询全部文章

   `article.service.ts`

   ```typescript
   // ...  
   async findAll() {
       const articles = await this.prisma.article.findMany()
       return articles
     }
   // ...
   ```

   ![image-20221014144139744](https://i.imgur.com/2mmUROf.png)

3. ### 在 `app.module.ts` 全局引入 ConfigModule

   ```typescript
   // ...
   import { ConfigModule } from '@nestjs/config';
   
   
   @Module({
     imports: [AuthModule, PrismaModule, ArticleModule, ConfigModule.forRoot({
       isGlobal: true
     })],
     controllers: [],
     providers: [],
   })
   // ...
   ```

4. ### 在 `.env` 文件写入每页文章显示数

   ```txt
   # 每页显示 10 行
   ARTICLE_PAGE_ROW=10
   ```

5. ### 在 `article.service.ts` 引入 `ARTICLE_PAGE_ROW` 字段

   ```typescript
   // ...
   async findAll() {
       const articles = await this.prisma.article.findMany()
       const pageSize = this.config.get('ARTICLE_PAGE_ROW')
       return articles
     }
   // ...
   ```

6. ### 返回结果分页

   ```typescript
   /// ...
   async findAll(page = 1) {
       // 每页总数
       const pageSize = +this.config.get('ARTICLE_PAGE_ROW')
       // 文章列表
       const articles = await this.prisma.article.findMany({
         take: pageSize,
         skip: (page - 1) * pageSize
       })
       // 文章总数
       const total = await this.prisma.article.count()
       return {
         meta: { currPage: page, pageSize, total, totalPage: Math.ceil(total / pageSize) },
         data: articles,
       }
     }
   // ...
   ```

   - 返回了 `ARTICLE_PAGE_ROW` 中定义的 10 行

     ![image-20221014145336954](https://i.imgur.com/S8Xq4ai.png)

7. ### 在 Article 控制器传入 page

8. ### 接口测试

   ![image-20221014155457652](https://i.imgur.com/z0pNYRL.png)

## 十一、文章详情接口

1. ### `article.service.ts`

   ```typescript
     // 文章详情
     async findOne(id: number) {
       const article = await this.prisma.article.findUnique({
         where: { id }
       })
       return article
     }
   ```

2. ### 接口测试![image-20221014160844349](https://i.imgur.com/2g16WdK.png)

## 十二、添加文章接口

1. ### `article.service.ts`

   ```typescript
     // 添加文章
     async create(createArticleDto: CreateArticleDto) {
       const article = await this.prisma.article.create({
         data: createArticleDto
       })
       return article
     }
   ```

2. ### 接口测试![image-20221014162134701](https://i.imgur.com/ra6glKG.png)

## 十三、修改文章接口

1. ### `article.service.ts`

   ```typescript
    // 修改文章
     async update(id: number, updateArticleDto: UpdateArticleDto) {
       const article = await this.prisma.article.update({
         where: { id },
         data: updateArticleDto
       })
       return article
     }
   ```

2. ### 接口测试![image-20221014163244820](https://i.imgur.com/x2nDMXV.png)

## 十四、删除文章接口

1. ### `article.service.ts`

   ```typescript
     // 删除文章
     remove(id: number) {
       const article = this.prisma.article.delete({
         where: { id }
       })
       return 
     }
   ```

2. ### 接口测试![image-20221014162635882](https://i.imgur.com/EdT3Pju.png)

## 十五、设置 API 前缀

因为 Nest.JS 可以使用 Express 底层，如果想前端和后端项目跑在同一个域名，需要设置 API 前缀。

1. ### 在 `main.ts` 定义为 Express 应用

   ```typescript
   import { NestExpressApplication } from '@nestjs/platform-express';
   
   // ...
   const app = await NestFactory.create<NestExpressApplication>(AppModule);
   // ...
   // API 前缀
     app.setGlobalPrefix('api')
   // ...
   ```

2. ### 接口测试

   - 旧 API URL 地址报404![](https://i.imgur.com/jdgNOKB.png)
   
   - 新 API URL 地址正常![image-20221017145640982](https://i.imgur.com/zLh4Mgs.png)

## 十六、添加栏目模型

1. ### `schema.prisma`

   ```txt
   // ...
   model category {
     id       Int       @id @default(autoincrement()) @db.UnsignedInt
     title    String
     articles article[]
   }
   
   model article {
     id         Int      @id @default(autoincrement()) @db.UnsignedInt
     title      String
     content    String   @db.Text
     category   category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
     categoryId Int      @db.UnsignedInt
   }
   // ...
   ```


2. ### 数据填充 `seed.ts`

   ```typescript
       // ...
   for (let i = 1; i <= 5; i++) {
           await prisma.category.create({
               data: {
                   title: Random.ctitle(3, 6),
               }
           })
       }
   
       for (let i = 0; i < 50; i++) {
           await prisma.article.create({
               data: {
                   title: Random.ctitle(10, 30),
                   content: Random.cparagraph(30, 40),
                   categoryId: _.random(1, 5)
               }
           })
       }
       // ...
   ```

3. ### `tsconfig.json` 添加一行，否则 loadsh 会报错

   ```json
   "esModuleInterop": true
   ```

4. ### 更新迁移文件

   ```shell
   npx prisma migrate reset
   ```
   直接运行可能会报错，在 MySQL 命令行中执行

   ```sql
   TRUNCATE article
   ```

   然后重新跑一遍更新迁移文件


5. ### 数据库添加成功

   - `category` 表

     ![image-20221017152013359](https://i.imgur.com/f4nxCh2.png)

   - `article` 表

     ![image-20221017152030853](https://i.imgur.com/UptbGRI.png)

## 十七、栏目增删改查

`category.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {

  }
  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        title: createCategoryDto.title
      }
    })
    return { message: "添加栏目成功" }
  }

  async findAll() {
    const categories = await this.prisma.category.findMany()
    return { data: categories }
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    })
    return { data: category }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.update({
      data: {
        title: updateCategoryDto.title
      },
      where: { id }
    })
    return { message: "修改成功" }
  }

  async remove(id: number) {
    const category = await this.prisma.category.delete({
      where: { id }
    })
    return { message: "删除成功" }
  }
}
```

- 增加栏目

  ![image-20221018174801964](https://i.imgur.com/rv47BAd.png)

- 删除栏目

  ![image-20221018174830043](https://i.imgur.com/ayLllK2.png)

- 修改栏目

  ![image-20221018175147099](https://i.imgur.com/zArESKM.png)

- 获取全部栏目

  ![image-20221018175106004](https://i.imgur.com/vNZYZ0k.png)

- 获取栏目详情

  ![image-20221018175219584](https://i.imgur.com/gNlkpQK.png)

## 十八、Token 身份验证

1. ### Jwt 策略

   1. 在 Auth 模块中添加 `strategy` 文件夹

   2. 写入 `jwt.strategy.ts` 文件

      ```typescript
      import { PrismaService } from '../../prisma/prisma.service';
      import { ConfigService } from '@nestjs/config';
      import { ExtractJwt, Strategy } from 'passport-jwt';
      import { PassportStrategy } from '@nestjs/passport';
      import { Injectable } from '@nestjs/common';
      
      @Injectable()
      export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
          constructor(configService: ConfigService, private prisma: PrismaService) {
              super({
                  //解析用户提交的header中的Bearer Token数据
                  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                  //加密码的 secret
                  secretOrKey: configService.get('TOKEN_SECRET'),
              });
          }
      
          //验证通过后获取用户资料
          async validate({ sub: id }) {
              return this.prisma.user.findUnique({
                  where: { id },
              });
          }
      }
      ```

2. ### Auth 模块添加 Jwt 策略

   `auth.module.ts`

   ```typescript
   // ...
     providers: [AuthService, JwtStrategy]
   // ...
   ```

3. ### 接口添加守卫

   - 以获取全部栏目为例

     ```typescript
     // ...
     import { AuthGuard } from '@nestjs/passport';
     // ...  
       @Get()
       @UseGuards(AuthGuard('jwt'))
       findAll() {
         return this.categoryService.findAll();
       }
     // ...
     ```

     

4. ### 接口测试

   - 返回 401

     ![image-20221024143754795](https://i.imgur.com/rzTjhUz.png)

   

5. ### 聚合装饰器

   - 如果每个需要 Tkoen 验证的接口都要手动写的话就太麻烦了，所以可以弄一个聚合装饰器

     1. Auth 新建 `decorator` 文件夹

     2. 新建 `auth.decorator.ts` 文件

        ```typescript
        import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
        import { AuthGuard } from "@nestjs/passport";
        
        export function Auth() {
            return applyDecorators(UseGuards(AuthGuard('jwt')))
        }
        ```

     3. 在 Auth Controller 引用

        ```typescript
        // ...
        import { Auth } from 'src/auth/decorator/auth.decorator';
        // ...  
        // 文章列表
          @Get()
          // @UseGuards(AuthGuard('jwt'))
          @Auth()
          findAll(@Query('page') page: string) {
            if (!page) page = '1'
            return this.articleService.findAll(+page);
          }
        ```

     4. 接口测试

        ![image-20221027112715168](https://i.imgur.com/KRfxX2m.png)

   - 这样就不用每次都要写一行了

## 十九、角色守卫

1. #### 数据库用户模型添加角色字段

   `schema.prisma`

   ```txt
   // ...
   model user {
     id       Int     @id @default(autoincrement()) @db.UnsignedInt
     name     String  @unique
     password String
     role     String?
   }
   // ...
   ```

2. #### 重新生成迁移文件

   ```shell
   npx prisma migrate dev
   ```

3. #### 自动生成文件添加角色字段

   `seed.ts`

   ```typescript
   // ...
   await prisma.user.create({
           data: {
               name: 'admin',
               password: await hash('123456'),
               role:'admin'
           }
       })
   // ...
   ```

4. #### 定义枚举角色

   - 新建 `auth/enum.ts`

     ```typescript
     export enum Role {
         ADMIN = 'admin',
         EDITOR = 'editor'
     }
     ```

5. #### 在聚合装饰器里引用

   ```typescript
   import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
   import { AuthGuard } from "@nestjs/passport";
   import { Role } from "../enum";
   import { RoleGuard } from "../guard/role.guard";
   
   export function Auth(...roles: Role[]) {
       /* SetMetadata 设置元数据 */
       return applyDecorators(SetMetadata('roles', roles), UseGuards(AuthGuard('jwt'), RoleGuard))
   }
   ```

6. #### 创建角色守卫

   ```shell
   nest g gu auth/guard/role --no-spec
   ```

7. ### `role.guard.ts`

   ```typescript
   import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
   import { Reflector } from '@nestjs/core';
   import { user } from '@prisma/client';
   import { Observable } from 'rxjs';
   import { Role } from '../enum';
   
   @Injectable()
   export class RoleGuard implements CanActivate {
     constructor(private reflector: Reflector) { }
     canActivate(context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
       /* 打印当前用户 */
       const user = context.switchToHttp().getRequest().user as user
       /* 打印元数据的角色 */
       const roles = this.reflector.getAllAndMerge<Role[]>('roles', [context.getHandler(), context.getClass()])
       return roles.length ? roles.some((role) => { user.role === role }) : true;
     }
   }
   ```

8. ### 在控制器调用

   ```typescript
     // 文章列表
     @Get()
     @Auth(Role.ADMIN)
     findAll(@Query('page') page: string) {
       if (!page) page = '1'
       return this.articleService.findAll(+page);
     }
   ```

   只有具有管理员权限的用户才能调用该接口

   

## 二十、文件上传接口

1. ### 创建 upload 模块和服务

   ```shell
   nest g mo upload
   nest g co upload --no-spec
   nest g s upload --no-spec
   ```

2. ### 模块

   ```typescript
   import { Global, Module } from '@nestjs/common';
   import { UploadService } from './upload.service';
   import { UploadController } from './upload.controller';
   import { MulterModule } from '@nestjs/platform-express';
   import { diskStorage } from 'multer';
   import { extname } from 'path';
   
   @Global()
   @Module({
     imports: [
       MulterModule.registerAsync({
         useFactory() {
           return {
             storage: diskStorage({
               //文件储存位置
               destination: 'uploads',
               //文件名定制
               filename: (req, file, callback) => {
                 const path = Date.now() + '-' + Math.round(Math.random() * 1e10) + extname(file.originalname)
                 callback(null, path)
               },
             }),
           }
         },
       }),
     ],
     providers: [UploadService],
     controllers: [UploadController]
   })
   export class UploadModule { }
   
   ```

3. ### 控制器

   ```typescript
   import { BadRequestException, Controller, Post, UploadedFile } from '@nestjs/common';
   import { Auth } from 'src/auth/decorator/auth.decorator';
   import { DocUpload, ImageUpload } from './decorator/upload.decorator';
   
   @Controller('upload')
   export class UploadController {
       @Post('image')
       @Auth()
       @ImageUpload()
       images(@UploadedFile() file: Express.Multer.File) {
           if (!file) {
               throw new BadRequestException("file不能为空")
           }
           return file
       }
   
       @Post('doc')
       @Auth()
       @DocUpload()
       doc(@UploadedFile() file: Express.Multer.File) {
           if (!file) {
               throw new BadRequestException("file不能为空")
           }
           return file
       }
   }
   
   ```

4. ### 文件上传聚合装饰器

   `upload.decorator.ts`

   ```typescript
   import { applyDecorators, UnsupportedMediaTypeException, UseInterceptors } from "@nestjs/common";
   import { FileInterceptor } from "@nestjs/platform-express";
   import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
   
   export function Upload(fieldName = "file", option: MulterOptions = {}) {
       return applyDecorators(UseInterceptors(FileInterceptor(fieldName, option)))
   }
   
   export function fileFilter(type: string) {
       return (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
           if (!file.mimetype.includes(type)) {
               callback(new UnsupportedMediaTypeException('文件类型错误'), false)
           } else {
               callback(null, true)
           }
       }
   }
   
   export function ImageUpload(fieldName = 'file') {
       return Upload(fieldName, {
           fileFilter: fileFilter('image')
       })
   }
   
   export function DocUpload(fieldName = 'file') {
       return Upload(fieldName, {
           fileFilter: fileFilter('document')
       })
   }
   ```

5. ### 设置静态目录

   `main.ts`

   ```typescript
   // ...
   async function bootstrap() {
     const app = await NestFactory.create<NestExpressApplication>(AppModule);
     // ...
     // 静态目录
     app.useStaticAssets('uploads', { prefix: '/uploads' })
     // ...
   }
   ```

6. ### 接口测试

   ![image-20221027143531957](https://i.imgur.com/E7RF5vQ.png)

   

## 结语

这个项目的视频课是在9月中买的，其中断断续续跟着视频做，后来意识到我只是跟着视频做的话，很快就没什么印象了（虽然写了这篇文章记录后还是一样会忘掉），而且这里里面的很多代码其实写了之后就不会动的了，所以我把他记录下来，方便下次来抄。不管这个项目的质量怎样，起码这是我做的第一个后端项目，也算是跨出了第一步。

写这个项目的时候我还是要一边跟着视频一边抄，因为我对 TypeScript 和 MySQL 不熟悉，并且在我还没买这套视频前，自己也试了一下按照网上别人的博客来做了一下简单的 Nest.JS 功能。功能实现倒是实现了，但是也踩了不少坑。在某一天早上坐地铁上班时，我意外的发现了这个视频教程，价格不贵，日期也新鲜，就买了。

跟着视频做确实轻松了不少，坑也少踩了好多。但是这并不意味着你只要对着视频复制粘贴就能学会的，改动脑子的时候就要动脑子。我在培训的时候就已经留意到了很多人的心态是不正常的。妄想着自己给了钱，交了学费后出来就能月入过万。不能自己主动的学习，神仙教你也不行。写到这里有点语无伦次了，总之就是要能自我驱动，提升自己的能力吧。
