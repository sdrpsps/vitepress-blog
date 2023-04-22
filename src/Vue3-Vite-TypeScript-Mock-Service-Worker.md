---
title: Vue3 + Vite + TypeScript 的 Mock Service Worker 使用
date: 2022-11-28 09:45:19
---

# Vue3 + Vite + TypeScript 的 Mock Service Worker 使用

::: info
本次 Demo 仓库地址 https://github.com/sdrpsps/mswDemo
:::

## Install 安装
Let's start by installing the msw package into our project.

Run the following command in your project's root directory:

安装依赖包

``` shell
npm install msw --save-dev
# or
yarn add msw --dev
# or
pnpm install msw -D
```

## Mocking REST API

### Imports 引入
In our `src/mock/handlers.ts` file let's import the essentials we need for mocking a REST API. They are grouped under the rest namespace exposed by the library.

新建 `src/mock/handlers.ts` 文件

``` typescript
// src/mocks/handlers.ts
import { rest } from 'msw'
```

### Request handler & Response resolver 请求和相应

Response resolver is a function that accepts the following arguments:

`req` , an information about a matching request; 请求信息
`res` , a functional utility to create the mocked response; 返回信息
`ctx` , a group of functions that help to set a status code, headers, body, etc. of the mocked response. 上下文

``` typescript
import { rest } from "msw";

const articles = [
  {
    id: 1,
    title: "Node.js 日志最佳实践指南",
    content:
      "在开发阶段，无论是日志记录还是调试，都可以很容易地跟踪程序并检测到错误。但是在生产环境中，应该考虑更多关于日志记录的问题，因为这对于应用程序的监视和故障排除非常关键。",
    url: "https://juejin.cn/post/7017811851345920037",
  },
  {
    id: 2,
    title: "NodeJs 全栈创建多文件断点续传",
    content:
      "文件上传，算是项目开发中比较常见的需求，本文将展示如何构建一个多文件断点续传组件，可以同时处理多个文件，并可以在出现异常或者网络中断的情况下恢复上传，可以手动暂停和恢复文件的上传。文章内容涉及前端和后端，算是一个小型的全栈项目，项目将使用 NodeJs、Express、Busboy 和 XMLHttpRequest，并使用自己开发的脚手架 generator-norm 来构建项目。",
    url: "https://juejin.cn/post/7015935144007729189",
  },
  {
    id: 3,
    title: "Node.js 日志之winston使用指南",
    content:
      "Winston 是强大、灵活的 Node.js 开源日志库之一，理论上， Winston 是一个可以记录所有信息的记录器。这是一个高度直观的工具，易于定制。",
    url: "https://juejin.cn/post/7018169629176496158",
  },
];
const user = {
  name: "admin",
  password: "12345",
  token: "token",
};
export const handlers = [
  rest.get(`/api/article/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const data = articles.find((item) => item.id === parseInt(id as any, 10));
    if (data) {
      return res(ctx.status(200), ctx.json(data));
    } else {
      return res(ctx.status(500));
    }
  }),
  rest.post(`/api/login`, (req, res, ctx) => {
    const data = user;
    return res(ctx.status(200), ctx.json(data));
  }),
];

export const defaultHandlers = [];

```

### Integrate Browser 整合到浏览器

Execute the init command of the Mock Service Worker CLI: 初始化 Worker 到 `puilb` 目录
``` shell
npx msw init public/ --save
```

### Configure worker 配置 Worker

Let's create a file in our mock definition directory (`src/mocks`) where we would configure and start our Service Worker.

Create a `src/mocks/browser.ts` file:

创建 `src/mocks/browser.ts` 文件

``` typescript
import { setupWorker } from "msw";
import { handlers, defaultHandlers } from "./handler";

export const mocker = setupWorker(...handlers, ...defaultHandlers);
```

### Start worker 启动 Worker

在 `main.ts` 添加即可使用

``` typescript
// ...
import { mocker } from "./mocks/browser";
// ...

if (import.meta.env.MODE === "development") {
  mocker.start({
    // 对于没有 mock 的接口直接通过，避免异常
    onUnhandledRequest: "bypass",
  });
}
```

## 自用 Axios 封装

``` typescript
// src/utils/request.ts

import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";


const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 5000,
});

/* 请求拦截器 */
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/* 响应拦截器 */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 根据自定义错误码判断请求是否成功

    // 将组件用的数据返回
    return response.data;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/* 导出封装的请求方法 */
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config);
  },

  post<T = any>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.post(url, data, config);
  },

  put<T = any>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config);
  },
};

/* 导出 axios 实例 */
export default service;

```

## Axios 调用

### 请求方法

``` typescript
// src/api/index.ts

import { http } from "@/utils/request";
import { articleData, articleRes, loginRes } from "./types";

export function getArticle(id: articleData) {
  return http.get<articleRes>(`/article/${id}`);
}

export function login() {
  return http.post<loginRes>(`/login`);
}
```

### 类型定义

``` typescript
// src/api/types.ts

/* 文章列表请求参数 */
export interface articleData {
  id: number;
}
/* 文章列表结果 */
export interface articleRes {
  id: number;
  title: string;
  content: string;
  url: string;
}
/* 登陆结果 */
export interface loginRes {
    name: string;
    password: string;
    token: string;
  }

```