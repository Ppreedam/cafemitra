from __future__ import annotations

import io
import os
import sys
import threading
from pathlib import Path

from PIL import Image
from rembg import new_session, remove


# =========================================================
# CONFIGURATION
# =========================================================

# Original JPG, JPEG, PNG ya WebP image ka path
INPUT_IMAGE_PATH = r"prabhat.jpeg"

# Background-removed transparent PNG ka output path
OUTPUT_IMAGE_PATH = r"background-removed_prabhat.png"

# Passport/person photos ke liye achha default model
MODEL_NAME = "u2net_human_seg"

# Mask ke edges ko post-process karna hai ya nahi
POST_PROCESS_MASK = True

# Alpha matting detailed edges improve kar sakta hai,
# lekin processing slow hogi.
USE_ALPHA_MATTING = False


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


def remove_background_bytes(image_bytes: bytes) -> bytes:
    """Remove the background from in-memory image bytes and return PNG bytes.

    Used by the HTTP API, which processes uploads entirely in memory
    (no temp files on disk).
    """
    try:
        original_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    except Exception as error:
        raise BackgroundRemovalError(f"Image could not be opened: {error}") from error

    try:
        result_image = remove(
            original_image,
            session=_get_session(),
            post_process_mask=POST_PROCESS_MASK,
            alpha_matting=USE_ALPHA_MATTING,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )
    except Exception as error:
        raise BackgroundRemovalError(f"Background removal failed: {error}") from error

    if not isinstance(result_image, Image.Image):
        raise BackgroundRemovalError("Library ne valid image result return nahi kiya.")

    result_image = result_image.convert("RGBA")

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
        original_image = Image.open(input_file).convert("RGBA")
    except Exception as error:
        raise BackgroundRemovalError(
            f"Image open nahi hui: {error}"
        ) from error

    print(f"Image size: {original_image.width} × {original_image.height}")
    print(f"Model: {MODEL_NAME}")
    print("Background remove ho raha hai...")

    try:
        session = new_session(MODEL_NAME)

        result_image = remove(
            original_image,
            session=session,
            post_process_mask=POST_PROCESS_MASK,
            alpha_matting=USE_ALPHA_MATTING,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )

    except Exception as error:
        raise BackgroundRemovalError(
            f"Background removal failed: {error}"
        ) from error

    if not isinstance(result_image, Image.Image):
        raise BackgroundRemovalError(
            "Library ne valid image result return nahi kiya."
        )

    result_image = result_image.convert("RGBA")

    try:
        result_image.save(
            output_file,
            format="PNG",
            optimize=True,
        )
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