import os
import re
from collections import defaultdict

# Configuration
# Adjust these paths relative to where you run the script from
# Assuming running from project root
PROJECT_ROOT = os.getcwd()
LAYOUT_DIR = os.path.join(PROJECT_ROOT, "src", "features", "layout")
OUTPUT_FILE = os.path.join(LAYOUT_DIR, "Layouts.module.css")
LAYOUT_FILE_PATTERN = re.compile(r"Layout(\d+)\.module\.css")

def parse_css(content):
    """
    Parses CSS content into a list of (selector, body) tuples.
    This is a simple parser and assumes standard CSS syntax.
    """
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    rules = []
    buffer = ""
    depth = 0
    selector = ""
    
    # Simple state machine to extract rules
    for char in content:
        if char == '{':
            if depth == 0:
                selector = buffer.strip()
                buffer = ""
            else:
                buffer += char
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0:
                body = buffer.strip()
                rules.append((selector, body))
                buffer = ""
            else:
                buffer += char
        else:
            buffer += char
            
    return rules

def normalize_body(body):
    """
    Normalizes CSS body for comparison (removes whitespace/newlines).
    """
    return re.sub(r'\s+', ' ', body).strip()

def main():
    if not os.path.exists(LAYOUT_DIR):
        print(f"Error: Layout directory not found at {LAYOUT_DIR}")
        return

    # Find Layout(n).module.css files
    files = []
    for f in os.listdir(LAYOUT_DIR):
        match = LAYOUT_FILE_PATTERN.match(f)
        if match:
            n = int(match.group(1))
            files.append((n, os.path.join(LAYOUT_DIR, f)))
    
    files.sort()
    
    if not files:
        print(f"No files matching 'Layout(n).module.css' found in {LAYOUT_DIR}")
        print("Please ensure you have created the individual layout files.")
        return

    print(f"Found {len(files)} layout files. Combining...")

    # Map: normalized_body -> {'original_body': str, 'selectors': set}
    styles_map = {}
    
    for n, filepath in files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        rules = parse_css(content)
        
        for selector_str, body in rules:
            # Prepare the body key
            norm_body = normalize_body(body)
            
            # Prepare selectors (append _n)
            # Split grouped selectors in source file (e.g. .a, .b)
            source_selectors = [s.strip() for s in selector_str.split(',')]
            modified_selectors = []
            
            for sel in source_selectors:
                # Append _n to the class name
                # e.g. .contact -> .contact_0
                # We use regex to append suffix to the class name part
                # This handles complex selectors like ".container .item" -> ".container_0 .item_0" 
                # strictly speaking, usually only the defining class has the suffix in modular css, 
                # but for this specific "layout as state" system, it seems likely we want to suffix the main classes.
                # Based on Layouts.module.css, it seems flat: .contact_0, .name_0.
                
                def add_suffix(match):
                    return f"{match.group(0)}_{n}"
                
                # Apply to all class selectors in the string
                mod_sel = re.sub(r'\.([a-zA-Z0-9_-]+)', add_suffix, sel)
                modified_selectors.append(mod_sel)
            
            if norm_body not in styles_map:
                styles_map[norm_body] = {
                    'original_body': body,
                    'selectors': set()
                }
            
            styles_map[norm_body]['selectors'].update(modified_selectors)

    # Generate Output
    output_lines = []
    output_lines.append("/* Auto-generated from Layout(n).module.css by scripts/combine_layouts.py */\n")
    
    # Sort blocks by... maybe the appearance of the first selector index?
    # Or just loop dict.
    # To keep it deterministic, let's sort by the first selector in the group
    
    sorted_blocks = []
    for data in styles_map.values():
        selectors = sorted(list(data['selectors']), key=lambda x: (x.split('_')[0], int(x.split('_')[-1]) if '_' in x and x.split('_')[-1].isdigit() else 0))
        sorted_blocks.append((selectors, data['original_body']))
        
    # Sort blocks by their selectors
    sorted_blocks.sort(key=lambda x: x[0][0])
    
    for selectors, body in sorted_blocks:
        selector_string = ", ".join(selectors)
        output_lines.append(f"{selector_string} {{")
        # Use the original body formatting from the first file that had it
        output_lines.append(f"    {body}")
        output_lines.append("}\n")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("\n".join(output_lines))
        
    print(f"Successfully generated {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
