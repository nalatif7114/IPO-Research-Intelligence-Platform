import json
import csv
import os
from typing import List, Dict, Any

def generate_json_report(results: List[Dict[str, Any]], output_path: str):
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4)

def generate_csv_report(results: List[Dict[str, Any]], output_path: str):
    if not results:
        return
        
    keys = ["document_id", "question_id", "category", "latency_ms", "recall_at_5", "precision_at_5", "mrr", "ndcg", "citation_accuracy", "hallucination_rate"]
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for res in results:
            writer.writerow({k: res.get(k, "") for k in keys})

def generate_html_dashboard(results: List[Dict[str, Any]], output_path: str):
    if not results:
        return
        
    total_recall = sum(r.get("recall_at_5", 0) for r in results) / len(results)
    total_ndcg = sum(r.get("ndcg", 0) for r in results) / len(results)
    total_citation_acc = sum(r.get("citation_accuracy", 0) for r in results) / len(results)
    total_hallucination = sum(r.get("hallucination_rate", 0) for r in results) / len(results)
    avg_latency = sum(r.get("latency_ms", 0) for r in results) / len(results)

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>IPO Platform Evaluation Dashboard</title>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
            .container {{ max-width: 1200px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            h1, h2 {{ color: #333; }}
            .metrics-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }}
            .metric-card {{ background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; }}
            .metric-value {{ font-size: 2em; font-weight: bold; color: #1565c0; }}
            .metric-title {{ font-size: 0.9em; color: #555; text-transform: uppercase; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
            th {{ background-color: #f8f9fa; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>IPO Platform Evaluation Dashboard</h1>
            <div class="metrics-grid">
                <div class="metric-card"><div class="metric-value">{total_recall:.2f}</div><div class="metric-title">Avg Recall@5</div></div>
                <div class="metric-card"><div class="metric-value">{total_ndcg:.2f}</div><div class="metric-title">Avg NDCG</div></div>
                <div class="metric-card"><div class="metric-value">{total_citation_acc:.2f}</div><div class="metric-title">Citation Accuracy</div></div>
                <div class="metric-card"><div class="metric-value">{total_hallucination:.2f}</div><div class="metric-title">Hallucination Rate</div></div>
                <div class="metric-card"><div class="metric-value">{avg_latency:.0f} ms</div><div class="metric-title">Avg Latency</div></div>
            </div>
            
            <h2>Per-Question Results</h2>
            <table>
                <tr>
                    <th>Doc ID</th>
                    <th>Category</th>
                    <th>Latency (ms)</th>
                    <th>Recall@5</th>
                    <th>Citation Acc</th>
                    <th>Hallucination</th>
                </tr>
                {"".join(f"<tr><td>{r.get('document_id')}</td><td>{r.get('category')}</td><td>{r.get('latency_ms', 0):.0f}</td><td>{r.get('recall_at_5', 0):.2f}</td><td>{r.get('citation_accuracy', 0):.2f}</td><td>{r.get('hallucination_rate', 0):.2f}</td></tr>" for r in results)}
            </table>
        </div>
    </body>
    </html>
    """
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)


def generate_markdown_summary(results: List[Dict[str, Any]], output_path: str):
    if not results:
        return
        
    total_recall = sum(r.get("recall_at_5", 0) for r in results) / len(results)
    total_ndcg = sum(r.get("ndcg", 0) for r in results) / len(results)
    total_citation_acc = sum(r.get("citation_accuracy", 0) for r in results) / len(results)
    total_hallucination = sum(r.get("hallucination_rate", 0) for r in results) / len(results)
    avg_latency = sum(r.get("latency_ms", 0) for r in results) / len(results)

    md_content = f"""# Benchmark Evaluation Summary

## Aggregate Metrics
- **Questions Evaluated**: {len(results)}
- **Avg Recall@5**: {total_recall:.2f}
- **Avg NDCG**: {total_ndcg:.2f}
- **Avg Citation Accuracy**: {total_citation_acc:.2f}
- **Avg Hallucination Rate**: {total_hallucination:.2f}
- **Avg End-to-End Latency**: {avg_latency:.0f} ms

## Analysis
- **Retrieval Quality**: Assessed via Recall and NDCG against the expected ground truth chunk IDs.
- **LLM Quality**: Measured via Citation Accuracy and Hallucination Rates to ensure groundedness.
- **Performance**: End-to-end processing time for query handling.
"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
