import http from "http";

interface Request {
  app?: PureKoa;
  req?: Request;
  res?: Response;
  ctx?: Context;
  response?: Response;
}

interface Response {
  end?: (body: any) => any;
  app?: PureKoa;
  req?: Request;
  res?: Response;
  ctx?: Context;
  request?: Request;
}

interface Context {
  request?: Request;
  response?: Response;
  app?: PureKoa;
  req?: Request;
  res?: Response;
  body?: any;
}

type Middleware = (context: Context, next: () => void) => void;

class PureKoa {
  middleware: Middleware[];
  context: Context;
  request: Request;
  response: Response;

  constructor() {
    this.middleware = [];
    this.context = {};
    this.request = {};
    this.response = {};
  }

  listen(...args: any) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  compose(middleware: Middleware[]) {
    let index = -1;

    return (context: Context) => {
      const dispatch = (i: number): any => {
        if (index >= i) {
          return Promise.reject("next() has called multiple times!!");
        }
        index = i;

        let fn = middleware[i];

        if (i === middleware.length) {
          return Promise.resolve();
        }

        try {
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
        } catch (error) {
          return Promise.reject(error);
        }
      };

      return dispatch(0);
    };
  }

  callback() {
    const fn = this.compose(this.middleware);

    return (req: any, res: any) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };
  }

  handleRequest(ctx: Context, fnMiddleware: any) {
    const handleResponse = () => this.respond(ctx);
    return fnMiddleware(ctx).then(handleResponse).catch(this.onerror);
  }

  createContext(req: any, res: any) {
    const context = this.context;
    const request = (context.request = this.request);
    const response = (context.response = this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    return context;
  }

  use(fn: Middleware) {
    if (typeof fn !== "function")
      throw new TypeError("middleware must be a function!");

    this.middleware.push(fn);
    return this;
  }

  respond(ctx: Context) {
    const res = ctx.res;
    let body = ctx.body;
    if (res && res.end) {
      res.end(body);
    }
  }

  onerror(err: unknown) {
    console.error(err);
  }
}

module.exports = PureKoa;
