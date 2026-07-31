"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileDown, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportProductResponse } from "@/services/product.service";

interface ImportExportPanelProps {
  onImportFile: (file: File, onUploadProgress?: (progress: number) => void) => Promise<ImportProductResponse>;
  onDownloadTemplate: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  isImporting?: boolean;
  exportingType?: "template" | "excel" | "pdf" | null;
  totalProducts?: number;
}

export function ImportExportPanel({
  onImportFile,
  onDownloadTemplate,
  onExportExcel,
  onExportPdf,
  isImporting = false,
  exportingType = null,
  totalProducts = 0,
}: ImportExportPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [summary, setSummary] = useState<ImportProductResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = !!selectedFile && !isImporting;
  const hasRowErrors = (summary?.errors?.length ?? 0) > 0;

  const errorRowsPreview = useMemo(() => {
    return summary?.errors?.slice(0, 8) ?? [];
  }, [summary?.errors]);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setProgress(0);
    setDragOver(false);
  };

  const extractErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Gagal memproses file impor. Silakan coba lagi.";
  };

  const handleFileSelected = (file?: File) => {
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setProgress(0);
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      const result = await onImportFile(selectedFile, (nextProgress) => {
        setProgress(nextProgress);
      });

      setSummary(result);
      setUploadOpen(false);
      setSummaryOpen(true);
      setProgress(100);
      toast.success(result.message);
      resetUploadState();
    } catch (error) {
      const message = extractErrorMessage(error);
      setErrorMessage(message);
      setErrorOpen(true);
      toast.error(message);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2">
                <Download className="size-4" />
                Impor & Ekspor Data
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl break-words">
                Impor daftar asset dari Excel, unduh template, atau ekspor data ke Excel, CSV, dan PDF.
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground sm:text-right">
              {totalProducts} asset tersedia untuk ekspor
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap">
            <Button className="w-full justify-center sm:w-auto" type="button" variant="outline" onClick={() => setUploadOpen(true)} disabled={isImporting}>
              <Upload className="size-4" />
              Impor Excel
            </Button>
            <Button className="w-full justify-center sm:w-auto" type="button" variant="outline" onClick={onDownloadTemplate}>
              <FileDown className="size-4" />
              {exportingType === "template" ? "Memproses..." : "Download Template"}
            </Button>
            <Button className="w-full justify-center sm:w-auto" type="button" variant="outline" onClick={onExportExcel} disabled={exportingType === "excel"}>
              <FileSpreadsheet className="size-4" />
              {exportingType === "excel" ? "Memproses..." : "Export Excel"}
            </Button>
            <Button className="w-full justify-center sm:w-auto" type="button" variant="outline" onClick={onExportPdf} disabled={exportingType === "pdf"}>
              <FileDown className="size-4" />
              {exportingType === "pdf" ? "Memproses..." : "Export PDF"}
            </Button>
          </div>

          <input
            ref={inputRef}
            className="hidden"
            accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            type="file"
            onChange={(event) => {
              handleFileSelected(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={(open) => {
        setUploadOpen(open);
        if (!open && !isImporting) {
          resetUploadState();
        }
      }}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-[90vw] rounded-xl p-0 sm:w-[90vw] sm:max-w-[90vw] md:w-full md:max-w-[680px] md:min-w-0">
          <DialogHeader className="flex-none px-6 pt-6 pb-4 pr-12">
            <DialogTitle>Upload File Import</DialogTitle>
            <DialogDescription>
              Drag & drop file Excel/CSV atau pilih file secara manual.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6">
            <div className="space-y-4">
              <div
                className={`flex h-[200px] min-h-[180px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 bg-muted/10"}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!isImporting) {
                    setDragOver(true);
                  }
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(false);
                  if (isImporting) {
                    return;
                  }

                  const file = event.dataTransfer.files?.[0];
                  handleFileSelected(file);
                }}
              >
                <p className="text-sm font-medium">Tarik file ke sini</p>
                <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">Format: xlsx, xls, csv (maks 10 MB)</p>
                <Button type="button" variant="outline" className="mt-5" onClick={openPicker} disabled={isImporting}>
                  Pilih File
                </Button>
              </div>

              <div className="min-w-0 rounded-lg border bg-muted/20 p-3 text-sm">
                <p className="font-medium">File dipilih</p>
                <p className="mt-1 break-all text-muted-foreground">{selectedFile ? `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} KB)` : "Belum ada file."}</p>
              </div>

              {isImporting ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress upload</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
            <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => setUploadOpen(false)} disabled={isImporting}>
              Batal
            </Button>
            <Button className="w-full sm:w-auto" type="button" onClick={() => void handleImportSubmit()} disabled={!canSubmit}>
              {isImporting ? "Mengimpor..." : "Mulai Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ringkasan Import</DialogTitle>
            <DialogDescription>
              Hasil proses import file inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <SummaryItem label="Total" value={summary?.summary.total_rows ?? 0} />
            <SummaryItem label="Imported" value={summary?.summary.imported ?? 0} />
            <SummaryItem label="Updated" value={summary?.summary.updated ?? 0} />
            <SummaryItem label="Skipped" value={summary?.summary.skipped ?? 0} />
            <SummaryItem label="Failed" value={summary?.summary.failed ?? 0} />
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {hasRowErrors ? (
              <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => setErrorOpen(true)}>
                Lihat Detail Error
              </Button>
            ) : null}
            <Button className="w-full sm:w-auto" type="button" onClick={() => setSummaryOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Error Import</DialogTitle>
            <DialogDescription>
              {errorMessage || "Baris berikut gagal atau dilewati saat proses import."}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
            {errorRowsPreview.length ? errorRowsPreview.map((item) => (
              <div key={`${item.row}-${item.asset}`} className="rounded-md border p-2 text-sm">
                <p className="font-medium">Baris {item.row} {item.asset && item.asset !== "-" ? `- ${item.asset}` : ""}</p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                  {item.messages.map((message, index) => (
                    <li key={`${item.row}-${index}`}>{message}</li>
                  ))}
                </ul>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">Tidak ada detail error.</p>
            )}
          </div>

          {summary && summary.errors.length > errorRowsPreview.length ? (
            <p className="text-xs text-muted-foreground">Menampilkan {errorRowsPreview.length} dari {summary.errors.length} error baris.</p>
          ) : null}

          <DialogFooter className="flex justify-end">
            <Button className="w-full sm:w-auto" type="button" onClick={() => setErrorOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-lg border p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
