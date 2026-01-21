import dotenv from "dotenv";
import { createCookieSessionStorage } from "react-router";
dotenv.config({ path: ".env" });

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    // @ts-ignore
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export default sessionStorage;
