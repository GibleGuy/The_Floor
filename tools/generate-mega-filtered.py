import os
import re
import random

registry_path = '/Users/gibleguy/Downloads/Programming/the_floor/categories/index.js'
categories_dir = '/Users/gibleguy/Downloads/Programming/the_floor/categories'
output_path = '/Users/gibleguy/Downloads/Programming/the_floor/categories/mega-filtered.js'

with open(registry_path, 'r', encoding='utf-8') as f:
    registry_content = f.read()

# Get all REAL DEAL categories
matches = re.findall(r"\{\s*key:\s*'([^']*)'.*?script:\s*'([^']*)'.*?tier:\s*'REAL DEAL'", registry_content, re.DOTALL)

merged_clues = []
for key, script_name in matches:
    script_path = os.path.join(categories_dir, script_name)
    if not os.path.exists(script_path):
        continue
    
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract objects: { n: "...", u: "..." }
    # Using a regex that handles potential newlines and single/double quotes
    objs = re.findall(r"\{\s*n:\s*[\"'][^\"']*?[\"'],\s*u:\s*[\"'][^\"']*?[\"']\s*\}", content, re.DOTALL)
    
    # Take first 10
    first_ten = objs[:10]
    for obj_str in first_ten:
        merged_clues.append({'cat': key, 'str': obj_str.strip()})

def shuffle_with_spacing(clues, min_spacing=5):
    by_cat = {}
    for c in clues:
        by_cat.setdefault(c['cat'], []).append(c)
    
    for cat in by_cat:
        random.shuffle(by_cat[cat])
    
    result = []
    recent_cats = []
    
    total_clues = len(clues)
    while len(result) < total_clues:
        # Find candidate categories that don't violate spacing
        candidates = [cat for cat in by_cat if by_cat[cat] and cat not in recent_cats]
        
        if not candidates:
            # Fallback if no candidate satisfies spacing (pick one with most items remaining)
            candidates = sorted(by_cat.keys(), key=lambda x: len(by_cat[x]), reverse=True)
            if not candidates: break
            
        # To avoid being greedy and getting stuck later, pick from categories with more items left
        # Or just pick random from top candidates
        chosen_cat = random.choice(candidates[:3] if len(candidates) > 3 else candidates)
        item = by_cat[chosen_cat].pop(0)
        result.append(item)
        
        recent_cats.append(chosen_cat)
        if len(recent_cats) > min_spacing:
            recent_cats.pop(0)
            
        if not by_cat[chosen_cat]:
            del by_cat[chosen_cat]
            
    return result

final_list = shuffle_with_spacing(merged_clues, min_spacing=5)

js_content = "// Mega-Filtered — 10 clues per REAL DEAL category, randomized with spacing\n"
js_content += "const megaFilteredData = [\n"
js_content += ",\n".join([c['str'] for c in final_list])
js_content += "\n];\n"
js_content += "if (typeof window !== 'undefined') window.megaFilteredData = megaFilteredData;\n"

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'Generated {len(final_list)} clues from {len(matches)} categories in mega-filtered.js')
