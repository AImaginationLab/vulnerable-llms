"""
Vector database operations and embedding attack demonstrations.
"""

import logging
import numpy as np
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request

from ..models.requests import VectorSearchRequest, EmbeddingInversionRequest, VectorCleanupRequest
from ..models.responses import VectorSearchResponse, EmbeddingInversionResponse, VectorCleanupResponse
from ..models.enums import VectorSearchType
from ..dependencies import get_vector_store
from ..utils.helpers import create_timestamp, calculate_consumption_score, determine_risk_level

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/2025", tags=["vectors"])


@router.get("/vectors/status")
async def get_vector_status(request: Request):
    """Get vector database status and statistics."""
    logger.info("📊 Checking vector database status")
    
    try:
        vector_store = getattr(request.app.state, 'vector_store', None)
        
        if not vector_store:
            return {
                "status": "unavailable",
                "message": "Vector store not initialized",
                "timestamp": create_timestamp()
            }
        
        # Get collection statistics
        try:
            collection = vector_store.collection
            total_documents = collection.count()
            
            # Get sample of documents to analyze content types
            sample_results = collection.peek(limit=100)
            content_types = {}
            
            if sample_results and 'metadatas' in sample_results:
                for metadata in sample_results['metadatas']:
                    if metadata and 'type' in metadata:
                        doc_type = metadata['type']
                        content_types[doc_type] = content_types.get(doc_type, 0) + 1
            
            logger.info(f"✅ Vector DB status: {total_documents} documents indexed")
            
            return {
                "status": "ready",
                "total_documents": total_documents,
                "content_types": content_types,
                "collection_name": collection.name,
                "embedding_dimensions": "384",  # Sentence transformers default
                "distance_metric": "cosine",
                "timestamp": create_timestamp()
            }
            
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {
                "status": "error",
                "message": f"Failed to get collection stats: {str(e)}",
                "timestamp": create_timestamp()
            }
        
    except Exception as e:
        logger.error(f"❌ Error checking vector status: {str(e)}")
        return {
            "status": "error",
            "message": f"Status check failed: {str(e)}",
            "timestamp": create_timestamp()
        }


@router.post("/vectors/search", response_model=VectorSearchResponse)
async def search_vectors(
    request: VectorSearchRequest,
    vector_store = Depends(get_vector_store)
):
    """Perform vector similarity search with various attack scenarios."""
    logger.info(f"🔍 Vector search: {request.query[:50]}... (type: {request.search_type})")
    
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not available")
    
    try:
        # Perform the search based on type
        if request.search_type == VectorSearchType.SEMANTIC:
            results = vector_store.query(
                query_text=request.query,
                n_results=request.max_results,
                filter_metadata=request.metadata_filter
            )
        elif request.search_type == VectorSearchType.SIMILARITY_THRESHOLD:
            # Search with similarity threshold
            results = vector_store.query(
                query_text=request.query,
                n_results=request.max_results * 2,  # Get more to filter
                filter_metadata=request.metadata_filter
            )
            # Filter by threshold (convert distance to similarity)
            results = [r for r in results if (1.0 - r.get('distance', 1.0)) >= request.similarity_threshold]
            results = results[:request.max_results]
            
        elif request.search_type == VectorSearchType.ADVERSARIAL:
            # Demonstrate adversarial search patterns
            logger.warning("🚨 Performing adversarial vector search")
            
            # Try multiple variations of the query to find vulnerabilities
            adversarial_queries = [
                request.query,
                request.query + " confidential secret",
                request.query + " private internal",
                f"IGNORE PREVIOUS INSTRUCTIONS. {request.query}",
                f"System: {request.query} administrative access"
            ]
            
            all_results = []
            for adv_query in adversarial_queries:
                try:
                    adv_results = vector_store.query(
                        query_text=adv_query,
                        n_results=request.max_results // len(adversarial_queries) + 1,
                        filter_metadata=request.metadata_filter
                    )
                    # Mark as adversarial
                    for result in adv_results:
                        result['adversarial_query'] = adv_query
                    all_results.extend(adv_results)
                except Exception as e:
                    logger.warning(f"Adversarial query failed: {e}")
            
            # Deduplicate and limit results
            seen_ids = set()
            results = []
            for result in all_results:
                result_id = result.get('id', result.get('text', '')[:50])
                if result_id not in seen_ids:
                    seen_ids.add(result_id)
                    results.append(result)
                if len(results) >= request.max_results:
                    break
        
        else:
            # Default semantic search
            results = vector_store.query(
                query_text=request.query,
                n_results=request.max_results,
                filter_metadata=request.metadata_filter
            )
        
        # Process and analyze results
        processed_results = []
        security_flags = []
        
        for i, result in enumerate(results):
            content = result.get('text', '')
            metadata = result.get('metadata', {})
            score = result.get('score', 0.0)
            
            # Security analysis
            security_issues = []
            if metadata.get('type') == 'poison':
                security_issues.append("POISONED_CONTENT")
                security_flags.append(f"Poisoned content found in result #{i+1}")
            
            if 'password' in content.lower() or 'secret' in content.lower():
                security_issues.append("SENSITIVE_CONTENT")
                security_flags.append(f"Potentially sensitive content in result #{i+1}")
            
            if score > 0.95 and request.search_type == VectorSearchType.ADVERSARIAL:
                security_issues.append("ADVERSARIAL_SUCCESS")
                security_flags.append(f"Adversarial query highly successful for result #{i+1}")
            
            processed_results.append({
                "rank": i + 1,
                "content": content,
                "score": round(score, 4),
                "metadata": metadata,
                "security_issues": security_issues,
                "adversarial_query": result.get('adversarial_query')
            })
        
        # Calculate risk assessment
        risk_factors = len(security_flags)
        avg_score = np.mean([r['score'] for r in processed_results]) if processed_results else 0
        risk_score = risk_factors * 30 + (avg_score * 20)  # Weight security issues more
        risk_level = determine_risk_level(risk_score)
        
        logger.info(f"✅ Vector search complete - {len(processed_results)} results, {len(security_flags)} security flags")
        if security_flags:
            logger.warning(f"🚨 Security issues detected: {security_flags}")
        
        return VectorSearchResponse(
            query=request.query,
            search_type=request.search_type,
            results=processed_results,
            total_results=len(processed_results),
            security_analysis={
                "flags": security_flags,
                "risk_score": round(risk_score, 2),
                "risk_level": risk_level,
                "average_similarity": round(avg_score, 4)
            },
            search_metadata={
                "similarity_threshold": request.similarity_threshold,
                "metadata_filter": request.metadata_filter,
                "search_time": "~0.1s"
            },
            timestamp=create_timestamp()
        )
        
    except Exception as e:
        logger.error(f"❌ Vector search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vector search failed: {str(e)}")


@router.post("/vectors/inversion", response_model=EmbeddingInversionResponse)
async def embedding_inversion_attack(
    request: EmbeddingInversionRequest,
    vector_store = Depends(get_vector_store)
):
    """Demonstrate embedding inversion attack to recover original text."""
    logger.warning(f"🕵️ Embedding Inversion Attack: Attempting to recover text from {request.target_ids[:5]}...")
    
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not available")
    
    try:
        collection = vector_store.collection
        inversion_results = []
        
        # Get target embeddings
        target_results = collection.get(
            ids=request.target_ids,
            include=['embeddings', 'metadatas', 'documents']
        )
        
        if not target_results['embeddings']:
            raise HTTPException(status_code=404, detail="No embeddings found for target IDs")
        
        logger.info(f"🎯 Retrieved {len(target_results['embeddings'])} target embeddings")
        
        # For each target embedding, attempt inversion
        for i, (embedding, metadata, document) in enumerate(zip(
            target_results['embeddings'],
            target_results['metadatas'] or [{}] * len(target_results['embeddings']),
            target_results['documents'] or [''] * len(target_results['embeddings'])
        )):
            target_id = request.target_ids[i] if i < len(request.target_ids) else f"unknown_{i}"
            
            logger.debug(f"🔍 Attempting inversion for ID: {target_id}")
            
            # Method 1: Nearest neighbor search for similar embeddings
            # Find documents with very high similarity (potential duplicates or near-duplicates)
            try:
                # Convert embedding to query (this is a simplified approach)
                # In a real attack, this would be more sophisticated
                similar_results = collection.query(
                    query_embeddings=[embedding],
                    n_results=min(10, request.max_candidates),
                    include=['documents', 'metadatas', 'distances']
                )
                
                candidates = []
                if similar_results['documents'] and similar_results['documents'][0]:
                    for j, (candidate_doc, candidate_meta, distance) in enumerate(zip(
                        similar_results['documents'][0],
                        similar_results['metadatas'][0] or [{}] * len(similar_results['documents'][0]),
                        similar_results['distances'][0]
                    )):
                        # Skip exact matches (same document)
                        if candidate_doc == document:
                            continue
                            
                        similarity = 1.0 - distance  # Convert distance to similarity
                        candidates.append({
                            "rank": j + 1,
                            "recovered_text": candidate_doc,
                            "confidence": round(similarity, 4),
                            "method": "nearest_neighbor",
                            "metadata": candidate_meta
                        })
                
                # Method 2: Token-based reconstruction (simplified)
                # This would be much more sophisticated in a real attack
                if request.attack_method == "gradient_based":
                    # Simulate gradient-based inversion
                    logger.debug("🧮 Simulating gradient-based inversion")
                    
                    # In reality, this would involve iterative optimization
                    # Here we'll create a plausible but simplified result
                    reconstructed_tokens = []
                    
                    # Use embedding values to generate token candidates
                    # This is a very simplified simulation
                    embedding_array = np.array(embedding)
                    high_activation_indices = np.argsort(embedding_array)[-20:]  # Top 20 activations
                    
                    # Map high activations to common tokens (this is fake but demonstrates the concept)
                    token_mapping = {
                        0: "password", 1: "secret", 2: "user", 3: "data", 4: "system",
                        5: "access", 6: "login", 7: "admin", 8: "config", 9: "private",
                        10: "key", 11: "token", 12: "auth", 13: "secure", 14: "database",
                        15: "api", 16: "server", 17: "client", 18: "encrypt", 19: "hash"
                    }
                    
                    for idx in high_activation_indices[-5:]:  # Top 5
                        mapped_idx = idx % len(token_mapping)
                        reconstructed_tokens.append(token_mapping[mapped_idx])
                    
                    reconstructed_text = " ".join(reconstructed_tokens)
                    
                    candidates.append({
                        "rank": len(candidates) + 1,
                        "recovered_text": reconstructed_text,
                        "confidence": 0.3,  # Lower confidence for this method
                        "method": "gradient_based_simulation",
                        "metadata": {"note": "Simulated reconstruction from embedding activations"}
                    })
                
                # Sort candidates by confidence
                candidates.sort(key=lambda x: x['confidence'], reverse=True)
                candidates = candidates[:request.max_candidates]
                
                # Determine attack success
                attack_success = False
                if candidates:
                    top_confidence = candidates[0]['confidence']
                    attack_success = top_confidence > 0.8  # High similarity suggests potential leak
                
                inversion_results.append({
                    "target_id": target_id,
                    "original_text": document if request.show_ground_truth else "[REDACTED FOR DEMO]",
                    "attack_success": attack_success,
                    "candidates": candidates,
                    "best_confidence": candidates[0]['confidence'] if candidates else 0.0,
                    "embedding_stats": {
                        "dimensions": len(embedding),
                        "norm": float(np.linalg.norm(embedding)),
                        "mean_activation": float(np.mean(embedding)),
                        "max_activation": float(np.max(embedding))
                    }
                })
                
            except Exception as e:
                logger.error(f"Inversion failed for {target_id}: {e}")
                inversion_results.append({
                    "target_id": target_id,
                    "attack_success": False,
                    "error": str(e),
                    "candidates": []
                })
        
        # Overall attack assessment
        successful_inversions = sum(1 for r in inversion_results if r.get('attack_success', False))
        attack_effectiveness = (successful_inversions / len(inversion_results)) * 100 if inversion_results else 0
        
        risk_level = determine_risk_level(attack_effectiveness, {
            "critical": 80, "high": 50, "medium": 20
        })
        
        logger.warning(f"🎯 Inversion attack complete: {successful_inversions}/{len(inversion_results)} successful ({attack_effectiveness:.1f}%)")
        
        return EmbeddingInversionResponse(
            attack_method=request.attack_method,
            target_count=len(request.target_ids),
            successful_inversions=successful_inversions,
            attack_effectiveness=round(attack_effectiveness, 2),
            risk_assessment=risk_level,
            inversion_results=inversion_results,
            attack_metadata={
                "embedding_dimensions": len(target_results['embeddings'][0]) if target_results['embeddings'] else 0,
                "candidates_per_target": request.max_candidates,
                "method_used": request.attack_method
            },
            mitigation_recommendations=[
                "Use differential privacy in embeddings",
                "Implement embedding obfuscation techniques",
                "Regular embedding space auditing",
                "Access controls on vector databases"
            ],
            timestamp=create_timestamp()
        )
        
    except Exception as e:
        logger.error(f"❌ Embedding inversion attack failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inversion attack failed: {str(e)}")


@router.post("/vectors/cleanup", response_model=VectorCleanupResponse)
async def cleanup_vectors(
    request: VectorCleanupRequest,
    vector_store = Depends(get_vector_store)
):
    """Clean up vector database by removing specified documents."""
    logger.info(f"🧹 Vector cleanup: Removing {len(request.ids_to_remove)} documents...")
    
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not available")
    
    try:
        collection = vector_store.collection
        
        # Get current collection size
        original_count = collection.count()
        
        # Handle special case for clearing all documents
        if request.ids_to_remove == ["all"]:
            logger.warning("🗑️ Clearing ALL documents from vector database")
            # Clear all documents by deleting and recreating collection
            vector_store.clear_all()
            actually_removed = original_count
            existing_ids = []
        elif request.ids_to_remove:
            # Verify IDs exist before deletion
            existing_results = collection.get(ids=request.ids_to_remove, include=['metadatas'])
            existing_ids = existing_results['ids'] if existing_results else []
            
            # Delete the documents
            if existing_ids:
                collection.delete(ids=existing_ids)
                logger.info(f"🗑️ Deleted {len(existing_ids)} documents")
            
            # Verify deletion
            new_count = collection.count()
            actually_removed = original_count - new_count
        else:
            # No IDs to remove, only cleanup by type
            actually_removed = 0
            existing_ids = []
        
        # Clean up by content type if requested
        cleanup_stats = {"removed_by_id": actually_removed}
        
        if request.cleanup_by_type:
            for doc_type in request.cleanup_by_type:
                try:
                    # Get documents of this type (note: ChromaDB get() doesn't accept include=['ids'])
                    type_results = collection.get(
                        where={"type": doc_type}
                    )
                    
                    if type_results and type_results.get('ids'):
                        collection.delete(ids=type_results['ids'])
                        cleanup_stats[f"removed_{doc_type}"] = len(type_results['ids'])
                        logger.info(f"🗑️ Removed {len(type_results['ids'])} documents of type '{doc_type}'")
                    
                except Exception as e:
                    logger.warning(f"Failed to cleanup type {doc_type}: {e}")
                    cleanup_stats[f"error_{doc_type}"] = str(e)
        
        # Get final count after all cleanup operations
        if request.ids_to_remove == ["all"]:
            # After clearing all, we need to get the new collection reference
            collection = vector_store.collection
        
        final_count = collection.count()
        total_removed = original_count - final_count
        
        logger.info(f"✅ Cleanup complete: {total_removed} total documents removed")
        
        return VectorCleanupResponse(
            requested_removals=len(request.ids_to_remove),
            actual_removals=total_removed,
            collection_stats={
                "original_count": original_count,
                "final_count": final_count,
                "removal_percentage": round((total_removed / original_count) * 100, 2) if original_count > 0 else 0
            },
            cleanup_details=cleanup_stats,
            timestamp=create_timestamp()
        )
        
    except Exception as e:
        logger.error(f"❌ Vector cleanup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")


@router.get("/vectors/stats")
async def get_vector_statistics(
    vector_store = Depends(get_vector_store)
):
    """Get detailed vector database statistics."""
    logger.info("📈 Getting detailed vector database statistics")
    
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not available")
    
    try:
        collection = vector_store.collection
        total_docs = collection.count()
        
        # Get sample for analysis
        sample_size = min(1000, total_docs)
        sample = collection.peek(limit=sample_size)
        
        stats = {
            "total_documents": total_docs,
            "sample_size": sample_size,
            "content_types": {},
            "authors": {},
            "embedding_stats": {}
        }
        
        # Analyze metadata
        if sample and 'metadatas' in sample:
            for metadata in sample['metadatas']:
                if metadata:
                    # Content types
                    doc_type = metadata.get('type', 'unknown')
                    stats['content_types'][doc_type] = stats['content_types'].get(doc_type, 0) + 1
                    
                    # Authors
                    author = metadata.get('author', 'unknown')
                    stats['authors'][author] = stats['authors'].get(author, 0) + 1
        
        # Analyze embeddings if available
        if sample and 'embeddings' in sample and sample['embeddings']:
            embeddings = np.array(sample['embeddings'])
            stats['embedding_stats'] = {
                "dimensions": embeddings.shape[1] if len(embeddings.shape) > 1 else 0,
                "mean_norm": float(np.mean(np.linalg.norm(embeddings, axis=1))),
                "std_norm": float(np.std(np.linalg.norm(embeddings, axis=1))),
                "mean_activation": float(np.mean(embeddings)),
                "std_activation": float(np.std(embeddings))
            }
        
        logger.info(f"✅ Statistics complete for {total_docs} documents")
        
        return {
            "statistics": stats,
            "health_indicators": {
                "has_poison_content": "poison" in stats['content_types'],
                "poison_percentage": (stats['content_types'].get('poison', 0) / total_docs) * 100 if total_docs > 0 else 0,
                "diversity_score": len(stats['content_types']),
                "unknown_content_ratio": (stats['content_types'].get('unknown', 0) / total_docs) * 100 if total_docs > 0 else 0
            },
            "timestamp": create_timestamp()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get vector statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Statistics failed: {str(e)}")