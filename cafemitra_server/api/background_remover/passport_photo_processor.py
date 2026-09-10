from __future__ import annotations

import os
import sys
from pathlib import Path

import cv2
import numpy as np


# =========================================================
# CONFIGURATION
# =========================================================

# Background-removed transparent PNG
INPUT_IMAGE_PATH = r"background-removed.png"

# Output folder
OUTPUT_DIRECTORY = r"output"

# Passport photo size
PASSPORT_WIDTH_MM = 35
PASSPORT_HEIGHT_MM = 45

# Printing resolution
DPI = 300

# Background: RGB
BACKGROUND_COLOR = (255, 255, 255)

# Blue/cyan halo removal
DESPILL_STRENGTH = 0.85

# Edge refinement
ERODE_SIZE = 1
EDGE_BLUR_SIZE = 3
EDGE_WIDTH = 5

# Passport framing
# Face box ke comparison me final crop kitna bada ho
FACE_TO_CROP_WIDTH_RATIO = 0.52

# Face ka vertical center final image me kis position par ho
FACE_CENTER_Y_RATIO = 0.43

# Top of hair ke upar approximate space
TOP_MARGIN_RATIO = 0.07


class ProcessingError(Exception):
    pass


def mm_to_pixels(mm: float, dpi: int) -> int:
    return round((mm / 25.4) * dpi)


def ensure_bgra(image: np.ndarray) -> np.ndarray:
    if image is None:
        raise ProcessingError("Image load nahi hui.")

    if image.ndim == 2:
        return cv2.cvtColor(image, cv2.COLOR_GRAY2BGRA)

    if image.shape[2] == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)

    if image.shape[2] == 4:
        return image

    raise ProcessingError("Unsupported image channel format.")


def load_transparent_png(path: str) -> np.ndarray:
    input_path = Path(path)

    if not input_path.exists():
        raise ProcessingError(
            f"Input image nahi mili:\n{input_path}"
        )

    image = cv2.imread(
        str(input_path),
        cv2.IMREAD_UNCHANGED,
    )

    image = ensure_bgra(image)

    alpha = image[:, :, 3]

    if np.all(alpha == 255):
        raise ProcessingError(
            "Image me transparency nahi hai. "
            "Background-removed PNG use karo."
        )

    return image


def refine_alpha_mask(
    alpha: np.ndarray,
    erode_size: int = 1,
    blur_size: int = 3,
    erode_blend: float = 0.55,
) -> np.ndarray:
    refined = alpha.copy()

    # Weak transparent noise cleanup
    refined[refined < 4] = 0
    refined[refined > 251] = 255

    # Small gaps fill
    close_kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (3, 3),
    )

    refined = cv2.morphologyEx(
        refined,
        cv2.MORPH_CLOSE,
        close_kernel,
        iterations=1,
    )

    # Small isolated noise remove
    open_kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (3, 3),
    )

    refined = cv2.morphologyEx(
        refined,
        cv2.MORPH_OPEN,
        open_kernel,
        iterations=1,
    )

    # Slight shrink: outer blue outline remove
    if erode_size > 0:
        kernel_size = erode_size * 2 + 1

        erode_kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE,
            (kernel_size, kernel_size),
        )

        eroded = cv2.erode(
            refined,
            erode_kernel,
            iterations=1,
        )

        # Partial erosion, hair preserve karne ke liye
        refined = cv2.addWeighted(
            refined,
            1.0 - erode_blend,
            eroded,
            erode_blend,
            0,
        )

    if blur_size > 0:
        if blur_size % 2 == 0:
            blur_size += 1

        refined = cv2.GaussianBlur(
            refined,
            (blur_size, blur_size),
            sigmaX=0,
        )

    return refined


def create_edge_mask(
    alpha: np.ndarray,
    edge_width: int = 5,
) -> np.ndarray:
    size = max(3, edge_width * 2 + 1)

    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (size, size),
    )

    dilated = cv2.dilate(
        alpha,
        kernel,
        iterations=1,
    )

    eroded = cv2.erode(
        alpha,
        kernel,
        iterations=1,
    )

    edge = cv2.subtract(dilated, eroded)

    return edge


def remove_blue_cyan_spill(
    bgr: np.ndarray,
    alpha: np.ndarray,
    strength: float = 0.85,
    edge_width: int = 5,
) -> np.ndarray:
    """
    Blue/cyan background ke color halo ko edge area se reduce karta hai.
    """

    strength = float(np.clip(strength, 0.0, 1.0))

    image = bgr.astype(np.float32)

    blue = image[:, :, 0]
    green = image[:, :, 1]
    red = image[:, :, 2]

    edge_mask = create_edge_mask(
        alpha,
        edge_width=edge_width,
    ).astype(np.float32) / 255.0

    alpha_float = alpha.astype(np.float32) / 255.0

    # Semi-transparent pixels par correction zyada
    soft_boundary = 1.0 - np.abs(
        alpha_float * 2.0 - 1.0
    )

    process_factor = np.maximum(
        edge_mask,
        soft_boundary,
    )

    # Cyan/blue condition:
    # blue high ho aur green bhi red ke comparison me high ho.
    dominant_blue = np.maximum(
        blue - np.maximum(red, green),
        0.0,
    )

    cyan_excess = np.maximum(
        np.minimum(blue, green) - red,
        0.0,
    )

    blue_correction = (
        dominant_blue
        + cyan_excess * 0.65
    ) * strength * process_factor

    green_correction = (
        cyan_excess
        * 0.35
        * strength
        * process_factor
    )

    blue = blue - blue_correction
    green = green - green_correction

    # Neutral warmth restore
    red = red + blue_correction * 0.12

    output = cv2.merge([
        np.clip(blue, 0, 255),
        np.clip(green, 0, 255),
        np.clip(red, 0, 255),
    ])

    return output.astype(np.uint8)


def decontaminate_edge_colors(
    bgr: np.ndarray,
    alpha: np.ndarray,
    edge_width: int = 8,
) -> np.ndarray:
    """
    Semi-transparent boundary pixels (jaise udte hue baal ke strands) ka
    color kabhi bhi pure foreground nahi hota - original photo me wo pixel
    optically (motion blur / camera anti-aliasing ki wajah se) background ke
    saath thoda blend hota hai, chahe background kisi bhi color ka ho (safed,
    cream, blue - kuch bhi). remove_blue_cyan_spill sirf blue/cyan studio
    backdrop ke liye kaam karta hai; ye function har edge pixel ke sabse
    nazdeeki "confidently background" pixel ka color estimate karke uska
    contribution subtract karta hai - standard alpha-matting "decontaminate
    colors" trick, jo kisi bhi original background color ke liye kaam karta
    hai, isliye white/cream backdrop se aane wale fringe ko bhi hata deta hai.
    """
    confident_background = (alpha < 10).astype(np.uint8)

    if not np.any(confident_background):
        return bgr

    # distanceTransformWithLabels seeds from ZERO-valued pixels, so the mask
    # fed in must have background pixels at 0 (everything else at 1) - the
    # inverse of confident_background itself.
    seed_input = np.where(confident_background == 1, 0, 1).astype(np.uint8)

    _, labels = cv2.distanceTransformWithLabels(
        seed_input,
        cv2.DIST_L2,
        5,
        labelType=cv2.DIST_LABEL_PIXEL,
    )

    ys, xs = np.nonzero(confident_background)
    label_ids = labels[ys, xs]
    colors = bgr[ys, xs].astype(np.float32)

    lut = np.zeros((int(label_ids.max()) + 1, 3), dtype=np.float32)
    lut[label_ids] = colors
    background_estimate = lut[labels]

    alpha_float = (alpha.astype(np.float32) / 255.0)[:, :, None]
    edge_mask = create_edge_mask(
        alpha,
        edge_width=edge_width,
    ).astype(np.float32)[:, :, None] / 255.0

    safe_alpha = np.clip(alpha_float, 0.15, 1.0)
    decontaminated = (
        bgr.astype(np.float32) - background_estimate * (1.0 - alpha_float)
    ) / safe_alpha
    decontaminated = np.clip(decontaminated, 0, 255)

    # Sirf semi-transparent boundary band par apply hota hai - jahan alpha
    # already high (fully opaque core) wahan blend ~0 rehta hai, taaki face
    # ya body ka asli color na badle.
    blend = edge_mask * (1.0 - alpha_float)
    result = bgr.astype(np.float32) * (1.0 - blend) + decontaminated * blend

    return np.clip(result, 0, 255).astype(np.uint8)


def defringe_edge_colors(
    bgr: np.ndarray,
    alpha: np.ndarray,
    edge_width: int = 3,
    strength: float = 0.8,
) -> np.ndarray:
    """
    decontaminate_edge_colors ka matting formula sirf semi-transparent
    pixels (alpha < 255) par kaam karta hai - jab alpha=255 hota hai, formula
    background contribution zero maan leta hai, isliye kuch correct nahi
    karta. Lekin refine_alpha_mask ka threshold (`refined[refined>251]=255`)
    kayi near-boundary pixels ko poori tarah opaque bana deta hai, chahe
    unka asal RGB color abhi bhi original (jaise white/cream) backdrop se
    tinted ho - yही hard white/light outline banata hai jo kisi bhi solid
    backdrop colour ke against dikhta hai.
    Ye function un pixels ka color fix karta hai bina alpha par depend kiye:
    mask boundary ke bilkul paas (edge_width) har pixel ka color, sabse
    nazdeeki "confidently foreground" pixel ke color se replace/blend kar
    deta hai. Seed pixels sirf wahi maane jaate hain jo high-alpha (>245)
    HO AUR boundary se kaafi door (edge_width se bahar) bhi ho - kyunki
    boundary ring ke pixels khud bhi refine_alpha_mask ke threshold se
    alpha=255 tak snap ho chuke hote hain, sirf alpha check unhe interior
    se alag nahi kar sakta.
    """
    seed_exclusion = create_edge_mask(alpha, edge_width=edge_width + 3)
    confident_fg = ((alpha > 245) & (seed_exclusion == 0)).astype(np.uint8)

    if not np.any(confident_fg) or np.all(confident_fg):
        return bgr

    seed_input = np.where(confident_fg == 1, 0, 1).astype(np.uint8)

    _, labels = cv2.distanceTransformWithLabels(
        seed_input,
        cv2.DIST_L2,
        5,
        labelType=cv2.DIST_LABEL_PIXEL,
    )

    ys, xs = np.nonzero(confident_fg)
    label_ids = labels[ys, xs]
    colors = bgr[ys, xs].astype(np.float32)

    lut = np.zeros((int(label_ids.max()) + 1, 3), dtype=np.float32)
    lut[label_ids] = colors
    foreground_estimate = lut[labels]

    edge_mask = create_edge_mask(
        alpha,
        edge_width=edge_width,
    ).astype(np.float32)[:, :, None] / 255.0

    blend = edge_mask * float(np.clip(strength, 0.0, 1.0))
    result = bgr.astype(np.float32) * (1.0 - blend) + foreground_estimate * blend

    return np.clip(result, 0, 255).astype(np.uint8)


def smooth_subject_edges(
    bgr: np.ndarray,
    alpha: np.ndarray,
    edge_width: int = 3,
) -> np.ndarray:
    """
    Face ke center ko blur nahi karta.
    Sirf hair, shoulder aur shirt boundary smooth karta hai.
    """

    edge_mask = create_edge_mask(
        alpha,
        edge_width=edge_width,
    )

    edge_factor = (
        edge_mask.astype(np.float32) / 255.0
    )[:, :, None]

    smoothed = cv2.bilateralFilter(
        bgr,
        d=5,
        sigmaColor=22,
        sigmaSpace=22,
    )

    result = (
        bgr.astype(np.float32) * (1.0 - edge_factor)
        + smoothed.astype(np.float32) * edge_factor
    )

    return np.clip(result, 0, 255).astype(np.uint8)


def clean_transparent_image(
    image: np.ndarray,
) -> np.ndarray:
    bgr = image[:, :, :3]
    alpha = image[:, :, 3]

    refined_alpha = refine_alpha_mask(
        alpha,
        erode_size=ERODE_SIZE,
        blur_size=EDGE_BLUR_SIZE,
    )

    despilled = remove_blue_cyan_spill(
        bgr,
        refined_alpha,
        strength=DESPILL_STRENGTH,
        edge_width=EDGE_WIDTH,
    )

    smoothed = smooth_subject_edges(
        despilled,
        refined_alpha,
        edge_width=2,
    )

    final = cv2.merge([
        smoothed[:, :, 0],
        smoothed[:, :, 1],
        smoothed[:, :, 2],
        refined_alpha,
    ])

    return final


def clean_transparent_image_light(
    image: np.ndarray,
) -> np.ndarray:
    """Same as clean_transparent_image, but with a much lighter alpha erosion.

    clean_transparent_image's erosion assumes a chroma-key studio backdrop
    (a person centred well inside the frame) and shrinks the whole
    silhouette uniformly - fine for that passport-photo pipeline, but a full
    erosion also eats into shoulders/limbs on ordinary photos where the
    subject runs close to the frame edge. Skipping erosion entirely, though,
    left the outermost ring of semi-transparent pixels untouched - those
    pixels still carry a blend of hair/edge colour with whatever the
    original studio backdrop was (white, cream, etc.), so they show up as a
    light-coloured fringe once composited over a different backdrop colour.
    A small erosion, blended in partially, trims that outer fringe ring
    without visibly shrinking the silhouette. On top of that,
    defringe_edge_colors and decontaminate_edge_colors subtract whatever
    original backdrop colour (white, cream, blue - any colour) is still
    baked into the remaining boundary pixels - whether they're semi
    transparent or were snapped to fully opaque by refine_alpha_mask's
    threshold - since remove_blue_cyan_spill below only targets a blue/cyan
    studio backdrop specifically.
    """
    bgr = image[:, :, :3]
    alpha = image[:, :, 3]

    # decontaminate_edge_colors' matting formula is only physically valid on
    # the ORIGINAL alpha (a real blend ratio from segmentation), so it runs
    # first, before the alpha is eroded below. Running it after erosion would
    # feed it an alpha value that was artificially manufactured by us, not a
    # genuine partial-coverage ratio, and produce nonsense colours.
    decontaminated = decontaminate_edge_colors(
        bgr,
        alpha,
        edge_width=EDGE_WIDTH * 2,
    )

    refined_alpha = refine_alpha_mask(
        alpha,
        erode_size=3,
        blur_size=EDGE_BLUR_SIZE + 2,
        erode_blend=0.72,
    )

    # defringe_edge_colors runs against the ERODED alpha instead, since its
    # job is specifically to catch pixels refine_alpha_mask just snapped
    # back to full opacity despite sitting right on the boundary. Concave
    # spots (like the notch between an ear and hair) shrink less from
    # erosion than a convex edge does, so they need the widest, strongest
    # pass of the three.
    defringed = defringe_edge_colors(
        decontaminated,
        refined_alpha,
        edge_width=5,
        strength=0.95,
    )

    despilled = remove_blue_cyan_spill(
        defringed,
        refined_alpha,
        strength=DESPILL_STRENGTH,
        edge_width=EDGE_WIDTH,
    )

    smoothed = smooth_subject_edges(
        despilled,
        refined_alpha,
        edge_width=2,
    )

    return cv2.merge([
        smoothed[:, :, 0],
        smoothed[:, :, 1],
        smoothed[:, :, 2],
        refined_alpha,
    ])


def enhance_transparent_bytes(image_bytes: bytes) -> bytes:
    """Refine edges and remove color halo from an in-memory transparent PNG.

    Used by the HTTP API to "enhance" a background-removed image (despill
    + edge smoothing) without touching disk.
    """
    buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(buffer, cv2.IMREAD_UNCHANGED)
    image = ensure_bgra(image)

    alpha = image[:, :, 3]
    if np.all(alpha == 255):
        raise ProcessingError(
            "Image has no transparency to enhance. Remove the background first."
        )

    cleaned = clean_transparent_image_light(image)

    success, encoded = cv2.imencode(".png", cleaned)
    if not success:
        raise ProcessingError("Enhanced image could not be encoded.")

    return encoded.tobytes()


def composite_on_background(
    bgra: np.ndarray,
    rgb_color: tuple[int, int, int],
) -> np.ndarray:
    foreground = bgra[:, :, :3].astype(np.float32)

    alpha = (
        bgra[:, :, 3].astype(np.float32) / 255.0
    )[:, :, None]

    red, green, blue = rgb_color

    background = np.zeros_like(
        foreground,
        dtype=np.float32,
    )

    background[:, :, 0] = blue
    background[:, :, 1] = green
    background[:, :, 2] = red

    result = (
        foreground * alpha
        + background * (1.0 - alpha)
    )

    return np.clip(
        result,
        0,
        255,
    ).astype(np.uint8)


def detect_face(
    bgr_image: np.ndarray,
) -> tuple[int, int, int, int]:
    gray = cv2.cvtColor(
        bgr_image,
        cv2.COLOR_BGR2GRAY,
    )

    gray = cv2.equalizeHist(gray)

    cascade_path = (
        cv2.data.haarcascades
        + "haarcascade_frontalface_default.xml"
    )

    detector = cv2.CascadeClassifier(cascade_path)

    if detector.empty():
        raise ProcessingError(
            "OpenCV face detector load nahi hua."
        )

    faces = detector.detectMultiScale(
        gray,
        scaleFactor=1.08,
        minNeighbors=5,
        minSize=(80, 80),
    )

    if len(faces) == 0:
        raise ProcessingError(
            "Face detect nahi hua. "
            "Front-facing clear image use karo."
        )

    # Sabse bada face select
    face = max(
        faces,
        key=lambda box: box[2] * box[3],
    )

    x, y, width, height = map(int, face)

    return x, y, width, height


def crop_with_padding(
    image: np.ndarray,
    x1: int,
    y1: int,
    x2: int,
    y2: int,
    background_color: tuple[int, int, int],
) -> np.ndarray:
    crop_width = x2 - x1
    crop_height = y2 - y1

    if crop_width <= 0 or crop_height <= 0:
        raise ProcessingError("Invalid crop dimensions.")

    red, green, blue = background_color

    canvas = np.full(
        (crop_height, crop_width, 3),
        (blue, green, red),
        dtype=np.uint8,
    )

    image_height, image_width = image.shape[:2]

    source_x1 = max(0, x1)
    source_y1 = max(0, y1)
    source_x2 = min(image_width, x2)
    source_y2 = min(image_height, y2)

    if source_x2 <= source_x1 or source_y2 <= source_y1:
        raise ProcessingError(
            "Crop image boundary ke bahar hai."
        )

    destination_x1 = source_x1 - x1
    destination_y1 = source_y1 - y1

    destination_x2 = (
        destination_x1 + source_x2 - source_x1
    )

    destination_y2 = (
        destination_y1 + source_y2 - source_y1
    )

    canvas[
        destination_y1:destination_y2,
        destination_x1:destination_x2,
    ] = image[
        source_y1:source_y2,
        source_x1:source_x2,
    ]

    return canvas


def create_passport_crop(
    white_background_image: np.ndarray,
) -> np.ndarray:
    face_x, face_y, face_width, face_height = detect_face(
        white_background_image
    )

    output_width = mm_to_pixels(
        PASSPORT_WIDTH_MM,
        DPI,
    )

    output_height = mm_to_pixels(
        PASSPORT_HEIGHT_MM,
        DPI,
    )

    target_aspect = output_width / output_height

    # Face width final crop width ka approximately 52%
    crop_width = int(
        face_width / FACE_TO_CROP_WIDTH_RATIO
    )

    crop_height = int(
        crop_width / target_aspect
    )

    face_center_x = face_x + face_width / 2
    face_center_y = face_y + face_height / 2

    crop_x1 = int(
        face_center_x - crop_width / 2
    )

    # Face center ko crop height ke 43% point par place karo
    crop_y1 = int(
        face_center_y
        - crop_height * FACE_CENTER_Y_RATIO
    )

    # Hair/top head ke upar minimum margin
    estimated_head_top = face_y - int(face_height * 0.28)

    expected_top_margin = int(
        crop_height * TOP_MARGIN_RATIO
    )

    desired_crop_y1 = (
        estimated_head_top - expected_top_margin
    )

    crop_y1 = min(crop_y1, desired_crop_y1)

    crop_x2 = crop_x1 + crop_width
    crop_y2 = crop_y1 + crop_height

    cropped = crop_with_padding(
        white_background_image,
        crop_x1,
        crop_y1,
        crop_x2,
        crop_y2,
        BACKGROUND_COLOR,
    )

    resized = cv2.resize(
        cropped,
        (output_width, output_height),
        interpolation=cv2.INTER_LANCZOS4,
    )

    return resized


def save_image(
    path: Path,
    image: np.ndarray,
) -> None:
    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    success = cv2.imwrite(
        str(path),
        image,
    )

    if not success:
        raise ProcessingError(
            f"Image save nahi hui:\n{path}"
        )


def process() -> None:
    output_dir = Path(OUTPUT_DIRECTORY)

    print("1. Transparent PNG load ho rahi hai...")
    image = load_transparent_png(INPUT_IMAGE_PATH)

    print("2. Blue/cyan halo remove ho raha hai...")
    print("3. Hair aur shirt edges refine ho rahe hain...")
    cleaned_transparent = clean_transparent_image(image)

    transparent_output = (
        output_dir / "01_cleaned_transparent.png"
    )

    save_image(
        transparent_output,
        cleaned_transparent,
    )

    print("4. White background composite ho raha hai...")
    white_background = composite_on_background(
        cleaned_transparent,
        BACKGROUND_COLOR,
    )

    white_output = (
        output_dir / "02_white_background.jpg"
    )

    save_image(
        white_output,
        white_background,
    )

    print("5. Face detect ho raha hai...")
    print("6. 35x45 mm passport crop generate ho raha hai...")
    passport_image = create_passport_crop(
        white_background
    )

    passport_output = (
        output_dir / "03_passport_35x45_300dpi.jpg"
    )

    save_image(
        passport_output,
        passport_image,
    )

    print("\nProcessing completed successfully.")
    print(f"\nClean transparent PNG:\n{transparent_output}")
    print(f"\nWhite background image:\n{white_output}")
    print(f"\nPassport photo:\n{passport_output}")
    print(
        f"\nPassport pixel size: "
        f"{passport_image.shape[1]} × "
        f"{passport_image.shape[0]}"
    )


def main() -> None:
    try:
        process()

    except ProcessingError as error:
        print("\nProcessing error:")
        print(error)
        sys.exit(1)

    except Exception as error:
        print("\nUnexpected error:")
        print(type(error).__name__, error)
        sys.exit(1)


if __name__ == "__main__":
    main()