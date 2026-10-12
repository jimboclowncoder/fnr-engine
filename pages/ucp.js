if (!_userdata.session_logged_in) window.location.replace('/');

const routes = [{
        path: '/',
        redirect: '/inicio'
    },
    {
        path: '/home',
        redirect: '/inicio'
    }
];

if (typeof forumConfig.profileUser.cronoField === 'undefined' && typeof forumConfig.profileUser.relaField === 'undefined') {
    routes.push({
        path: '/inicio',
        redirect: '/editar'
    });

    routes.push({
        path: '/editar',
        component: {
            page_name: 'Editar perfil',
            template: `
<wiki-contenido mode="app">
    <panel-control elements="` + JSON.stringify(forumConfig.profileEdit).replace(/"/g, "'") + `" />
</wiki-contenido>
    `
        }
    });

    if (typeof forumConfig.profileUser.accountsField !== 'undefined') {
        routes.push({
            path: '/multicuentas',
            component: {
                page_name: 'Multicuentas',
                template: `
<wiki-contenido mode="app">
    <gestor-multicuentas />
</wiki-contenido>
        `
            }
        });
    }

    routes.push({
        path: '/supervisados',
        component: {
            page_name: 'Supervisados',
            template: `
<wiki-contenido mode="app">
    <lista-seguidos />
</wiki-contenido>
    `
        }
    });

    routes.push({
        path: '/bosquejos',
        component: {
            page_name: 'Bosquejos',
            template: `
<wiki-contenido mode="app">
    <lista-bosquejos />
</wiki-contenido>
    `
        }
    });
} else {
    if (typeof forumConfig.profileUser.accountsField !== 'undefined') {
        routes.push({
            path: '/inicio',
            redirect: '/perfil/editar'
        });

        routes.push({
            path: '/perfil',
            redirect: '/inicio',
            component: {
                page_name: 'Perfil de usuario',
            }
        });

        routes.push({
            path: '/perfil/editar',
            component: {
                page_name: 'Editar',
                page_parent: 'Perfil de usuario',
                template: `
<wiki-contenido mode="app">
    <panel-control elements="` + JSON.stringify(forumConfig.profileEdit).replace(/"/g, "'") + `" />
</wiki-contenido>
        `
            }
        });

        routes.push({
            path: '/perfil/multicuentas',
            component: {
                page_name: 'Multicuentas',
                page_parent: 'Perfil de usuario',
                template: `
        <wiki-contenido mode="app">
            <gestor-multicuentas />
        </wiki-contenido>
        `
            }
        });
    } else {
        routes.push({
            path: '/inicio',
            redirect: '/editar'
        });
    
        routes.push({
            path: '/editar',
            component: {
                page_name: 'Editar perfil',
                template: `
<wiki-contenido mode="app">
    <panel-control elements="` + JSON.stringify(forumConfig.profileEdit).replace(/"/g, "'") + `" />
</wiki-contenido>
        `
            }
        });
    }

    routes.push({
        path: '/otros',
        redirect: '/inicio',
        component: {
            page_name: 'Otros',
        }
    });

    if (typeof forumConfig.profileUser.cronoField !== 'undefined') {
        routes.push({
            path: '/otros/cronologia',
            component: {
                page_name: 'Cronología',
                page_parent: 'Otros',
                template: `
<wiki-contenido mode="app">
    <gestor-cronologia />
</wiki-contenido>
        `
            }
        });
    }

    if (typeof forumConfig.profileUser.relaField !== 'undefined') {
        routes.push({
            path: '/otros/relaciones',
            component: {
                page_name: 'Relaciones',
                page_parent: 'Otros',
                template: `
<wiki-contenido mode="app">
    <gestor-relaciones />
</wiki-contenido>
        `
            }
        });        
    }

    routes.push({
        path: '/otros/supervisados',
        component: {
            page_name: 'Supervisados',
            page_parent: 'Otros',
            template: `
<wiki-contenido mode="app">
    <lista-seguidos />
</wiki-contenido>
    `
        },
        alias: '/supervisados'
    });

    routes.push({
        path: '/otros/bosquejos',
        component: {
            page_name: 'Bosquejos',
            page_parent: 'Otros',
            template: `
<wiki-contenido mode="app">
    <lista-bosquejos />
</wiki-contenido>
    `
        },
        alias: '/bosquejos'
    });
}

const router = new VueRouter({
    routes
});