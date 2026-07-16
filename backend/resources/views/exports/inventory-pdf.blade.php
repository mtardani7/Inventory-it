<!doctype html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4 landscape;
            margin: 24px 20px 36px 20px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #0f172a;
        }

        .title-company {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 2px;
        }

        .title-report {
            font-size: 12px;
            font-weight: 700;
            color: #1d4ed8;
            margin-bottom: 10px;
        }

        .meta {
            margin-bottom: 12px;
            font-size: 10px;
            color: #334155;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        thead {
            display: table-header-group;
        }

        th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 5px;
            vertical-align: top;
            word-wrap: break-word;
        }

        th {
            background: #1e3a8a;
            color: #ffffff;
            text-align: left;
            font-weight: 700;
            font-size: 9px;
        }

        tbody tr:nth-child(even) {
            background: #f8fafc;
        }

        .footer {
            position: fixed;
            bottom: -18px;
            left: 0;
            right: 0;
            text-align: right;
            font-size: 9px;
            color: #64748b;
        }

        .footer .page:after {
            content: counter(page);
        }

        .footer .pages:after {
            content: counter(pages);
        }
    </style>
</head>
<body>
<div class="title-company">PT Inventory IT Nusantara</div>
<div class="title-report">Laporan Export Inventory IT</div>
<div class="meta">
    Tanggal Export: {{ $exportedAt }}<br>
    Total Assets: {{ $totalAssets }}
</div>

<table>
    <thead>
    <tr>
        <th>No Asset</th>
        <th>No Serial</th>
        <th>No Equipment</th>
        <th>Tipe</th>
        <th>Tahun Pembuatan</th>
        <th>Tanggal Pemakaian</th>
        <th>Pengguna</th>
        <th>Computer Name</th>
        <th>Plant</th>
        <th>Usage Record</th>
        <th>Keterangan</th>
        <th>Status</th>
    </tr>
    </thead>
    <tbody>
    @forelse($products as $product)
        <tr>
            <td>{{ $product->no_asset ?: '-' }}</td>
            <td>{{ $product->no_serial ?: '-' }}</td>
            <td>{{ $product->no_equipment ?: '-' }}</td>
            <td>{{ $product->tipe ?: '-' }}</td>
            <td>{{ $product->tahun_pembuatan ?: '-' }}</td>
            <td>{{ $product->usage_date ?: '-' }}</td>
            <td>{{ $product->pengguna ?: '-' }}</td>
            <td>{{ $product->computer_name ?: '-' }}</td>
            <td>{{ $product->plant ?: '-' }}</td>
            <td>{{ $product->usage_record ?: '-' }}</td>
            <td>{{ $product->keterangan ?: '-' }}</td>
            <td>{{ $product->status ?: '-' }}</td>
        </tr>
    @empty
        <tr>
            <td colspan="12" style="text-align: center; color: #64748b;">Tidak ada data asset.</td>
        </tr>
    @endforelse
    </tbody>
</table>

<div class="footer">
    Halaman <span class="page"></span> / <span class="pages"></span>
</div>
</body>
</html>
