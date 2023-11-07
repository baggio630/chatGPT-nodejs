// import { Configuration, OpenAIApi } from "openai";
import OpenAI from "openai";
import Koa from "koa";
import Router from "koa-router";
import cors from "@koa/cors";

// https://platform.openai.com/docs/api-reference/images

// const configuration = new Configuration({
//   organization: process.env.APP_ORG,
//   apiKey: process.env.APP_KEY,
// });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAI(
  {
    organization: process.env.APP_ORG,
    apiKey: process.env.APP_KEY,
  }
);
// const response = await openai.listEngines();

// console.log("prompt", response);

const app = new Koa();
const router = new Router();

router.get("/chat", async (ctx, next) => {
  // 获取请求中的参数
  const { prompt, systemMessage } = ctx.request.query;

  console.log('user:', prompt);
  console.log('systemMessage:', systemMessage);

  const messages = [{role: "user", content: prompt}];
  if (systemMessage) {
    messages.unshift({role: "system", content: systemMessage});
  }

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-16k-0613",
    messages: [
    {"role": "system", "content": "你是一名设计助理，帮助人们解答设计问题."},
    messages
  ],
    temperature: 0.2
  });
  ctx.body = res.data.choices;
});

app.use(
  cors({
    origin: "*",
  })
);

// 启用路由
app.use(router.routes()).use(router.allowedMethods());

// router.get("/engines", async (ctx, next) => {
//   const response = await openai.listEngines();
//   ctx.body = response.data; // 返回模型列表到客户端
// });

// 启动服务器
app.listen(process.env.PORT, () => {
  console.log("Server is listening on port " + process.env.PORT);
});
