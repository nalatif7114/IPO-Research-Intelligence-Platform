from pydantic import BaseModel, Field
from typing import List, Literal, Generic, TypeVar

T = TypeVar('T')

class GovernanceMetric(BaseModel, Generic[T]):
    value: T = Field(description="The extracted governance detail, or 'Insufficient evidence.' if data is missing.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0.")
    citations: List[str] = Field(description="Exact sentences or excerpts from the context proving the value.")

class GovernanceInput(BaseModel):
    document_id: str

class GovernanceOutput(BaseModel):
    board_of_directors: GovernanceMetric[str]
    board_of_commissioners: GovernanceMetric[str]
    independent_commissioners: GovernanceMetric[str]
    audit_committee: GovernanceMetric[str]
    nomination_committee: GovernanceMetric[str]
    remuneration_committee: GovernanceMetric[str]
    ownership_structure: GovernanceMetric[str]
    shareholder_concentration: GovernanceMetric[str]
    related_party_transactions: GovernanceMetric[str]
    corporate_governance_policies: GovernanceMetric[str]
    internal_controls: GovernanceMetric[str]
    transparency: GovernanceMetric[str]
    disclosure_quality: GovernanceMetric[str]
    conflict_of_interest: GovernanceMetric[str]
    governance_red_flags: GovernanceMetric[List[str]]
    governance_strengths: GovernanceMetric[List[str]]
    overall_governance_quality: GovernanceMetric[Literal["VERY GOOD", "GOOD", "FAIR", "POOR", "UNKNOWN"]]
