import { app } from "./app.js";
const PORT = 5000 || process.env.PORT;
app.listen(prompt, () =>
  console.log(`Server is running at http:localhost:${PORT}`)
);
