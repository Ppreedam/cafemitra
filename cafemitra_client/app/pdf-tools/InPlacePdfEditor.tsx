"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Bold, Check, Copy, Download, Eraser, FilePenLine, Image as ImageIcon, Italic, Link2, LoaderCircle, Minus, Plus, Redo2, RotateCcw, ShieldCheck, Trash2, Type, Undo2 } from "lucide-react";
import { PdfToolUpload } from "./PdfToolUpload";
import { RelatedToolSuggestions, ToolPromotionRail } from "./ToolDiscovery";

type TextSpan={id:string;text:string;x:number;y:number;width:number;height:number;fontSize:number;fontFamily:string;bold:boolean;italic:boolean;color:string};
type EditorPage={index:number;image:string;width:number;height:number;spans:TextSpan[]};
type Edit={text:string;fontSize:number;fontFamily:string;bold:boolean;italic:boolean;color:string;whiteout:boolean};
type Result={blob:Blob;url:string;name:string};

async function renderSharpPreviews(file:File,pages:EditorPage[]){
  const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs",import.meta.url).toString();
  const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  const pixelRatio=Math.min(3,Math.max(2,window.devicePixelRatio||1));
  const enhanced:EditorPage[]=[];
  for(const model of pages){
    const page=await pdf.getPage(model.index),base=page.getViewport({scale:1});
    const viewport=page.getViewport({scale:model.width/base.width*pixelRatio});
    const canvas=document.createElement("canvas");
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    const context=canvas.getContext("2d",{alpha:false});
    if(!context)throw new Error("Canvas unavailable");
    context.imageSmoothingEnabled=true;context.imageSmoothingQuality="high";
    await page.render({canvas,canvasContext:context,viewport}).promise;
    const embeddedFonts=await registerEmbeddedFonts(page,model);
    enhanced.push({...model,image:canvas.toDataURL("image/png"),spans:model.spans.map(span=>({...span,fontFamily:embeddedFonts.get(span.id)||browserFontFamily(span.fontFamily,span.bold),color:stableTextColor(span.color)}))});
  }
  return enhanced;
}

async function registerEmbeddedFonts(page:unknown,model:EditorPage){
  const registered=new Map<string,string>();
  try{
    const pdfPage=page as {getTextContent():Promise<{items:Array<{fontName?:string}>}>;commonObjs:{get(name:string):{data?:Uint8Array}}};
    const content=await pdfPage.getTextContent();
    const loaded=new Map<string,string>();
    for(let index=0;index<content.items.length;index++){
      const fontName=content.items[index].fontName;
      if(!fontName)continue;
      let cssName=loaded.get(fontName);
      if(!cssName){
        const font=pdfPage.commonObjs.get(fontName);
        if(!font?.data?.byteLength)continue;
        cssName=`RepetiGoPDF_${model.index}_${fontName.replace(/[^a-z0-9_-]/gi,"_")}`;
        const face=new FontFace(cssName,font.data);
        await face.load();document.fonts.add(face);loaded.set(fontName,cssName);
      }
      registered.set(`${model.index}-${index}`,cssName);
    }
  }catch{
    // Some PDFs intentionally omit or restrict embedded font programs.
    // The browser-safe metric-compatible fallback below handles those files.
  }
  return registered;
}

function browserFontFamily(fontName:string,bold=false){
  const name=fontName.toLowerCase();
  if(/courier|mono|consolas/.test(name))return "Courier New";
  if(/times|serif|georgia|cambria|garamond/.test(name))return "Times New Roman";
  if(/helvetica|arial|sans|calibri|roboto|verdana|tahoma/.test(name))return "Arial";
  // PDF.js often exposes embedded subsets as g_d0_f1, F1 or six-letter
  // subset prefixes. These are not usable CSS font names; most business PDFs
  // use Helvetica/Arial-compatible faces for such subsets.
  if(/^(g_|f\d|[a-z]{6}\+)/i.test(fontName)||fontName.includes("_"))return "Arial";
  return bold?"Arial":"Arial";
}

function stableTextColor(color:string){
  const match=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if(!match)return "#111827";
  const [r,g,b]=match.slice(1).map(value=>parseInt(value,16));
  const chroma=Math.max(r,g,b)-Math.min(r,g,b),light=(r+g+b)/3;
  if(chroma<22&&light<170)return "#111827";
  return color;
}

function flowChanges(page:EditorPage,pageEdits:Array<[string,Edit]>,zoom:number){
  return pageEdits.map(([id,edit])=>{const span=page.spans.find(item=>item.id===id);if(!span||edit.whiteout)return null;const originalHeight=adaptiveTextHeight(span,span.text,page,zoom,defaultEdit(span)),editedHeight=adaptiveTextHeight(span,edit.text,page,zoom,edit),grown=editedHeight-originalHeight;return grown>Math.max(.12,span.fontSize*.45)?{span,delta:grown}:null;}).filter((item):item is {span:TextSpan;delta:number}=>Boolean(item)).sort((a,b)=>a.span.y-b.span.y);
}

function adaptiveTextWidth(span:TextSpan,text:string,page:EditorPage,zoom:number,edit:Edit){
  const fontPixels=edit.fontSize*page.height*zoom/100,canvas=document.createElement("canvas"),context=canvas.getContext("2d");
  if(context)context.font=`${edit.italic?"italic ":""}${edit.bold?"700 ":"400 "}${fontPixels}px "${edit.fontFamily}", Arial, sans-serif`;
  const measured=Math.max(fontPixels,...text.split(/\n/).map(line=>context?.measureText(line).width||line.length*fontPixels*.54)),estimated=(measured+8)/(page.width*zoom)*100;
  return Math.min(editableWidthLimit(span,page),Math.max(span.width,estimated));
}

function editableWidthLimit(span:TextSpan,page:EditorPage){
  const neighbours=paragraphNeighbours(span,page);
  if(!neighbours.length)return 98-span.x;
  const right=Math.max(span.x+span.width,...neighbours.map(item=>item.x+item.width));
  return Math.min(98-span.x,Math.max(span.width,right-span.x));
}

function paragraphNeighbours(span:TextSpan,page:EditorPage){
  return page.spans.filter(item=>item.id!==span.id&&Math.abs(item.fontSize-span.fontSize)<Math.max(.24,span.fontSize*.36)&&Math.abs(item.y-span.y)<span.fontSize*5.2);
}

function paragraphLeft(span:TextSpan,page:EditorPage){
  const neighbours=paragraphNeighbours(span,page);return neighbours.length?Math.min(span.x,...neighbours.map(item=>item.x)):span.x;
}

function drawParagraphWrapped(context:CanvasRenderingContext2D,text:string,firstX:number,continuationX:number,y:number,rightEdge:number,lineHeight:number){
  let row=0;
  for(const paragraph of text.split(/\n/)){
    const words=paragraph.split(/\s+/).filter(Boolean);let line="";
    if(!words.length){row++;continue;}
    for(const word of words){
      const x=row===0?firstX:continuationX,maxWidth=Math.max(12,rightEdge-x),candidate=line?`${line} ${word}`:word;
      if(line&&context.measureText(candidate).width>maxWidth){context.fillText(line,x,y+row*lineHeight);row++;line=word;}else line=candidate;
    }
    if(line){const x=row===0?firstX:continuationX;context.fillText(line,x,y+row*lineHeight);row++;}
  }
}

function adaptiveTextHeight(span:TextSpan,text:string,page:EditorPage,zoom:number,edit:Edit){
  const fontPixels=edit.fontSize*page.height*zoom/100,widthPixels=Math.max(12,adaptiveTextWidth(span,text,page,zoom,edit)/100*page.width*zoom),lines=measuredWrappedLines(text,widthPixels,fontPixels,edit);
  return Math.max(span.height,lines*fontPixels*1.22/(page.height*zoom)*100);
}

function measuredWrappedLines(text:string,maxWidth:number,fontSize:number,edit:Edit){
  const canvas=document.createElement("canvas"),context=canvas.getContext("2d");
  if(!context)return Math.max(1,text.split(/\n/).length);
  context.font=`${edit.italic?"italic ":""}${edit.bold?"700 ":"400 "}${fontSize}px "${edit.fontFamily}", Arial, sans-serif`;
  let lines=0;
  for(const paragraph of text.split(/\n/)){
    const words=paragraph.split(/\s+/).filter(Boolean);if(!words.length){lines++;continue;}
    let line="";
    for(const word of words){
      const candidate=line?`${line} ${word}`:word;
      if(line&&context.measureText(candidate).width>maxWidth){lines++;line=word;}else line=candidate;
      if(context.measureText(line).width>maxWidth){const units=Math.max(1,Math.ceil(context.measureText(line).width/maxWidth));lines+=units-1;line=word.slice(Math.floor(word.length*(units-1)/units));}
    }
    if(line)lines++;
  }
  return Math.max(1,lines);
}

function flowOffsetPercent(span:TextSpan,page:EditorPage,pageEdits:Array<[string,Edit]>,zoom:number){
  return flowChanges(page,pageEdits,zoom).reduce((offset,change)=>span.id!==change.span.id&&span.y>=change.span.y+change.span.height?offset+change.delta:offset,0);
}

async function createFlowPreview(page:EditorPage,pageEdits:Array<[string,Edit]>,zoom:number){
  const changes=flowChanges(page,pageEdits,zoom);
  if(!changes.length)return page.image;
  const image=new Image();image.src=page.image;await image.decode();
  const canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const context=canvas.getContext("2d",{alpha:false});if(!context)return page.image;
  context.drawImage(image,0,0);
  let accumulated=0;
  for(const change of changes){
    const boundary=Math.max(0,Math.min(canvas.height,Math.round((change.span.y+change.span.height+accumulated)/100*canvas.height)));
    const shift=Math.max(1,Math.round(change.delta/100*canvas.height));
    const snapshot=document.createElement("canvas");snapshot.width=canvas.width;snapshot.height=canvas.height;
    snapshot.getContext("2d")?.drawImage(canvas,0,0);
    context.fillStyle="#fff";context.fillRect(0,boundary,canvas.width,canvas.height-boundary);
    if(boundary+shift<canvas.height)context.drawImage(snapshot,0,boundary,canvas.width,canvas.height-boundary,0,boundary+shift,canvas.width,canvas.height-boundary);
    accumulated+=change.delta;
  }
  return canvas.toDataURL("image/png");
}

function TopTextControls({edit,page,update,duplicate}:{edit:Edit;page:EditorPage;update(patch:Partial<Edit>):void;duplicate():void}){
  const size=Math.round(edit.fontSize*page.height)/100;
  return <div className="inplace-top-text-tools">
    <button className={edit.bold?"active":""} type="button" onClick={()=>update({bold:!edit.bold})} title="Bold"><Bold size={16}/></button>
    <button className={edit.italic?"active":""} type="button" onClick={()=>update({italic:!edit.italic})} title="Italic"><Italic size={16}/></button>
    <label title="Font size"><Type size={14}/><input type="number" min="5" max="120" value={size} onChange={event=>update({fontSize:Math.max(5,+event.target.value)/page.height*100})}/></label>
    <select value={edit.fontFamily} onChange={event=>update({fontFamily:event.target.value})} title="Font family"><option value={edit.fontFamily}>{edit.fontFamily}</option><option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option><option value="Georgia">Georgia</option></select>
    <label className="top-color" title="Text color"><input type="color" value={edit.color} onChange={event=>update({color:event.target.value})}/></label>
    <button type="button" onClick={duplicate} title="Duplicate text"><Copy size={16}/></button>
    <button className="danger" type="button" onClick={()=>update({whiteout:true,text:""})} title="Delete text"><Trash2 size={16}/></button>
  </div>;
}

async function createEditedPdfImproved(file:File,pages:EditorPage[],edits:Record<string,Edit>,progress:(value:number)=>void){
  const { PDFDocument } = await import("pdf-lib");
  const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs",import.meta.url).toString();
  const bytes=new Uint8Array(await file.arrayBuffer()),renderDoc=await pdfjs.getDocument({data:bytes.slice()}).promise,source=await PDFDocument.load(bytes),output=await PDFDocument.create();
  for(let number=1;number<=pages.length;number++){
    const entries=Object.entries(edits).filter(([id])=>id.startsWith(`${number}-`));
    if(!entries.length){const [copied]=await output.copyPages(source,[number-1]);output.addPage(copied);progress(Math.round(number/pages.length*92));continue;}
    const renderPage=await renderDoc.getPage(number),viewport=renderPage.getViewport({scale:2}),canvas=document.createElement("canvas");canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    const context=canvas.getContext("2d",{alpha:false});if(!context)throw new Error("Canvas unavailable");
    await renderPage.render({canvas,canvasContext:context,viewport}).promise;
    const model=pages[number-1],changes=flowChanges(model,entries,canvas.width/model.width);
    let accumulated=0;
    for(const change of changes){
      const boundary=Math.round((change.span.y+change.span.height+accumulated)/100*canvas.height),shift=Math.max(1,Math.round(change.delta/100*canvas.height)),snapshot=document.createElement("canvas");snapshot.width=canvas.width;snapshot.height=canvas.height;snapshot.getContext("2d")?.drawImage(canvas,0,0);
      context.fillStyle="#fff";context.fillRect(0,boundary,canvas.width,canvas.height-boundary);
      if(boundary+shift<canvas.height)context.drawImage(snapshot,0,boundary,canvas.width,canvas.height-boundary,0,boundary+shift,canvas.width,canvas.height-boundary);
      accumulated+=change.delta;
    }
    for(const [id,edit] of entries){
      const span=model.spans.find(item=>item.id===id);if(!span)continue;
      const offset=flowOffsetPercent(span,model,entries,canvas.width/model.width),x=span.x/100*canvas.width,y=(span.y+offset)/100*canvas.height,width=Math.max(span.width/100*canvas.width,8),height=Math.max(span.height/100*canvas.height,8);
      context.fillStyle="#fff";context.fillRect(x-2,y-2,width+5,height+5);
      if(edit.whiteout||!edit.text)continue;
      const fontSize=Math.max(5,edit.fontSize/100*canvas.height);context.font=`${edit.italic?"italic ":""}${edit.bold?"700 ":"400 "}${fontSize}px "${edit.fontFamily}", Arial, sans-serif`;context.textBaseline="top";context.fillStyle=edit.color;
      const continuationX=paragraphLeft(span,model)/100*canvas.width,rightEdge=(span.x+editableWidthLimit(span,model))/100*canvas.width;drawParagraphWrapped(context,edit.text,x,continuationX,y,Math.max(x+width,rightEdge),fontSize*1.22);
    }
    const image=await output.embedPng(canvas.toDataURL("image/png")),original=source.getPage(number-1),newPage=output.addPage([original.getWidth(),original.getHeight()]);newPage.drawImage(image,{x:0,y:0,width:newPage.getWidth(),height:newPage.getHeight()});progress(Math.round(number/pages.length*92));
  }
  return output.save({useObjectStreams:true});
}

export default function InPlacePdfEditor({ headingLevel = "h1" }: { headingLevel?: "h1" | "h2" } = {}){
  const EditorHeading = headingLevel;
  const inputRef=useRef<HTMLInputElement>(null);const [file,setFile]=useState<File|null>(null),[pages,setPages]=useState<EditorPage[]>([]),[pageIndex,setPageIndex]=useState(0),[edits,setEdits]=useState<Record<string,Edit>>({}),[history,setHistory]=useState<Array<Record<string,Edit>>>([]),[future,setFuture]=useState<Array<Record<string,Edit>>>([]),[selectedId,setSelectedId]=useState(""),[zoom,setZoom]=useState(1.35),[loading,setLoading]=useState(false),[processing,setProcessing]=useState(false),[progress,setProgress]=useState(0),[error,setError]=useState(""),[result,setResult]=useState<Result|null>(null);
  const [addTextMode,setAddTextMode]=useState(false);
  useEffect(()=>{let cancelled=false;void (async()=>{const wrappers=Array.from(document.querySelectorAll<HTMLElement>(".inplace-page-wrap"));for(let index=0;index<pages.length;index++){const wrapper=wrappers[index],image=wrapper?.querySelector<HTMLImageElement>(".inplace-page-shell>img");if(!image)continue;const source=pages[index],pageEdits=Object.entries(edits).filter(([id])=>id.startsWith(`${source.index}-`));const flowed=await createFlowPreview(source,pageEdits,zoom);if(cancelled)return;image.src=flowed;source.spans.forEach(span=>{const field=wrapper.querySelector<HTMLTextAreaElement>(`[data-text-id="${span.id}"]`);if(field){const edit=edits[span.id]||defaultEdit(span),width=adaptiveTextWidth(span,edit.text,source,zoom,edit);field.style.width=`${width}%`;field.style.height="auto";field.style.height=`${Math.max(span.height/100*source.height*zoom,field.scrollHeight)}px`;field.style.transform=`translateY(${flowOffsetPercent(span,source,pageEdits,zoom)*source.height*zoom/100}px)`;}});}})();return()=>{cancelled=true;};},[edits,pages,zoom]);
  useEffect(()=>()=>{if(result)URL.revokeObjectURL(result.url);},[result]);const current=pages[pageIndex];const selectedPage=pages.find(page=>page.spans.some(span=>span.id===selectedId));const selected=selectedPage?.spans.find(span=>span.id===selectedId);const activeEdit=selected?edits[selected.id]||defaultEdit(selected):null;const changedPages=useMemo(()=>new Set(Object.keys(edits).map(id=>Number(id.split("-")[0]))),[edits]);
  async function chooseFile(list:FileList){const next=list[0];if(!next)return;resetResult();setFile(next);setPages([]);setEdits({});setHistory([]);setFuture([]);setSelectedId("");setPageIndex(0);setLoading(true);setError("");try{const extracted=await prepareEditor(next),sharpPages=await renderSharpPreviews(next,extracted);setPages(sharpPages);if(!sharpPages.some(page=>page.spans.length))setError("No editable text layer was found. Run OCR PDF first for scanned documents.");}catch(reason){console.error(reason);setFile(null);setError("This PDF could not be opened. It may be protected or damaged.");}finally{setLoading(false);}}
  function resetResult(){if(result)URL.revokeObjectURL(result.url);setResult(null);setProgress(0);}
  function reset(){resetResult();setAddTextMode(false);setFile(null);setPages([]);setEdits({});setHistory([]);setFuture([]);setError("");}
  function commit(id:string,next:Edit){resetResult();setHistory(stack=>[...stack,edits]);setFuture([]);setEdits(currentEdits=>({...currentEdits,[id]:next}));}
  function updateSelected(patch:Partial<Edit>){if(!selected||!activeEdit)return;commit(selected.id,{...activeEdit,...patch});}
  function updateSpan(span:TextSpan,patch:Partial<Edit>){setSelectedId(span.id);commit(span.id,{...(edits[span.id]||defaultEdit(span)),...patch});}
  function duplicateSelected(){if(!current||!selected||!activeEdit)return;const id=`${current.index}-new-${crypto.randomUUID()}`,copy:TextSpan={...selected,id,x:Math.min(94,selected.x+2),y:Math.min(96,selected.y+3),text:activeEdit.text};setPages(all=>all.map((page,index)=>index===pageIndex?{...page,spans:[...page.spans,copy]}:page));setHistory(stack=>[...stack,edits]);setEdits(existing=>({...existing,[id]:{...activeEdit}}));setFuture([]);setSelectedId(id);requestAnimationFrame(()=>document.querySelector<HTMLTextAreaElement>(`[data-text-id="${id}"]`)?.focus());}
  function addTextAt(page:EditorPage,index:number,event:ReactMouseEvent<HTMLDivElement>){if(!addTextMode||(event.target as HTMLElement).closest(".inplace-text-box"))return;setAddTextMode(false);setPageIndex(index);const rect=event.currentTarget.getBoundingClientRect(),x=Math.max(0,Math.min(94,(event.clientX-rect.left)/rect.width*100)),y=Math.max(0,Math.min(96,(event.clientY-rect.top)/rect.height*100));const nearest=page.spans.reduce<TextSpan|null>((best,span)=>!best||distance(span,x,y)<distance(best,x,y)?span:best,null),fallback:TextSpan={id:"",text:"",x,y,width:24,height:2,fontSize:2,fontFamily:"Arial",bold:false,italic:false,color:"#111827"},source=nearest||fallback,id=`${page.index}-new-${crypto.randomUUID()}`,span:TextSpan={...source,id,text:"",x,y,width:Math.min(35,98-x),height:Math.max(source.height,2)};setPages(all=>all.map((item,itemIndex)=>itemIndex===index?{...item,spans:[...item.spans,span]}:item));const edit=defaultEdit(span);setHistory(stack=>[...stack,edits]);setFuture([]);setEdits(existing=>({...existing,[id]:edit}));setSelectedId(id);requestAnimationFrame(()=>document.querySelector<HTMLTextAreaElement>(`[data-text-id="${id}"]`)?.focus());}
  function undo(){if(!history.length)return;const previous=history[history.length-1];setFuture(stack=>[edits,...stack]);setEdits(previous);setHistory(stack=>stack.slice(0,-1));}
  function redo(){if(!future.length)return;const next=future[0];setHistory(stack=>[...stack,edits]);setEdits(next);setFuture(stack=>stack.slice(1));}
  async function exportPdf(){if(!file||!Object.keys(edits).length||processing)return;setProcessing(true);setProgress(4);setError("");try{const bytes=await createEditedPdfImproved(file,pages,edits,setProgress);const blob=new Blob([bytes],{type:"application/pdf"});setResult({blob,url:URL.createObjectURL(blob),name:`${baseName(file.name)}-edited.pdf`});setProgress(100);}catch(reason){console.error(reason);setError("The edited PDF could not be created.");}finally{setProcessing(false);}}
  if(!file)return <PdfToolUpload title="Edit PDF text" description="Click existing PDF wording and replace it while matching its detected font style." icon={FilePenLine} inputRef={inputRef} onFiles={files=>void chooseFile(files)} multiple={false} buttonLabel="Select PDF file"/>;
  return <div className="inplace-editor-page"><input ref={inputRef} hidden type="file" accept="application/pdf,.pdf" onChange={event=>{if(event.target.files?.length)void chooseFile(event.target.files);event.target.value="";}}/><div className="inplace-topline"><Link href="/pdf-tools"><ArrowLeft size={17}/> PDF Tools</Link><span><ShieldCheck size={16}/> Free · Private browser editing</span></div><div className="inplace-studio"><main className="inplace-main"><header><div><span><FilePenLine size={23}/></span><div><small>RepetiGo PDF Editor</small><EditorHeading>Edit existing PDF text</EditorHeading><p>{file.name} · {pages.length} pages · {changedPages.size} changed</p></div></div><button type="button" onClick={()=>inputRef.current?.click()}>Replace PDF</button></header>
    {!result?<div className="inplace-toolbar"><div><button className="active" type="button" onClick={()=>setAddTextMode(false)}><Type size={16}/> Edit text</button><button className={addTextMode?"active inplace-add-text":"inplace-add-text"} type="button" onClick={()=>{setAddTextMode(value=>!value);setSelectedId("");}}><Plus size={16}/> Add text</button>{selected&&activeEdit&&selectedPage?<TopTextControls edit={activeEdit} page={selectedPage} update={updateSelected} duplicate={duplicateSelected}/>:<span className="inplace-format-hint">{addTextMode?"Click on the PDF to place text":"Select text to format"}</span>}</div><div className="inplace-toolbar-actions"><button type="button" onClick={undo} disabled={!history.length}><Undo2 size={16}/> Undo</button><button type="button" onClick={redo} disabled={!future.length}><Redo2 size={16}/> Redo</button><button type="button" onClick={()=>setZoom(value=>Math.max(.65,value-.1))}><Minus size={15}/></button><span>{Math.round(zoom*100)}%</span><button type="button" onClick={()=>setZoom(value=>Math.min(1.8,value+.1))}><Plus size={15}/></button><button className="inplace-top-reset" type="button" onClick={reset}><RotateCcw size={15}/> Start over</button><button className="inplace-top-apply" type="button" disabled={!Object.keys(edits).length||processing} onClick={exportPdf}>{processing?<LoaderCircle className="spin" size={16}/>:<FilePenLine size={16}/>} {processing?`${progress}%`:"Apply changes"}</button></div></div>:null}
    {loading?<div className="inplace-loading"><LoaderCircle className="spin"/> Detecting text, fonts, colors and positions…</div>:result?<EditorSuccess result={result} onBack={resetResult} onReset={reset}/>:pages.length?<div className="inplace-workarea inplace-continuous-pages">{pages.map((page,index)=><section className="inplace-page-wrap" key={page.index}><span>Page {page.index} / {pages.length}</span><div className="inplace-page-shell" style={{width:`${page.width*zoom}px`,height:`${page.height*zoom}px`}} onClick={event=>addTextAt(page,index,event)}><img src={page.image} alt={`PDF page ${page.index}`}/>{page.spans.map(span=>{const edit=edits[span.id],isSelected=selectedId===span.id,value=edit?(edit.whiteout?"":edit.text):span.text,metrics=textBoxMetrics(span,value,page,zoom,edit);return <textarea rows={1} data-text-id={span.id} key={span.id} className={`inplace-text-box ${isSelected?"selected":""} ${edit?"edited":""}`} style={{left:`${span.x}%`,top:`${span.y}%`,width:`${metrics.width}%`,height:`${metrics.height}%`,fontFamily:edit?.fontFamily||span.fontFamily,fontSize:`${metrics.fontPixels}px`,lineHeight:1.15,fontWeight:(edit?.bold??span.bold)?700:400,fontStyle:(edit?.italic??span.italic)?"italic":"normal",color:isSelected||edit?(edit?.color||span.color):"transparent"}} value={value} onClick={event=>event.stopPropagation()} onFocus={()=>{setPageIndex(index);setSelectedId(span.id);}} onChange={event=>updateSpan(span,{text:event.target.value,whiteout:false})} aria-label={`Edit text: ${span.text}`}/>})}</div></section>)}</div>:null}</main>
    {!result?<aside className="inplace-panel"><div><span className="auto-print-kicker">RepetiGo editor</span><h2>Edit directly on PDF</h2><p>Click existing wording to type. Click a blank area to add new text. Formatting appears above the selected text.</p></div><div className="inplace-help"><Type size={24}/><strong>Inline editing</strong><ol><li>Click text and place the caret</li><li>Type naturally on the page</li><li>Use the floating formatting bar</li><li>Apply and download</li></ol></div><div className="inplace-status"><Check size={18}/><div><strong>{Object.keys(edits).length} text change{Object.keys(edits).length===1?"":"s"}</strong><small>Unchanged pages retain their original PDF quality.</small></div></div>{processing?<div className="inplace-progress"><span>Applying edits… {progress}%</span><progress value={progress} max="100"/></div>:null}<button className="inplace-apply" type="button" disabled={!Object.keys(edits).length||processing} onClick={exportPdf}>{processing?<LoaderCircle className="spin" size={18}/>:<FilePenLine size={18}/>} {processing?"Applying changes…":"Apply changes"}</button><button className="inplace-reset" type="button" onClick={reset}><RotateCcw size={15}/> Start over</button></aside>:<ToolPromotionRail context="edit-pdf-result"/>}</div>{error?<div className="profile-alert error inplace-error">{error}{!pages.some(page=>page.spans.length)?<Link href="/pdf-tools/ocr-pdf">Run OCR PDF</Link>:null}</div>:null}</div>;
}
function FloatingTextToolbar({span,edit,page,zoom,update,duplicate}:{span:TextSpan;edit:Edit;page:EditorPage;zoom:number;update(patch:Partial<Edit>):void;duplicate():void}){const size=Math.round(edit.fontSize*page.height)/100;return <div className="inplace-floating-tools" style={{left:`${span.x}%`,top:`${span.y}%`}} onClick={event=>event.stopPropagation()} onMouseDown={event=>event.preventDefault()}><button className={edit.bold?"active":""} type="button" onClick={()=>update({bold:!edit.bold})} title="Bold"><Bold size={16}/></button><button className={edit.italic?"active":""} type="button" onClick={()=>update({italic:!edit.italic})} title="Italic"><Italic size={16}/></button><label title="Font size"><Type size={14}/><input type="number" min="5" max="120" value={size} onChange={event=>update({fontSize:Math.max(5,+event.target.value)/page.height*100})}/></label><select value={edit.fontFamily} onChange={event=>update({fontFamily:event.target.value})} title="Font family"><option value={edit.fontFamily}>{edit.fontFamily}</option><option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option><option value="Georgia">Georgia</option></select><label className="floating-color" title="Text color"><input type="color" value={edit.color} onChange={event=>update({color:event.target.value})}/></label><button type="button" onClick={duplicate} title="Duplicate text"><Copy size={16}/></button><button className="danger" type="button" onClick={()=>update({whiteout:true,text:""})} title="Delete text"><Trash2 size={16}/></button></div>}
function EditorSuccess({result,onBack,onReset}:{result:Result;onBack():void;onReset():void}){return <section className="inplace-success"><span><Check size={30}/></span><h2>PDF text updated!</h2><p>Your edited document is ready.</p><div><FilePenLine size={25}/><div><strong>{result.name}</strong><small>{formatBytes(result.blob.size)}</small></div></div><a href={result.url} download={result.name}><Download size={19}/> Download edited PDF</a><footer><button type="button" onClick={onBack}>Continue editing</button><button type="button" onClick={onReset}>Edit another PDF</button></footer><RelatedToolSuggestions context="edit-pdf-result"/></section>}
async function prepareEditor(file:File){const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs",import.meta.url).toString();const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,output:EditorPage[]=[];for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n),base=page.getViewport({scale:1}),displayScale=Math.min(1.15,820/base.width),view=page.getViewport({scale:displayScale}),canvas=document.createElement("canvas");canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);const context=canvas.getContext("2d");if(!context)throw new Error("Canvas unavailable");await page.render({canvas,canvasContext:context,viewport:view}).promise;const content=await page.getTextContent(),items=content.items as Array<{str?:string;transform?:number[];width?:number;height?:number;fontName?:string}>,styles=content.styles as Record<string,{fontFamily?:string;ascent?:number;descent?:number}>;const spans:TextSpan[]=[];items.forEach((item,index)=>{if(!item.str?.trim()||!item.transform)return;const transformed=pdfjs.Util.transform(view.transform,item.transform),fontHeight=Math.hypot(transformed[2],transformed[3]),left=transformed[4],baseline=transformed[5],width=(item.width||0)*displayScale,height=Math.max(fontHeight,4),style=styles[item.fontName||""]||{},reported=style.fontFamily||"",family=cleanFont(/^(sans-serif|serif|monospace)$/i.test(reported)?item.fontName||reported:reported||item.fontName||"Arial"),color=sampleTextColor(context,left,baseline-height,width,height);spans.push({id:`${n}-${index}`,text:item.str,x:left/view.width*100,y:(baseline-height)/view.height*100,width:Math.max(width/view.width*100,.8),height:height/view.height*100,fontSize:height/view.height*100,fontFamily:family,bold:/bold|black|heavy/i.test(family),italic:/italic|oblique/i.test(family),color});});output.push({index:n,image:canvas.toDataURL("image/png"),width:view.width,height:view.height,spans});}return output;}
async function createEditedPdf(file:File,pages:EditorPage[],edits:Record<string,Edit>,progress:(v:number)=>void){const { PDFDocument } = await import("pdf-lib");const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs",import.meta.url).toString();const bytes=new Uint8Array(await file.arrayBuffer()),renderDoc=await pdfjs.getDocument({data:bytes.slice()}).promise,source=await PDFDocument.load(bytes),output=await PDFDocument.create();for(let n=1;n<=pages.length;n++){const pageEdits=Object.entries(edits).filter(([id])=>id.startsWith(`${n}-`));if(!pageEdits.length){const [copied]=await output.copyPages(source,[n-1]);output.addPage(copied);}else{const renderPage=await renderDoc.getPage(n),view=renderPage.getViewport({scale:2}),canvas=document.createElement("canvas");canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);const context=canvas.getContext("2d");if(!context)throw new Error("Canvas unavailable");await renderPage.render({canvas,canvasContext:context,viewport:view}).promise;const model=pages[n-1];for(const [id,edit] of pageEdits){const span=model.spans.find(item=>item.id===id);if(!span)continue;const px=span.x/100*canvas.width,py=span.y/100*canvas.height,pw=Math.max(span.width/100*canvas.width,8),ph=Math.max(span.height/100*canvas.height,8);context.fillStyle="#ffffff";context.fillRect(px-2,py-2,pw+5,ph+5);if(!edit.whiteout&&edit.text){const size=Math.max(5,edit.fontSize/100*canvas.height);context.font=`${edit.italic?"italic ":""}${edit.bold?"700 ":"400 "}${size}px "${edit.fontFamily}", Arial, sans-serif`;context.textBaseline="top";context.fillStyle=edit.color;drawWrapped(context,edit.text,px,py,Math.max(pw,canvas.width-px-12),size*1.18);}}const image=await output.embedPng(canvas.toDataURL("image/png")),original=source.getPage(n-1),newPage=output.addPage([original.getWidth(),original.getHeight()]);newPage.drawImage(image,{x:0,y:0,width:newPage.getWidth(),height:newPage.getHeight()});}progress(Math.round(n/pages.length*92));}return output.save({useObjectStreams:true});}
function drawWrapped(context:CanvasRenderingContext2D,text:string,x:number,y:number,maxWidth:number,lineHeight:number){let lineNumber=0;text.split(/\n/).forEach(paragraph=>{const words=paragraph.split(/\s+/),lines:string[]=[];let line="";words.forEach(word=>{const test=`${line} ${word}`.trim();if(line&&context.measureText(test).width>maxWidth){lines.push(line);line=word;}else line=test;});lines.push(line);lines.forEach(value=>context.fillText(value,x,y+(lineNumber++)*lineHeight));});}function textBoxMetrics(span:TextSpan,value:string,page:EditorPage,zoom:number,edit?:Edit){const fontPixels=(edit?.fontSize||span.fontSize)*page.height*zoom/100,maxWidth=Math.max(2,98-span.x),naturalWidth=Math.max(span.width,(Math.max(1,...value.split(/\n/).map(line=>line.length))*fontPixels*.56)/(page.width*zoom)*100),width=Math.min(maxWidth,naturalWidth),charactersPerLine=Math.max(1,Math.floor(width/100*page.width*zoom/(fontPixels*.56))),lines=value.split(/\n/).reduce((total,line)=>total+Math.max(1,Math.ceil(line.length/charactersPerLine)),0),height=Math.max(span.height,(lines*fontPixels*1.18)/(page.height*zoom)*100);return{fontPixels,width,height};}function distance(span:TextSpan,x:number,y:number){return Math.hypot(span.x-x,span.y-y);}function sampleTextColor(context:CanvasRenderingContext2D,x:number,y:number,width:number,height:number){try{const data=context.getImageData(Math.max(0,Math.floor(x)),Math.max(0,Math.floor(y)),Math.max(1,Math.ceil(width)),Math.max(1,Math.ceil(height))).data;const colors:Array<[number,number,number]>=[];for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];if(a>100&&Math.max(r,g,b)<220)colors.push([r,g,b]);}if(!colors.length)return"#111827";colors.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));const [r,g,b]=colors[Math.floor(colors.length*.35)];return`#${[r,g,b].map(value=>value.toString(16).padStart(2,"0")).join("")}`;}catch{return"#111827";}}function defaultEdit(span:TextSpan):Edit{return{text:span.text,fontSize:span.fontSize,fontFamily:span.fontFamily,bold:span.bold,italic:span.italic,color:span.color,whiteout:false};}function cleanFont(value:string){return value.replace(/["']/g,"").replace(/^[A-Z]{6}\+/i,"").trim()||"Arial";}function baseName(name:string){return name.replace(/\.pdf$/i,"");}function formatBytes(bytes:number){return bytes<1048576?`${Math.max(1,Math.round(bytes/1024))} KB`:`${(bytes/1048576).toFixed(2)} MB`;}
