<?php

namespace Dannyvel\Plugins\CMS\Controllers;

use App\Http\Controllers\Controller;
use Dannyvel\Plugins\CMS\Providers\CMSProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CMSApiController extends Controller {
    public function lookup(Request $request, CMSProvider $cms) {
        $data = $this->validate($request, [
            'types' => ['required', 'array'],
            'types.*' => ['required', 'string'],
            'text' => ['required', 'string'],
        ]);

        $results = new Collection();
        foreach($data['types'] as $type) {
            $typeResults = $cms->searchType($type, $data['text'])->map(function($item) {
                $data = $item->toArray();
                $data['_type'] = get_class($item);
                return $data;
            });
            $results = $results->merge($typeResults);
        }

        return $results;
    }
}
