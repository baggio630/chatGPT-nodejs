import OpenAI from "openai";
import Koa from "koa";
import Router from "koa-router";
import cors from "@koa/cors";
import bodyParser from 'koa-bodyparser';
const openai = new OpenAI(
  {
    organization: process.env.APP_ORG,
    apiKey: process.env.APP_KEY,
  }
);

const app = new Koa();
const router = new Router();

app.use(bodyParser());

router.get("/chat", async (ctx, next) => {
  // 获取请求中的参数
  const { prompt, systemMessage } = ctx.request.query;

  console.log('user:', prompt);
  console.log('systemMessage:', systemMessage);

  // const messages = [{role: "user", content: prompt}];
  if (systemMessage) {
    messages.unshift({role: "system", content: systemMessage});
  }

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-16k-0613",
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  });
  console.log("res",res)
  ctx.body = res.choices;
});

router.get("/assistant", async (ctx) => {
  console.log("Received POST request");
  const { content } = ctx.request.query;
  console.log("content", content);

  // 创建一个新的线程
  const thread = await openai.beta.threads.create({
    messages: [{ role: "user", content }]
  });

  // 在线程中创建并执行一个运行
  const run = await openai.beta.threads.runs.create(
    thread.id,
    {
      assistant_id: "asst_oaoORJy5U49dZrdwQvkYVbIb",
    }
  );

  console.log("run",run)

  const run1 = await openai.beta.threads.runs.retrieve(
    thread.id,
    run.id
  );

  const messages = await openai.beta.threads.messages.list(
    thread.id
  );

  // 将回复消息作为响应返回
  ctx.body = messages.data;
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
