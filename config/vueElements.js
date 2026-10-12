const header = new Vue({
    el: 'header:not(.is-not-vue)'
});

const navbar = new Vue({
    el: '#forum-navbar:not(.is-not-vue)'
});

const footer = new Vue({
    el: 'footer:not(.is-not-vue)'
});

const widgets = new Vue({
    el: 'aside#right:not(.is-not-vue)'
});

if (document.querySelector('#forum-content:not(.is-not-vue)')) {
    const body = new Vue({
        el: '#forum-content:not(.is-not-vue)',
        data: {
            info: forumData,
            directions: forumConfig.usableDirections,
            location: window.location.href
        }
    });
}

if (document.querySelector('#forum-extra')) {
    const extra = new Vue({
        el: '#forum-extra:not(.is-not-vue)'
    });
}

const topbar = new Vue({
    el: '#forum-topbar:not(.is-not-vue)'
});

if (document.querySelector('#forum-wiki:not(.is-not-vue)')) {
    const wiki = new Vue({
        router,
        updated() {
            this.$nextTick(function () {
                FNR.behaviour.genWiki();
            });
        }
    }).$mount('#forum-wiki:not(.is-not-vue)');
}