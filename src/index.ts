import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { serve } from "@hono/node-server";
import Groq from "groq-sdk";
import "dotenv/config";
import { swaggerUI } from "@hono/swagger-ui";
import { download_file_from_url } from "./libs/download-file-from-url";
import fs from "fs";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
const app = new OpenAPIHono();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
app.use(logger());
app.use(compress());
app.use("/", cors());
app.use(
  "/transcription",
  bearerAuth({
    headerName: "X-RapidAPI-Proxy-Secret",
    token: process.env.RAPID_API_KEY!,
    
  })
);

const transcribe_route = createRoute({
  method: "post",
  path: "/transcription",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            prompt: z.string().max(128).optional(),
            response_format: z.enum(["json", "text", "verbose_json"]),
            language: z.string().optional(),
            temperature: z.number().min(0).max(1),
            file: z.string().url(),
            translate: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            output: z.object({}),
          }),
        },
      },
      description: "Retrieve the user",
    },
  },
});
app.openapi(transcribe_route, async (c): Promise<any> => {
  const { prompt, response_format, language, file, temperature, translate } =
    await c.req.json();

  console.log(
    `Receiving request for transcription of ${file} with options: ${JSON.stringify(
      {
        prompt,
        response_format,
        language,
        temperature,
        translate,
      }
    )}`
  );

  const [download_file_location, download_file_error] =
    await download_file_from_url(file);

  if (download_file_error || !download_file_location) {
    console.log(`Error downloading file from ${file}: ${download_file_error}`);
    return c.json(
      { error: download_file_error || "something went wrong" },
      { status: 400 }
    );
  }

  if (translate) {
    console.log("Attempting to translate the file");
    const translation = await groq.audio.translations.create({
      file: fs.createReadStream(download_file_location),
      model: "whisper-large-v3",
      prompt: prompt,
      response_format,
      temperature,
    });
    console.log("Translation completed");
    // delete translation["x_groq"]
    return c.json({
      output: translation,
    });
  } else {
    console.log("Attempting to transcribe the file");
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(download_file_location),
      model: "whisper-large-v3",
      prompt: prompt,
      response_format,
      language,
      temperature,
      timestamp_granularities: ["word", "segment"],
    });
    console.log("Transcription completed");
    return c.json({
      output: transcription,
    });
  }
});

app.doc("/docs", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Rapid STT",
  },
});

app.get("/ping", async (c) => c.text("pong"));
app.get("/swagger-ui", swaggerUI({ url: "/docs" }));
// export const handler = handle(app);
const port = process.env.PORT || 5000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: +port,
});
