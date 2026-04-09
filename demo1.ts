import { Ollama } from "ollama"

const ollama = new Ollama()

const response = await ollama.chat({
  model: "gemma4:e4b",
  messages: [{ role: "user", content: "こんにちは！自己紹介してください。" }],
})

console.log(response.message.content)
