"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Clock3, Crop, Download, Eye, EyeOff, FileText, IdCard, Image as ImageIcon, LoaderCircle, LockKeyhole, Printer, Trash2, Upload, Wallet, X } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { calculatePriceItemRate, formatPriceItem, getAllowedPaymentModes, mergePricingDefaults, type PriceItem, type PricingService } from "@/lib/pricing";
import { buildPassportPrompt, passportAttireOptions } from "@/lib/passport-attire";
import { CropEditor, cropImage, loadImage, DEFAULT_CROP_RECT, type CropRect } from "../../CropEditor";
import PublicResumeBuilder from "./PublicResumeBuilder";
import PublicBiodataMaker from "./PublicBiodataMaker";

type PublicShop = {
  code: string;
  shop: {
    shopName: string;
    address: string;
    city: string;
    state: string;
    mobile: string;
    whatsapp: string;
    logo?: string;
    banner?: string;
  };
  services: PricingService[];
  status: {
    verified: boolean;
    open: boolean;
  };
};

type PrintOrder = {
  id: number;
  orderNumber: string;
  tokenId: string;
  tokenNumber: number;
  paymentStatus: string;
  paymentGateway: string;
  status: string;
  totalAmount: number;
  documentDeleted?: boolean;
  geminiPhoto?: string;
};

const serviceIcons: Record<string, typeof FileText> = {
  auto_document_print: FileText,
  passport_photo: ImageIcon,
  id_card_print: IdCard,
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error("Razorpay Checkout could not load."));
    document.body.appendChild(script);
  });
}

export default function CustomerScanPage() {
  const params = useParams<{ code: string }>();
  const [data, setData] = useState<PublicShop | null>(null);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState("auto_document_print");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(1);
  const [finalFile, setFinalFile] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [passportSheetUrl, setPassportSheetUrl] = useState("");
  const [attireCategory, setAttireCategory] = useState(passportAttireOptions[0].key);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPageManagerOpen, setIsPageManagerOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isDeleteDocumentOpen, setIsDeleteDocumentOpen] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pdfPasswordInput, setPdfPasswordInput] = useState("");
  const [pdfPasswordError, setPdfPasswordError] = useState("");
  const [isUnlockingPdf, setIsUnlockingPdf] = useState(false);
  const [showPdfPassword, setShowPdfPassword] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isCombiningFiles, setIsCombiningFiles] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [orderError, setOrderError] = useState("");
  const [paymentMode, setPaymentMode] = useState("Online Payment");
  const [upiQrDataUrl, setUpiQrDataUrl] = useState("");
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [optionsTouched, setOptionsTouched] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const paymentPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentCheckInFlightRef = useRef(false);
  const deletePromptShownForOrderRef = useRef<number | null>(null);

  useEffect(() => {
    fetch(apiUrl(`/api/public-shop/${params.code}/`))
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.message || `Cafe QR request failed (${response.status}).`);
        }
        return result;
      })
      .then((result: PublicShop) => {
        // mergePricingDefaults backfills every known service (including ones
        // the shop never exposed here, like resume_builder - that one is a
        // cafe-staff-assisted flow, not a self-service upload) - keep only
        // the services the backend actually returned for this shop.
        const returnedKeys = new Set(result.services.map((service) => service.serviceKey));
        const services = mergePricingDefaults(result.services).filter((service) => returnedKeys.has(service.serviceKey));
        setData({ ...result, services });
        setError("");
        setSelectedService(services[0]?.serviceKey || "auto_document_print");
        const firstItem = getPriceItems(services[0])[0];
        setSelectedItemId(firstItem?.id || "");
        setPaymentMode(getAllowedPaymentModes(services[0])[0] || "Online Payment");
      })
      .catch((shopError) =>
        setError(shopError instanceof Error ? shopError.message : "Cafe QR not found or temporarily unavailable."),
      );
  }, [params.code]);

  // PayU is a full-page redirect flow (unlike Razorpay's popup), so after
  // PayU sends the browser back here the React state is gone - recover the
  // order from the ?order= query param the backend callback appended.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const orderIdParam = searchParams.get("order");
    const paymentResult = searchParams.get("payment");
    if (!orderIdParam) return;

    fetch(apiUrl(`/api/public-orders/${orderIdParam}/`))
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not load the order.");
        return result;
      })
      .then((result: { order: PrintOrder }) => {
        setOrder(result.order);
        if (paymentResult === "success" || result.order.paymentStatus === "paid") {
          setPaymentMessage("Payment received. Your document has been sent to the print queue.");
        } else if (paymentResult === "failure") {
          setPaymentMessage("Payment was not completed. Please try again.");
        }
      })
      .catch(() => {});
  }, []);

  const activeService = useMemo(() => data?.services.find((service) => service.serviceKey === selectedService), [data, selectedService]);
  const allowedPaymentModes = useMemo(() => getAllowedPaymentModes(activeService), [activeService]);
  const priceItems = activeService ? getPriceItems(activeService) : [];
  const selectedItem = priceItems.find((item) => item.id === selectedItemId) || priceItems[0];
  const isPassportPhoto = selectedService === "passport_photo";
  const hasUploadedFile = Boolean(fileUrl);
  const selectedRate = calculatePriceItemRate(selectedItem, isPassportPhoto ? 1 : pages);
  const amount = hasUploadedFile ? Math.max(0, selectedRate * (isPassportPhoto ? copies : pages * copies)) : 0;
  const hasPdfFile = isPdfFile(fileType, fileName);
  const hasImageFile = isImageFile(fileType, fileName);
  const onlyCropImage = selectedService === "auto_document_print" && hasImageFile;
  const canCropImage = (selectedService === "auto_document_print" || isPassportPhoto) && hasImageFile;
  const showServiceSelector = (data?.services.length || 0) > 1;
  const activeStep = showServiceSelector
    ? order || (hasUploadedFile && optionsTouched)
      ? 4
      : hasUploadedFile
        ? 3
        : selectedService
          ? 2
          : 1
    : order || (hasUploadedFile && optionsTouched)
      ? 3
      : hasUploadedFile
        ? 2
        : 1;
  const completedStepCount = showServiceSelector
    ? order
      ? 4
      : hasUploadedFile && optionsTouched
        ? 3
        : hasUploadedFile
          ? 2
          : selectedService
            ? 1
            : 0
    : order
      ? 3
      : hasUploadedFile && optionsTouched
        ? 2
        : hasUploadedFile
          ? 1
          : 0;
  const customerSteps = showServiceSelector
    ? [
        { label: "Service", text: "Choose print or photo" },
        { label: "Upload", text: "Select PDF or image" },
        { label: "Options", text: "Pages, copies, remove page" },
        { label: "Payment", text: "Check total and continue" },
      ]
    : [
        { label: "Upload", text: "Select PDF or image" },
        { label: "Options", text: "Pages, copies, remove page" },
        { label: "Payment", text: "Check total and continue" },
      ];
  const progressPercent = Math.round((completedStepCount / customerSteps.length) * 100);
  const activeStepLabel = customerSteps[activeStep - 1]?.label || "Service";
  const canDeletePrintedDocument = order?.status === "printed" && !order.documentDeleted;
  const isOnlinePaymentOrder = order?.paymentStatus === "pending" && paymentMode === "Online Payment";
  const isDirectUpiOrder = isOnlinePaymentOrder && order?.paymentGateway === "direct_upi";
  const isRazorpayOrder = isOnlinePaymentOrder && order?.paymentGateway === "razorpay";
  const isPayuOrder = isOnlinePaymentOrder && order?.paymentGateway === "payu";
  const isPhonepeOrder = isOnlinePaymentOrder && order?.paymentGateway === "phonepe";
  const upiLink = useMemo(() => (order && data ? buildUpiLink(order, data.shop.shopName) : ""), [data, order]);
  const isCafeOpen = data?.status.open !== false;

  useEffect(() => {
    if (allowedPaymentModes.length && !allowedPaymentModes.includes(paymentMode)) {
      setPaymentMode(allowedPaymentModes[0]);
    }
  }, [allowedPaymentModes, paymentMode]);

  useEffect(() => {
    if (!isPassportPhoto || !fileUrl || !hasImageFile) {
      if (passportSheetUrl) {
        URL.revokeObjectURL(passportSheetUrl);
        setPassportSheetUrl("");
      }
      return;
    }

    let cancelled = false;
    setFinalFile(null);
    Promise.all([fetch(fileUrl).then((response) => response.blob()), generatePassportSheet(fileUrl)])
      .then(([rawBlob, sheetBlob]) => {
        if (cancelled) return;
        // The tiled sheet is preview-only; the raw photo is what gets sent to the backend.
        setFinalFile(rawBlob);
        setPages(1);
        setPassportSheetUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(sheetBlob);
        });
      })
      .catch(() => setOrderError("Could not prepare the passport photo."));

    return () => {
      cancelled = true;
    };
  }, [fileUrl, hasImageFile, isPassportPhoto]);

  useEffect(() => {
    let isActive = true;

    if (!upiLink || !isDirectUpiOrder) {
      setUpiQrDataUrl("");
      return;
    }

    import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(upiLink, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 220,
      }))
      .then((url) => {
        if (isActive) setUpiQrDataUrl(url);
      })
      .catch(() => {
        if (isActive) setUpiQrDataUrl("");
      });

    return () => {
      isActive = false;
    };
  }, [upiLink, isDirectUpiOrder]);

  useEffect(() => {
    if (!paymentStarted || !order || order.paymentStatus !== "pending" || order.paymentGateway !== "direct_upi") return;

    paymentPollRef.current = setInterval(() => {
      checkUpiPayment(order.id);
    }, 3000);

    return () => {
      if (paymentPollRef.current) {
        clearInterval(paymentPollRef.current);
        paymentPollRef.current = null;
      }
    };
  }, [paymentStarted, order?.id, order?.paymentStatus]);

  useEffect(() => {
    if (!order || order.status === "printed" || order.status === "failed") return;
    if (isPassportPhoto && order.geminiPhoto) return;

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(apiUrl(`/api/public-orders/${order.id}/`));
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.order) setOrder(result.order);
      } catch {
        // Keep the current token visible if status refresh is temporarily unavailable.
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [order]);

  useEffect(() => {
    if (!order || order.status !== "printed" || order.documentDeleted) return;
    if (deletePromptShownForOrderRef.current === order.id) return;

    deletePromptShownForOrderRef.current = order.id;
    setIsDeleteDocumentOpen(true);
  }, [order]);

  useEffect(() => {
    setPrintProgress(0);
  }, [order?.id]);

  useEffect(() => {
    if (!order) return;
    // Passport photo never enters the desktop Print Agent's queue (the
    // agent excludes that service entirely) - `status` stays "queued"
    // forever regardless of how far along the AI generation is, so its
    // own completion signal (geminiPhoto present) drives progress instead.
    // Still animates up to 92% meanwhile so the wait doesn't look stalled.
    if (isPassportPhoto) {
      if (order.geminiPhoto) {
        setPrintProgress(100);
        return;
      }
      // Generation hasn't started yet while a cash-counter order is waiting
      // on the shop owner's approval, or an online-payment order is still
      // waiting on the gateway - animating toward 92% here would read as
      // "in progress" when nothing is actually happening.
      if (order.status === "awaiting_approval" || order.status === "awaiting_payment") return;
    } else if (order.status === "printed") {
      setPrintProgress(100);
      return;
    } else if (order.status !== "queued" && order.status !== "printing") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPrintProgress((current) => {
        if (current >= 92) return current;
        const step = current < 45 ? 7 : current < 75 ? 3 : 1;
        return Math.min(92, current + step);
      });
    }, 650);

    return () => window.clearInterval(intervalId);
  }, [order?.status, order?.id, isPassportPhoto, order?.geminiPhoto]);

  function selectService(service: PricingService) {
    setSelectedService(service.serviceKey);
    setPaymentMode(getAllowedPaymentModes(service)[0] || "Online Payment");
    setSelectedItemId(getPriceItems(service)[0]?.id || "");
    setOptionsTouched(false);
    // Switching services should start clean - an uploaded file, its price
    // calculation, and any in-progress order/payment state all belonged to
    // the previous service and don't carry over.
    clearUpload();
  }

  function selectAttireCategory(category: string) {
    setAttireCategory(category);
    resetOrderDraft();
  }

  function resetOrderDraft() {
    setOrder(null);
    setOrderError("");
    resetPaymentFlow();
  }

  function resetPaymentFlow() {
    setUpiQrDataUrl("");
    setPaymentStarted(false);
    setIsCheckingPayment(false);
    setPaymentMessage("");
    if (paymentPollRef.current) {
      clearInterval(paymentPollRef.current);
      paymentPollRef.current = null;
    }
  }

  async function handleUpload(fileList?: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;

    if (files.length === 1) {
      await handleSingleUpload(files[0]);
      return;
    }

    if (isPassportPhoto) {
      alert("Please upload only one photo for passport size photo.");
      return;
    }

    await handleMultipleUpload(files);
  }

  async function handleSingleUpload(file: File) {
    const isImageUpload = file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);
    if (isPassportPhoto && !isImageUpload) {
      alert("Please upload only JPG, PNG, or JPEG images for passport photos.");
      return;
    }

    const isPdfUpload = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (isPdfUpload) {
      try {
        const { isEncrypted } = await import("@pdfsmaller/pdf-decrypt");
        const status = await isEncrypted(new Uint8Array(await file.arrayBuffer()));
        if (status.encrypted) {
          setPendingPdfFile(file);
          setPdfPasswordInput("");
          setPdfPasswordError("");
          setIsPasswordPromptOpen(true);
          return;
        }
      } catch {
        // Encryption check failed to run; fall through and let the normal PDF flow surface any issue.
      }
    }

    await applyUploadedFile(file);
  }

  // Merges every selected file into one combined PDF (images become full-page
  // scans) so the rest of the flow - page/price calculation, order creation,
  // and the single-document print job the agent picks up - needs no changes
  // at all to handle "multiple documents" as one bigger document.
  async function handleMultipleUpload(files: File[]) {
    const invalidFile = files.find((file) => {
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      return !isImage && !isPdf;
    });
    if (invalidFile) {
      alert("Please upload only PDF, JPG, PNG, or JPEG files.");
      return;
    }

    setIsCombiningFiles(true);
    try {
      const [{ PDFDocument }, { isEncrypted }] = await Promise.all([import("pdf-lib"), import("@pdfsmaller/pdf-decrypt")]);
      const mergedDoc = await PDFDocument.create();

      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

        if (isPdf) {
          const encryptionStatus = await isEncrypted(bytes).catch(() => ({ encrypted: false }));
          if (encryptionStatus.encrypted) {
            alert(`"${file.name}" is password-protected. Please remove its password first, or upload it on its own.`);
            return;
          }
          const sourceDoc = await PDFDocument.load(bytes);
          const copiedPages = await mergedDoc.copyPages(sourceDoc, sourceDoc.getPageIndices());
          copiedPages.forEach((page) => mergedDoc.addPage(page));
        } else {
          // Route every image through <canvas> and re-encode as PNG instead
          // of calling embedJpg directly - pdf-lib's own JPEG decoder can't
          // handle progressive JPEGs (common from phone cameras/screenshots)
          // and throws, which was silently aborting the whole merge whenever
          // a JPG was mixed in. The canvas re-encode uses the browser's own
          // decoder instead, which handles any JPEG/PNG variant.
          const pngBytes = await imageFileToPngBytes(file);
          const image = await mergedDoc.embedPng(pngBytes);
          const page = mergedDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
      }

      const totalPages = mergedDoc.getPageCount();
      if (!totalPages) {
        alert("Could not read any pages from the selected files. Please try again.");
        return;
      }

      const mergedBytes = await mergedDoc.save();
      const mergedFile = new File([mergedBytes], `${files.length} files combined.pdf`, { type: "application/pdf" });
      await applyUploadedFile(mergedFile, totalPages);
    } catch {
      alert("Could not combine the selected files. Please try uploading them one at a time.");
    } finally {
      setIsCombiningFiles(false);
    }
  }

  async function applyUploadedFile(file: File, knownPages?: number) {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (passportSheetUrl) URL.revokeObjectURL(passportSheetUrl);
    const nextUrl = URL.createObjectURL(file);
    setFinalFile(isPassportPhoto ? null : file);
    setFileUrl(nextUrl);
    setFileName(file.name);
    setFileType(file.type || file.name.split(".").pop()?.toLowerCase() || "");
    setIsPageManagerOpen(false);
    setIsPreviewOpen(false);
    setIsCropOpen(false);
    setCropRect(DEFAULT_CROP_RECT);
    setOrder(null);
    setOrderError("");
    setOptionsTouched(false);
    setPassportSheetUrl("");
    resetPaymentFlow();

    if (knownPages !== undefined) {
      setPages(knownPages);
      return;
    }

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const detectedPages = await detectPdfPages(file);
      setPages(detectedPages);
      return;
    }

    setPages(1);
  }

  async function unlockPendingPdf() {
    if (!pendingPdfFile || !pdfPasswordInput) return;

    setIsUnlockingPdf(true);
    setPdfPasswordError("");
    try {
      const { decryptPDF } = await import("@pdfsmaller/pdf-decrypt");
      const bytes = new Uint8Array(await pendingPdfFile.arrayBuffer());
      const decryptedBytes = await decryptPDF(bytes, pdfPasswordInput);
      const unlockedFile = new File([decryptedBytes], pendingPdfFile.name, { type: "application/pdf" });
      setIsPasswordPromptOpen(false);
      setPendingPdfFile(null);
      setPdfPasswordInput("");
      await applyUploadedFile(unlockedFile);
    } catch {
      setPdfPasswordError("Incorrect password. Please try again.");
    } finally {
      setIsUnlockingPdf(false);
    }
  }

  function cancelPdfPasswordPrompt() {
    if (isUnlockingPdf) return;
    setIsPasswordPromptOpen(false);
    setPendingPdfFile(null);
    setPdfPasswordInput("");
    setPdfPasswordError("");
  }

  function clearUploadedFileState() {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (passportSheetUrl) URL.revokeObjectURL(passportSheetUrl);
    setFinalFile(null);
    setFileUrl("");
    setPassportSheetUrl("");
    setFileName("");
    setFileType("");
    setPages(0);
    setIsPreviewOpen(false);
    setIsPageManagerOpen(false);
    setIsCropOpen(false);
    setCropRect(DEFAULT_CROP_RECT);
  }

  function clearUpload() {
    clearUploadedFileState();
    setCopies(1);
    setAttireCategory(passportAttireOptions[0].key);
    setOrder(null);
    setOrderError("");
    resetPaymentFlow();
  }

  async function applyImageCrop() {
    if (!fileUrl || !hasImageFile) return;

    try {
      const croppedBlob = await cropImage(fileUrl, cropRect);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      URL.revokeObjectURL(fileUrl);
      setFinalFile(croppedBlob);
      setFileUrl(croppedUrl);
      setFileName(fileName.replace(/(\.[^.]+)?$/, "-cropped.png"));
      setFileType("image/png");
      setIsCropOpen(false);
      setIsPreviewOpen(false);
      setCropRect(DEFAULT_CROP_RECT);
      setOrder(null);
      setOrderError("");
      if (passportSheetUrl) {
        URL.revokeObjectURL(passportSheetUrl);
        setPassportSheetUrl("");
      }
    } catch {
      alert("Could not crop the image. Please upload the image again and try.");
    }
  }

  async function removePdfPage(pageIndex: number) {
    if (!fileUrl || !hasPdfFile || pages <= 1 || isProcessingPdf) return;

    setIsProcessingPdf(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const sourceBytes = await fetch(fileUrl).then((response) => response.arrayBuffer());
      const pdfDoc = await PDFDocument.load(sourceBytes);
      const currentPageCount = pdfDoc.getPageCount();

      if (currentPageCount <= 1 || pageIndex < 0 || pageIndex >= currentPageCount) return;

      pdfDoc.removePage(pageIndex);
      const updatedBytes = await pdfDoc.save();
      const updatedBlob = new Blob([updatedBytes], { type: "application/pdf" });
      const updatedUrl = URL.createObjectURL(updatedBlob);

      URL.revokeObjectURL(fileUrl);
      setFinalFile(updatedBlob);
      setFileUrl(updatedUrl);
      setPages(pdfDoc.getPageCount());
      setIsPreviewOpen(false);
      setOrder(null);
      setOrderError("");
      if (pdfDoc.getPageCount() <= 1) setIsPageManagerOpen(false);
    } catch {
      alert("Could not remove the PDF page. Please upload the file again and try.");
    } finally {
      setIsProcessingPdf(false);
    }
  }

  async function createPrintOrder() {
    if (!finalFile || !selectedItem || !activeService) return;
    if (!isCafeOpen) {
      setOrderError("This print shop is currently closed. Please try again when the service is open.");
      return;
    }

    setOptionsTouched(true);
    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      const formData = new FormData();
      const uploadName = fileName || (isPassportPhoto ? "passport-photo.jpg" : "document");
      formData.append("document", finalFile, uploadName);
      formData.append("serviceKey", activeService.serviceKey);
      formData.append("priceItemId", selectedItem.id);
      formData.append("priceLabel", selectedItem.label);
      formData.append("rate", String(selectedRate));
      formData.append("pages", String(isPassportPhoto ? 1 : pages));
      formData.append("copies", String(copies));
      formData.append("totalAmount", String(amount));
      formData.append("paymentMode", paymentMode);
      if (isPassportPhoto) {
        formData.append("attireCategory", attireCategory);
        formData.append("prompt", buildPassportPrompt(attireCategory));
      }

      const response = await fetch(apiUrl(`/api/public-shop/${data?.code || params.code}/orders/`), {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not create the order.");
      setOrder(result.order);
      if (result.order?.paymentStatus === "pending" && paymentMode === "Online Payment") {
        if (result.order.paymentGateway === "razorpay") {
          await openRazorpay(result.order);
        } else if (result.order.paymentGateway === "payu") {
          await openPayu(result.order);
        } else if (result.order.paymentGateway === "phonepe") {
          await openPhonepe(result.order);
        } else {
          setPaymentStarted(true);
          setPaymentMessage("Scan the QR code or open your UPI app. We will verify payment automatically.");
        }
      }
    } catch (submitError) {
      setOrderError(submitError instanceof Error ? submitError.message : "Could not create the order.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  async function checkUpiPayment(orderId: number) {
    if (paymentCheckInFlightRef.current) return;

    paymentCheckInFlightRef.current = true;
    setIsCheckingPayment(true);
    setOrderError("");
    try {
      const response = await fetch(apiUrl(`/api/public-orders/${orderId}/check-upi-payment/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not verify the payment.");
      if (result.order) setOrder(result.order);

      if (result.order?.paymentStatus === "paid") {
        setPaymentStarted(false);
        setPaymentMessage("Payment received. Your document has been sent to the print queue.");
      } else {
        setPaymentMessage("Waiting for UPI payment confirmation...");
      }
    } catch (paymentError) {
      setPaymentMessage("");
      setOrderError(paymentError instanceof Error ? paymentError.message : "Could not verify the payment.");
    } finally {
      paymentCheckInFlightRef.current = false;
      setIsCheckingPayment(false);
    }
  }

  async function openRazorpay(targetOrder: PrintOrder) {
    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      const response = await fetch(apiUrl(`/api/public-orders/${targetOrder.id}/razorpay/order/`), { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not start Razorpay.");
      const Razorpay = (window as typeof window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout could not load.");
      const checkout = new Razorpay({
        key: result.payment.keyId,
        amount: result.payment.amount,
        currency: result.payment.currency,
        name: result.payment.name,
        description: result.payment.description,
        order_id: result.payment.gatewayOrderId,
        theme: { color: "#2563eb" },
        handler: async (payment: Record<string, string>) => {
          const verifyResponse = await fetch(apiUrl(`/api/public-orders/${targetOrder.id}/razorpay/verify/`), {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payment),
          });
          const verified = await verifyResponse.json().catch(() => ({}));
          if (!verifyResponse.ok) {
            setOrderError(verified.message || "Payment verification failed.");
            return;
          }
          setOrder(verified.order);
          setPaymentMessage("Payment received. Your document has been sent to the print queue.");
        },
        modal: { ondismiss: () => setPaymentMessage("Payment was not completed. Click Pay with Razorpay to retry.") },
      });
      checkout.open();
    } catch (paymentError) {
      setOrderError(paymentError instanceof Error ? paymentError.message : "Could not start Razorpay.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  async function openPayu(targetOrder: PrintOrder) {
    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      const response = await fetch(apiUrl(`/api/public-orders/${targetOrder.id}/payu/order/`), { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not start PayU.");

      // PayU has no JS popup for hosted checkout - submit a real form so the
      // browser navigates to PayU's page; it redirects back to our backend
      // callback, which then redirects here with ?order=&payment=.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.payment.actionUrl;
      Object.entries(result.payment.fields as Record<string, string>).forEach(([fieldName, fieldValue]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = fieldName;
        input.value = fieldValue;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (paymentError) {
      setOrderError(paymentError instanceof Error ? paymentError.message : "Could not start PayU.");
      setIsSubmittingOrder(false);
    }
  }

  async function openPhonepe(targetOrder: PrintOrder) {
    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      const response = await fetch(apiUrl(`/api/public-orders/${targetOrder.id}/phonepe/order/`), { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not start PhonePe.");
      // PhonePe returns its own hosted checkout URL - just navigate there.
      window.location.href = result.payment.redirectUrl;
    } catch (paymentError) {
      setOrderError(paymentError instanceof Error ? paymentError.message : "Could not start PhonePe.");
      setIsSubmittingOrder(false);
    }
  }

  function openUpiApp() {
    if (!upiLink || !order) return;

    setPaymentStarted(true);
    setPaymentMessage("Opening UPI app. Complete the payment, then keep this page open for confirmation.");
    window.setTimeout(() => checkUpiPayment(order.id), 3000);
    const opened = window.open(upiLink, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = upiLink;
    }
  }

  async function markOrderPaid() {
    if (!order) return;

    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      const response = await fetch(apiUrl(`/api/public-orders/${order.id}/mark-paid/`), { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update the payment.");
      setOrder(result.order);
    } catch (paymentError) {
      setOrderError(paymentError instanceof Error ? paymentError.message : "Could not update the payment.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  async function deletePrintedDocument() {
    if (!order) return;

    setIsDeletingDocument(true);
    setOrderError("");
    try {
      const response = await fetch(apiUrl(`/api/public-orders/${order.id}/delete-document/`), { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not delete the document.");
      setIsDeleteDocumentOpen(false);
      clearUpload();
    } catch (deleteError) {
      setOrderError(deleteError instanceof Error ? deleteError.message : "Could not delete the document.");
    } finally {
      setIsDeletingDocument(false);
    }
  }

  if (error) {
    return (
      <main className="customer-portal">
        <section className="customer-error">{error}</section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="customer-portal">
        <section className="customer-loading">
          <div className="customer-loading-mark">
            <Printer size={26} />
          </div>
          <span className="customer-loading-text">Loading your print shop…</span>
          <div className="customer-loading-dots">
            <i></i>
            <i></i>
            <i></i>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="customer-portal">
      <section className="customer-shop-hero">
        <div className="customer-shop-overlay">
          <div className="customer-shop-identity">
            <div className="customer-logo">
              {data.shop.logo ? <img src={data.shop.logo} alt="" /> : <Printer size={21} />}
            </div>
            <div className="customer-shop-copy">
              <div>
                <span className="customer-brand">RepetiGo PrintPilot</span>
                <h1>{data.shop.shopName || "RepetiGo Cafe"}</h1>
              </div>
              <div className="customer-badges">
                <span className={data.status.open ? "open" : "closed"}>{data.status.open ? "Open" : "Closed"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isCafeOpen ? (
        <section className="customer-closed-state">
          <div className="customer-closed-icon">
            <Clock3 size={30} />
          </div>
          <span>Service Closed</span>
          <h2>{data.shop.shopName || "This print shop"} is not accepting uploads right now.</h2>
          <p>Please scan again later when the cafe reopens. Your documents are safe because no file upload is accepted while the service is closed.</p>
        </section>
      ) : null}

      {isCafeOpen ? (
      <section className="customer-flow-grid">
        {selectedService !== "resume_builder" && selectedService !== "biodata_maker" ? (
          <div className="customer-flow-guide" aria-label="Order steps">
            <div className="customer-progress-summary">
              <div>
                <span>Step {activeStep} of {customerSteps.length}</span>
                <strong>{progressPercent}% complete</strong>
              </div>
              <div className="customer-progress-track" aria-hidden="true">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        ) : null}

        {showServiceSelector ? (
          <article className={`customer-panel ${activeStep === 1 ? "is-guided" : ""}`}>
            <div className="customer-panel-head">
              <span>Step 1</span>
              <h2>Select Service</h2>
            </div>
            <div className="customer-service-grid">
              {data.services.map((service) => {
                const Icon = serviceIcons[service.serviceKey] || FileText;
                return (
                  <label className={selectedService === service.serviceKey ? "active" : ""} key={service.serviceKey}>
                    <input
                      checked={selectedService === service.serviceKey}
                      name="customer-service"
                      type="radio"
                      value={service.serviceKey}
                      onChange={() => selectService(service)}
                    />
                    <Icon size={18} />
                    <strong>{service.serviceName}</strong>
                  </label>
                );
              })}
            </div>
          </article>
        ) : null}

        {selectedService === "resume_builder" ? (
          <PublicResumeBuilder code={data.code} pricingService={activeService} stepNumber={showServiceSelector ? 2 : 1} />
        ) : selectedService === "biodata_maker" ? (
          <PublicBiodataMaker code={data.code} pricingService={activeService} stepNumber={showServiceSelector ? 2 : 1} />
        ) : (
        <>
        <article className={`customer-panel ${activeStep === (showServiceSelector ? 2 : 1) ? "is-guided" : ""}`}>
          <div className="customer-panel-head">
            <span>Step {showServiceSelector ? 2 : 1}</span>
            <h2>Upload Document</h2>
          </div>
          {hasUploadedFile ? (
            <div className="customer-document-preview">
              <div className="document-thumb">
                {isImageFile(fileType, fileName) ? <img src={fileUrl} alt="" /> : <PdfThumb fileName={fileName} fileUrl={fileUrl} pages={pages} onPageCount={setPages} />}
                <button className="document-thumb-preview" type="button" onClick={() => setIsPreviewOpen(true)} aria-label="Preview document">
                  <Eye size={17} />
                </button>
              </div>
              <div>
                <strong>{fileName}</strong>
                <span>{pages ? `${pages} page${pages > 1 ? "s" : ""} detected` : "Detecting pages..."}</span>
                <p className="customer-inline-help">
                  {hasPdfFile
                    ? "If there is a wrong page, use Remove Page. Preview the file before continuing."
                    : canCropImage
                      ? "Use Crop if you only want to print a specific part of the image."
                      : "Preview the file before continuing."}
                </p>
                <div className="document-actions">
                  {hasPdfFile ? (
                    <button type="button" onClick={() => setIsPageManagerOpen(true)} disabled={pages <= 1 || isProcessingPdf}>
                      <Trash2 size={16} /> Remove Page
                    </button>
                  ) : null}
                  {canCropImage ? (
                    <button type="button" onClick={() => setIsCropOpen(true)}>
                      <Crop size={16} /> Crop
                    </button>
                  ) : null}
                  {!onlyCropImage ? (
                    <button type="button" onClick={clearUpload}>
                      <X size={16} /> Remove
                    </button>
                  ) : null}
                </div>
                {isPassportPhoto && passportSheetUrl ? (
                  <>
                    <div className="passport-attire-picker">
                      <span>Dress</span>
                      <div className="passport-attire-options">
                        {passportAttireOptions.map((option) => {
                          const OptionIcon = option.icon;
                          return (
                            <button
                              className={attireCategory === option.key ? "active" : ""}
                              key={option.key}
                              type="button"
                              onClick={() => selectAttireCategory(option.key)}
                              aria-label={option.label}
                              title={option.label}
                            >
                              <OptionIcon size={18} />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="passport-sheet-mini">
                      <img src={passportSheetUrl} alt="" />
                      <span>6 pcs sheet ready</span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <label className={`customer-upload ${isCombiningFiles ? "is-busy" : ""}`}>
              <Upload size={24} />
              <strong>{isPassportPhoto ? "Upload Passport Photo" : "Upload PDF, JPG, PNG, JPEG"}</strong>
              <span>
                {isCombiningFiles
                  ? "Combining your files into one document…"
                  : isPassportPhoto
                    ? "Upload a JPG, PNG, or JPEG image. A 6-piece printable sheet will be created after cropping."
                    : "Pages will be detected automatically. You can also select multiple files at once - they'll be combined and priced together."}
              </span>
              <em>{isCombiningFiles ? "Please wait…" : "Tap to choose a file"}</em>
              <input
                accept={isPassportPhoto ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"}
                type="file"
                multiple={!isPassportPhoto}
                disabled={isCombiningFiles}
                onChange={(event) => handleUpload(event.target.files)}
              />
            </label>
          )}
        </article>

        <article className={`customer-panel customer-options-panel ${activeStep === (showServiceSelector ? 3 : 2) ? "is-guided" : ""}`}>
          <div className="customer-panel-head">
            <span>Step {showServiceSelector ? 3 : 2}</span>
            <h2>Print Options</h2>
          </div>
          {/* <div className="customer-tip-row">
            <Printer size={16} />
            <span>{hasUploadedFile ? "Now confirm the print type, pages, and copies." : "After upload, you can edit pages and copies."}</span>
          </div> */}
          <div className="print-type-control">
            <span>{isPassportPhoto ? "Package" : "Charge Type"}</span>
            <div className="print-type-options">
              {priceItems.map((item) => (
                <label className={selectedItem?.id === item.id ? "active" : ""} key={item.id}>
                  <input
                    checked={selectedItem?.id === item.id}
                    name="print-type"
                    type="radio"
                    value={item.id}
                    onChange={() => {
                      setSelectedItemId(item.id);
                      setOptionsTouched(true);
                      resetOrderDraft();
                    }}
                  />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{formatPriceItem(item).replace(`${item.label} `, "")}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
          {!isPassportPhoto ? (
            <label>
              <span>Pages</span>
              <input
                disabled={!hasUploadedFile}
                min="1"
                placeholder="Upload document first"
                type="number"
                value={hasUploadedFile ? pages : ""}
                onChange={(event) => {
                  setPages(Number(event.target.value || 1));
                  setOptionsTouched(true);
                  resetOrderDraft();
                }}
              />
            </label>
          ) : null}
          <label className="copies-control">
            <span>{isPassportPhoto ? "Sets" : "Copies"}</span>
            <div className="copies-stepper">
              <button
                aria-label="Decrease copies"
                disabled={!hasUploadedFile || copies <= 1}
                type="button"
                onClick={() => {
                  setCopies((current) => Math.max(1, current - 1));
                  setOptionsTouched(true);
                  resetOrderDraft();
                }}
              >
                -
              </button>
              <input
                disabled={!hasUploadedFile}
                min="1"
                placeholder="Upload document first"
                type="number"
                value={hasUploadedFile ? copies : ""}
                onChange={(event) => {
                  setCopies(Number(event.target.value || 1));
                  setOptionsTouched(true);
                  resetOrderDraft();
                }}
              />
              <button
                aria-label="Increase copies"
                disabled={!hasUploadedFile}
                type="button"
                onClick={() => {
                  setCopies((current) => current + 1);
                  setOptionsTouched(true);
                  resetOrderDraft();
                }}
              >
                +
              </button>
            </div>
          </label>
          <label>
            <span>Payment Mode</span>
            <select
              value={paymentMode}
              disabled={allowedPaymentModes.length <= 1}
              onChange={(event) => {
                setPaymentMode(event.target.value);
                setOptionsTouched(true);
                resetOrderDraft();
              }}
            >
              {allowedPaymentModes.map((mode) => (
                <option value={mode} key={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
        </article>

        <article className={`customer-panel customer-summary-panel ${activeStep === (showServiceSelector ? 4 : 3) ? "is-guided" : ""}`}>
          <div className="customer-panel-head">
            <span>Step {showServiceSelector ? 4 : 3}</span>
            <h2>Order Summary</h2>
          </div>
          <div className="customer-summary-row">
            <span>Rate</span>
            <strong>{selectedItem?.label} Rs. {selectedRate}</strong>
          </div>
          <div className="customer-summary-row">
            <span>{isPassportPhoto ? "Package x Sets" : "Pages x Copies"}</span>
            <strong>{hasUploadedFile ? (isPassportPhoto ? `${selectedItem?.label || "6 pcs"} x ${copies}` : `${pages} x ${copies}`) : "Upload pending"}</strong>
          </div>
          {isPassportPhoto ? (
            <div className="customer-summary-row">
              <span>Dress</span>
              <strong>{passportAttireOptions.find((option) => option.key === attireCategory)?.label || passportAttireOptions[0].label}</strong>
            </div>
          ) : null}
          {isPassportPhoto && passportSheetUrl ? (
            <div className="passport-sheet-preview">
              <img src={passportSheetUrl} alt="" />
              <span>Final printable sheet preview</span>
            </div>
          ) : null}
          <div className="customer-total">
            <span>Total</span>
            <strong>Rs. {amount}</strong>
          </div>
          {!hasUploadedFile ? <p className="customer-payment-help">The payment button will be active after upload.</p> : null}
          {order ? (
            <div className="order-created-box">
              <small>Order Created</small>
              <strong>{order.orderNumber}</strong>
              {order.paymentStatus === "paid" || order.paymentStatus === "cash_counter" || order.status === "queued" || order.status === "printing" || order.status === "printed" ? (
                <div className="customer-token-card">
                  <div className="customer-token-head">
                    <small>Your Token ID</small>
                    {canDeletePrintedDocument ? (
                      <button type="button" onClick={() => setIsDeleteDocumentOpen(true)} aria-label="Delete printed document">
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                  <strong>{order.tokenId}</strong>
                </div>
              ) : null}
              {isPassportPhoto ? (
                <div className="customer-token-card">
                  <small>Passport Photo Preview</small>
                  {order.geminiPhoto ? (
                    <>
                      <img src={apiUrl(order.geminiPhoto)} alt="Generated passport photo" className="gemini-photo-preview" />
                      <a className="customer-download-btn" href={apiUrl(order.geminiPhoto)} download="passport-photo.jpg">
                        <Download size={16} /> Download photo
                      </a>
                      <p className="customer-inline-help">Please collect your hardcopy passport photo from your cyber cafe shop.</p>
                    </>
                  ) : order.status === "awaiting_approval" ? (
                    <span>Waiting for the cafe owner to confirm your cash counter payment before your photo is generated.</span>
                  ) : (
                    <div className="print-progress-box">
                      <div className="print-progress-head">
                        <LoaderCircle className="spin" size={16} />
                        <span>Generating your passport photo…</span>
                        <strong>{printProgress}%</strong>
                      </div>
                      <progress value={printProgress} max={100} />
                      <p>This page checks every few seconds - your photo and download link will appear here.</p>
                    </div>
                  )}
                </div>
              ) : null}
              {!isPassportPhoto ? (
                order.status === "queued" || order.status === "printing" ? (
                  <div className="print-progress-box">
                    <div className="print-progress-head">
                      <LoaderCircle className="spin" size={16} />
                      <span>{order.status === "printing" ? "Printing your document…" : "Waiting in the print queue…"}</span>
                      <strong>{printProgress}%</strong>
                    </div>
                    <progress value={printProgress} max={100} />
                    <p>Please stay on this page — you&apos;ll be able to delete your document here once printing is complete.</p>
                  </div>
                ) : (
                  <span>
                    {order.status === "awaiting_approval"
                      ? "Cash counter approval is pending. The cafe owner will approve the print after receiving cash."
                      : order.documentDeleted
                        ? "The document has been deleted. The token record is saved."
                        : order.status === "printed"
                          ? "Print is complete. You can delete the uploaded document if you want."
                          : order.status === "failed"
                            ? "Printing failed. Please contact the cafe for help."
                            : "Payment is pending."}
                  </span>
                )
              ) : null}
            </div>
          ) : null}
          {orderError ? <div className="profile-alert error">{orderError}</div> : null}
          {isDirectUpiOrder ? (
            <div className="upi-payment-box">
              <div className="upi-payment-head">
                <span>UPI Payment</span>
                <strong>Rs. {order.totalAmount}</strong>
              </div>
              {upiQrDataUrl ? <img src={upiQrDataUrl} alt="UPI payment QR code" /> : <div className="upi-qr-placeholder">Generating QR...</div>}
              <p>Pay for {order.orderNumber}. Printing will start after payment confirmation.</p>
              {paymentMessage ? <small>{paymentMessage}</small> : null}
              <button type="button" onClick={openUpiApp} disabled={!upiLink || isSubmittingOrder}>
                <Wallet size={18} /> Open UPI App
              </button>
              <button className="secondary-action" type="button" onClick={() => checkUpiPayment(order.id)} disabled={isCheckingPayment}>
                {isCheckingPayment ? "Checking..." : "I have paid, check now"}
              </button>
            </div>
          ) : isRazorpayOrder && order ? (
            <button type="button" onClick={() => openRazorpay(order)} disabled={isSubmittingOrder}>
              <Wallet size={18} /> {isSubmittingOrder ? "Opening Razorpay..." : "Pay with Razorpay"}
            </button>
          ) : isPayuOrder && order ? (
            <div className="upi-payment-box">
              {paymentMessage ? <small>{paymentMessage}</small> : null}
              <button type="button" onClick={() => openPayu(order)} disabled={isSubmittingOrder}>
                <Wallet size={18} /> {isSubmittingOrder ? "Opening PayU..." : "Pay with PayU"}
              </button>
            </div>
          ) : isPhonepeOrder && order ? (
            <div className="upi-payment-box">
              {paymentMessage ? <small>{paymentMessage}</small> : null}
              <button type="button" onClick={() => openPhonepe(order)} disabled={isSubmittingOrder}>
                <Wallet size={18} /> {isSubmittingOrder ? "Opening PhonePe..." : "Pay with PhonePe"}
              </button>
            </div>
          ) : (
            <button type="button" onClick={createPrintOrder} disabled={!hasUploadedFile || !finalFile || isSubmittingOrder || Boolean(order)}>
              <Wallet size={18} /> {isSubmittingOrder ? "Creating Order..." : order ? "Order Created" : "Continue to Payment"}
            </button>
          )}
        </article>
        </>
        )}
      </section>
      ) : null}

      {isDeleteDocumentOpen ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Delete printed document">
          <div className="confirm-dialog">
            <span className="confirm-dialog-kicker">RepetiGo Privacy</span>
            <div className="confirm-dialog-icon">
              <Trash2 size={22} />
            </div>
            <h2>Delete your document?</h2>
            <p>RepetiGo does not store your documents. Please delete it now to keep your data private. If you choose &quot;No&quot;, RepetiGo will not be responsible for anything that happens to your document — though it will be auto-deleted from our servers within 7 days regardless.</p>
            <div className="confirm-dialog-actions">
              <button type="button" onClick={() => setIsDeleteDocumentOpen(false)} disabled={isDeletingDocument}>
                No, Keep It
              </button>
              <button type="button" onClick={deletePrintedDocument} disabled={isDeletingDocument}>
                {isDeletingDocument ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isPreviewOpen ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Document preview">
          <div className="document-preview-window">
            <div className="document-preview-head">
              <div>
                <strong>{fileName}</strong>
                <span>{pages ? `${pages} page${pages > 1 ? "s" : ""}` : "Preview"}</span>
              </div>
              <button type="button" onClick={() => setIsPreviewOpen(false)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="document-preview-body">
              {isImageFile(fileType, fileName) ? <img src={fileUrl} alt="" /> : <iframe src={fileUrl} title={fileName} />}
            </div>
            <div className="document-preview-actions">
              <button type="button" onClick={() => setIsPreviewOpen(false)}>
                <X size={16} /> Close Preview
              </button>
              <button type="button" onClick={clearUpload}>
                <Trash2 size={16} /> Remove File
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isPageManagerOpen ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Remove PDF pages">
          <div className="page-manager-window">
            <div className="document-preview-head">
              <div>
                <strong>Remove Pages</strong>
                <span>{fileName}</span>
              </div>
              <button type="button" onClick={() => setIsPageManagerOpen(false)} aria-label="Close page manager">
                <X size={18} />
              </button>
            </div>
            <div className="page-manager-body">
              {Array.from({ length: pages }, (_, index) => (
                <div className="pdf-page-card" key={`${fileUrl}-${index}`}>
                  <PdfPageThumb fileUrl={fileUrl} pageNumber={index + 1} />
                  <div>
                    <strong>Page {index + 1}</strong>
                    <button type="button" onClick={() => removePdfPage(index)} disabled={pages <= 1 || isProcessingPdf}>
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isCropOpen ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Crop image">
          <div className="crop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop Image</strong>
                <span>{fileName}</span>
              </div>
              <button type="button" onClick={() => setIsCropOpen(false)} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <CropEditor fileUrl={fileUrl} rect={cropRect} onRectChange={setCropRect} />
              <div className="crop-controls">
                <p>Drag a corner or edge to resize the print area. Drag inside the box to move the crop area.</p>
                <button type="button" onClick={() => setCropRect(DEFAULT_CROP_RECT)}>
                  Reset Crop
                </button>
                <button type="button" onClick={applyImageCrop}>
                  <Crop size={17} /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isPasswordPromptOpen ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Enter PDF password">
          <div className="pdf-password-window">
            <div className="pdf-password-icon">
              <LockKeyhole size={22} />
            </div>
            <h2>Password Protected PDF</h2>
            <p>{pendingPdfFile?.name || "This PDF"} is locked. Enter the password to unlock it and continue.</p>
            <div className="password-input">
              <input
                type={showPdfPassword ? "text" : "password"}
                value={pdfPasswordInput}
                onChange={(event) => setPdfPasswordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") unlockPendingPdf();
                }}
                placeholder="Enter PDF password"
                autoFocus
              />
              <button type="button" onClick={() => setShowPdfPassword((value) => !value)} aria-label={showPdfPassword ? "Hide password" : "Show password"}>
                {showPdfPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pdfPasswordError ? <span className="pdf-password-error">{pdfPasswordError}</span> : null}
            <div className="pdf-password-actions">
              <button type="button" onClick={cancelPdfPasswordPrompt} disabled={isUnlockingPdf}>
                Cancel
              </button>
              <button type="button" onClick={unlockPendingPdf} disabled={isUnlockingPdf || !pdfPasswordInput}>
                {isUnlockingPdf ? "Unlocking..." : "Unlock PDF"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function getPriceItems(service?: PricingService) {
  return Array.isArray(service?.settings.priceItems) ? service.settings.priceItems : [];
}

function getUpiTransactionRef(order: PrintOrder) {
  return `${order.orderNumber}`.replace(/[^A-Za-z0-9]/g, "").slice(0, 35);
}

function buildUpiLink(order: PrintOrder, shopName: string) {
  const transactionRef = getUpiTransactionRef(order);
  const params = new URLSearchParams({
    pa: "8298972939@okbizaxis",
    pn: shopName || "RepetiGo Print",
    mc: "5944",
    aid: "uGICAgICTie7ceg",
    ver: "01",
    mode: "01",
    tr: transactionRef,
    am: order.totalAmount.toFixed(2),
    cu: "INR",
    tn: transactionRef,
  });

  return `upi://pay?${params.toString()}`;
}

function isImageFile(fileType: string, fileName: string) {
  return fileType.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(fileName);
}

function isPdfFile(fileType: string, fileName: string) {
  return fileType === "application/pdf" || /\.pdf$/i.test(fileName);
}

async function detectPdfPages(file: File) {
  try {
    const text = await file.text();
    const matches = text.match(/\/Type\s*\/Page\b/g);
    return Math.max(matches?.length || 1, 1);
  } catch {
    return 1;
  }
}

async function imageFileToPngBytes(file: File): Promise<Uint8Array> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not supported");
    context.drawImage(image, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not encode image as PNG");
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function generatePassportSheet(fileUrl: string) {
  const image = await loadImage(fileUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const sheetWidth = 1800;
  const sheetHeight = 1200;
  const photoWidth = 360;
  const photoHeight = 463;
  const gapX = 180;
  const gapY = 80;
  const startX = (sheetWidth - photoWidth * 3 - gapX * 2) / 2;
  const startY = (sheetHeight - photoHeight * 2 - gapY) / 2;

  canvas.width = sheetWidth;
  canvas.height = sheetHeight;
  if (!context) throw new Error("Canvas not supported");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, sheetWidth, sheetHeight);

  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = startX + col * (photoWidth + gapX);
      const y = startY + row * (photoHeight + gapY);
      drawPassportPhoto(context, image, x, y, photoWidth, photoHeight);
    }
  }

  context.fillStyle = "#111a44";
  context.font = "bold 28px Segoe UI, Arial";
  context.fillText("RepetiGo Passport Photo", 56, sheetHeight - 44);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Passport sheet failed"))), "image/png", 0.95);
  });
}

function drawPassportPhoto(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  context.save();
  context.fillStyle = "#ffffff";
  context.fillRect(x, y, width, height);
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();

  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  context.restore();
  context.strokeStyle = "#d6dbea";
  context.lineWidth = 3;
  context.strokeRect(x, y, width, height);
}

function PdfThumb({ fileName, fileUrl, pages, onPageCount }: { fileName: string; fileUrl: string; pages: number; onPageCount: (pages: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy: () => void; promise: Promise<any> } | null = null;

    async function renderPdfThumbnail() {
      if (!fileUrl || !canvasRef.current) return;

      try {
        setFailed(false);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

        loadingTask = pdfjs.getDocument({ url: fileUrl });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        onPageCount(Math.max(pdf.numPages, 1));
        const page = await pdf.getPage(1);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const cssWidth = 128;
        const scale = cssWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const ratio = window.devicePixelRatio || 1;

        if (!context) return;

        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        await page.render({ canvasContext: context, viewport }).promise;
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    renderPdfThumbnail();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [fileUrl, onPageCount]);

  return (
    <div className="pdf-thumb">
      {failed ? <FileText size={34} /> : <canvas ref={canvasRef} aria-label={`${fileName} preview`} />}
      <span>{pages || 1} page{pages > 1 ? "s" : ""}</span>
    </div>
  );
}

function PdfPageThumb({ fileUrl, pageNumber }: { fileUrl: string; pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy: () => void; promise: Promise<any> } | null = null;

    async function renderPage() {
      if (!fileUrl || !canvasRef.current) return;

      try {
        setFailed(false);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

        loadingTask = pdfjs.getDocument({ url: fileUrl });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const cssWidth = 118;
        const scale = cssWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const ratio = window.devicePixelRatio || 1;

        if (!context) return;

        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        await page.render({ canvasContext: context, viewport }).promise;
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [fileUrl, pageNumber]);

  return <div className="pdf-page-thumb">{failed ? <FileText size={32} /> : <canvas ref={canvasRef} aria-label={`Page ${pageNumber} preview`} />}</div>;
}
