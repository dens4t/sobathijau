<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

final class DlhFeed
{
    public const SOURCE = 'https://dlh.pontianak.go.id';

    /** @return array{ok: bool, items: array<int, array<string, string>>, fetchedAt: string} */
    public function get(bool $force = false): array
    {
        if (! $force && ($cached = Cache::get('dlh_feed_v1'))) {
            return $cached;
        }

        try {
            $items = $this->parse($this->fetchListing());
            $payload = [
                'ok' => true,
                'items' => $items,
                'fetchedAt' => now()->toIso8601String(),
            ];
            Cache::put('dlh_feed_v1', $payload, now()->addHour());

            return $payload;
        } catch (\Throwable) {
            $fallback = Cache::get('dlh_feed_v1');

            return $fallback ?? ['ok' => false, 'items' => [], 'fetchedAt' => now()->toIso8601String()];
        }
    }

    private function fetchListing(): string
    {
        return Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        ])->timeout(20)->get(self::SOURCE.'/berita')->throw()->body();
    }

    /** @return array<int, array<string, string>> */
    public function parse(string $html): array
    {
        preg_match_all('#<h5><a href="[^"]*beritadetail/(\d+)">(.*?)</a></h5>#s', $html, $h, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);

        $items = [];
        $seen = [];
        foreach ($h as $m) {
            $pos = $m[0][1];
            $id = $m[1][0];
            $title = trim(strip_tags(html_entity_decode($m[2][0])));
            if ($title === '') {
                continue;
            }

            $window = substr($html, max(0, $pos - 1200), 2400);

            $image = '';
            if (preg_match('#<img[^>]*src="([^"]*posting/post-[^"]+)"#s', $window, $img)) {
                $image = $img[1];
                if (str_starts_with($image, '/')) {
                    $image = self::SOURCE.$image;
                }
            }

            $date = '';
            if (preg_match('#calendar[^>]*>\s*</i>\s*(\d{4}-\d{2}-\d{2})#', substr($window, 0, 1200), $d)) {
                $date = $d[1];
            }

            if (isset($seen[$id])) {
                $items[$seen[$id]] = array_merge($items[$seen[$id]], array_filter([
                    'image' => $image,
                    'date' => $date,
                ]));

                continue;
            }

            $seen[$id] = count($items);
            $items[] = [
                'id' => $id,
                'title' => $title,
                'url' => self::SOURCE.'/beritadetail/'.$id,
                'image' => $image,
                'date' => $date,
            ];
        }

        return array_slice(array_values($items), 0, 8);
    }
}
