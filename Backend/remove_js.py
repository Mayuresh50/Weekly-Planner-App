import os
import re

directory = r'd:\My Work\ThinkBridge_January_2026\Week 7\Backend\src'

# Regex to match .js' or .js" in imports/requires/mocks
pattern = re.compile(r'\.js([\'"])')

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.ts'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = pattern.sub(r'\1', content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {path}")
            except Exception as e:
                print(f"Failed to process {path}: {e}")
