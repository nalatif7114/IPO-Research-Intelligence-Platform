from __future__ import annotations

import abc
from typing import Any


class PromptTemplate(abc.ABC):
    """Base class for prompt templates used across agents.

    Subclasses define the raw template string and variable slots; this base
    provides the rendering contract.
    """

    @abc.abstractmethod
    def get_template(self) -> str:
        """Return the raw template string with placeholder variables."""
        ...

    @abc.abstractmethod
    def get_required_variables(self) -> list[str]:
        """Return the list of variable names required by this template."""
        ...

    def format(self, **kwargs: Any) -> str:
        """Render the template by substituting *kwargs* into placeholders."""
        template = self.get_template()
        missing = [v for v in self.get_required_variables() if v not in kwargs]
        if missing:
            raise ValueError(f"Missing required template variables: {missing}")
        return template.format(**kwargs)

    def render(self, variables: dict[str, Any]) -> str:
        """Convenience wrapper around :meth:`format`."""
        return self.format(**variables)
