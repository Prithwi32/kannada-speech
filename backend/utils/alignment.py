def align_phonemes_string(target, spoken):
    """
    Compare phoneme lists and classify differences as:
    S - Substitution
    O - Omission
    D - Distortion (from pitch/energy)
    A - Addition
    """
    alignment = []
    i, j = 0, 0
    while i < len(target) or j < len(spoken):
        if i < len(target) and j < len(spoken):
            if target[i] == spoken[j]:
                alignment.append({"target": target[i], "spoken": spoken[j], "type": "Correct"})
            else:
                alignment.append({"target": target[i], "spoken": spoken[j], "type": "Substitution"})
            i += 1
            j += 1
        elif i < len(target):
            alignment.append({"target": target[i], "spoken": "", "type": "Omission"})
            i += 1
        elif j < len(spoken):
            alignment.append({"target": "", "spoken": spoken[j], "type": "Addition"})
            j += 1

    # Count summary
    summary = {"S": 0, "O": 0, "D": 0, "A": 0, "Correct": 0}
    for a in alignment:
        if a["type"] == "Substitution":
            summary["S"] += 1
        elif a["type"] == "Omission":
            summary["O"] += 1
        elif a["type"] == "Addition":
            summary["A"] += 1
        elif a["type"] == "Correct":
            summary["Correct"] += 1

    return {"alignment": alignment, "summary": summary}


def align_phonemes_list(target_list, spoken_list):
    """
    Aligns two phoneme LISTS and classifies:
    - Correct
    - Substitution
    - Omission
    - Addition
    """

    alignment = []
    i, j = 0, 0

    # Loop until both lists are fully processed
    while i < len(target_list) or j < len(spoken_list):

        # Case 1: both present
        if i < len(target_list) and j < len(spoken_list):
            if target_list[i] == spoken_list[j]:
                alignment.append({
                    "target": target_list[i],
                    "spoken": spoken_list[j],
                    "type": "Correct"
                })
            else:
                alignment.append({
                    "target": target_list[i],
                    "spoken": spoken_list[j],
                    "type": "Substitution"
                })
            i += 1
            j += 1

        # Case 2: target has extra → Omission
        elif i < len(target_list):
            alignment.append({
                "target": target_list[i],
                "spoken": "",
                "type": "Omission"
            })
            i += 1

        # Case 3: spoken has extra → Addition
        elif j < len(spoken_list):
            alignment.append({
                "target": "",
                "spoken": spoken_list[j],
                "type": "Addition"
            })
            j += 1

    # Summary calculation
    summary = {"S": 0, "O": 0, "D": 0, "A": 0, "Correct": 0}

    for item in alignment:
        t = item["type"]
        if t == "Correct":
            summary["Correct"] += 1
        elif t == "Substitution":
            summary["S"] += 1
        elif t == "Omission":
            summary["O"] += 1
        elif t == "Addition":
            summary["A"] += 1

    return {"alignment": alignment, "summary": summary}


def extract_substitutions(target_list, spoken_list):
    """
    Returns list of substituted phonemes
    """
    substitutions = []

    for t, s in zip(target_list, spoken_list):
        if t != s:
            substitutions.append({
                "target": t,
                "spoken": s
            })

    return substitutions
