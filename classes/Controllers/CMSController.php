<?php

namespace Dannyvel\Plugins\CMS\Controllers;

use App\Http\Controllers\Controller;
use Dannyvel\Plugins\CMS\DTO\ContentTypeDTO;
use Dannyvel\Plugins\CMS\Enums\CMSPermissionsEnum;
use Dannyvel\Plugins\CMS\Providers\CMSProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

class CMSController extends Controller {
    private function paginate($items, $perPage = 15, $page = null, $options = [])
    {
        $options['path'] = Paginator::resolveCurrentPath();

        $page = $page ?: (Paginator::resolveCurrentPage() ?: 1);
        $items = $items instanceof Collection ? $items : Collection::make($items);
        return new LengthAwarePaginator($items->forPage($page, $perPage), $items->count(), $perPage, $page, $options);
    }

    public function index(CMSProvider $cms, $type) {
        $config = $cms->getType($type);
        if (!$config) {
            abort(404);
        }

        $results = call_user_func([$config->class, 'all'])->filter(function($model) use($cms) {
            return Gate::allows(CMSPermissionsEnum::EditRecord, $model);
        });

        return view('dannyvel::cms/records-list', [
            'type' => $config,
            'records' => $this->paginate($results)
        ]);
    }

    public function create(CMSProvider $cms, $type) {
        $config = $cms->getType($type);
        if (!$config) {
            throw new \RuntimeException("Unable to locate content type '{$type}'");
        }

        abort_unless(Gate::allows(CMSPermissionsEnum::EditRecords, $type), 403);
        $instance = new $config->class();
        return view('dannyvel::cms/record-edit', [
            'type' => $config,
            'record' => $instance,
            'fields' => $cms->getFields($type, $instance),
            'relationships' => $cms->getRelationshipFields($type, $instance)
        ]);
    }

    public function edit(CMSProvider $cms, $id, $type) {
        $config = $cms->getType($type);
        if (!$config) {
            throw new \RuntimeException("Unable to locate content type '{$type}'");
        }

        /**
         * @var \Illuminate\Database\Eloquent\Model $instance
         */
        $instance = call_user_func([$config->class, 'where'], 'id', $id)->firstOrFail();
        abort_unless(Gate::allows(CMSPermissionsEnum::EditRecord, $instance), 403);

        return view('dannyvel::cms/record-edit', [
            'type' => $config,
            'record' => $instance,
            'fields' => $cms->getFields($type, $instance),
            'relationships' => $cms->getRelationshipFields($type, $instance)
        ]);
    }

    private function save(CMSProvider $cms, Request $request, ContentTypeDTO $type, Model $model) {
        $data = $this->validate($request, $cms->getValidationRules($type->type, $model));
        foreach($data as $attribute => $value) {
            try {
                $model->{$attribute} = $value;
            } catch(\Exception $e) {
                throw new \InvalidArgumentException("Failed to assign proprty '{$attribute}': '{$e->getMessage()}'", 1, $e);
            }
        }

        $oneToManyRelationships = [];
        $manyToManyRelationships = [];

        foreach($cms->getRelationshipFields($type->type, $model) as $relationshipField) {
            $relationship = $model->{$relationshipField->property}();

            // belongsTo (one to one / one to many - record that has the foreign key (_id))
            // hasOne (one to one - the other end)
            // hasMany (many to one - the other end)
            // belongsToMany (many to many)

            // morphTo (polymorphic one to one - record that has the foreign keys (_type, _id)
            // morphOne (polymorphic one to one - the other end)

            // belongsTo (update foreign key on model)
            // hasOne (update foreign model)
            // hasMany (update foreign model)
            // belongsToMany (sync)


            if ($relationship instanceof BelongsTo) {
                $data = $this->validate($request, [
                    $relationshipField->property.'.id' => ['required', 'numeric'],
                    $relationshipField->property.'.type' => ['required', 'string'],
                ]);
                $value = $data[$relationshipField->property] ?? [];

                if ($relationship->first()) {
                    $relationship->dissociate();
                }

                $foreignModel = null;
                if ($value) {
                    $func = [$value['type'], 'where'];
                    $foreignModel = $func('id', $value['id'])->first();
                }

                if ($foreignModel) {
                    $relationship->associate($foreignModel);
                }
            } elseif($relationship instanceof HasOne || $relationship instanceof HasMany) {
                $oneToManyRelationships[$relationshipField->property] = $relationship->get();
            } elseif($relationship instanceof BelongsToMany) {
                $manyToManyRelationships[$relationshipField->property] = $relationship->get();
            }
        }
        $model->save();

        foreach($manyToManyRelationships as $attribute => $related) {
            $data = $this->validate($request, [
                $attribute.'.*.id' => ['required', 'numeric'],
                $attribute.'.*.type' => ['required', 'string'],
            ]);
            $value = $data[$attribute] ?? [];
            $model->{$attribute}()->sync(collect($value)->pluck('id')->toArray());
        }

        foreach($oneToManyRelationships as $attribute => $related) {
            $existing = collect($related)->mapWithKeys(function($item) {
                return [get_class($item).'::'.$item->id => $item];
            });

            $data = $this->validate($request, [
                $attribute.'.*.id' => ['required', 'numeric'],
                $attribute.'.*.type' => ['required', 'string'],
            ]);
            $value = $data[$attribute] ?? [];
            $models = collect($value)->map(function($row) {
                return call_user_func([$row['type'], 'where'], 'id', $row['id'])->firstOrFail();
            });

            $key = $model->{$attribute}()->getForeignKeyName();

            $new = collect($value)->mapWithKeys(function($item) {
                return [$item['type'].'::'.$item['id'] => $item];
            });

            $delete = $existing->keys()->diff($new->keys());
            $create = $new->keys()->diff($existing->keys());

            foreach($delete as $relationshipId) {
                // todo - unset or delete?
                $existing[$relationshipId]->delete();
                /*
                // This only works if the column is nullable
                $existing[$relationshipId]->{$key} = null;
                $existing[$relationshipId]->save();
                */
            }

            foreach($create as $relationshipId) {
                $instance = call_user_func([$new[$relationshipId]['type'], 'where'], 'id', $new[$relationshipId]['id'])->firstOrFail();
                $instance->{$key} = $model->id;
                $instance->save();
            }
        }
    }

    public function store(CMSProvider $cms, Request $request, $type) {
        $config = $cms->getType($type);
        if (!$config) {
            throw new \RuntimeException("Unable to locate content type '{$type}'");
        }

        abort_unless(Gate::allows(CMSPermissionsEnum::EditRecords, $type), 403);
        $instance = new $config->class();
        $this->save($cms, $request, $config, $instance);

        return redirect(route('cms.list.'.$type));
    }

    public function update(CMSProvider $cms, Request $request, $id, $type) {
        $config = $cms->getType($type);
        if (!$config) {
            throw new \RuntimeException("Unable to locate content type '{$type}'");
        }

        /**
         * @var \Illuminate\Database\Eloquent\Model $instance
         */
        $instance = call_user_func([$config->class, 'where'], 'id', $id)->firstOrFail();
        abort_unless(Gate::allows(CMSPermissionsEnum::EditRecord, $instance), 403);
        $this->save($cms, $request, $config, $instance);

        return redirect(route('cms.list.'.$type));
    }
}
