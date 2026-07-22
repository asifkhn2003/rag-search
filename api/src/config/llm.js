const { ChatOpenAI } = require("@langchain/openai");
const config = require("./constants");

const zenConfig = {
    configuration: {
        baseURL: config.ZEN_BASE_URL,
    },
    apiKey: config.ZEN_API_KEY,
};

const primaryModel = new ChatOpenAI({
    ...zenConfig,
    model: config.PRIMARY_MODEL,
    modelKwargs: {
        thinking: {
            type: "disabled",
        },
    },
});

const fallbackModel = new ChatOpenAI({
    ...zenConfig,
    model: config.FALLBACK_MODEL,
});

module.exports = {
    primaryModel,
    fallbackModel,
};