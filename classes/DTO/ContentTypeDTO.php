<?php

namespace Dannyvel\Plugins\CMS\DTO;

class ContentTypeDTO {
    public $type = '';
    public $name = '';
    public $class = '';
    public $relationships = [];
    public $searchFields = [];
    public $readOnly = ['id', 'created_at', 'updated_at'];
    public $summaryFields = [];

    public static function create() { return new self(); }

    public function setSummaryFields(array $fields) : ContentTypeDTO {
        $this->summaryFields = $fields;
        return $this;
    }

    public function setSearchFields(array $fields) : ContentTypeDTO {
        $this->searchFields = $fields;
        return $this;
    }

    /**
     * @param string $type
     *
     * @return \Dannyvel\Plugins\CMS\DTO\ContentTypeDTO
     */
    public function setType(string $type): ContentTypeDTO {
        $this->type = $type;
        return $this;
    }

    public function pushReadOnly($readOnly) : ContentTypeDTO {
        if (!is_array($readOnly))
            $readOnly = [$readOnly];

        $this->readOnly = array_merge($this->readOnly, $readOnly);
        return $this;
    }

    public function setReadOnly(array $readOnly) : ContentTypeDTO {
        $this->readOnly = $readOnly;
        return $this;
    }

    public function setRelationships(array $relationships) : ContentTypeDTO {
        $this->relationships = $relationships;
        return $this;
    }

    /**
     * @param string $name
     *
     * @return \Dannyvel\Plugins\CMS\DTO\ContentTypeDTO
     */
    public function setName(string $name): ContentTypeDTO {
        $this->name = $name;
        return $this;
    }

    /**
     * @param string $class
     *
     * @return \Dannyvel\Plugins\CMS\DTO\ContentTypeDTO
     */
    public function setClass(string $class): ContentTypeDTO {
        $this->class = $class;
        return $this;
    }


}
