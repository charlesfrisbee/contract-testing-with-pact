import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

interface User {
  id: string;
  name: string;
  age: number;
}

const users: Map<string, User> = new Map();
users.set("1", { id: "1", name: "John", age: 22 });
users.set("2", { id: "2", name: "Jane", age: 23 });

app.get("/users/:id", (req: Request, res: Response) => {
  const user = users.get(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post("/users", (req: Request, res: Response) => {
  const user: User = req.body;
  const id = Date.now().toString();
  user.id = id;
  users.set(id, user);
  res.status(201).json(user);
});

export default app;
