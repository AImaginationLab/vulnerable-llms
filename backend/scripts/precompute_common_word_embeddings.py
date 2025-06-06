#!/usr/bin/env python3
"""
Precompute embeddings for the common words list and save to a .npy cache file.
Run this script once after updating common_words.txt to generate or refresh the cache.
"""
import os
import os, sys
# Pull in numpy compatibility from vector_store
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from vector_store import np
from sentence_transformers import SentenceTransformer

def main():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    wordlist_path = os.path.join(base_dir, 'wordlists', 'common_words.txt')
    emb_cache_path = os.path.join(base_dir, 'wordlists', 'common_words_embs.npy')

    if not os.path.exists(emb_cache_path):
        if not os.path.exists(wordlist_path):
            print(f"Error: word list not found at {wordlist_path}")
            return

        with open(wordlist_path, 'r', encoding='utf-8') as f:
            words = [line.strip() for line in f if line.strip()]

        print(f"Loaded {len(words)} words from {wordlist_path}")
        print("Loading embedding model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')

        print("Encoding words...")
        embeddings = model.encode(words, show_progress_bar=True)
        arr = np.array(embeddings)
        print(f"Saving embeddings to cache file {emb_cache_path}")
        np.save(emb_cache_path, arr)
        print("Done.")
    else:
        print(f"Embeddings loaded from cache at {emb_cache_path}")

if __name__ == '__main__':
    main()
