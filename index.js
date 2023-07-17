import { Configuration, OpenAIApi } from "openai";
import Koa from "koa";
import Router from "koa-router";
import cors from '@koa/cors';

// https://platform.openai.com/docs/api-reference/images

const configuration = new Configuration({
    organization: process.env.APP_ORG,
    apiKey: process.env.APP_KEY,
});
const openai = new OpenAIApi(configuration);
const response = await openai.listEngines();

console.log(response);

const app = new Koa()
const router = new Router();



router.get("/chat", async (ctx, next) => {
    // 获取请求中的参数
    const { prompt } = ctx.request.query;

    const res = await openai.createCompletion({
        // 对话模型
        model: "text-davinci-003",
        //model: "gpt-3.5-turbo-16k-0613",
        prompt: prompt,
        max_tokens: 2048,
        temperature: 0.2
    })
    // 将生成的内容返回给客户端
    ctx.body = res.data.choices
});

// router.get("/chat", async (ctx, next) => {
//     try {
//         // 获取请求中的参数
//         const { prompt } = ctx.request.query;

//     const res = await openai.createCompletion({
//         // 对话模型
//         // model: "text-davinci-003",
//         model: "gpt-3.5-turbo",
//         prompt: prompt,
//         max_tokens: 2048,
//         temperature: 0.2
//     })
//         // 将生成的内容返回给客户端
//         if (!res || !res.data || !res.data.choices) {
//             console.error('Unexpected response from OpenAI API', res);
//             ctx.status = 500;
//             ctx.body = 'Unexpected response from OpenAI API';
//             return;
//         }
//         ctx.body = res.data.choices;
//     } catch (error) {
//         console.error(`Error when trying to use OpenAI API: ${error.message}`);
//         // console.error(`Error when trying to use OpenAI API2: ${error.response.data.error.message}`);
//         ctx.status = 500;
//         ctx.body = 'Internal Server Error';
//     }
// });

app.use(cors({
  origin: '*'
}));

// 启用路由
app.use(router.routes()).use(router.allowedMethods());

router.get("/engines", async (ctx, next) => {
    const response = await openai.listEngines();
    ctx.body = response.data;  // 返回模型列表到客户端
});

// 启动服务器
app.listen(process.env.PORT, () => {
    console.log("Server is listening on port " + process.env.PORT);
});

