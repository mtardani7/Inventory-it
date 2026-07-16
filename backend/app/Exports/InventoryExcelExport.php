<?php

namespace App\Exports;

use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InventoryExcelExport implements FromArray, ShouldAutoSize, WithStyles, WithEvents, WithTitle
{
    private const HEADERS = [
        'No Asset',
        'No Serial',
        'No Equipment',
        'Tipe',
        'Tahun Pembuatan',
        'Tanggal Pemakaian',
        'Pengguna',
        'Computer Name',
        'Plant',
        'Usage Record',
        'Keterangan',
        'Status',
    ];

    private int $headerRow = 6;

    private int $firstDataRow = 7;

    /**
     * @param  Collection<int, Product>  $products
     */
    public function __construct(
        private readonly Collection $products,
        private readonly bool $isTemplate = false
    ) {
    }

    public static function template(): self
    {
        return new self(collect(), true);
    }

    public function array(): array
    {
        $rows = [
            ['PT Rapid Plast Indonesia'],
            [$this->isTemplate ? 'Template Import Inventory IT' : 'Laporan Export Inventory IT'],
            ['Tanggal Export', Carbon::now()->format('d-m-Y H:i')],
            ['Total Assets', $this->products->count()],
            [],
            self::HEADERS,
        ];

        if ($this->isTemplate) {
            $rows[] = [
                'A001',
                'SN001',
                'EQ001',
                'Laptop',
                '2024-01-01',
                '2024-06-12',
                'Budi',
                'PC-001',
                '1',
                'Digunakan untuk operasional harian',
                'Contoh data template',
                'Aktif',
            ];

            return $rows;
        }

        foreach ($this->products as $product) {
            $rows[] = [
                $product->no_asset,
                $product->no_serial,
                $product->no_equipment,
                $product->tipe,
                $product->tahun_pembuatan,
                $product->usage_date,
                $product->pengguna,
                $product->computer_name,
                $product->plant,
                $product->usage_record,
                $product->keterangan,
                $product->status,
            ];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 15,
                    'color' => ['rgb' => '0F172A'],
                ],
            ],
            2 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                    'color' => ['rgb' => '1D4ED8'],
                ],
            ],
            $this->headerRow => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E40AF'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                    'wrapText' => true,
                ],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $highestRow = max($sheet->getHighestDataRow(), $this->firstDataRow);

                $sheet->mergeCells('A1:L1');
                $sheet->mergeCells('A2:L2');
                $sheet->getStyle('A1:L2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                $sheet->freezePane('A' . $this->firstDataRow);
                $sheet->setAutoFilter("A{$this->headerRow}:L{$this->headerRow}");

                $sheet->getPageSetup()
                    ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
                    ->setPaperSize(PageSetup::PAPERSIZE_A4)
                    ->setFitToWidth(1)
                    ->setFitToHeight(0);

                $sheet->getPageMargins()
                    ->setTop(0.35)
                    ->setRight(0.25)
                    ->setLeft(0.25)
                    ->setBottom(0.35);

                $sheet->getStyle("A{$this->headerRow}:L{$highestRow}")
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN)
                    ->getColor()
                    ->setRGB('CBD5E1');

                for ($row = $this->firstDataRow; $row <= $highestRow; $row++) {
                    if ($row % 2 === 0) {
                        $sheet->getStyle("A{$row}:L{$row}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('F8FAFC');
                    }
                }

                $sheet->getStyle("A{$this->firstDataRow}:L{$highestRow}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_TOP)
                    ->setWrapText(true);

                $sheet->getRowDimension($this->headerRow)->setRowHeight(24);
            },
        ];
    }

    public function title(): string
    {
        return 'Inventory IT';
    }
}
