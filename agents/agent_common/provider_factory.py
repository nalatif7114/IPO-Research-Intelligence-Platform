from agents.agent_common.llm import GeminiProvider
from agents.agent_common.ollama_provider import OllamaProvider
from backend.app.config import get_settings

settings = get_settings()

def get_llm_provider(**kwargs):
    provider = settings.default_llm_provider.lower()

    if provider == "gemini":
        return GeminiProvider(
            temperature=settings.llm_temperature,
            top_p=settings.llm_top_p,
            max_output_tokens=settings.llm_max_output_tokens,
            timeout_seconds=settings.llm_timeout
        )

    if provider == "ollama":
        return OllamaProvider(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            temperature=settings.llm_temperature,
            timeout_seconds=settings.llm_timeout
        )

    raise ValueError(f"Unknown provider: {provider}")