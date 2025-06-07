"""
Tests for vector search API to verify embeddings are different for different inputs.
"""

import pytest
from fastapi.testclient import TestClient
import numpy as np


def test_vector_search_returns_embeddings(client: TestClient):
    """Test that vector search returns embeddings in the response."""
    response = client.post(
        "/api/v1/2025/vectors/search",
        json={
            "query": "test query",
            "search_type": "semantic",
            "max_results": 1
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    
    if len(data["results"]) > 0:
        result = data["results"][0]
        assert "embedding" in result
        assert isinstance(result["embedding"], list)
        assert len(result["embedding"]) > 0


def test_different_queries_return_different_embeddings(client: TestClient):
    """Test that different queries return different embeddings."""
    
    # Query 1
    response1 = client.post(
        "/api/v1/2025/vectors/search",
        json={
            "query": "cat dog animal pet",
            "search_type": "semantic",
            "max_results": 1
        }
    )
    
    # Query 2 - completely different
    response2 = client.post(
        "/api/v1/2025/vectors/search",
        json={
            "query": "computer technology software programming",
            "search_type": "semantic",
            "max_results": 1
        }
    )
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    
    data1 = response1.json()
    data2 = response2.json()
    
    # Both should have results
    assert len(data1.get("results", [])) > 0
    assert len(data2.get("results", [])) > 0
    
    # Get embeddings
    embedding1 = data1["results"][0].get("embedding")
    embedding2 = data2["results"][0].get("embedding")
    
    assert embedding1 is not None
    assert embedding2 is not None
    
    # Embeddings should be different
    assert embedding1 != embedding2
    
    # Calculate cosine similarity - should be low for unrelated queries
    if len(embedding1) == len(embedding2):
        embedding1_np = np.array(embedding1)
        embedding2_np = np.array(embedding2)
        
        cosine_sim = np.dot(embedding1_np, embedding2_np) / (
            np.linalg.norm(embedding1_np) * np.linalg.norm(embedding2_np)
        )
        
        print(f"Cosine similarity between embeddings: {cosine_sim}")
        
        # For very different queries, similarity should be relatively low
        assert cosine_sim < 0.8, f"Embeddings too similar ({cosine_sim}) for different queries"


def test_similar_queries_return_similar_embeddings(client: TestClient):
    """Test that similar queries return similar embeddings."""
    
    # Query 1
    response1 = client.post(
        "/api/v1/2025/vectors/search",
        json={
            "query": "password security authentication",
            "search_type": "semantic",
            "max_results": 1
        }
    )
    
    # Query 2 - similar topic
    response2 = client.post(
        "/api/v1/2025/vectors/search",
        json={
            "query": "password auth secure",
            "search_type": "semantic",
            "max_results": 1
        }
    )
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    
    data1 = response1.json()
    data2 = response2.json()
    
    if len(data1.get("results", [])) > 0 and len(data2.get("results", [])) > 0:
        embedding1 = data1["results"][0].get("embedding")
        embedding2 = data2["results"][0].get("embedding")
        
        if embedding1 and embedding2 and len(embedding1) == len(embedding2):
            embedding1_np = np.array(embedding1)
            embedding2_np = np.array(embedding2)
            
            cosine_sim = np.dot(embedding1_np, embedding2_np) / (
                np.linalg.norm(embedding1_np) * np.linalg.norm(embedding2_np)
            )
            
            print(f"Cosine similarity for similar queries: {cosine_sim}")
            
            # Similar queries should have higher similarity
            assert cosine_sim > 0.5, f"Embeddings not similar enough ({cosine_sim}) for related queries"


def test_embedding_dimensions(client: TestClient):
    """Test that embeddings have consistent dimensions."""
    
    queries = [
        "short text",
        "this is a much longer text with many more words to test if the embedding size remains constant",
        "🚀 emoji test 🎉",
        "numbers 123 456 789"
    ]
    
    embedding_sizes = []
    
    for query in queries:
        response = client.post(
            "/api/v1/2025/vectors/search",
            json={
                "query": query,
                "search_type": "semantic",
                "max_results": 1
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data.get("results", [])) > 0:
            embedding = data["results"][0].get("embedding")
            if embedding:
                embedding_sizes.append(len(embedding))
                print(f"Query: '{query[:30]}...' -> Embedding size: {len(embedding)}")
    
    # All embeddings should have the same dimension
    if embedding_sizes:
        assert len(set(embedding_sizes)) == 1, f"Inconsistent embedding dimensions: {embedding_sizes}"
        print(f"All embeddings have consistent size: {embedding_sizes[0]}")


def test_empty_query_handling(client: TestClient):
    """Test how the API handles empty queries."""
    
    response = client.post(
        "/api/v1/2025/vectors/search",
        json={
            "query": "",
            "search_type": "semantic",
            "max_results": 1
        }
    )
    
    # Should reject empty query
    assert response.status_code == 422


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])