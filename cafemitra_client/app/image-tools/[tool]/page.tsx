"use client";
import { useParams } from "next/navigation";
import { DashboardShell } from "../../DashboardShell";
import ImageTransformTool, { isImageTransformSlug } from "../ImageTransformTool";
export default function ImageToolPage(){const params=useParams<{tool:string}>();const slug=String(params.tool||"");return <DashboardShell activePath="/image-tools"><div className="dashboard image-transform-shell">{isImageTransformSlug(slug)?<ImageTransformTool slug={slug}/>:<section className="pdf-tool-placeholder"><h1>Image tool not found</h1></section>}</div></DashboardShell>;}
