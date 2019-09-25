<?php

namespace Dannyvel\Plugins\CMS\Providers;

use Dannyvel\Plugins\CMS\DTO\AttributeDTO;
use Dannyvel\Plugins\CMS\DTO\ContentTypeDTO;
use Dannyvel\Plugins\CMS\DTO\FieldDTO;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

class CMSProvider {

    /**
     * @var ContentTypeDTO[]
     */
    private $types = [];

    private $typesByClass = [];

    /**
     * @var \Closure
     */
    private $fieldTypeFactories = [];

    /**
     * @var AttributeDTO[]
     */
    private $attributeCache = [];

    /**
     * CMSProvider constructor.
     */
    public function __construct() {
        $this->fieldTypeFactory('string', function(Model $record, $attribute, $name) {
            $attr = $this->getAttributes($record);
            $rules = [
                'string'
            ];

            if ($attr[$attribute]->default || $attr[$attribute]->nullable) {
                $rules[] = 'nullable';
            } else {
                $rules[] = 'required';
            }

            return FieldDTO::create()->setCaption($name)->setComponent('field-text')->setProperty($attribute)->setType('int')->setComponentConfig([
                'config' => [],
                'name' => $attribute,
                'value' => $record->{$attribute}
            ])->setValidationRules($rules)->setRequired(in_array('required', $rules));
        });

        $this->fieldTypeFactory('int', function(Model $record, $attribute, $name) {
            $attr = $this->getAttributes($record);
            $rules = [
                'numeric'
            ];

            if ($attr[$attribute]->default || $attr[$attribute]->nullable) {
                $rules[] = 'nullable';
            } else {
                $rules[] = 'required';
            }

            return FieldDTO::create()->setCaption($name)->setComponent('field-number')->setProperty($attribute)->setType('string')->setComponentConfig([
                'config' => [],
                'name' => $attribute,
                'value' => $record->{$attribute}
            ])->setValidationRules($rules)->setRequired(in_array('required', $rules, true));
        });

        $this->fieldTypeFactory('text', function(Model $record, $attribute, $name) {
            $attr = $this->getAttributes($record);
            $rules = [
                'string'
            ];

            if ($attr[$attribute]->default || $attr[$attribute]->nullable) {
                $rules[] = 'nullable';
            } else {
                $rules[] = 'required';
            }

            return FieldDTO::create()->setCaption($name)->setComponent('field-textarea')->setProperty($attribute)->setType('text')->setComponentConfig([
                'config' => [],
                'name' => $attribute,
                'value' => $record->{$attribute}
            ])->setValidationRules($rules)->setRequired(in_array('required', $rules, true));
        });

        $this->fieldTypeFactory('datetime', function(Model $record, $attribute, $name) {
            return FieldDTO::create()->setCaption($name)->setComponent('field-date')->setProperty($attribute)->setType('string')->setComponentConfig([
                'config' => [],
                'name' => $attribute,
                'value' => $record->{$attribute}
            ])->setValidationRules([
                'nullable'
            ]);
        });

        $this->fieldTypeFactory('relationship', function(Model $record, $attribute, $name) {
            $def = $this->getType(get_class($record));
            $relationship = $record->{$attribute}();

            if (!$relationship instanceof Relation){
                $class = get_class($record);
                throw new \RuntimeException("Not a relationship '{$class}::{$attribute}'");
            }
            $relationshipType = $this->getRelationshipType($relationship);

            $value = null;
            if ($relationshipType === 'many') {
                $value = [];

                foreach($record->{$attribute} as $row) {
                    $rowData = $row->toArray();
                    $rowData['_type'] = get_class($row);
                    $value[] = $rowData;
                }
            } else {
                $value = $record->{$attribute}()->get()->shift();
                if ($value) {
                    $value = $value->toArray();
                }

                if ($value) {
                    $value['_type'] = get_class($record->{$attribute}()->get()[0]);
                } else {
                    $value = null;
                }

            }

            return FieldDTO::create()->setCaption($name)->setComponent('field-relationship-'.$relationshipType)->setProperty($attribute)->setType('string')->setComponentConfig([
                'config' => [
                    'types' => $def->relationships[$attribute]['types']
                ],
                'relationship' => get_class($relationship),
                'name' => $attribute,
                'value' => $value
            ])->setValidationRules([
                'nullable'
            ]);
        });
    }

    public static function CMSRoutes($prefix, $type) {
        Route::prefix($prefix)->namespace('\\Dannyvel\\Plugins\\CMS\\Controllers')->group(function() use($type) {
            Route::get('', 'CMSController@index')->defaults('type', $type)->name('cms.list.'.$type);

            Route::get('create', 'CMSController@create')->defaults('type', $type)->name('cms.create.'.$type);
            Route::post('create', 'CMSController@store')->defaults('type', $type)->name('cms.store.'.$type);

            Route::get('{id}', 'CMSController@edit')->defaults('type', $type)->name('cms.edit.'.$type);
            Route::post('{id}', 'CMSController@update')->defaults('type', $type)->name('cms.update.'.$type);
        });
    }

    private function getRelationshipType(Relation $relationship) {
        if ($relationship instanceof BelongsTo) {
            return 'single';
        }
        if ($relationship instanceof MorphTo) {
            return 'single';
        }
        if ($relationship instanceof HasOne) {
            return 'single';
        }
        if ($relationship instanceof MorphOne) {
            return 'single';
        }
        return 'many';
    }

    public function fieldTypeFactory($type, \Closure $factory) {
        $this->fieldTypeFactories[$type] = $factory;
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $record
     * @return \Dannyvel\Plugins\CMS\DTO\FieldDTO[]
     */
    public function getRelationshipFields($type, Model $record) {
        $def = $this->getType($type);
        $relationships = $def->relationships;

        $fields = [];

        foreach($relationships as $attribute => $config) {
            $name = title_case(snake_case(camel_case($attribute), ' '));
            $field_type = 'relationship';
            $fields[] = call_user_func($this->fieldTypeFactories[$field_type], $record, $attribute, $name);
        }
        return $fields;
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $record
     *
     * @return AttributeDTO[]
     */
    private function getAttributes(Model $record) {
        if (!isset($this->attributeCache[$record->getTable()])) {
            $results = DB::select('EXPLAIN `'.$record->getTable().'`');
            $attributes = [];

            foreach($results as $attribute) {
                $dto = new AttributeDTO();
                $dto->nullable = $attribute->Null === 'YES';
                $dto->default = $attribute->Default;
                $dto->attribute = $attribute->Field;

                $typePattern = '([a-zA-Z]+)';
                $lengthPattern = '\(?([0-9]*)\)?';
                $pattern = "/{$typePattern}{$lengthPattern}/";
                preg_match($pattern, $attribute->Type, $matches);
                if (!isset($matches[1])) {
                    dd([
                        $attribute->Type,
                        $matches
                    ]);
                }
                $dto->type = $matches[1];
                $dto->length = $matches[2];

                $attributes[$dto->attribute] = $dto;
            }
            $this->attributeCache[$record->getTable()] = $attributes;
        }

        return $this->attributeCache[$record->getTable()];
    }

    public function getValidationRules($type, Model $record) {
        $rules = [];

        foreach($this->getFields($type, $record) as $field) {
            $rules[$field->property] = $field->validationRules;
        }

        return $rules;
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $record
     * @return \Dannyvel\Plugins\CMS\DTO\FieldDTO[]
     */
    public function getFields($type, Model $record) {
        $def = $this->getType($type);

        $casts = $record->getCasts();
        $hidden = $record->getHidden();

        $relationships = array_keys($def->relationships);

        $fields = [];

        foreach($this->getAttributes($record) as $dto) {
            $attribute = $dto->attribute;

            $name = title_case(snake_case(camel_case($attribute), ' '));
            $field_type = 'string';

            if (in_array($attribute, $hidden) || in_array($attribute, $def->readOnly)) {
                continue;
            }

            if (in_array($attribute, $relationships)) {
                continue;
            } elseif (isset($def->fieldTypeOverrides[$attribute])) {
                $field_type = $def->fieldTypeOverrides[$attribute];
            } elseif (isset($casts[$attribute])) {
                $field_type = $casts[$attribute];
            }

            if (!isset($this->fieldTypeFactories[$field_type])) {
                throw new \RuntimeException("Unknown field type '{$field_type}'");
            }
            $fields[] = call_user_func($this->fieldTypeFactories[$field_type], $record, $attribute, $name);
        }
        return $fields;
    }

    public function searchType($type, $searchText) {
        $def = $this->getType($type);
        if (!$def || !$def->searchFields)
            return new Collection();

        $fields = $def->searchFields;

        $query = call_user_func([$def->class, 'where'], array_shift($fields), 'LIKE', '%'.$searchText.'%');
        foreach($fields as $field) {
            $query->orWhere($field, 'LIKE', '%'.$searchText.'%');
        }
        return $query->get();
    }

    public function registerType(ContentTypeDTO $type) {
        $this->types[$type->type] = $type;
        $this->typesByClass[$type->class] = $type->type;
    }

    /**
     * @param $type
     *
     * @return \Dannyvel\Plugins\CMS\DTO\ContentTypeDTO|null
     */
    public function getType($type) {
        if (isset($this->typesByClass[$type]))
            $type = $this->typesByClass[$type];

        return $this->types[$type] ?? null;
    }
}
