"""
Simple investigation to understand why embeddings might be the same.
"""

import requests
import json
import numpy as np


def test_embeddings_manually():
    """Test embeddings using the running API directly."""
    
    base_url = "http://localhost:5000"
    
    test_queries = [
        "cat dog animal",
        "computer software technology",
        "hello world",
        "password secret authentication",
        "completely random text here",
        "123 456 789"
    ]
    
    embeddings = {}
    
    for query in test_queries:
        try:
            response = requests.post(
                f"{base_url}/api/v1/2025/vectors/search",
                json={
                    "query": query,
                    "search_type": "semantic",
                    "max_results": 1
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    result = data["results"][0]
                    if "embedding" in result and result["embedding"]:
                        embeddings[query] = result["embedding"][:10]  # First 10 dims
                        print(f"\nQuery: '{query}'")
                        print(f"First 10 embedding values: {[f'{v:.4f}' for v in embeddings[query]]}")
                        print(f"Content returned: {result.get('content', 'N/A')[:50]}...")
                    else:
                        print(f"\nQuery: '{query}' - No embedding in result")
                else:
                    print(f"\nQuery: '{query}' - No results returned")
            else:
                print(f"\nQuery: '{query}' - Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"\nQuery: '{query}' - Exception: {e}")
    
    # Compare embeddings
    if len(embeddings) > 1:
        print("\n\n=== EMBEDDING COMPARISON ===")
        queries_list = list(embeddings.keys())
        
        for i in range(len(queries_list)):
            for j in range(i + 1, len(queries_list)):
                q1, q2 = queries_list[i], queries_list[j]
                emb1 = np.array(embeddings[q1])
                emb2 = np.array(embeddings[q2])
                
                # Check if they're exactly the same
                if np.array_equal(emb1, emb2):
                    print(f"\n⚠️  IDENTICAL EMBEDDINGS: '{q1}' and '{q2}'")
                else:
                    # Calculate cosine similarity
                    cosine_sim = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
                    print(f"\nCosine similarity between '{q1}' and '{q2}': {cosine_sim:.4f}")


def check_vector_store_content():
    """Check what's actually in the vector store."""
    
    base_url = "http://localhost:5000"
    
    try:
        # Check vector store status
        response = requests.get(f"{base_url}/api/v1/2025/vectors/status")
        if response.status_code == 200:
            print("\n=== VECTOR STORE STATUS ===")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Vector store status error: {response.status_code}")
    except Exception as e:
        print(f"Error checking vector store: {e}")


if __name__ == "__main__":
    print("Testing embeddings from running API...")
    print("Make sure the API is running on http://localhost:5000")
    print("=" * 50)
    
    test_embeddings_manually()
    check_vector_store_content()