<!doctype html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4 landscape; margin: 20px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #0f172a; }
        h1 { margin: 0; font-size: 14px; }
        h2 { margin: 8px 0 6px; font-size: 11px; color: #1d4ed8; }
        p { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid #cbd5e1; padding: 4px; vertical-align: top; }
        th { background: #1e3a8a; color: #fff; font-size: 9px; }
        tbody tr:nth-child(even) { background: #f8fafc; }
    </style>
</head>
<body>
    <h1>PT Rapid Plast Indonesia</h1>
    <h2>Inventory Reports</h2>
    <p>Tanggal Export: {{ $exportedAt }}</p>

    <table>
        <thead>
        <tr>
            <th>Total Assets</th>
            <th>Active Assets</th>
            <th>Disposal Assets</th>
            <th>Repair Assets</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>{{ $report['summary']['total_assets'] }}</td>
            <td>{{ $report['summary']['active_assets'] }}</td>
            <td>{{ $report['summary']['disposal_assets'] }}</td>
            <td>{{ $report['summary']['repair_assets'] }}</td>
        </tr>
        </tbody>
    </table>

    <table>
        <thead>
        <tr>
            <th>No Asset</th>
            <th>No Serial</th>
            <th>Tipe</th>
            <th>Plant</th>
            <th>Pengguna</th>
            <th>Status</th>
            <th>Created At</th>
        </tr>
        </thead>
        <tbody>
        @forelse($report['inventory_report'] as $item)
            <tr>
                <td>{{ $item['no_asset'] ?? '-' }}</td>
                <td>{{ $item['no_serial'] ?? '-' }}</td>
                <td>{{ $item['tipe'] ?? '-' }}</td>
                <td>{{ $item['plant'] ?? '-' }}</td>
                <td>{{ $item['pengguna'] ?? '-' }}</td>
                <td>{{ $item['status'] ?? '-' }}</td>
                <td>{{ $item['created_at'] ?? '-' }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="7" style="text-align: center; color: #64748b;">Tidak ada data report.</td>
            </tr>
        @endforelse
        </tbody>
    </table>
</body>
</html>
