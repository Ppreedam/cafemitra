"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, Crop, Eye, FileText, IdCard, Image as ImageIcon, Phone, Trash2, Upload, Wallet, X } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { mergePricingDefaults, type PriceItem, type PricingService } from "@/lib/pricing";

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
  status: string;
  totalAmount: number;
};

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropDrag = {
  mode: "move" | "resize";
  handle?: string;
  startX: number;
  startY: number;
  rect: CropRect;
};

const serviceIcons: Record<string, typeof FileText> = {
  auto_document_print: FileText,
  passport_photo: ImageIcon,
  id_card_print: IdCard,
};

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
  const [passportBackground, setPassportBackground] = useState("white");
  const [passportCustomBackground, setPassportCustomBackground] = useState("#ffffff");
  const [removePassportBackground, setRemovePassportBackground] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPageManagerOpen, setIsPageManagerOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect>({ x: 10, y: 10, width: 80, height: 80 });
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [orderError, setOrderError] = useState("");
  const [paymentMode, setPaymentMode] = useState("Online Payment");

  useEffect(() => {
    fetch(apiUrl(`/api/public-shop/${params.code}/`))
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((result: PublicShop) => {
        const services = mergePricingDefaults(result.services);
        setData({ ...result, services });
        setSelectedService(services[0]?.serviceKey || "auto_document_print");
        const firstItem = getPriceItems(services[0])[0];
        setSelectedItemId(firstItem?.id || "");
        setPaymentMode(String(services[0]?.settings.paymentMode || "Online Payment"));
      })
      .catch(() => setError("Cafe QR not found or temporarily unavailable."));
  }, [params.code]);

  const activeService = useMemo(() => data?.services.find((service) => service.serviceKey === selectedService), [data, selectedService]);
  const priceItems = activeService ? getPriceItems(activeService) : [];
  const selectedItem = priceItems.find((item) => item.id === selectedItemId) || priceItems[0];
  const isPassportPhoto = selectedService === "passport_photo";
  const hasUploadedFile = Boolean(fileUrl);
  const amount = hasUploadedFile ? Math.max(0, Number(selectedItem?.rate || 0) * (isPassportPhoto ? copies : pages * copies)) : 0;
  const hasPdfFile = isPdfFile(fileType, fileName);
  const hasImageFile = isImageFile(fileType, fileName);
  const onlyCropImage = selectedService === "auto_document_print" && hasImageFile;
  const canCropImage = (selectedService === "auto_document_print" || isPassportPhoto) && hasImageFile;

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
    generatePassportSheet(fileUrl, passportBackground, passportCustomBackground, removePassportBackground)
      .then((sheetBlob) => {
        if (cancelled) return;
        setFinalFile(sheetBlob);
        setPages(1);
        setPassportSheetUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(sheetBlob);
        });
      })
      .catch(() => setOrderError("Passport photo sheet generate nahi ho paya."));

    return () => {
      cancelled = true;
    };
  }, [fileUrl, hasImageFile, isPassportPhoto, passportBackground, passportCustomBackground, removePassportBackground]);

  function selectService(service: PricingService) {
    setSelectedService(service.serviceKey);
    setPaymentMode(String(service.settings.paymentMode || "Online Payment"));
    setSelectedItemId(getPriceItems(service)[0]?.id || "");
    setCopies(1);
    setOrder(null);
    setOrderError("");
    if (service.serviceKey === "passport_photo" && hasUploadedFile && !hasImageFile) {
      clearUpload();
    }
  }

  function resetOrderDraft() {
    setOrder(null);
    setOrderError("");
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    const isImageUpload = file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);
    if (isPassportPhoto && !isImageUpload) {
      alert("Passport Size Photo ke liye sirf JPG, PNG, JPEG image upload karein.");
      return;
    }

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
    setCropRect({ x: 10, y: 10, width: 80, height: 80 });
    setOrder(null);
    setOrderError("");
    setPassportSheetUrl("");

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const detectedPages = await detectPdfPages(file);
      setPages(detectedPages);
      return;
    }

    setPages(1);
  }

  function clearUpload() {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (passportSheetUrl) URL.revokeObjectURL(passportSheetUrl);
    setFinalFile(null);
    setFileUrl("");
    setPassportSheetUrl("");
    setFileName("");
    setFileType("");
    setPages(0);
    setCopies(1);
    setIsPreviewOpen(false);
    setIsPageManagerOpen(false);
    setIsCropOpen(false);
    setOrder(null);
    setOrderError("");
    setCropRect({ x: 10, y: 10, width: 80, height: 80 });
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
      setCropRect({ x: 10, y: 10, width: 80, height: 80 });
      setOrder(null);
      setOrderError("");
      if (passportSheetUrl) {
        URL.revokeObjectURL(passportSheetUrl);
        setPassportSheetUrl("");
      }
    } catch {
      alert("Image crop nahi ho paya. Please image dobara upload karke try karein.");
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
      alert("PDF page remove nahi ho paya. Please file dobara upload karke try karein.");
    } finally {
      setIsProcessingPdf(false);
    }
  }

  async function createPrintOrder() {
    if (!finalFile || !selectedItem || !activeService) return;

    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      const formData = new FormData();
      const uploadName = isPassportPhoto ? `${data?.code || params.code}-passport-6pcs.png` : fileName || "document";
      formData.append("document", finalFile, uploadName);
      formData.append("serviceKey", activeService.serviceKey);
      formData.append("priceItemId", selectedItem.id);
      formData.append("priceLabel", selectedItem.label);
      formData.append("rate", String(selectedItem.rate));
      formData.append("pages", String(isPassportPhoto ? 1 : pages));
      formData.append("copies", String(copies));
      formData.append("totalAmount", String(amount));
      formData.append("paymentMode", paymentMode);

      const response = await fetch(apiUrl(`/api/public-shop/${data?.code || params.code}/orders/`), {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Order create nahi ho paya.");
      setOrder(result.order);
    } catch (submitError) {
      setOrderError(submitError instanceof Error ? submitError.message : "Order create nahi ho paya.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  async function markOrderPaid() {
    if (!order) return;

    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      const response = await fetch(apiUrl(`/api/public-orders/${order.id}/mark-paid/`), { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Payment update nahi ho paya.");
      setOrder(result.order);
    } catch (paymentError) {
      setOrderError(paymentError instanceof Error ? paymentError.message : "Payment update nahi ho paya.");
    } finally {
      setIsSubmittingOrder(false);
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
        <section className="customer-error">Loading cafe...</section>
      </main>
    );
  }

  return (
    <main className="customer-portal">
      <section className="customer-shop-hero">
        <div className="customer-shop-overlay">
          <div className="customer-logo">{data.shop.logo ? <img src={data.shop.logo} alt="" /> : data.shop.shopName.charAt(0)}</div>
          <div>
            <h1>{data.shop.shopName || "CafeMitra Cafe"}</h1>
            <div className="customer-badges">
              {data.status.verified ? (
                <span>
                  <BadgeCheck size={15} /> Verified
                </span>
              ) : null}
              <span className={data.status.open ? "open" : "closed"}>{data.status.open ? "Open" : "Closed"}</span>
            </div>
            <p>{[data.shop.address, data.shop.city, data.shop.state].filter(Boolean).join(", ")}</p>
            <a href={`tel:${data.shop.mobile}`}>
              <Phone size={15} /> {data.shop.mobile || data.shop.whatsapp || "Call shop"}
            </a>
          </div>
        </div>
      </section>

      <section className="customer-flow-grid">
        <article className="customer-panel">
          <h2>Select Service</h2>
          <div className="customer-service-grid">
            {data.services.map((service) => {
              const Icon = serviceIcons[service.serviceKey] || FileText;
              return (
                <button className={selectedService === service.serviceKey ? "active" : ""} type="button" key={service.serviceKey} onClick={() => selectService(service)}>
                  <Icon size={20} />
                  <span>
                    <strong>{service.serviceName}</strong>
                    <small>{getServiceSummary(service)}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="customer-panel">
          <h2>Upload Document</h2>
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
                <div className="document-actions">
                  {!onlyCropImage ? (
                    <button type="button" onClick={() => setIsPreviewOpen(true)}>
                      <Eye size={16} /> Preview
                    </button>
                  ) : null}
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
                    <div className="passport-photo-tools">
                      <label className="passport-bg-toggle">
                        <input
                          type="checkbox"
                          checked={removePassportBackground}
                          disabled={passportBackground === "original"}
                          onChange={(event) => {
                            setRemovePassportBackground(event.target.checked);
                            resetOrderDraft();
                          }}
                        />
                        <span>Remove background</span>
                      </label>
                      <label>
                        <span>Background</span>
                        <select
                          value={passportBackground}
                          onChange={(event) => {
                            setPassportBackground(event.target.value);
                            resetOrderDraft();
                          }}
                        >
                          <option value="white">White</option>
                          <option value="blue">Light Blue</option>
                          <option value="custom">Custom Color</option>
                          <option value="original">Original</option>
                        </select>
                      </label>
                      {passportBackground === "custom" ? (
                        <label>
                          <span>Color</span>
                          <div className="passport-color-control">
                            <input
                              aria-label="Choose passport photo background color"
                              type="color"
                              value={passportCustomBackground}
                              onChange={(event) => {
                                setPassportCustomBackground(event.target.value);
                                resetOrderDraft();
                              }}
                            />
                            <strong>{passportCustomBackground}</strong>
                          </div>
                        </label>
                      ) : null}
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
            <label className="customer-upload">
              <Upload size={24} />
              <strong>{isPassportPhoto ? "Upload Passport Photo" : "Upload PDF, JPG, PNG, JPEG"}</strong>
              <span>{isPassportPhoto ? "JPG, PNG, JPEG image upload karo. Crop ke baad 6 pcs printable sheet banegi." : "Pages auto-detect honge. Upload ke baad thumbnail aur full preview milega."}</span>
              <input accept={isPassportPhoto ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"} type="file" onChange={(event) => handleUpload(event.target.files?.[0])} />
            </label>
          )}
        </article>

        <article className="customer-panel customer-options-panel">
          <h2>Print Options</h2>
          <label>
            <span>{isPassportPhoto ? "Package" : "Charge Type"}</span>
            <select
              value={selectedItem?.id || ""}
              onChange={(event) => {
                setSelectedItemId(event.target.value);
                resetOrderDraft();
              }}
            >
              {priceItems.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.label} - Rs. {item.rate}
                </option>
              ))}
            </select>
          </label>
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
                  resetOrderDraft();
                }}
              />
            </label>
          ) : null}
          <label>
            <span>{isPassportPhoto ? "Sets" : "Copies"}</span>
            <input
              disabled={!hasUploadedFile}
              min="1"
              placeholder="Upload document first"
              type="number"
              value={hasUploadedFile ? copies : ""}
              onChange={(event) => {
                setCopies(Number(event.target.value || 1));
                resetOrderDraft();
              }}
            />
          </label>
          <label>
            <span>Payment Mode</span>
            <select
              value={paymentMode}
              onChange={(event) => {
                setPaymentMode(event.target.value);
                resetOrderDraft();
              }}
            >
              <option>Online Payment</option>
              <option>Cash Counter</option>
              <option>UPI</option>
              <option>Both</option>
            </select>
          </label>
        </article>

        <article className="customer-panel customer-summary-panel">
          <h2>Order Summary</h2>
          <div className="customer-summary-row">
            <span>Service</span>
            <strong>{activeService?.serviceName}</strong>
          </div>
          <div className="customer-summary-row">
            <span>Rate</span>
            <strong>{selectedItem?.label} Rs. {selectedItem?.rate}</strong>
          </div>
          <div className="customer-summary-row">
            <span>{isPassportPhoto ? "Package x Sets" : "Pages x Copies"}</span>
            <strong>{hasUploadedFile ? (isPassportPhoto ? `${selectedItem?.label || "6 pcs"} x ${copies}` : `${pages} x ${copies}`) : "Upload pending"}</strong>
          </div>
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
          {order ? (
            <div className="order-created-box">
              <small>Order Created</small>
              <strong>{order.orderNumber}</strong>
              {order.paymentStatus === "paid" || order.paymentStatus === "cash_counter" || order.status === "queued" ? (
                <div className="customer-token-card">
                  <small>Your Token ID</small>
                  <strong>{order.tokenId}</strong>
                </div>
              ) : null}
              <span>
                {order.status === "awaiting_approval"
                  ? "Cash counter approval pending hai. Cafe owner cash receive karke print approve karega."
                  : order.paymentStatus === "paid" || order.status === "queued"
                    ? "Print queue me bhej diya gaya."
                    : "Payment pending hai."}
              </span>
            </div>
          ) : null}
          {orderError ? <div className="profile-alert error">{orderError}</div> : null}
          {order && order.paymentStatus === "pending" ? (
            <button type="button" onClick={markOrderPaid} disabled={isSubmittingOrder}>
              <Wallet size={18} /> {isSubmittingOrder ? "Processing..." : "Pay Now"}
            </button>
          ) : (
            <button type="button" onClick={createPrintOrder} disabled={!hasUploadedFile || !finalFile || isSubmittingOrder || Boolean(order)}>
              <Wallet size={18} /> {isSubmittingOrder ? "Creating Order..." : order ? "Order Created" : "Continue to Payment"}
            </button>
          )}
        </article>
      </section>

      {isPreviewOpen ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Document preview">
          <div className="document-preview-window">
            <div className="document-preview-head">
              <strong>{fileName}</strong>
              <button type="button" onClick={() => setIsPreviewOpen(false)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="document-preview-body">
              {isImageFile(fileType, fileName) ? <img src={fileUrl} alt="" /> : <iframe src={fileUrl} title={fileName} />}
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
                <p>Corner ya edge drag karke print area resize karo. Box ke andar drag karke crop area move karo.</p>
                <button type="button" onClick={() => setCropRect({ x: 10, y: 10, width: 80, height: 80 })}>
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
    </main>
  );
}

function getPriceItems(service?: PricingService) {
  return Array.isArray(service?.settings.priceItems) ? service.settings.priceItems : [];
}

function getServiceSummary(service: PricingService) {
  const items = getPriceItems(service);
  return items.length ? items.map((item) => `${item.label} Rs. ${item.rate}`).join(" | ") : "Pricing not set";
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

function CropEditor({ fileUrl, rect, onRectChange }: { fileUrl: string; rect: CropRect; onRectChange: (rect: CropRect) => void }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<CropDrag | null>(null);

  function updateFromPointer(event: PointerEvent | { clientX: number; clientY: number }) {
    const stage = stageRef.current;
    const drag = dragRef.current;
    if (!stage || !drag) return;

    const bounds = stage.getBoundingClientRect();
    const deltaX = ((event.clientX - drag.startX) / bounds.width) * 100;
    const deltaY = ((event.clientY - drag.startY) / bounds.height) * 100;
    const next = drag.mode === "move" ? moveCropRect(drag.rect, deltaX, deltaY) : resizeCropRect(drag.rect, drag.handle || "", deltaX, deltaY);
    onRectChange(next);
  }

  function startDrag(event: React.PointerEvent<HTMLElement>, mode: CropDrag["mode"], handle?: string) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      rect,
    };
  }

  function stopDrag() {
    dragRef.current = null;
  }

  return (
    <div className="crop-stage" ref={stageRef} onPointerMove={updateFromPointer} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
      <img src={fileUrl} alt="" draggable={false} />
      <div
        className="crop-selection"
        style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
        onPointerDown={(event) => startDrag(event, "move")}
      >
        {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
          <span
            className={`crop-handle crop-handle-${handle}`}
            key={handle}
            onPointerDown={(event) => {
              event.stopPropagation();
              startDrag(event, "resize", handle);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function moveCropRect(rect: CropRect, deltaX: number, deltaY: number) {
  return {
    ...rect,
    x: clamp(rect.x + deltaX, 0, 100 - rect.width),
    y: clamp(rect.y + deltaY, 0, 100 - rect.height),
  };
}

function resizeCropRect(rect: CropRect, handle: string, deltaX: number, deltaY: number) {
  const minSize = 8;
  let { x, y, width, height } = rect;

  if (handle.includes("w")) {
    const nextX = clamp(x + deltaX, 0, x + width - minSize);
    width += x - nextX;
    x = nextX;
  }

  if (handle.includes("e")) {
    width = clamp(width + deltaX, minSize, 100 - x);
  }

  if (handle.includes("n")) {
    const nextY = clamp(y + deltaY, 0, y + height - minSize);
    height += y - nextY;
    y = nextY;
  }

  if (handle.includes("s")) {
    height = clamp(height + deltaY, minSize, 100 - y);
  }

  return { x, y, width, height };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

async function cropImage(fileUrl: string, rect: CropRect) {
  const image = await loadImage(fileUrl);
  const sourceX = (rect.x / 100) * image.naturalWidth;
  const sourceY = (rect.y / 100) * image.naturalHeight;
  const sourceWidth = (rect.width / 100) * image.naturalWidth;
  const sourceHeight = (rect.height / 100) * image.naturalHeight;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = Math.max(1, Math.round(sourceWidth));
  canvas.height = Math.max(1, Math.round(sourceHeight));
  if (!context) throw new Error("Canvas not supported");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))), "image/png", 0.95);
  });
}

async function generatePassportSheet(fileUrl: string, background: string, customBackground: string, removeBackground: boolean) {
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
  const bgColor = passportBackgroundColor(background, customBackground);

  canvas.width = sheetWidth;
  canvas.height = sheetHeight;
  if (!context) throw new Error("Canvas not supported");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, sheetWidth, sheetHeight);

  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = startX + col * (photoWidth + gapX);
      const y = startY + row * (photoHeight + gapY);
      drawPassportPhoto(context, image, x, y, photoWidth, photoHeight, background === "original" ? "" : bgColor, removeBackground && background !== "original");
    }
  }

  context.fillStyle = "#111a44";
  context.font = "bold 28px Segoe UI, Arial";
  context.fillText("CafeMitra Passport Photo", 56, sheetHeight - 44);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Passport sheet failed"))), "image/png", 0.95);
  });
}

function passportBackgroundColor(background: string, customBackground: string) {
  if (background === "blue") return "#dff3ff";
  if (background === "custom") return customBackground || "#ffffff";
  return "#ffffff";
}

function drawPassportPhoto(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number, backgroundColor: string, removeBackground: boolean) {
  context.save();
  context.fillStyle = backgroundColor || "#ffffff";
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
  if (removeBackground && backgroundColor) {
    replaceApproxBackground(context, x, y, width, height, backgroundColor);
  }
  context.restore();
  context.strokeStyle = "#d6dbea";
  context.lineWidth = 3;
  context.strokeRect(x, y, width, height);
}

function replaceApproxBackground(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, backgroundColor: string) {
  const imageData = context.getImageData(x, y, width, height);
  const data = imageData.data;
  const target = hexToRgb(backgroundColor);
  const bg = dominantBorderColor(data, width, height);
  const threshold = 118;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  function enqueue(pixelIndex: number) {
    if (pixelIndex < 0 || pixelIndex >= visited.length || visited[pixelIndex]) return;
    const dataIndex = pixelIndex * 4;
    const distance = colorDistance({ r: data[dataIndex], g: data[dataIndex + 1], b: data[dataIndex + 2] }, bg);
    if (distance <= threshold) {
      visited[pixelIndex] = 1;
      queue.push(pixelIndex);
    }
  }

  for (let column = 0; column < width; column += 1) {
    enqueue(column);
    enqueue((height - 1) * width + column);
  }
  for (let row = 0; row < height; row += 1) {
    enqueue(row * width);
    enqueue(row * width + width - 1);
  }

  while (queue.length) {
    const pixelIndex = queue.shift() as number;
    const row = Math.floor(pixelIndex / width);
    const column = pixelIndex % width;
    const dataIndex = pixelIndex * 4;
    data[dataIndex] = target.r;
    data[dataIndex + 1] = target.g;
    data[dataIndex + 2] = target.b;

    if (column > 0) enqueue(pixelIndex - 1);
    if (column < width - 1) enqueue(pixelIndex + 1);
    if (row > 0) enqueue(pixelIndex - width);
    if (row < height - 1) enqueue(pixelIndex + width);
  }

  context.putImageData(imageData, x, y);
}

function dominantBorderColor(data: Uint8ClampedArray, width: number, height: number) {
  const buckets = new Map<string, { color: { r: number; g: number; b: number }; count: number }>();
  const step = 4;

  function addSample(x: number, y: number) {
    const color = getPixel(data, width, x, y);
    if (color.r < 25 && color.g < 25 && color.b < 25) return;
    const key = `${Math.round(color.r / 24)}-${Math.round(color.g / 24)}-${Math.round(color.b / 24)}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.color.r += color.r;
      existing.color.g += color.g;
      existing.color.b += color.b;
      return;
    }
    buckets.set(key, { color: { ...color }, count: 1 });
  }

  for (let column = 0; column < width; column += step) {
    addSample(column, 2);
    addSample(column, height - 3);
  }
  for (let row = 0; row < height; row += step) {
    addSample(2, row);
    addSample(width - 3, row);
  }

  let best = { color: { r: 255, g: 255, b: 255 }, count: 0 };
  buckets.forEach((bucket) => {
    if (bucket.count > best.count) best = bucket;
  });
  return {
    r: best.color.r / Math.max(best.count, 1),
    g: best.color.g / Math.max(best.count, 1),
    b: best.color.b / Math.max(best.count, 1),
  };
}

function getPixel(data: Uint8ClampedArray, width: number, x: number, y: number) {
  const index = (Math.max(0, y) * width + Math.max(0, x)) * 4;
  return { r: data[index], g: data[index + 1], b: data[index + 2] };
}

function colorDistance(first: { r: number; g: number; b: number }, second: { r: number; g: number; b: number }) {
  return Math.sqrt((first.r - second.r) ** 2 + (first.g - second.g) ** 2 + (first.b - second.b) ** 2);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
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
