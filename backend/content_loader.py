import os

def load_content(vulnerability_id):
    """Load markdown content for a vulnerability"""
    content_dir = os.path.join(os.path.dirname(__file__), '..', 'content')
    content_file = os.path.join(content_dir, f"{vulnerability_id}.md")
    
    if not os.path.exists(content_file):
        raise FileNotFoundError(f"Content file not found: {content_file}")
    
    with open(content_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract title from first line if it's a header
    lines = content.split('\n')
    title = ""
    if lines and lines[0].startswith('# '):
        title = lines[0][2:].strip()
    
    return {
        "title": title,
        "content": content
    }