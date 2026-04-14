// api/weather.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
    // 1. 設定 API Key (稍後在 Vercel 後台設定)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

    try {
        // 2. 獲取福岡即時溫濕度 (OpenWeatherMap)
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=Fukuoka&appid=${WEATHER_API_KEY}&units=metric&lang=zh_tw`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const temp = weatherData.main.temp;
        const humidity = weatherData.main.humidity;
        const desc = weatherData.weather[0].description;

        // 3. 讓 Gemini AI 產生探險貼士
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `現在福岡天氣：氣溫 ${temp}度，濕度 ${humidity}%，狀況為 ${desc}。
                       請以「瑪利歐探險家」的語氣，針對 2026 九州旅遊（含阿蘇火山、由布院等）給出一段 60 字內的穿衣建議與探險貼士。
                       必須提到溫濕度對行程的影響。`;

        const result = await model.generateContent(prompt);
        const aiAdvice = result.response.text();

        // 4. 回傳數據
        res.status(200).json({
            temp,
            humidity,
            desc,
            aiAdvice
        });
    } catch (error) {
        res.status(500).json({ error: "AI 能量不足，無法讀取天氣！" });
