#!/usr/bin/env python3
import sys
import re
import git_filter_repo as fr

def filter_sensitive_data(filter_context):
    # Patterns to remove
    patterns = [
        r'sk-[a-zA-Z0-9]+',  # OpenAI API key pattern
        r'AKIAI[A-Z0-9]+',   # AWS Access Key ID pattern
        r'[A-Za-z0-9+/]{40}' # Generic secret/key pattern
    ]

    for commit in filter_context.commits:
        for change in commit.file_changes:
            try:
                # Decode file content
                content = change.file_content.decode('utf-8')
                
                # Check if content contains sensitive data
                for pattern in patterns:
                    if re.search(pattern, content):
                        # Replace sensitive data
                        content = re.sub(pattern, '[REDACTED]', content)
                
                # Encode and update file content
                change.file_content = content.encode('utf-8')
            except UnicodeDecodeError:
                # Skip binary files
                pass

if __name__ == '__main__':
    fr.main(filter_name='filter_sensitive_data', filter_callback=filter_sensitive_data)
