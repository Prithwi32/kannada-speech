from difflib import SequenceMatcher

def find_omission_and_addition(target, spoken):
    """
    target : list of target phonemes
    spoken : list of spoken phonemes

    Returns:
        omitted : list of missing phonemes
        added   : list of extra phonemes
    """
    matcher = SequenceMatcher(None, target, spoken)

    omitted = []
    added = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'delete':   # present in target, missing in spoken
            omitted.extend(target[i1:i2])
        elif tag == 'insert': # extra in spoken
            added.extend(spoken[j1:j2])
        elif tag == 'replace':
            omitted.extend(target[i1:i2])
            added.extend(spoken[j1:j2])

    return omitted, added
