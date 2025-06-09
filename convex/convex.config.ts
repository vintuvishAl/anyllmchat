// convex/convex.config.ts
import agent from "@convex-dev/agent/convex.config";
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(agent);
app.use(persistentTextStreaming);

export default app;
