Vue.filter('to-number', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return parseFloat(value);
});

Vue.filter('in-two-digits', (value) => {
    if (value === null || typeof value === 'string') return value;
    else if (value > 9) return value;
    else return '0' + value;
});

Vue.filter('max-two-digits', (value) => {
    if (!value || typeof value !== 'string') return value;
    else if (parseFloat(value) > 99) return [value.toString.split('')[0], value.toString.split('')[1]].join();
    else return value;
});

Vue.filter('just-name', (value) => {
    if (!value || typeof value !== 'string') return value;
    else if (value === 'Anonymous') return 'Invitado';
    else if (!value.includes(' ') && value.length < 9) return value;
    else if (!value.includes(' ') && value.includes('-')) return value.split('-')[0].length < 3 ? value.split('-')[1] : value.split('-')[0];
    else if (!value.includes(' ') && value.includes("'")) return value.split("'")[0].length < 3 ? value.split("'")[1] : value.split("'")[0]
    else if (!value.includes(' ')) return value;
    else return value.split(' ')[0].length < 3 ? value.split(' ')[1] : value.split(' ')[0];
});

Vue.filter('capitalize', (value) => {
    if (!value || typeof value !== 'string') return value;
    else if (value.charAt(0) === '¿' || value.charAt(0) === '¡') return value.charAt(0) + value.charAt(1).toUpperCase() + value.slice(2).toLowerCase();
    else return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
});

Vue.filter('url-to-normal', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return value.replace(/[\?\&]change_version=invision/, '');
});

Vue.filter('url-to-invision', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return value.split("#")[0] + "?change_version=invision#" + value.split("#")[1];
});

Vue.filter('tray-title', (value) => {
    if (!value || typeof value !== 'string') return value;
    else if (value.indexOf('bandeja de entrada') > -1) return 'Bandeja de Entrada';
    else if (value.indexOf('bandeja de recepción') > -1) return 'Bandeja de Entrada';
    else if (value.indexOf('andeja de Mensajes enviados') > -1) return 'Elementos Enviados';
    else if (value.indexOf('andeja de envío') > -1) return 'Bandeja de Envio';
    else if (value.indexOf('andeja de elementos guardados') > -1) return 'Elementos Guardados';
});

Vue.filter('tray-percent', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return (value.indexOf('vacía') === -1 ? value.match(/[\d]+/)[0] : 0);
});

Vue.filter('search-from', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return value.split(' para ')[1];
});

Vue.filter('search-number', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return value + ` resultado${parseFloat(value) === 1 ? '' : 's'}`;
});

Vue.filter('turn-br', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return value.replace(/\n/g, '<br>');
});

Vue.filter('mini-sanitize', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
});

Vue.filter('twist-field', (value) => {
    if (!value || typeof value !== 'string') return value;
    else return value.split(' — ').reverse().join(' — ');
});