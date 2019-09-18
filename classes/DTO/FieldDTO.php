<?php

namespace Dannyvel\Plugins\CMS\DTO;

class FieldDTO {
    public $property        = '';
    public $caption         = '';
    public $type            = '';
    public $component       = '';
    public $componentConfig = [];
    public $validationRules = [];
    public $required  = true;

    public static function create() { return new self(); }

    public function setRequired(bool  $required) : FieldDTO {
        $this->required = $required;
        return $this;
    }

    public function setValidationRules(array $rules) : FieldDTO {
        $this->validationRules = $rules;
        return $this;
    }

    /**
     * @param string $property
     *
     * @return \Dannyvel\Plugins\CMS\DTO\FieldDTO
     */
    public function setProperty(string $property): FieldDTO {
        $this->property = $property;
        return $this;
    }

    /**
     * @param string $caption
     *
     * @return \Dannyvel\Plugins\CMS\DTO\FieldDTO
     */
    public function setCaption(string $caption): FieldDTO {
        $this->caption = $caption;
        return $this;
    }

    /**
     * @param string $type
     *
     * @return \Dannyvel\Plugins\CMS\DTO\FieldDTO
     */
    public function setType(string $type): FieldDTO {
        $this->type = $type;
        return $this;
    }

    /**
     * @param string $component
     *
     * @return \Dannyvel\Plugins\CMS\DTO\FieldDTO
     */
    public function setComponent(string $component): FieldDTO {
        $this->component = $component;
        return $this;
    }

    /**
     * @param array $componentConfig
     *
     * @return \Dannyvel\Plugins\CMS\DTO\FieldDTO
     */
    public function setComponentConfig(array $componentConfig): FieldDTO {
        $this->componentConfig = $componentConfig;
        return $this;
    }
}
