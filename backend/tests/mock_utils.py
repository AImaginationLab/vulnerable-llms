"""
Reusable mock utilities for testing.
"""

from unittest.mock import MagicMock, AsyncMock
import numpy as np


def create_mock_ollama_service():
    """Create a mock Ollama service."""
    mock_ollama = MagicMock()
    mock_ollama.call_ollama = AsyncMock(return_value="Test response from LLM")
    mock_ollama.close = AsyncMock(return_value=None)
    return mock_ollama


def create_mock_vector_store():
    """Create a mock vector store with realistic behavior."""
    mock_store = MagicMock()
    mock_collection = MagicMock()
    
    # Mock collection methods
    mock_collection.count.return_value = 100
    mock_collection.peek.return_value = {
        'metadatas': [
            {'type': 'document', 'author': 'user1'},
            {'type': 'poison', 'author': 'attacker'},
            {'type': 'document', 'author': 'user2'}
        ],
        'documents': [
            'Sample document 1',
            'Malicious content with secrets',
            'Sample document 2'
        ],
        'embeddings': [
            [0.1, 0.2, 0.3, 0.4] * 96,  # 384 dimensions
            [0.5, 0.6, 0.7, 0.8] * 96,
            [0.2, 0.3, 0.4, 0.5] * 96
        ],
        'ids': ['doc1', 'doc2', 'doc3']
    }
    
    # Mock get method for specific IDs
    def mock_get(ids=None, include=None, where=None):
        if where and where.get('type') == 'poison':
            return {
                'ids': ['poison1', 'poison2'],
                'documents': ['Malicious doc 1', 'Malicious doc 2'],
                'metadatas': [{'type': 'poison'}, {'type': 'poison'}],
                'embeddings': [[0.5, 0.6, 0.7, 0.8] * 96] * 2
            }
        
        if ids:
            # Return mock data for requested IDs
            mock_docs = []
            mock_metas = []
            mock_embeds = []
            for idx, doc_id in enumerate(ids):
                mock_docs.append(f'Document for {doc_id}')
                mock_metas.append({'type': 'document', 'id': doc_id})
                mock_embeds.append([0.1 + idx * 0.1] * 384)
            
            return {
                'ids': ids,
                'documents': mock_docs,
                'metadatas': mock_metas,
                'embeddings': mock_embeds
            }
        
        return mock_collection.peek.return_value
    
    mock_collection.get = mock_get
    
    # Mock delete method
    def mock_delete(ids):
        # Just return without error
        pass
    
    mock_collection.delete = mock_delete
    
    # Mock embedding function
    def mock_embed(texts):
        # Return different embeddings for different texts
        embeddings = []
        for text in texts:
            if 'cat' in text.lower() or 'dog' in text.lower() or 'animal' in text.lower() or 'pet' in text.lower():
                embeddings.append([0.1, 0.2, 0.3] * 128)  # 384 dims
            elif 'computer' in text.lower() or 'technology' in text.lower() or 'software' in text.lower() or 'programming' in text.lower():
                embeddings.append([0.4, 0.5, 0.6] * 128)
            elif 'password' in text.lower() or 'secret' in text.lower() or 'auth' in text.lower() or 'security' in text.lower():
                embeddings.append([0.7, 0.8, 0.9] * 128)
            else:
                # Default embedding with some variation based on text hash
                text_hash = abs(hash(text)) % 1000 / 1000.0
                base = text_hash
                embeddings.append([base, base + 0.1, base + 0.2] * 128)
        return embeddings
    
    mock_collection._embed = mock_embed
    
    # Mock query for embeddings
    def mock_query_embeddings(query_embeddings, n_results=5, include=None):
        # Return similar documents based on embedding
        results = {
            'documents': [['Similar doc 1', 'Similar doc 2']],
            'metadatas': [[{'type': 'document'}, {'type': 'document'}]],
            'distances': [[0.1, 0.2]],
            'ids': [['similar1', 'similar2']]
        }
        return results
    
    mock_collection.query = mock_query_embeddings
    
    # Mock query results
    def mock_query(query_text=None, query_embeddings=None, n_results=5, filter_metadata=None, **kwargs):
        if query_embeddings:
            return mock_query_embeddings(query_embeddings, n_results, kwargs.get('include'))
            
        results = []
        
        # Simulate different results based on query
        if query_text:
            if 'password' in query_text.lower() or 'secret' in query_text.lower() or 'auth' in query_text.lower() or 'security' in query_text.lower():
                results = [
                    {
                        'text': 'User password: admin123',
                        'metadata': {'type': 'poison', 'sensitive': True},
                        'score': 0.95,
                        'distance': 0.05,
                        'id': 'doc1',
                        'embedding': [0.7, 0.8, 0.9] * 128
                    }
                ]
            elif 'error' in query_text.lower():
                # Simulate an error case
                raise Exception("Simulated query error")
            else:
                # Generate embedding using the same logic as mock_embed
                embedding = mock_embed([query_text])[0]
                results = [
                    {
                        'text': 'Sample document about ' + query_text,
                        'metadata': {'type': 'document'},
                        'score': 0.85,
                        'distance': 0.15,
                        'id': 'doc2',
                        'embedding': embedding
                    }
                ]
        
        return results[:n_results]
    
    # Mock clear_all method
    def mock_clear_all():
        mock_collection.count.return_value = 0
        
    mock_store.query = mock_query
    mock_store.collection = mock_collection
    mock_store.clear_all = mock_clear_all
    
    return mock_store


def create_mock_rag_system():
    """Create a mock RAG system."""
    mock_rag = MagicMock()
    mock_rag.query = AsyncMock(return_value={
        'answer': 'Test RAG response',
        'sources': ['source1.md', 'source2.md'],
        'confidence': 0.85
    })
    return mock_rag


def create_mock_github_scraper():
    """Create a mock GitHub scraper."""
    mock_scraper = MagicMock()
    mock_scraper.scrape_repo = AsyncMock(return_value={
        'files': ['file1.py', 'file2.py'],
        'content': 'Mock scraped content'
    })
    return mock_scraper


def create_mock_content_loader():
    """Create a mock content loader."""
    mock_loader = MagicMock()
    mock_loader.load_content = MagicMock(return_value={
        'LLM01_2025': 'Content for LLM01',
        'LLM02_2025': 'Content for LLM02'
    })
    return mock_loader


def override_dependencies(app, mock_services):
    """Override app dependencies with mocks."""
    from app.dependencies import get_ollama_service, get_vector_store
    
    if 'ollama' in mock_services:
        app.dependency_overrides[get_ollama_service] = lambda: mock_services['ollama']
    
    if 'vector_store' in mock_services:
        app.dependency_overrides[get_vector_store] = lambda: mock_services['vector_store']
    
    # Set app state attributes if needed
    for service_name, service_mock in mock_services.items():
        if hasattr(app.state, service_name):
            setattr(app.state, service_name, service_mock)