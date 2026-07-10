"use client";

import { useRef } from "react";
import { Download, FileDown, FileSpreadsheet, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportExportPanelProps {
  onImportFile: (file: File) => Promise<void> | void;
  onDownloadTemplate: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  isImporting?: boolean;
  totalProducts?: number;
}

export function ImportExportPanel({
  onImportFile,
  onDownloadTemplate,
  onExportExcel,
  onExportCsv,
  onExportPdf,
  isImporting = false,
  totalProducts = 0,
}: ImportExportPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="size-4" />
              Impor & Ekspor Data
            </CardTitle>
            <CardDescription>
              Impor daftar asset dari Excel, unduh template, atau ekspor data ke Excel, CSV, dan PDF.
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalProducts} asset tersedia untuk ekspor
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={isImporting}>
            <Upload className="size-4" />
            Impor Excel
          </Button>
          <Button type="button" variant="outline" onClick={onDownloadTemplate}>
            <FileDown className="size-4" />
            Download Template
          </Button>
          <Button type="button" variant="outline" onClick={onExportExcel}>
            <FileSpreadsheet className="size-4" />
            Export Excel
          </Button>
          <Button type="button" variant="outline" onClick={onExportCsv}>
            <FileText className="size-4" />
            Export CSV
          </Button>
          <Button type="button" variant="outline" onClick={onExportPdf}>
            <FileDown className="size-4" />
            Export PDF
          </Button>
        </div>

        <input
          ref={inputRef}
          className="hidden"
          accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void onImportFile(file);
            }
            event.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}
