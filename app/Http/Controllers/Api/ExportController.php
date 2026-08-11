<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeoLocation;
use App\Models\Service;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

final class ExportController extends Controller
{
    private const FORMATS = ['csv', 'kml', 'kmz', 'xlsx', 'shp'];

    public function locations(Request $request, string $format): Response|StreamedResponse
    {
        abort_unless(in_array($format, self::FORMATS, true), 404, 'Format tidak didukung.');

        $rows = GeoLocation::all();
        if ($ids = $request->query('ids')) {
            $allowed = collect(explode(',', (string) $ids))
                ->map(static fn (string $id): string => trim($id))->filter()
                ->filter(static fn (string $id): bool => (bool) preg_match('/^[A-Za-z0-9_-]+$/', $id));
            $rows = $rows->filter(static fn (GeoLocation $l): bool => $allowed->contains($l->id))->values();
        }

        $stamp = date('Y-m-d');
        $name = "lokasi-dlh-pontianak-$stamp";

        return match ($format) {
            'csv' => $this->csv($rows, $name),
            'kml' => $this->kml($rows, $name),
            'kmz' => $this->kmz($rows, $name),
            'xlsx' => $this->xlsx($rows, $name),
            'shp' => $this->shp($rows, $name),
        };
    }

    /** Rekap permohonan (admin): CSV/XLSX — ikut filter serviceId/status/dateStart/dateEnd. */
    public function submissions(Request $request, string $format): Response
    {
        abort_unless(in_array($format, ['csv', 'xlsx'], true), 404, 'Format tidak didukung.');

        $query = Submission::query();
        if ($serviceId = $request->query('serviceId')) {
            $query->where('serviceId', $serviceId);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($start = $request->query('dateStart')) {
            $query->where('submittedAt', '>=', $start);
        }
        if ($end = $request->query('dateEnd')) {
            $query->where('submittedAt', '<=', $end.' 23:59');
        }
        $rows = $query->orderByDesc('submittedAt')->get();

        // Kolom dinamis mengikuti layanan terpilih (label field sebagai header).
        $fields = [];
        if ($serviceId && $svc = Service::find($serviceId)) {
            foreach ((array) $svc->fields as $f) {
                $fields[$f['id'] ?? ''] = $f['label'] ?? $f['id'] ?? '';
            }
        }

        $header = ['Kode', 'Tanggal', 'Pemohon', 'Layanan', 'Status'];
        $data = [];
        foreach ($rows as $sub) {
            $row = [$sub->id, $sub->submittedAt, $sub->applicantName, $sub->serviceName, $sub->status];
            foreach (array_keys($fields) as $fid) {
                $row[] = self::formValue($sub->formData[$fid] ?? null);
            }
            $data[] = $row;
        }
        $header = array_merge($header, array_values($fields));

        $name = 'rekap-permohonan-'.date('Y-m-d');

        return $format === 'csv'
            ? $this->csvFromData($header, $data, "$name.csv")
            : $this->xlsxFromData($header, $data, "$name.xlsx");
    }

    private static function formValue(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }
        if (is_array($value)) {
            if (isset($value['name'])) {
                return (string) $value['name'];
            }

            return implode(', ', array_map(static fn ($x): string => is_array($x) ? ($x['name'] ?? '') : (string) $x, $value));
        }

        return (string) $value;
    }

    private function csvFromData(array $header, array $rows, string $filename): Response
    {
        $out = "\xEF\xBB\xBF";
        $out .= implode(',', array_map(static fn ($h): string => '"'.str_replace('"', '""', (string) $h).'"', $header))."\r\n";
        foreach ($rows as $row) {
            $out .= implode(',', array_map(static fn ($v): string => '"'.str_replace('"', '""', (string) $v).'"', $row))."\r\n";
        }

        return $this->fileResponse($out, $filename, 'text/csv');
    }

    private function xlsxFromData(array $header, array $rows, string $name): Response
    {
        $cell = static function (int $r, int $c, string $v): string {
            $ref = chr(65 + $c).$r;

            return '<c r="'.$ref.'" t="inlineStr"><is><t xml:space="preserve">'.htmlspecialchars($v, ENT_XML1 | ENT_QUOTES, 'UTF-8').'</t></is></c>';
        };

        $sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'."\n"
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
        $sheet .= '<row r="1">';
        foreach ($header as $c => $h) {
            $sheet .= $cell(1, $c, (string) $h);
        }
        $sheet .= '</row>';
        $r = 2;
        foreach ($rows as $row) {
            $cells = '';
            foreach ($row as $c => $v) {
                $cells .= $cell($r, $c, (string) $v);
            }
            $sheet .= '<row r="'.$r.'">'.$cells.'</row>';
            $r++;
        }
        $sheet .= '</sheetData></worksheet>';

        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'</Types>';
        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';
        $workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="Rekap" sheetId="1" r:id="rId1"/></sheets>'
            .'</workbook>';
        $workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'</Relationships>';

        $tmp = tempnam(sys_get_temp_dir(), 'xlsx');
        $zip = new ZipArchive;
        $zip->open($tmp, ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', $contentTypes);
        $zip->addFromString('_rels/.rels', $rels);
        $zip->addFromString('xl/workbook.xml', $workbook);
        $zip->addFromString('xl/_rels/workbook.xml.rels', $workbookRels);
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheet);
        $zip->close();
        $bytes = (string) file_get_contents($tmp);
        unlink($tmp);

        return $this->fileResponse($bytes, "$name.xlsx", 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    private function csv(Collection $rows, string $name): Response
    {
        $out = "\xEF\xBB\xBF"; // UTF-8 BOM agar Excel membaca aksen dengan benar
        $out .= "ID,Nama,Kategori,Latitude,Longitude,Alamat,Deskripsi\r\n";
        foreach ($rows as $l) {
            $out .= implode(',', array_map(static fn (?string $v): string => '"'.str_replace('"', '""', (string) $v).'"', [
                $l->id, $l->name, $l->category, (string) $l->lat, (string) $l->lng, $l->address, $l->description,
            ]))."\r\n";
        }

        return $this->fileResponse($out, "$name.csv", 'text/csv');
    }

    private function kml(Collection $rows, string $name): Response
    {
        $places = $rows->map(function (GeoLocation $l): string {
            $color = $this->kmlColor($l->color);

            return '<Placemark>'
                .'<name>'.e($l->name).'</name>'
                .'<description><![CDATA['.$l->address.' — '.$l->description.']]></description>'
                .'<Style><IconStyle><color>'.$color.'</color><scale>1.2</scale></IconStyle></Style>'
                .'<Point><coordinates>'.number_format((float) $l->lng, 6, '.', '').','.number_format((float) $l->lat, 6, '.', '').',0</coordinates></Point>'
                .'</Placemark>';
        })->implode("\n");

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<kml xmlns="http://www.opengis.net/kml/2.2">'."\n"
            .'<Document><name>'.e($name).'</name><open>1</open>'."\n"
            .$places."\n"
            .'</Document></kml>';

        return $this->fileResponse($xml, "$name.kml", 'application/vnd.google-earth.kml+xml');
    }

    private function kmz(Collection $rows, string $name): Response
    {
        $tmp = tempnam(sys_get_temp_dir(), 'kmz');
        $zip = new ZipArchive;
        $zip->open($tmp, ZipArchive::OVERWRITE);
        $zip->addFromString('doc.kml', $this->kmlXml($rows, $name));
        $zip->close();
        $bytes = (string) file_get_contents($tmp);
        unlink($tmp);

        return $this->fileResponse($bytes, "$name.kmz", 'application/vnd.google-earth.kmz');
    }

    private function xlsx(Collection $rows, string $name): Response
    {
        $header = ['ID', 'Nama', 'Kategori', 'Latitude', 'Longitude', 'Alamat', 'Deskripsi'];

        $sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'."\n"
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';

        $col = static fn (int $i): string => chr(65 + $i); // A..G
        $cell = static function (int $r, int $c, string $v, bool $numeric = false) use ($col): string {
            $ref = $col($c).$r;

            return $numeric
                ? '<c r="'.$ref.'"><v>'.$v.'</v></c>'
                : '<c r="'.$ref.'" t="inlineStr"><is><t xml:space="preserve">'.htmlspecialchars($v, ENT_XML1 | ENT_QUOTES, 'UTF-8').'</t></is></c>';
        };

        $sheet .= '<row r="1">';
        foreach ($header as $c => $h) {
            $sheet .= $cell(1, $c, $h);
        }
        $sheet .= '</row>';

        $r = 2;
        foreach ($rows as $l) {
            $sheet .= '<row r="'.$r.'">'
                .$cell($r, 0, $l->id)
                .$cell($r, 1, $l->name)
                .$cell($r, 2, $l->category)
                .$cell($r, 3, number_format((float) $l->lat, 6, '.', ''), true)
                .$cell($r, 4, number_format((float) $l->lng, 6, '.', ''), true)
                .$cell($r, 5, $l->address)
                .$cell($r, 6, $l->description)
                .'</row>';
            $r++;
        }
        $sheet .= '</sheetData></worksheet>';

        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'</Types>';

        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';

        $workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="Lokasi" sheetId="1" r:id="rId1"/></sheets>'
            .'</workbook>';

        $workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'</Relationships>';

        $tmp = tempnam(sys_get_temp_dir(), 'xlsx');
        $zip = new ZipArchive;
        $zip->open($tmp, ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', $contentTypes);
        $zip->addFromString('_rels/.rels', $rels);
        $zip->addFromString('xl/workbook.xml', $workbook);
        $zip->addFromString('xl/_rels/workbook.xml.rels', $workbookRels);
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheet);
        $zip->close();
        $bytes = (string) file_get_contents($tmp);
        unlink($tmp);

        return $this->fileResponse($bytes, "$name.xlsx", 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    private function shp(Collection $rows, string $name): Response
    {
        $shp = self::shpMainHeader($rows);
        $shx = self::shpMainHeader($rows, count($rows));
        $offset = 50; // words: 100-byte header

        foreach ($rows as $l) {
            $content = pack('V', 1) // shape type point
                .pack('d', (float) $l->lng)
                .pack('d', (float) $l->lat);

            $shp .= pack('N', 0).pack('N', strlen($content) / 2).$content; // record num diisi di pass kedua
            $shx .= pack('N', $offset).pack('N', strlen($content) / 2);
            $offset += 4 + strlen($content) / 2;
        }

        // Record number big-endian 1..n (overwrite placeholder 0)
        $rec = 1;
        $pos = 100;
        $contentLen = 10; // 20 bytes / 2
        $recordSize = 8 + 20;
        while (strlen($shp) >= $pos + $recordSize) {
            $shp = substr_replace($shp, pack('N', $rec), $pos, 4);
            $rec++;
            $pos += $recordSize;
        }

        $dbf = self::dbf($rows);

        $prj = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]';

        $tmp = tempnam(sys_get_temp_dir(), 'shp');
        $zip = new ZipArchive;
        $zip->open($tmp, ZipArchive::OVERWRITE);
        $zip->addFromString("$name.shp", $shp);
        $zip->addFromString("$name.shx", $shx);
        $zip->addFromString("$name.dbf", $dbf);
        $zip->addFromString("$name.prj", $prj);
        $zip->close();
        $bytes = (string) file_get_contents($tmp);
        unlink($tmp);

        return $this->fileResponse($bytes, "$name-shp.zip", 'application/zip');
    }

    /** @return string 100-byte header; shxFileLength = jumlah record */
    private static function shpMainHeader(Collection $rows, ?int $shxRecords = null): string
    {
        $lats = $rows->pluck('lat')->map('floatval');
        $lngs = $rows->pluck('lng')->map('floatval');
        $xmin = $lngs->min() ?? 0.0;
        $ymin = $lats->min() ?? 0.0;
        $xmax = $lngs->max() ?? 0.0;
        $ymax = $lats->max() ?? 0.0;

        $fileLen = $shxRecords !== null
            ? 50 + $shxRecords * 4
            : 50 + count($rows) * 14;

        return pack('N', 9994)
            .pack('N', 0).pack('N', 0).pack('N', 0).pack('N', 0).pack('N', 0)
            .pack('N', $fileLen)
            .pack('V', 1000)
            .pack('V', 1)
            .pack('d', $xmin).pack('d', $ymin).pack('d', $xmax).pack('d', $ymax)
            .pack('d', 0.0).pack('d', 0.0)
            .pack('d', 0.0).pack('d', 0.0);
    }

    private static function dbf(Collection $rows): string
    {
        $fields = [
            ['ID', 'C', 10, 0], ['NAME', 'C', 50, 0], ['CATEGORY', 'C', 30, 0],
            ['LAT', 'N', 12, 6], ['LNG', 'N', 12, 6],
            ['ADDRESS', 'C', 80, 0], ['DESC', 'C', 100, 0],
        ];

        $headerLen = 32 + 32 * count($fields) + 1;
        $recordLen = 1 + array_sum(array_column($fields, 2));

        $out = pack('C', 0x03)                      // version dBASE III
            .pack('CCC', (int) date('y'), (int) date('m'), (int) date('d'))
            .pack('V', count($rows))
            .pack('v', $headerLen)
            .pack('v', $recordLen)
            .str_pad('', 20, "\x00");

        foreach ($fields as $f) {
            $out .= str_pad(substr($f[0], 0, 10), 11, "\x00")
                .$f[1]
                .str_pad('', 4, "\x00")
                .pack('C', $f[2])
                .pack('C', $f[3])
                .str_pad('', 14, "\x00");
        }

        $out .= "\x0D";

        foreach ($rows as $l) {
            $out .= ' '; // deletion flag
            $out .= self::dbfChar($l->id, 10);
            $out .= self::dbfChar($l->name, 50);
            $out .= self::dbfChar($l->category, 30);
            $out .= self::dbfNum((float) $l->lat, 12, 6);
            $out .= self::dbfNum((float) $l->lng, 12, 6);
            $out .= self::dbfChar($l->address, 80);
            $out .= self::dbfChar($l->description, 100);
        }

        $out .= "\x1A"; // EOF

        return $out;
    }

    private static function dbfChar(string $value, int $width): string
    {
        return str_pad(mb_substr($value, 0, $width), $width);
    }

    private static function dbfNum(float $value, int $width, int $decimals): string
    {
        return str_pad(number_format($value, $decimals, '.', ''), $width, ' ', STR_PAD_LEFT);
    }

    private function kmlXml(Collection $rows, string $name): string
    {
        $places = $rows->map(function (GeoLocation $l): string {
            $color = $this->kmlColor($l->color);

            return '<Placemark>'
                .'<name>'.e($l->name).'</name>'
                .'<description><![CDATA['.$l->address.' — '.$l->description.']]></description>'
                .'<Style><IconStyle><color>'.$color.'</color><scale>1.2</scale></IconStyle></Style>'
                .'<Point><coordinates>'.number_format((float) $l->lng, 6, '.', '').','.number_format((float) $l->lat, 6, '.', '').',0</coordinates></Point>'
                .'</Placemark>';
        })->implode("\n");

        return '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<kml xmlns="http://www.opengis.net/kml/2.2">'."\n"
            .'<Document><name>'.e($name).'</name><open>1</open>'."\n"
            .$places."\n"
            .'</Document></kml>';
    }

    /** #RRGGBB → KML aabbggrr */
    private function kmlColor(string $hex): string
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) !== 6 || ! ctype_xdigit($hex)) {
            return 'ff0000ff';
        }
        $r = substr($hex, 0, 2);
        $g = substr($hex, 2, 2);
        $b = substr($hex, 4, 2);

        return 'ff'.$b.$g.$r;
    }

    private function fileResponse(string $bytes, string $filename, string $contentType): Response
    {
        return response($bytes)
            ->header('Content-Type', $contentType)
            ->header('Content-Disposition', 'attachment; filename="'.$filename.'"')
            ->header('Cache-Control', 'no-store');
    }
}
