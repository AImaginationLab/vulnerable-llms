"""
GitHub API client for scraping public repositories, issues, and pull requests.
Supports extracting comments and content for indirect prompt injection demos.
"""

import requests
import logging
from typing import List, Dict, Optional, Union
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class GitHubScraper:
    """
    GitHub API client for scraping public content.
    No authentication required for public repositories.
    """
    
    def __init__(self, base_url: str = "https://api.github.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'VulnerableLLMs-Demo-App'
        })
    
    def parse_github_url(self, url: str) -> Dict[str, str]:
        """
        Parse GitHub URL to extract owner, repo, and resource type.
        
        Supports:
        - https://github.com/owner/repo/issues/123
        - https://github.com/owner/repo/pull/456
        - https://github.com/owner/repo
        """
        patterns = {
            'issue': r'github\.com/([^/]+)/([^/]+)/issues/(\d+)',
            'pull': r'github\.com/([^/]+)/([^/]+)/pull/(\d+)',
            'repo': r'github\.com/([^/]+)/([^/]+)/?$'
        }
        
        for resource_type, pattern in patterns.items():
            match = re.search(pattern, url)
            if match:
                if resource_type == 'repo':
                    return {
                        'type': 'repo',
                        'owner': match.group(1),
                        'repo': match.group(2)
                    }
                else:
                    return {
                        'type': resource_type,
                        'owner': match.group(1),
                        'repo': match.group(2),
                        'number': int(match.group(3))
                    }
        
        raise ValueError(f"Invalid GitHub URL format: {url}")
    
    def get_issue(self, owner: str, repo: str, issue_number: int) -> Dict:
        """Get issue details including body and metadata."""
        url = f"{self.base_url}/repos/{owner}/{repo}/issues/{issue_number}"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()
    
    def get_pull_request(self, owner: str, repo: str, pr_number: int) -> Dict:
        """Get pull request details including body and metadata."""
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()
    
    def get_issue_comments(self, owner: str, repo: str, issue_number: int) -> List[Dict]:
        """Get all comments for an issue."""
        url = f"{self.base_url}/repos/{owner}/{repo}/issues/{issue_number}/comments"
        comments = []
        page = 1
        
        while True:
            response = self.session.get(url, params={'page': page, 'per_page': 100})
            response.raise_for_status()
            
            page_comments = response.json()
            if not page_comments:
                break
                
            comments.extend(page_comments)
            page += 1
            
            # Safety limit
            if page > 10:
                logger.warning(f"Stopped pagination at page {page} for safety")
                break
        
        return comments
    
    def get_pull_request_comments(self, owner: str, repo: str, pr_number: int) -> List[Dict]:
        """Get all comments for a pull request (issue comments + review comments)."""
        # Get issue comments (general PR comments)
        issue_comments = self.get_issue_comments(owner, repo, pr_number)
        
        # Get review comments (code-specific comments)
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/comments"
        review_comments = []
        page = 1
        
        while True:
            response = self.session.get(url, params={'page': page, 'per_page': 100})
            response.raise_for_status()
            
            page_comments = response.json()
            if not page_comments:
                break
                
            # Mark as review comments
            for comment in page_comments:
                comment['comment_type'] = 'review'
            
            review_comments.extend(page_comments)
            page += 1
            
            if page > 10:
                logger.warning(f"Stopped pagination at page {page} for safety")
                break
        
        # Mark issue comments
        for comment in issue_comments:
            comment['comment_type'] = 'issue'
        
        return issue_comments + review_comments
    
    def get_repository_issues(self, owner: str, repo: str, limit: int = 50) -> List[Dict]:
        """Get recent issues from a repository."""
        url = f"{self.base_url}/repos/{owner}/{repo}/issues"
        response = self.session.get(url, params={
            'state': 'all',
            'sort': 'updated',
            'per_page': min(limit, 100)
        })
        response.raise_for_status()
        return response.json()
    
    def scrape_from_url(self, github_url: str) -> Dict[str, Union[List[Dict], Dict]]:
        """
        Scrape content from any GitHub URL.
        Returns structured data ready for vector embedding.
        """
        try:
            parsed = self.parse_github_url(github_url)
            logger.info(f"Scraping {parsed['type']} from {github_url}")
            
            if parsed['type'] == 'issue':
                return self._scrape_issue(parsed['owner'], parsed['repo'], parsed['number'])
            elif parsed['type'] == 'pull':
                return self._scrape_pull_request(parsed['owner'], parsed['repo'], parsed['number'])
            elif parsed['type'] == 'repo':
                return self._scrape_repository(parsed['owner'], parsed['repo'])
            else:
                raise ValueError(f"Unsupported resource type: {parsed['type']}")
                
        except Exception as e:
            logger.error(f"Error scraping {github_url}: {e}")
            raise
    
    def _scrape_issue(self, owner: str, repo: str, issue_number: int) -> Dict:
        """Scrape issue and all its comments."""
        issue = self.get_issue(owner, repo, issue_number)
        comments = self.get_issue_comments(owner, repo, issue_number)
        
        return {
            'type': 'issue',
            'url': issue['html_url'],
            'title': issue['title'],
            'body': issue['body'] or '',
            'author': issue['user']['login'],
            'created_at': issue['created_at'],
            'updated_at': issue['updated_at'],
            'comments': [
                {
                    'id': comment['id'],
                    'body': comment['body'],
                    'author': comment['user']['login'],
                    'created_at': comment['created_at'],
                    'updated_at': comment['updated_at']
                }
                for comment in comments
            ]
        }
    
    def _scrape_pull_request(self, owner: str, repo: str, pr_number: int) -> Dict:
        """Scrape pull request and all its comments."""
        pr = self.get_pull_request(owner, repo, pr_number)
        comments = self.get_pull_request_comments(owner, repo, pr_number)
        
        return {
            'type': 'pull_request',
            'url': pr['html_url'],
            'title': pr['title'],
            'body': pr['body'] or '',
            'author': pr['user']['login'],
            'created_at': pr['created_at'],
            'updated_at': pr['updated_at'],
            'comments': [
                {
                    'id': comment['id'],
                    'body': comment['body'],
                    'author': comment['user']['login'],
                    'created_at': comment['created_at'],
                    'updated_at': comment['updated_at'],
                    'comment_type': comment.get('comment_type', 'unknown'),
                    'path': comment.get('path'),  # For review comments
                    'position': comment.get('position')  # For review comments
                }
                for comment in comments
            ]
        }
    
    def _scrape_repository(self, owner: str, repo: str, limit: int = 20) -> Dict:
        """Scrape recent issues from a repository."""
        issues = self.get_repository_issues(owner, repo, limit)
        
        scraped_issues = []
        for issue in issues:
            # Skip pull requests (they show up in issues API)
            if 'pull_request' in issue:
                continue
                
            try:
                issue_data = self._scrape_issue(owner, repo, issue['number'])
                scraped_issues.append(issue_data)
            except Exception as e:
                logger.warning(f"Failed to scrape issue #{issue['number']}: {e}")
                continue
        
        return {
            'type': 'repository',
            'owner': owner,
            'repo': repo,
            'issues': scraped_issues
        }
    
    def extract_text_content(self, scraped_data: Dict) -> List[Dict[str, str]]:
        """
        Extract text content suitable for vector embedding.
        Returns list of text chunks with metadata.
        """
        chunks = []
        
        if scraped_data['type'] in ['issue', 'pull_request']:
            # Main issue/PR body
            if scraped_data['body'].strip():
                chunks.append({
                    'text': f"Title: {scraped_data['title']}\n\nBody: {scraped_data['body']}",
                    'type': scraped_data['type'],
                    'author': scraped_data['author'],
                    'url': scraped_data['url'],
                    'created_at': scraped_data['created_at']
                })
            
            # Comments
            for comment in scraped_data['comments']:
                if comment['body'].strip():
                    chunks.append({
                        'text': comment['body'],
                        'type': f"{scraped_data['type']}_comment",
                        'author': comment['author'],
                        'url': scraped_data['url'],
                        'created_at': comment['created_at'],
                        'comment_id': comment['id']
                    })
        
        elif scraped_data['type'] == 'repository':
            # Process all issues in repository
            for issue in scraped_data['issues']:
                issue_chunks = self.extract_text_content(issue)
                chunks.extend(issue_chunks)
        
        return chunks


# Example usage for testing
