// src/app.ts
import express, {
  json,
  urlencoded,
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
import { ValidateError } from "tsoa";
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";
import path from "path";
import cors from "cors";
import { ApiError } from "./models/api";

export const app = express();

app.use(cors());

app.use((req, _, next) => {
  if (req.headers["content-type"]?.indexOf("scim+") !== -1) {
    req.headers["content-type"] = req.headers["content-type"]?.replace(
      "scim+",
      ""
    );
  }
  next();
});

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

RegisterRoutes(app);
app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction
): ExResponse | void {
  console.log(err);
  if (req?.path?.indexOf("scim") !== -1) {
    const anyErr = err as any;
    return res.status(404).json({
      schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
      detail: anyErr.message,
      status: anyErr?.status || anyErr.code || 500,
    });
  }
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
      code: 422,
    });
  }
  if (err instanceof ApiError) {
    return res.status(err.code).json({
      message: err.message,
      code: err.code,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      err,
    });
  }
  if ((err as any).status == 401) {
    return res.status(401).json({
      code: 401,
      message: "Authentication error",
    });
  }
  next();
});

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../../public")));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);
