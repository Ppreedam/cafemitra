from __future__ import annotations

import logging

import cv2
import numpy as np

logger = logging.getLogger("django")

# Gemini stamps a small sparkle/star watermark near the bottom-right
# corner of every image it generates, at a consistent position relative
# to the image size. Brightness-based auto-detection was tried here and
# dropped: the icon's contrast against the surrounding fabric is subtle
# enough (and comparable in size to any local-mean kernel that could spot
# it) that detection missed it on real photos. A fixed box tightly sized
# to just the icon - not a large search - is simpler and reliable.
WATERMARK_CENTER_X_RATIO = 0.865
WATERMARK_CENTER_Y_RATIO = 0.895
WATERMARK_BOX_RATIO = 0.055  # box side length as a fraction of image width - hugs just the icon
FEATHER_PIXELS = 4  # soft blend width at the very edge of the patch, in pixels


def _watermark_box(width: int, height: int) -> tuple[int, int, int, int]:
    box = max(8, int(round(width * WATERMARK_BOX_RATIO)))

    center_x = int(round(width * WATERMARK_CENTER_X_RATIO))
    center_y = int(round(height * WATERMARK_CENTER_Y_RATIO))

    x1 = max(0, min(width - box, center_x - box // 2))
    y1 = max(0, min(height - box, center_y - box // 2))
    return x1, y1, x1 + box, y1 + box


def _feathered_mask(core_h: int, core_w: int, feather: int) -> np.ndarray:
    """Ideal (unclamped) mask sized core + `feather` margin on every
    side: EXACTLY 1.0 everywhere inside the core (watermark) box - a
    guaranteed full overwrite there no matter how opaque the watermark
    is - fading to 0 only for pixels outside it, over the `feather`-pixel
    margin, so the blend seam sits entirely in pixels that were never
    part of the watermark box.

    A Gaussian blur on a hard step would soften *both* sides of the
    edge, eating into the core's own boundary - a distance transform
    instead gives an asymmetric falloff that only touches the outside."""
    if feather <= 0:
        return np.ones((core_h, core_w), dtype=np.float32)

    outer_h, outer_w = core_h + 2 * feather, core_w + 2 * feather
    core_mask = np.zeros((outer_h, outer_w), dtype=np.uint8)
    core_mask[feather:feather + core_h, feather:feather + core_w] = 255

    outside = cv2.bitwise_not(core_mask)
    distance_outside = cv2.distanceTransform(outside, cv2.DIST_L2, 5)
    return np.clip(1.0 - distance_outside / feather, 0.0, 1.0).astype(np.float32)


def _patch_fill_from_right(bgr: np.ndarray, x1: int, y1: int, x2: int, y2: int, width: int, height: int) -> np.ndarray:
    """Cover the watermark box with a real patch copied from directly to
    its right - never top/left/below. The watermark sits close to the
    right edge, so if the equal-size patch to the right would run past
    the image boundary, the image is mirror-padded on the right first so
    there is always genuine right-side content to sample from.

    The core watermark box itself is always a 100% hard overwrite from
    the donor patch (so the watermark is fully gone regardless of how
    opaque it is); a `FEATHER_PIXELS`-wide margin around that box is then
    softly blended so the seam into the rest of the photo doesn't show.
    """
    feather = FEATHER_PIXELS
    core_h, core_w = y2 - y1, x2 - x1

    # Ideal (unclamped) outer box and its feathered mask.
    ideal_ox1, ideal_oy1 = x1 - feather, y1 - feather
    ideal_ox2, ideal_oy2 = x2 + feather, y2 + feather
    ideal_mask = _feathered_mask(core_h, core_w, feather)

    # Real, image-bounds-clamped outer box (usually equal to the ideal one).
    ox1, oy1 = max(0, ideal_ox1), max(0, ideal_oy1)
    ox2, oy2 = min(width, ideal_ox2), min(height, ideal_oy2)
    outer_w, outer_h = ox2 - ox1, oy2 - oy1

    mask = ideal_mask[
        oy1 - ideal_oy1: oy1 - ideal_oy1 + outer_h,
        ox1 - ideal_ox1: ox1 - ideal_ox1 + outer_w,
    ][:, :, None]

    donor_x1 = ox2
    donor_x2 = ox2 + outer_w
    extra = donor_x2 - width

    canvas = bgr if extra <= 0 else cv2.copyMakeBorder(bgr, 0, 0, 0, extra, cv2.BORDER_REFLECT_101)
    patch = canvas[oy1:oy2, donor_x1:donor_x2]
    if patch.shape[0] != outer_h or patch.shape[1] != outer_w:
        return bgr  # donor region malformed (tiny image) - leave untouched rather than guess

    region = bgr[oy1:oy2, ox1:ox2].astype(np.float32)
    blended = region * (1.0 - mask) + patch.astype(np.float32) * mask

    result = bgr.copy()
    result[oy1:oy2, ox1:ox2] = np.clip(blended, 0, 255).astype(np.uint8)
    return result


def remove_gemini_watermark(image_bytes: bytes, content_type: str = "image/jpeg") -> bytes:
    """Cover Gemini's bottom-right sparkle watermark with a patch sampled
    only from the image content directly to its right, before storing.

    Best-effort: returns the original bytes unchanged if decoding,
    patching, or re-encoding fails for any reason, so a watermark cleanup
    hiccup never blocks saving the finished photo.
    """
    try:
        buffer = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(buffer, cv2.IMREAD_UNCHANGED)
        if image is None:
            logger.error("remove_gemini_watermark: cv2.imdecode returned None (%d bytes, content_type=%s)", len(image_bytes), content_type)
            return image_bytes

        alpha_channel = None
        if image.ndim == 2:
            bgr = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        elif image.shape[2] == 4:
            bgr = image[:, :, :3]
            alpha_channel = image[:, :, 3]
        else:
            bgr = image

        height, width = bgr.shape[:2]
        x1, y1, x2, y2 = _watermark_box(width, height)
        filled = _patch_fill_from_right(bgr, x1, y1, x2, y2, width, height)

        wants_png = alpha_channel is not None or "png" in (content_type or "").lower()
        if alpha_channel is not None:
            filled = cv2.merge([filled[:, :, 0], filled[:, :, 1], filled[:, :, 2], alpha_channel])

        if wants_png:
            success, encoded = cv2.imencode(".png", filled)
        else:
            success, encoded = cv2.imencode(".jpg", filled, [int(cv2.IMWRITE_JPEG_QUALITY), 95])

        if not success:
            logger.error("remove_gemini_watermark: cv2.imencode failed (shape=%s, wants_png=%s)", filled.shape, wants_png)
            return image_bytes

        return encoded.tobytes()
    except Exception:
        logger.exception("remove_gemini_watermark: unexpected failure, storing original photo unmodified (%d bytes, content_type=%s)", len(image_bytes), content_type)
        return image_bytes
