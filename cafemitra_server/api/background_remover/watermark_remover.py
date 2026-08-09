from __future__ import annotations

import cv2
import numpy as np

# Gemini stamps a small sparkle/star watermark near the bottom-right
# corner of every image it generates, at a fairly consistent position
# relative to the image size.
WATERMARK_CENTER_X_RATIO = 0.865
WATERMARK_CENTER_Y_RATIO = 0.895
WATERMARK_BOX_RATIO = 0.11  # box side length as a fraction of image width
INPAINT_RADIUS = 7


def _watermark_box(width: int, height: int) -> tuple[int, int, int, int]:
    box = max(8, int(round(width * WATERMARK_BOX_RATIO)))

    center_x = int(round(width * WATERMARK_CENTER_X_RATIO))
    center_y = int(round(height * WATERMARK_CENTER_Y_RATIO))

    x1 = max(0, min(width - box, center_x - box // 2))
    y1 = max(0, min(height - box, center_y - box // 2))
    return x1, y1, x1 + box, y1 + box


def _donor_box(x1: int, y1: int, x2: int, y2: int, width: int, height: int) -> tuple[int, int, int, int] | None:
    """Find a same-size patch of real image content next to the watermark
    box to copy from - tried in the order most likely to match the actual
    fabric/backdrop that continues around the watermark: left, above,
    upper-left, then right. The first candidate that fits fully inside the
    image is used."""
    box_w = x2 - x1
    box_h = y2 - y1

    candidates = [
        (x1 - box_w, y1, x2 - box_w, y2),                  # left
        (x1, y1 - box_h, x2, y2 - box_h),                  # above
        (x1 - box_w, y1 - box_h, x2 - box_w, y2 - box_h),  # upper-left
        (x1 + box_w, y1, x2 + box_w, y2),                  # right
    ]

    for cx1, cy1, cx2, cy2 in candidates:
        if cx1 >= 0 and cy1 >= 0 and cx2 <= width and cy2 <= height:
            return cx1, cy1, cx2, cy2

    return None


def _inpaint_box(bgr: np.ndarray, x1: int, y1: int, x2: int, y2: int, width: int, height: int) -> np.ndarray:
    mask = np.zeros((height, width), dtype=np.uint8)
    mask[y1:y2, x1:x2] = 255
    return cv2.inpaint(bgr, mask, inpaintRadius=INPAINT_RADIUS, flags=cv2.INPAINT_TELEA)


def _patch_fill(bgr: np.ndarray, x1: int, y1: int, x2: int, y2: int, width: int, height: int) -> np.ndarray:
    """Cover the watermark box with a real patch copied from right next to
    it (rather than diffusing colors inward like plain inpainting), so
    texture - fabric weave, hair, printed pattern - carries over instead of
    smearing. cv2.seamlessClone (Poisson blending) then matches the
    copied patch's tone/lighting to its new spot so the seam disappears."""
    donor = _donor_box(x1, y1, x2, y2, width, height)
    if donor is None:
        return _inpaint_box(bgr, x1, y1, x2, y2, width, height)

    dx1, dy1, dx2, dy2 = donor
    patch = bgr[dy1:dy2, dx1:dx2].copy()
    patch_mask = np.full(patch.shape[:2], 255, dtype=np.uint8)
    center = ((x1 + x2) // 2, (y1 + y2) // 2)

    try:
        return cv2.seamlessClone(patch, bgr, patch_mask, center, cv2.NORMAL_CLONE)
    except cv2.error:
        return _inpaint_box(bgr, x1, y1, x2, y2, width, height)


def remove_gemini_watermark(image_bytes: bytes, content_type: str = "image/jpeg") -> bytes:
    """Cover Gemini's bottom-right sparkle watermark with a patch sampled
    from the surrounding image before storing.

    Best-effort: returns the original bytes unchanged if decoding,
    patching, or re-encoding fails for any reason, so a watermark cleanup
    hiccup never blocks saving the finished photo.
    """
    try:
        buffer = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(buffer, cv2.IMREAD_UNCHANGED)
        if image is None:
            return image_bytes

        alpha = None
        if image.ndim == 2:
            bgr = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        elif image.shape[2] == 4:
            bgr = image[:, :, :3]
            alpha = image[:, :, 3]
        else:
            bgr = image

        height, width = bgr.shape[:2]
        x1, y1, x2, y2 = _watermark_box(width, height)
        filled = _patch_fill(bgr, x1, y1, x2, y2, width, height)

        wants_png = alpha is not None or "png" in (content_type or "").lower()
        if alpha is not None:
            filled = cv2.merge([filled[:, :, 0], filled[:, :, 1], filled[:, :, 2], alpha])

        if wants_png:
            success, encoded = cv2.imencode(".png", filled)
        else:
            success, encoded = cv2.imencode(".jpg", filled, [int(cv2.IMWRITE_JPEG_QUALITY), 95])

        if not success:
            return image_bytes

        return encoded.tobytes()
    except Exception:
        return image_bytes
