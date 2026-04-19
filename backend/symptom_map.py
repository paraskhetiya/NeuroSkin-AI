"""
NeuroSkin AI — Symptom Mapping
Hardcoded if-else type symptom map for all 8 diseases.
Returns symptoms for any combination of predicted diseases.
"""

# ── Symptom database for all 8 diseases ───────────────────────────────────────
SYMPTOMS_BY_DISEASE: dict[str, list[str]] = {
    "melanoma": [
        "Asymmetric shape of the mole or spot",
        "Irregular or ragged borders",
        "Multiple colors within the mole (brown, black, red, white, blue)",
        "Diameter larger than 6mm (pencil eraser size)",
        "Mole has been evolving or changing in size/shape/color",
        "Itching, tenderness, or bleeding from the spot",
        "New dark spot that looks different from others",
    ],
    "basal_cell_carcinoma": [
        "Pearly or waxy bump on the skin",
        "Flat, flesh-colored or brown scar-like lesion",
        "Open sore that does not heal or recurs",
        "Tiny visible blood vessels on the surface",
        "Slow, gradual growth over months",
        "Located on sun-exposed area (face, neck, arms)",
        "Occasional bleeding or crusting",
    ],
    "actinic_keratosis": [
        "Rough, scaly patch on sun-exposed skin",
        "Sandpaper-like texture when touched",
        "Pink, red, or brown colored patch",
        "Patch is flat or slightly raised",
        "Located on face, ears, scalp, hands, or forearms",
        "Itching or burning sensation in the area",
        "Patch comes and goes but returns",
    ],
    "benign_keratosis": [
        "Waxy, 'stuck on' appearance",
        "Brown, black, or tan coloring",
        "Round or oval-shaped growth",
        "Clearly defined edges",
        "Painless and not tender",
        "Has been stable for months or years",
        "Slightly raised with rough texture",
    ],
    "acne": [
        "Pimples, whiteheads, or blackheads",
        "Oily or greasy skin in affected areas",
        "Painful cysts or nodules under the skin",
        "Located on face, forehead, chest, or back",
        "Skin redness or inflammation around lesions",
        "Breakouts worsen with stress or hormonal changes",
        "Scarring or dark marks from previous breakouts",
    ],
    "eczema": [
        "Intense itching, especially worse at night",
        "Dry, cracked, or flaky skin",
        "Red or inflamed patches",
        "Small raised bumps that may leak fluid",
        "Thickened or leathery skin from scratching",
        "Triggered by soaps, detergents, or certain fabrics",
        "Affects inner elbows, behind knees, hands, or face",
    ],
    "psoriasis": [
        "Thick silvery-white scales on skin",
        "Well-defined red or pink plaques",
        "Dry, cracked skin that may bleed",
        "Located on elbows, knees, scalp, or lower back",
        "Itching, burning, or soreness",
        "Nail changes (pitting, thickening, discoloration)",
        "Joint stiffness or swelling",
    ],
    "ringworm": [
        "Ring-shaped red patch on skin",
        "Central clearing (skin looks normal in the middle)",
        "Raised, sharply defined border",
        "Patch is spreading outward over time",
        "Scaly, flaky, or slightly bumpy texture",
        "Itching in the affected area",
        "Multiple ring-shaped patches appearing",
    ],
}


def get_symptoms_for_diseases(disease_ids: list[str]) -> dict[str, list[str]]:
    """
    Given a list of disease IDs (e.g. ["eczema", "psoriasis", "ringworm"]),
    return the symptom checklist for each.
    """
    result = {}
    for disease_id in disease_ids:
        if disease_id in SYMPTOMS_BY_DISEASE:
            result[disease_id] = SYMPTOMS_BY_DISEASE[disease_id]
        else:
            result[disease_id] = [f"No symptom data available for '{disease_id}'"]
    return result
