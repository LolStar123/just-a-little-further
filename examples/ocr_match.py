"""Text matching stage from the screen-reading crafting prototype. No mouse control."""
import difflib
import re

THRESHOLD = 0.70

def is_similar(text, keywords, threshold=THRESHOLD):
    text_normalized = re.sub(r"\s+", " ", text.lower())
    text_normalized = text_normalized.replace("1", "l").replace("i", "l").replace("|", "l")
    found = []
    for keyword in keywords:
        kw = keyword.lower().replace("1", "l").replace("i", "l").replace("|", "l")
        kw_norm = re.sub(r"\s+", " ", kw)
        # Direct in-text match
        if kw_norm in text_normalized:
            found.append(keyword)
            continue
        # Fuzzy window
        for i in range(len(text_normalized) - len(kw_norm) + 1):
            window = text_normalized[i:i+len(kw_norm)]
            if difflib.SequenceMatcher(None, window, kw_norm).ratio() >= threshold:
                found.append(keyword)
                break
    return found


if __name__ == "__main__":
    for text in ["Adds cold damage", "GrAnd Des1gn", "Remarkab|e"]:
        print(text, "->", is_similar(text, ["grand design", "remarkable"]))
