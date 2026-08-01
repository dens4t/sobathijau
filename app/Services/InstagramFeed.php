<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

final class InstagramFeed
{
    private const GRAPH_VERSION = 'v22.0';

    /** @return array{ok: bool, configured: bool, items: array<int, array<string, mixed>>, fetchedAt: string, error?: string} */
    public function get(bool $force = false): array
    {
        $configured = (bool) (config('socmed.meta_token') && config('socmed.meta_ig_user_id'));

        if (! $configured) {
            return [
                'ok' => false,
                'configured' => false,
                'items' => [],
                'fetchedAt' => now()->toIso8601String(),
            ];
        }

        if (! $force && ($cached = Cache::get('ig_feed_v1'))) {
            return $cached;
        }

        try {
            $items = $this->fetchMedia();
            $payload = [
                'ok' => true,
                'configured' => true,
                'items' => $items,
                'fetchedAt' => now()->toIso8601String(),
            ];
            Cache::put('ig_feed_v1', $payload, now()->addMinutes(15));

            return $payload;
        } catch (\Throwable $e) {
            $fallback = Cache::get('ig_feed_v1');
            if ($fallback) {
                return $fallback;
            }

            return [
                'ok' => false,
                'configured' => true,
                'items' => [],
                'fetchedAt' => now()->toIso8601String(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function fetchMedia(): array
    {
        $res = Http::timeout(20)->get('https://graph.facebook.com/'.self::GRAPH_VERSION.'/'.config('socmed.meta_ig_user_id').'/media', [
            'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
            'limit' => 12,
            'access_token' => config('socmed.meta_token'),
        ])->throw()->json();

        $items = [];
        foreach ($res['data'] ?? [] as $post) {
            $items[] = [
                'id' => $post['id'] ?? '',
                'caption' => $this->cleanCaption($post['caption'] ?? ''),
                'mediaType' => $post['media_type'] ?? 'IMAGE',
                'mediaUrl' => $post['media_url'] ?? '',
                'thumbnailUrl' => $post['thumbnail_url'] ?? $post['media_url'] ?? '',
                'permalink' => $post['permalink'] ?? '',
                'timestamp' => $post['timestamp'] ?? '',
            ];
        }

        return $items;
    }

    private function cleanCaption(string $caption): string
    {
        return trim(preg_replace('/#\S+/u', '', $caption));
    }
}
