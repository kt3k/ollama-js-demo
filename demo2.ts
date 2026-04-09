import { Ollama } from "ollama"

const ollama = new Ollama()

const MODEL = "gemma4:e4b"

// ツールの定義: 現在の天気を取得する関数
function getCurrentWeather(city: string): string {
  // 実際にはAPIを呼ぶが、ここではダミーデータを返す
  const data: Record<string, string> = {
    東京: "晴れ、気温 22°C",
    大阪: "曇り、気温 20°C",
    札幌: "雪、気温 -2°C",
  }
  return data[city] ?? `${city}の天気データが見つかりません`
}

// Ollama に渡すツール定義
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_current_weather",
      description: "指定された都市の現在の天気を取得します",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "都市名",
          },
        },
        required: ["city"],
      },
    },
  },
]

// 1. ツール付きでチャットを送信
const messages: { role: string; content: string }[] = [
  { role: "user", content: "東京の天気を教えてください" },
]

console.log("--- ユーザー:", messages[0].content)

const response = await ollama.chat({
  model: MODEL,
  messages,
  tools,
})

// 2. モデルがツール呼び出しを返した場合、実行して結果を返す
if (response.message.tool_calls && response.message.tool_calls.length > 0) {
  for (const toolCall of response.message.tool_calls) {
    console.log(
      "--- ツール呼び出し:",
      toolCall.function.name,
      toolCall.function.arguments,
    )

    const result = getCurrentWeather(toolCall.function.arguments.city)
    console.log("--- ツール結果:", result)

    // ツール呼び出しとその結果を会話に追加
    messages.push(response.message)
    messages.push({ role: "tool", content: result })
  }

  // 3. ツール結果を含めて再度チャット
  const finalResponse = await ollama.chat({
    model: MODEL,
    messages,
    tools,
  })

  console.log("--- アシスタント:", finalResponse.message.content)
} else {
  console.log("--- アシスタント:", response.message.content)
}
