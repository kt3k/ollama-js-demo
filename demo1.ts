import { Ollama } from "ollama"

const ollama = new Ollama()

const response = await ollama.chat({
  model: "gemma4:e4b",
  messages: [{ role: "user", content: "簡単に、自己紹介して" }],
})

console.log(response.message.content)
