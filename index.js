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

  console.log('user1:', prompt);
  console.log('systemMessage:', systemMessage);

  // const messages = [{role: "user", content: prompt}];
  if (systemMessage) {
    messages.unshift({ role: "system", content: systemMessage });
  }

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-16k-0613",
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  });
  console.log("res", res)
  ctx.body = res.choices;
});

router.get("/assistant", async (ctx) => {
  try {
    console.log("Received GET request");
    const assistantId = "asst_oaoORJy5U49dZrdwQvkYVbIb";
    const { content } = ctx.request.query;

    if (!content) {
      ctx.status = 400; // 设置状态码为 400
      ctx.body = '缺少消息内容'; // 设置响应体
      return; // 退出函数
    }

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: content, // 使用查询参数中的内容
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let runStatus = run.status;
    while (runStatus !== 'completed') {
      const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      runStatus = updatedRun.status;
      if (runStatus === 'completed') {
        break;
      }
      // 适当等待一段时间后再次检查状态
      await new Promise(resolve => setTimeout(resolve, 500)); 
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    ctx.body = messages.data; // 将消息列表设置为响应体

  } catch (error) {
    ctx.status = 500; // 设置状态码为 500
    ctx.body = `服务器错误: ${error.message}`; // 设置响应体
  }
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
