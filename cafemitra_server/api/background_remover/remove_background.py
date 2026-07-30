from __future__ import annotations

import io
import os
import sys
import threading
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove


# =========================================================
# CONFIGURATION
# =========================================================

# Original JPG, JPEG, PNG ya WebP image ka path
INPUT_IMAGE_PATH = r"prabhat.jpeg"

# Background-removed transparent PNG ka output path
OUTPUT_IMAGE_PATH = r"background-removed_prabhat.png"

# isnet-general-use ek generic "salient object" model hai (product/animal/
# kisi bhi cheez ke liye) - insaan ke plain-colour clothing (jaise flat
# gray t-shirt) ko kabhi kabhi confidently "foreground" nahi maan pata aur
# poora torso/shoulder hata deta hai. u2net_human_seg specifically full
# human body (clothing samet) segment karne ke liye trained hai, isliye
# ye clothing/shoulders ko reliably capture karta hai. Iski known weakness
# - frame-edge ko chhoone wale shoulders crop ho jaana - _pad_with_reflection
# se pehle se hi handle ho raha hai, isliye dono fix ek saath mil jaate hain.
MODEL_NAME = "u2net_human_seg"

# Mask ke edges ko post-process karna hai ya nahi
POST_PROCESS_MASK = True

# Alpha matting se boundary (shoulders, hair) ka alpha zyada accurate
# milta hai bajaye ek hard/binary mask ke - thodi processing slow hoti
# hai lekin cropped-looking edges ka issue kaafi kam ho jata hai.
USE_ALPHA_MATTING = True

# Jab subject (shoulders/body) frame ke edge ko chhoo raha ho, model wahan
# mask thoda andar se crop kar sakta hai. Edge-replicate padding se subject
# edge se thoda door lagta hai (bina koi mirrored duplicate pattern banaye),
# isliye mask poora shoulder/body cover karta hai. Jahan do edges milte hain
# (corner), wahan replicate-padding ka corner-fill sabse kam reliable hota
# hai, isliye corner ke paas wale arm/elbow ko poora capture karne ke liye
# extra padding chahiye hota hai.
BORDER_PAD_RATIO = 0.5
MIN_BORDER_PAD_PX = 130


class BackgroundRemovalError(Exception):
    """Background-removal processing error."""


def validate_input_file(input_path: Path) -> None:
    if not input_path.exists():
        raise BackgroundRemovalError(
            f"Input image nahi mili:\n{input_path}"
        )

    if not input_path.is_file():
        raise BackgroundRemovalError(
            f"Input path file nahi hai:\n{input_path}"
        )

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".bmp",
    }

    if input_path.suffix.lower() not in allowed_extensions:
        raise BackgroundRemovalError(
            "Unsupported image format. "
            "JPG, JPEG, PNG, WebP ya BMP image use karo."
        )


_session = None
_session_lock = threading.Lock()


def _get_session():
    """Lazily load and cache the rembg model session (expensive to construct)."""
    global _session
    if _session is None:
        with _session_lock:
            if _session is None:
                _session = new_session(MODEL_NAME)
    return _session


def _pad_with_reflection(image: Image.Image) -> tuple[Image.Image, int]:
    """Extend the canvas with mirrored pixels so the subject no longer
    touches the frame edge, then u2net can trace its full silhouette
    instead of truncating shoulders/limbs that run off the border.
    """
    width, height = image.size
    pad = max(MIN_BORDER_PAD_PX, round(max(width, height) * BORDER_PAD_RATIO))
    array = np.array(image)
    padded = np.pad(array, ((pad, pad), (pad, pad), (0, 0)), mode="edge")
    return Image.fromarray(padded), pad


def remove_background_bytes(image_bytes: bytes) -> bytes:
    """Remove the background from in-memory image bytes and return PNG bytes.

    Used by the HTTP API, which processes uploads entirely in memory
    (no temp files on disk).
    """
    try:
        original_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    except Exception as error:
        raise BackgroundRemovalError(f"Image could not be opened: {error}") from error

    width, height = original_image.size
    padded_image, pad = _pad_with_reflection(original_image)

    try:
        result_image = remove(
            padded_image,
            session=_get_session(),
            post_process_mask=POST_PROCESS_MASK,
            alpha_matting=USE_ALPHA_MATTING,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            # Narrower "unknown" trimap band around the mask boundary - a
            # wider band (10px) was pulling in some real arm/shoulder pixels
            # near a bent-elbow edge and letting matting mark them background.
            alpha_matting_erode_size=6,
        )
    except Exception as error:
        raise BackgroundRemovalError(f"Background removal failed: {error}") from error

    if not isinstance(result_image, Image.Image):
        raise BackgroundRemovalError("Library ne valid image result return nahi kiya.")

    result_image = result_image.convert("RGBA").crop((pad, pad, pad + width, pad + height))

    buffer = io.BytesIO()
    result_image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def remove_image_background(
    input_path: str,
    output_path: str,
) -> None:
    input_file = Path(input_path)
    output_file = Path(output_path)

    validate_input_file(input_file)

    if output_file.suffix.lower() != ".png":
        raise BackgroundRemovalError(
            "Output file ka extension .png hona chahiye, "
            "kyunki transparency PNG me save hogi."
        )

    output_file.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("Image loading...")

    try:
        image_bytes = input_file.read_bytes()
    except Exception as error:
        raise BackgroundRemovalError(
            f"Image open nahi hui: {error}"
        ) from error

    print(f"Model: {MODEL_NAME}")
    print("Background remove ho raha hai...")

    result_bytes = remove_background_bytes(image_bytes)

    try:
        output_file.write_bytes(result_bytes)
    except Exception as error:
        raise BackgroundRemovalError(
            f"Output image save nahi hui: {error}"
        ) from error

    print("\nBackground successfully remove ho gaya.")
    print(f"Output image:\n{output_file}")


def main() -> None:
    try:
        remove_image_background(
            input_path=INPUT_IMAGE_PATH,
            output_path=OUTPUT_IMAGE_PATH,
        )

    except BackgroundRemovalError as error:
        print("\nError:")
        print(error)
        sys.exit(1)

    except KeyboardInterrupt:
        print("\nProcessing manually stop ki gayi.")
        sys.exit(1)

    except Exception as error:
        print("\nUnexpected error:")
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()