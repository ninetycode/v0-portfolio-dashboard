import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"
import { ALLOWED_DOCUMENT_MIME_TYPES, DOCUMENT_FOLDER, MAX_DOCUMENT_BYTES, documentMimeType } from "@/lib/document-files"

// Documents go straight from the browser to Blob, so they are not limited by the serverless body size.
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(DOCUMENT_FOLDER) || !documentMimeType(pathname)) {
          throw new Error("Formato de archivo no permitido")
        }
        return {
          allowedContentTypes: ALLOWED_DOCUMENT_MIME_TYPES,
          maximumSizeInBytes: MAX_DOCUMENT_BYTES,
          addRandomSuffix: true,
        }
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al subir el archivo" }, { status: 400 })
  }
}
