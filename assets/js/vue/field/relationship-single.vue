<script>
    export default {
        props: ["config", "value", "name", "relationship"],
        data()
        {
            return {
                content : this.value,
            }
        },
        watch : {
            value() {
                this.content = this.value;
            }
        },
        methods : {

        },
        components : {

        }
    }
</script>

<style lang="scss" scoped>
    .selected-value {
        padding: 10px;
        border: 1px solid #ccc;
        position: relative;
    }

    .delete-button {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }
</style>

<template>
    <div class="layout-field-relationship">
        <div v-if="content" class="selected-value">
            <input type="hidden" :name="name + '[id]'" :value="content.id" />
            <input type="hidden" :name="name + '[type]'" :value="content._type" />
            {{ content.name }}
            <span @click="content = null" class="btn btn-danger delete-button">X</span>
        </div>
        <field-model-lookup v-else :types="config.types" @select="content = arguments[0]"></field-model-lookup>
    </div>
</template>
