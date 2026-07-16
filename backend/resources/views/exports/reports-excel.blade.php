<table>
    <tr>
        <td><strong>PT Rapid Plast Indonesia</strong></td>
    </tr>
    <tr>
        <td><strong>Inventory Reports</strong></td>
    </tr>
    <tr>
        <td>Tanggal Export: {{ $exportedAt }}</td>
    </tr>
</table>

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
    @foreach($report['inventory_report'] as $item)
        <tr>
            <td>{{ $item['no_asset'] ?? '-' }}</td>
            <td>{{ $item['no_serial'] ?? '-' }}</td>
            <td>{{ $item['tipe'] ?? '-' }}</td>
            <td>{{ $item['plant'] ?? '-' }}</td>
            <td>{{ $item['pengguna'] ?? '-' }}</td>
            <td>{{ $item['status'] ?? '-' }}</td>
            <td>{{ $item['created_at'] ?? '-' }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
