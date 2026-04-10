import { type Message, Ollama } from "ollama"

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
    type: "function",
    function: {
      name: "get_current_weather",
      description: "指定された都市の現在の天気を取得します",
      parameters: {
        type: "object",
        required: ["city"],
        properties: {
          city: {
            type: "string",
            description: "都市名 (ex. 東京, 大阪, 札幌)",
          },
        },
      },
    },
  },
]

const QUESTION = "東京の天気を教えてください"
const messages: Message[] = [
  { role: "user", content: QUESTION },
]
console.log("--- ユーザー:", QUESTION)

// ツール付きでチャットを送信
const { message } = await ollama.chat({ model: MODEL, messages, tools })
messages.push(message)
const { tool_calls } = message

// モデルがツール呼び出しを返した場合、実行して結果を返す
if (tool_calls && tool_calls.length > 0) {
  for (const { function: { name, arguments: args } } of tool_calls) {
    console.log("--- ツール呼び出し:", name, args)

    // ツール呼び出しとその結果を会話に追加
    const result = getCurrentWeather(args.city)
    console.log("--- ツール結果:", result)
    messages.push({ role: "tool", content: result })
  }

  // ツール結果を含めて再度チャット
  const finalResponse = await ollama.chat({ model: MODEL, messages, tools })
  console.log("--- アシスタント:", finalResponse.message.content)
} else {
  console.log("--- アシスタント:", message.content)
}
