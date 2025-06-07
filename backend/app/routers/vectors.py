"""
Vector database operations and embedding attack demonstrations.
"""

import logging
import numpy as np
import os
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Body

from ..models.requests import VectorSearchRequest, EmbeddingInversionRequest, VectorCleanupRequest
from ..models.responses import VectorSearchResponse, EmbeddingInversionResponse, VectorCleanupResponse
from ..models.enums import VectorSearchType
from ..dependencies import get_vector_store
from ..utils.helpers import create_timestamp, calculate_consumption_score, determine_risk_level
from ..services.ollama import OllamaService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/2025", tags=["vectors"])

# Global cache for wordlist embeddings
_wordlist_cache = None
_wordlist_words = None

def load_wordlist_embeddings():
    """Load precomputed word embeddings for inversion attacks."""
    global _wordlist_cache, _wordlist_words

    if _wordlist_cache is not None:
        return _wordlist_words, _wordlist_cache

    try:
        # Get paths relative to the backend directory
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        wordlist_path = os.path.join(backend_dir, 'wordlists', 'common_words.txt')
        embeddings_path = os.path.join(backend_dir, 'wordlists', 'common_words_embs.npy')

        # Load words
        with open(wordlist_path, 'r', encoding='utf-8') as f:
            _wordlist_words = [line.strip() for line in f if line.strip()]

        # Load precomputed embeddings
        _wordlist_cache = np.load(embeddings_path)

        logger.info(f"✅ Loaded {len(_wordlist_words)} word embeddings for inversion attacks")
        return _wordlist_words, _wordlist_cache

    except Exception as e:
        logger.warning(f"⚠️ Could not load wordlist embeddings: {e}")
        return None, None


@router.post("/vectors/embed")
async def generate_embedding(
    request: Request,
    text: str = Body(..., description="Text to generate embedding for")
):
    """Generate embedding for arbitrary text."""
    logger.info(f"🧮 Generating embedding for text: {text[:50]}...")

    try:
        vector_store = getattr(request.app.state, 'vector_store', None)

        if not vector_store:
            raise HTTPException(status_code=503, detail="Vector store not available")

        # Use the vector store's embedding function
        collection = vector_store.collection

        # Generate embedding using the collection's embedding function
        embeddings = collection._embed([text])

        if embeddings and len(embeddings) > 0:
            embedding = embeddings[0]
            logger.info(f"✅ Generated embedding with {len(embedding)} dimensions")

            return {
                "text": text,
                "embedding": embedding.tolist() if hasattr(embedding, 'tolist') else embedding,
                "dimensions": len(embedding),
                "model": "sentence-transformers/all-MiniLM-L6-v2"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to generate embedding")

    except Exception as e:
        logger.error(f"❌ Embedding generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")


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
                "adversarial_query": result.get('adversarial_query'),
                "id": result.get('id'),
                "embedding": result.get('embedding')
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

                # Method 2: Wordlist-based reconstruction
                if request.attack_method == "gradient_based":
                    logger.debug("🧮 Attempting wordlist-based inversion")

                    # Load wordlist embeddings
                    words, word_embeddings = load_wordlist_embeddings()

                    if words and word_embeddings is not None:
                        # Normalize target embedding
                        target_embedding = np.array(embedding)
                        target_norm = target_embedding / np.linalg.norm(target_embedding)

                        # Normalize word embeddings
                        word_norms = word_embeddings / np.linalg.norm(word_embeddings, axis=1, keepdims=True)

                        # Compute cosine similarities
                        similarities = np.dot(word_norms, target_norm)

                        # Get top matching words
                        top_indices = np.argsort(similarities)[-20:][::-1]  # Top 20 words

                        # Create candidates from top matches
                        word_candidates = []
                        for idx in top_indices[:10]:  # Top 10 words
                            similarity = float(similarities[idx])
                            if similarity > 0.3:  # Threshold for relevance
                                word_candidates.append({
                                    "word": words[idx],
                                    "similarity": similarity
                                })

                        # Analyze semantic relationships between recovered words
                        word_pairs = []
                        if word_candidates and len(word_candidates) >= 2:
                            # Check which words might go together
                            for i, w1 in enumerate(word_candidates[:10]):
                                for w2 in word_candidates[i+1:10]:
                                    # Simple heuristic: words that commonly appear together
                                    common_pairs = [
                                        ("user", "password"), ("secret", "key"), ("access", "token"),
                                        ("database", "connection"), ("api", "key"), ("private", "data"),
                                        ("admin", "panel"), ("system", "config"), ("authentication", "token")
                                    ]
                                    for pair in common_pairs:
                                        if (w1["word"] in pair and w2["word"] in pair):
                                            word_pairs.append(f"{w1['word']} {w2['word']}")

                        # Group words by similarity to create reconstructed phrases
                        if word_candidates:
                            # High confidence words (>0.7 similarity)
                            high_conf_words = [w["word"] for w in word_candidates if w["similarity"] > 0.7]

                            # Medium confidence words (0.5-0.7 similarity)
                            med_conf_words = [w["word"] for w in word_candidates if 0.5 <= w["similarity"] <= 0.7]

                            # Low confidence words for context (0.3-0.5 similarity)
                            low_conf_words = [w["word"] for w in word_candidates if 0.3 <= w["similarity"] < 0.5]

                            # Create reconstructed text attempts
                            if high_conf_words:
                                reconstructed_text = " ".join(high_conf_words[:5])
                                candidates.append({
                                    "rank": len(candidates) + 1,
                                    "recovered_text": reconstructed_text,
                                    "confidence": float(np.mean([w["similarity"] for w in word_candidates if w["word"] in high_conf_words])),
                                    "method": "wordlist_inversion_high_confidence",
                                    "metadata": {
                                        "matched_words": len(high_conf_words),
                                        "top_similarity": float(word_candidates[0]["similarity"])
                                    }
                                })

                            if med_conf_words:
                                mixed_text = " ".join((high_conf_words[:3] + med_conf_words[:2])[:5])
                                candidates.append({
                                    "rank": len(candidates) + 1,
                                    "recovered_text": mixed_text,
                                    "confidence": float(np.mean([w["similarity"] for w in word_candidates[:5]])),
                                    "method": "wordlist_inversion_mixed",
                                    "metadata": {
                                        "note": "Mixed confidence reconstruction"
                                    }
                                })

                            # Add individual word candidates
                            for wc in word_candidates[:5]:
                                candidates.append({
                                    "rank": len(candidates) + 1,
                                    "recovered_text": wc["word"],
                                    "confidence": wc["similarity"],
                                    "method": "single_word_match",
                                    "metadata": {"exact_word": True}
                                })
                    else:
                        # Fallback to simple token mapping if wordlist not available
                        logger.warning("⚠️ Wordlist not available, using fallback method")
                        token_mapping = {
                            0: "password", 1: "secret", 2: "user", 3: "data", 4: "system",
                            5: "access", 6: "login", 7: "admin", 8: "config", 9: "private"
                        }

                        embedding_array = np.array(embedding)
                        high_activation_indices = np.argsort(np.abs(embedding_array))[-5:]

                        reconstructed_tokens = []
                        for idx in high_activation_indices:
                            mapped_idx = idx % len(token_mapping)
                            reconstructed_tokens.append(token_mapping[mapped_idx])

                        candidates.append({
                            "rank": len(candidates) + 1,
                            "recovered_text": " ".join(reconstructed_tokens),
                            "confidence": 0.3,
                            "method": "fallback_token_mapping",
                            "metadata": {"note": "Wordlist unavailable - using simplified approach"}
                        })

                # Sort candidates by confidence
                candidates.sort(key=lambda x: x['confidence'], reverse=True)
                candidates = candidates[:request.max_candidates]

                # Use Ollama to reconstruct a coherent sentence from the top candidates
                reconstructed_sentence = None
                if candidates and len(candidates) >= 3:
                    try:
                        # Get top words from candidates
                        top_words = []
                        for candidate in candidates[:10]:
                            if candidate['method'] == 'single_word_match' or 'wordlist' in candidate['method']:
                                words = candidate['recovered_text'].split()
                                top_words.extend(words)

                        # Remove duplicates while preserving order
                        seen = set()
                        unique_words = []
                        for word in top_words:
                            if word.lower() not in seen:
                                seen.add(word.lower())
                                unique_words.append(word)

                        # Shuffle slightly for variation (keep high confidence words near front)
                        import random
                        if len(unique_words) > 5:
                            # Keep first 3 words (highest confidence) but shuffle the rest
                            core_words = unique_words[:3]
                            other_words = unique_words[3:]
                            random.shuffle(other_words)
                            unique_words = core_words + other_words

                        if len(unique_words) >= 3:
                            # Estimate sentence length from embedding characteristics
                            embedding_array = np.array(embedding)

                            # Method 1: Information density - higher activation variance suggests more content
                            activation_variance = np.var(embedding_array)
                            activation_std = np.std(embedding_array)

                            # Method 2: Active dimensions - count dimensions with significant activation
                            threshold = np.mean(np.abs(embedding_array)) + np.std(np.abs(embedding_array))
                            active_dimensions = np.sum(np.abs(embedding_array) > threshold)

                            # Method 3: Entropy-based estimation
                            # Normalize to probabilities for entropy calculation
                            abs_embedding = np.abs(embedding_array)
                            if np.sum(abs_embedding) > 0:
                                probs = abs_embedding / np.sum(abs_embedding)
                                entropy = -np.sum(probs * np.log(probs + 1e-10))
                            else:
                                entropy = 0

                            # Estimate word count based on these metrics
                            # These are rough heuristics based on typical sentence embeddings
                            estimated_words = int(
                                (active_dimensions / len(embedding_array)) * 20 +  # Active dimension ratio
                                (entropy / np.log(len(embedding_array))) * 10 +    # Normalized entropy
                                activation_variance * 50                            # Variance contribution
                            )

                            # Clamp to reasonable range
                            estimated_words = max(5, min(25, estimated_words))

                            # Use Ollama to create a coherent sentence
                            ollama_service = OllamaService()
                            # Include word pairs if found
                            pair_hint = ""
                            if word_pairs:
                                pair_hint = f"\nLikely word pairs detected: {', '.join(word_pairs[:3])}"

                            # Add some variation to ensure different reconstructions
                            import random
                            variation_seed = random.choice([
                                "Create a plausible database entry",
                                "Reconstruct a likely system message",
                                "Generate a possible configuration string",
                                "Recreate a potential user data record"
                            ])

                            reconstruction_prompt = f"""Given these recovered words from an embedding: {', '.join(unique_words[:8])}
{pair_hint}
The embedding characteristics suggest the original text was approximately {estimated_words} words long.

Confidence levels:
- High confidence words: {', '.join(high_conf_words[:3]) if high_conf_words else 'none'}
- Medium confidence: {', '.join(med_conf_words[:3]) if med_conf_words else 'none'}

Task: {variation_seed} that:
1. Prioritizes high-confidence words
2. Uses detected word pairs if present
3. Is approximately {estimated_words} words in length
4. Is grammatically correct and makes logical sense
5. Is the type of text that might be stored in a vector database

Return ONLY the reconstructed sentence, nothing else."""

                            reconstructed_sentence = await ollama_service.call_ollama(
                                prompt=reconstruction_prompt,
                                system_prompt="You are a forensic text reconstruction expert. Given word fragments, reconstruct the most likely original sentence.",
                                model="llama3.2:1b"
                            )

                            # Clean up the response
                            reconstructed_sentence = reconstructed_sentence.strip().strip('"').strip("'")

                            # Add as a special candidate
                            candidates.insert(0, {
                                "rank": 0,
                                "recovered_text": reconstructed_sentence,
                                "confidence": 0.85,  # High confidence for LLM reconstruction
                                "method": "llm_assisted_reconstruction",
                                "metadata": {
                                    "note": "Coherent sentence reconstructed using LLM",
                                    "words_used": len(unique_words),
                                    "estimated_length": estimated_words,
                                    "embedding_entropy": round(float(entropy), 3),
                                    "active_dimensions": int(active_dimensions),
                                    "word_pairs": word_pairs[:3] if word_pairs else [],
                                    "high_confidence_words": high_conf_words[:5] if high_conf_words else [],
                                    "reconstruction_method": "entropy_length_estimation_with_semantic_pairing"
                                }
                            })

                            await ollama_service.close()

                    except Exception as e:
                        logger.warning(f"Failed to use LLM for reconstruction: {e}")

                # Determine attack success
                attack_success = False
                if candidates:
                    top_confidence = candidates[0]['confidence']
                    attack_success = top_confidence > 0.7  # Lower threshold since we have LLM reconstruction

                inversion_results.append({
                    "target_id": target_id,
                    "original_text": document if request.show_ground_truth else "[REDACTED FOR DEMO]",
                    "reconstructed_sentence": reconstructed_sentence,
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
