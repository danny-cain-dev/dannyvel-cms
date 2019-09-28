<script>
    import Api from '../../helpers/cms-api';

    export default {
        props: ["types"],
        data()
        {
            return {
                api : Api,
                text : "",
                results : [],

                debounce : null
            }
        },
        created() {
            document.addEventListener('click', this.on_document_click);
        },
        beforeDestroy() {
            document.removeEventListener('click', this.on_document_click);
        },
        watch : {
            text() {
                this.search();
            }
        },
        methods : {
            on_document_click(e) {
                if (this.$el.contains(e.target))
                    return;

                this.results = [];
            },
            search() {
                if (this.debounce) {
                    clearTimeout(this.debounce);
                    this.debounce = null;
                }

                if (this.text.length < 3) {
                    return;
                }

                this.debounce = setTimeout(() => {
                    this.api.search(this.types, this.text).then((results) => {
                        this.results = results;
                    });
                }, 500);
            },
            select(result) {
                this.results = [];
                this.text = "";
                this.$emit('select', result);
            }
        },
        components : {

        }
    }
</script>

<style lang="scss" scoped>
    .layout-field-lookup {
        position: relative;
    }

    .lookup-results {
        position: absolute;
        width: 100%;
        background-color: white;
        z-index: 1;
    }

    .result {
        padding: 10px;
        border: 1px solid #aaa;
        border-top: none;

        &:first-child {
            border-top: 1px solid #aaa;
        }

        &:hover {
            background-color: #ddd;
        }
    }

</style>

<template>
    <div class="layout-field-lookup">
        <input type="text" class="form-control" v-model="text" />
        <div class="lookup-results">
            <div v-for="result in results" @click="select(result)" class="result">
                {{ result.name }}
            </div>
        </div>
    </div>
</template>
