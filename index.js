// import { Configuration, OpenAIApi } from "openai";
import OpenAI from "openai";
import Koa from "koa";
import Router from "koa-router";
import cors from "@koa/cors";
// import bodyParser from "koa-bodyparser";

// const configuration = new Configuration({
//   organization: process.env.APP_ORG,
//   apiKey: process.env.APP_KEY,
// });
// const openai = new OpenAIApi(configuration);

const openai = new OpenAI({organization: process.env.APP_ORG, apiKey: process.env.APP_KEY, });

const response = await openai.listEngines();

console.log("prompt", response);

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

  console.log("提交的数据",messages);

  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k-0613",
    messages: messages,
    temperature: 0.2
  });
  ctx.body = res.data.choices;
});

router.post("/assistant", async (ctx) => {
  // const { prompt } = ctx.request.body;
  const prompt = "你能做什么？";

  // 创建一个新的线程
  const thread = await openai.beta.threads.create();

  // 在线程中创建并执行一个运行
  const run = await openai.beta.threads.runs.create(
    {
    thread_id: thread.id,
    assistant_id: "asst_oaoORJy5U49dZrdwQvkYVbIb",
    inputs: prompt
    }
  );

  // 将回复消息作为响应返回
  ctx.body = run.data;
});

// console.log("结果",res);

app.use(
  cors({
    origin: "*",
  })
);

// 启用路由
app.use(router.routes()).use(router.allowedMethods());

router.get("/engines", async (ctx, next) => {
  const response = await openai.listEngines();
  ctx.body = response.data; // 返回模型列表到客户端
});

// 启动服务器
app.listen(process.env.PORT, () => {
  console.log("Server is listening on port " + process.env.PORT);
});
