import { handler } from './app.js';
import event from './event.local.json' with { type: "json" };

async function runLocal() {
  try {
    const response = await handler(event);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

runLocal();
