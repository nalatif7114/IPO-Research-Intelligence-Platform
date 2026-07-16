const provider = process.env.NEXT_PUBLIC_LLM_PROVIDER || "Ollama";
const model = process.env.NEXT_PUBLIC_LLM_MODEL || "Configured model";

export const currentModelLabel = `${model} (${provider})`;
