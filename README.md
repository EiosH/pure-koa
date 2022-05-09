# pure-koa
a self made 'koa' called pure-koa


### how to use

```js
const PureKoa = require("../src/index");

const app = new PureKoa();

app.use(async (ctx, next) => {
  await next();
  ctx.body = "Hello Purekoa";

  console.log(3);
});

app.use(async (ctx, next) => {
  console.log(1);
  await next();
});

app.use(async (ctx) => {
  console.log(2);
  ctx.body = "Hello World";
});

app.listen(3000, () => {
  console.log("koa listening in 3000");
});

```
