import $ from "jquery";

export default (new function() {
    let api = this;
    this.token = $('[name="api-token"]').attr('content');

    let _post = function(endpoint, data) {
        data = data || {};

        let self = this;

        return new Promise((resolve, reject) => {
            $.ajax({
                url : '/api/' + endpoint,
                type : 'POST',
                beforeSend(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + api.token);
                },
                data : data,
                success(response) {
                    resolve(response);
                },
                error() {
                    reject();
                }
            });
        });
    };

    let _get = function(endpoint, data) {
        data = data || {};

        return new Promise((resolve, reject) => {
            $.ajax({
                url : '/api/' + endpoint,
                type : 'GET',
                beforeSend(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + api.token);
                },
                data : data,
                success(response) {
                    resolve(response);
                },
                error() {
                    reject();
                }
            });
        });
    };

    this.search = function(types, text) {
        return _get('cms/lookup', {
            types : types,
            text : text
        });
    }
});
