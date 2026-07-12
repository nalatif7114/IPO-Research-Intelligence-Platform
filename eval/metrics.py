import math
from typing import List, Dict, Any

# --- Retrieval Metrics ---

def calculate_recall_at_k(retrieved_ids: List[str], expected_ids: List[str], k: int = 5) -> float:
    if not expected_ids:
        return 1.0
    retrieved_k = retrieved_ids[:k]
    hits = set(retrieved_k).intersection(set(expected_ids))
    return len(hits) / len(expected_ids)

def calculate_precision_at_k(retrieved_ids: List[str], expected_ids: List[str], k: int = 5) -> float:
    if not retrieved_ids:
        return 0.0
    retrieved_k = retrieved_ids[:k]
    hits = set(retrieved_k).intersection(set(expected_ids))
    return len(hits) / len(retrieved_k)

def calculate_mrr(retrieved_ids: List[str], expected_ids: List[str]) -> float:
    if not expected_ids:
        return 1.0
    for i, rid in enumerate(retrieved_ids):
        if rid in expected_ids:
            return 1.0 / (i + 1)
    return 0.0

def calculate_ndcg(retrieved_ids: List[str], expected_ids: List[str]) -> float:
    if not expected_ids:
        return 1.0
    
    dcg = 0.0
    for i, rid in enumerate(retrieved_ids):
        if rid in expected_ids:
            # relevance is 1 for expected, 0 for not expected
            dcg += 1.0 / math.log2(i + 2)
            
    idcg = 0.0
    for i in range(min(len(expected_ids), len(retrieved_ids))):
        idcg += 1.0 / math.log2(i + 2)
        
    return dcg / idcg if idcg > 0 else 0.0


# --- LLM Metrics ---

def calculate_citation_accuracy(generated_citations: List[str], expected_citations: List[str]) -> float:
    """Calculates what percentage of generated citations match (or partially match) expected citations."""
    if not generated_citations and not expected_citations:
        return 1.0
    if not generated_citations:
        return 0.0
        
    hits = 0
    for gen in generated_citations:
        for exp in expected_citations:
            if exp.lower() in gen.lower() or gen.lower() in exp.lower():
                hits += 1
                break
                
    return hits / len(generated_citations)

def calculate_hallucination_rate(agent_outputs: Dict[str, Any], retrieved_contexts: List[str]) -> float:
    """
    Checks if values are produced but no citations are attached, 
    or if the citation doesn't appear anywhere in the retrieved contexts.
    Returns % of fields that are hallucinated.
    """
    fields_checked = 0
    hallucinations = 0
    
    # Combined lowercase text of all retrieved chunks for simple string matching
    combined_context = " ".join(retrieved_contexts).lower()
    
    def traverse_output(obj):
        nonlocal fields_checked, hallucinations
        if isinstance(obj, dict):
            # Check if this dict matches our ValuationMetric/GovernanceMetric pattern
            if "value" in obj and "citations" in obj:
                val = obj["value"]
                cits = obj["citations"]
                
                # Skip UNKNOWN or Insufficient evidence
                if val in ["Insufficient evidence.", "UNKNOWN", None, []]:
                    return
                    
                fields_checked += 1
                
                if not cits or len(cits) == 0:
                    hallucinations += 1
                else:
                    # Check if citations actually exist in the retrieved context
                    valid = False
                    for cit in cits:
                        if cit.lower() in combined_context:
                            valid = True
                            break
                    if not valid:
                        hallucinations += 1
            else:
                for k, v in obj.items():
                    traverse_output(v)
        elif isinstance(obj, list):
            for item in obj:
                traverse_output(item)

    traverse_output(agent_outputs)
    
    if fields_checked == 0:
        return 0.0
        
    return hallucinations / fields_checked
