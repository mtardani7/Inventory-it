<?php

namespace App\Http\Controllers\Api;

use App\Exports\ReportsExcelExport;
use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Data laporan berhasil dimuat.',
            'data' => $this->reportService->getReportData($request),
        ]);
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $reportData = $this->reportService->getReportData($request);
        $filename = 'reports-inventory-' . Carbon::now()->format('Ymd_His') . '.xlsx';

        return Excel::download(
            new ReportsExcelExport($reportData),
            $filename,
            \Maatwebsite\Excel\Excel::XLSX,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]
        );
    }

    public function exportPdf(Request $request)
    {
        $reportData = $this->reportService->getReportData($request);
        $filename = 'reports-inventory-' . Carbon::now()->format('Ymd_His') . '.pdf';

        $pdf = Pdf::loadView('exports.reports-pdf', [
            'report' => $reportData,
            'exportedAt' => Carbon::now()->format('d-m-Y H:i'),
        ])->setPaper('a4', 'landscape');

        return response()->streamDownload(
            static function () use ($pdf): void {
                echo $pdf->output();
            },
            $filename,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]
        );
    }
}
