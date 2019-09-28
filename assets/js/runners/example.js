import $ from 'jquery';

export default function ({ $el, el, data })
{
    $.get('/example', message => $el.text(message));
}

// Hot Module Replacement - Re-run the function whenever this file is modified
// (Only enable this if it's safe to run the function multiple times)
// export const hot_accept = true;
