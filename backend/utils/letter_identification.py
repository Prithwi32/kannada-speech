
"""
Utility functions to identify specific letters/syllables for each error type.
Used for generating age-appropriate practice suggestions.
"""

from txt2ipa.kannada2ipa.ipaconvert import ipa2kannada_value

def identify_omission(target_syllable, spoken_syllable):
    """
    Identify omitted (deleted) syllables.
    
    Searches each syllable from target_syllable in spoken_syllable list.
    If not present, stores it as deleted.
    
    Args:
        target_syllable: list of target syllables
        spoken_syllable: list of spoken syllables
    
    Returns:
        list: List of deleted/omitted syllables
    """
    deleted = []
    
    for syllable in target_syllable:
        if syllable not in spoken_syllable:
            ds = ipa2kannada_value(syllable)
            deleted.append(ds)
    print("Deleted syllables:", deleted)
    return deleted


def identify_addition(target_syllable, spoken_syllable):
    """
    Identify added syllables.
    
    Searches each syllable from spoken_syllable in target_syllable list.
    If not there, marks it as addition.
    
    Args:
        target_syllable: list of target syllables
        spoken_syllable: list of spoken syllables
    
    Returns:
        list: List of added syllables
    """
    added = []
    
    for syllable in spoken_syllable:
        if syllable not in target_syllable:
            ads = ipa2kannada_value(syllable)
            added.append(ads)
    print("Added syllables:", added)
    return added


def identify_substitution(target_syllable, spoken_syllable):
    """
    Identify substituted syllables.
    
    Compares both lists index-wise, takes target_syllable as main.
    If element at same index is not matched (substituted), stores as substituted.
    
    Args:
        target_syllable: list of target syllables (main reference)
        spoken_syllable: list of spoken syllables
    
    Returns:
        list: List of dictionaries with target and spoken syllables for substitutions
              Format: [{"target": "syl1", "spoken": "syl2"}, ...]
    """
    substitutions = []
    
    # Compare index-wise, using target_syllable as main reference
    max_len = max(len(target_syllable), len(spoken_syllable))
    
    for i in range(max_len):
        target_syl = target_syllable[i]
        spoken_syl = spoken_syllable[i]
        ts = ipa2kannada_value(target_syl)
        ss = ipa2kannada_value(spoken_syl)

        if i < len(target_syllable) and i < len(spoken_syllable):
                    
            if target_syl != spoken_syl:
                substitutions.append({
                    "target": ts,
                    "spoken": ss
                })

        elif i < len(target_syllable):
            # Target has more syllables - this is actually an omission case
            # But we'll include it as substitution for completeness
            substitutions.append({
                "target": ts,
                "spoken": ""
            })
        elif i < len(spoken_syllable):
            # Spoken has more syllables - this is actually an addition case
            # But we'll include it as substitution for completeness
            substitutions.append({
                "target": "",
                "spoken": ss
            })
    print("Sustituted syllables:", substitutions)
    return substitutions


def identify_distortion(target_syllable, spoken_syllable):
    """
    Identify distorted syllables (similar to substitution but with distortion context).
    
    For distortion, we compare index-wise similar to substitution,
    as distortion often manifests as substitution-like errors.
    
    Args:
        target_syllable: list of target syllables
        spoken_syllable: list of spoken syllables
    
    Returns:
        list: List of dictionaries with target and spoken syllables for distortions
    """
    # Distortion detection is similar to substitution
    # The difference is in the audio analysis, but for letter identification
    # we use the same approach
    return identify_substitution(target_syllable, spoken_syllable)

