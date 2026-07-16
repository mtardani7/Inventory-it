<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class ReportsExcelExport implements FromView, ShouldAutoSize, WithTitle
{
    /**
     * @param  array<string,mixed>  $reportData
     */
    public function __construct(private readonly array $reportData)
    {
    }

    public function view(): View
    {
        return view('exports.reports-excel', [
            'report' => $this->reportData,
            'exportedAt' => now()->format('d-m-Y H:i'),
        ]);
    }

    public function title(): string
    {
        return 'Reports';
    }
}
