<script>
    import Api from '../../helpers/cms-api';

    export default {
        props: ["name", "value"],
        data()
        {
            let date = new Date();
            if (this.value) {
                date = new Date(this.value);
            }

            return {
                date : date.toISOString().split('T')[0]
            }
        },
        watch : {
            date() {
                this.$emit("change", this.date);
            },
            value() {
                if (this.value) {
                    this.date = new Date(this.value).toISOString().split('T')[0];
                }
            }
        },
        methods : {

        },
        components : {

        }
    }
</script>

<style lang="scss" scoped>

</style>

<template>
    <div class="layout-field-date">
        <input type="text" class="form-control" :name="name" :value="date" />
    </div>
</template>
