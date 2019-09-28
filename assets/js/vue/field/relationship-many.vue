<script>
    export default {
        props: ["config", "value", "name", "relationship"],
        data()
        {
            return {
                content : this.value
            }
        },
        watch : {
            value() {
                this.content = this.value;
            }
        },
        methods : {
            add_relationship(model) {
                this.content.push(model);
                this.$emit('change', this.content);
            },
            remove_relationship(index, model) {
                if (!confirm("This may delete the object, are you sure you wish to proceed?")) {
                    return;
                }
                this.content.splice(index, 1);
                this.$emit('change', this.content);
            }
        },
        components : {

        }
    }
</script>

<style lang="scss" scoped>
    .related {
        position: relative;
        padding: 7px;
        border: 1px solid #ccc;
        margin-bottom: 10px;
        border-radius: .25rem;
    }

    .delete-button {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }
</style>

<template>
    <div class="layout-field-relationships">
        <div v-for="(related, index) in content" class="related">
            {{ related.name }}
            <input type="hidden" :name="name + '[' + index + '][id]'" :value="related.id" />
            <input type="hidden" :name="name + '[' + index + '][type]'" :value="related._type" />
            <span class="btn btn-danger delete-button" @click="remove_relationship(index, related)">X</span>
        </div>
        <field-model-lookup :types="config.types" @select="add_relationship"></field-model-lookup>
    </div>
</template>
