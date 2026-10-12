/* Estructura del foro */
Vue.component('categoria-foro', {
    props: ['id'],
    computed: {
        slugName() {
            const name = (this.id.indexOf('<h2>') > -1 ? FNR.utility.genSlug(this.id.split('<h2>')[1].split('</h2>')[0], '-') : FNR.utility.genSlug(this.id, '-'));

            return 'category-' + name;
        }
    },
    template: `
    <section :class="'category-element ' + slugName">
  		<slot></slot>
    </section>
    `
});

Vue.component('cabecera-foro', {
    data() {
        return {
            title: this.$slots['title'][0].tag === undefined ? this.$slots['title'][0].text : this.$slots['title'][0].children[0].text
        }
    },
    template: `
    <div class="forum-head regular-head">
        <titulo-especial :title="title"></titulo-especial>
    </div>
    `
});

Vue.component('cabcategoria-foro', {
    data() {
        return {
            title: this.$slots['title'][0].tag === undefined ? this.$slots['title'][0].text : this.$slots['title'][0].children[0].text
        }
    },
    template: `
    <div class="forum-head category-head">
        <titulo-especial :title="title"></titulo-especial>
    </div>
    `
});

Vue.component('cabespecial-foro', {
    data() {
        return {
            title: this.$slots['title'][0].tag === undefined ? this.$slots['title'][0].text : this.$slots['title'][0].children[0].text
        }
    },
    template: `
    <div class="forum-head special-head">
        <titulo-especial :title="title"></titulo-especial>
    </div>
    `
});

Vue.component('subforo-foro', {
    props: ['id'],
    computed: {
        slugId() {
            let id = '';

            if (window.location.pathname.match(/f(\d+)-/)) {
                id = window.location.pathname.match(/f(\d+)-/)[1];
            } else if (window.location.pathname.match(/f(\d+)p(\d+)-/)) {
                id = window.location.pathname.match(/f(\d+)p(\d+)-/)[1];
            }

            return 'subforum-' + id;
        },
        slugName() {
            const name = (this.id.indexOf('<h2>') > -1 ? FNR.utility.genSlug(this.id.split('<h2>')[1].split('</h2>')[0], '-') : FNR.utility.genSlug(this.id, '-'));

            return 'subforum-' + name;
        }
    },
    template: `
    <section :class="'subforum-element ' + slugId + ' ' + slugName">
  		<slot></slot>
    </section>
    `
});

Vue.component('lista-temas-cabecera', {
    props: ['elements'],
    data() {
        return {
            elementos: JSON.parse(this.elements.replace(/'/g, '"'))
        }
    },
    template: `
    <ul class="topiclist-header no-style">
        <li v-for="element in elementos">
            <titulo-especial :title="element"></titulo-especial>
        </li>
    </ul>
    `
});

Vue.component('tema-foro', {
    computed: {
        slugId() {
            let id = '';

            if (window.location.pathname.match(/t(\d+)-/)) {
                id = window.location.pathname.match(/t(\d+)-/)[1];
            } else if (window.location.pathname.match(/t(\d+)p(\d+)-/)) {
                id = window.location.pathname.match(/t(\d+)p(\d+)-/)[1];
            }

            return 'topic-' + id;
        },
        slugName() {
            const name = FNR.utility.genSlug((this.$slots['title'][0].tag === undefined ? this.$slots['title'][0].text : this.$slots['title'][0].children[0].text), '-');

            return 'topic-' + name;
        }
    },
    template: `
    <section :class="'topic-element ' + slugId + ' ' + slugName">
  		<slot></slot>
    </section>
    `
});

Vue.component('mando-foro', {
    props: ['id', 'app'],
    template: `
    <section :class="'forum-controls ' + id">
        <template v-if="app === 'true'">
            <ul class="left no-style page-buttons">
                <slot name="controls"></slot>
            </ul>
            <div class="right page-pagination">
                <slot name="pagination"></slot>
            </div>
        </template>
        <template v-else>
        <ul class="left no-style page-buttons"></ul>
            <div class="right page-pagination"></div>
        </template>
    </section>
    `
});

Vue.component('paginacion-foro', {
    props: ['page', 'total'],
    data() {
        return {
            input: '',
            timeout: null,
        }
    },
    computed: {
        value: {
            get() {
                return this.input
            },
            set(val) {
                if (this.timeout) clearTimeout(this.timeout);

                this.timeout = setTimeout(() => {
                    this.input = val;

                    if (val.match(/[a-zA-Z]+/g) === null && val.trim() !== '') {
                        if (val < 1) {
                            this.$emit('setPage', 1);
                        } else if (val > this.total) {
                            this.$emit('setPage', this.total);
                        } else {
                            this.$emit('setPage', val);
                        }

                        this.$refs.refInput.blur()
                        this.input = '';
                        this.doScroll();
                    }
                }, 750)
            }
        }
    },
    methods: {
        doScroll() {
            if (document.querySelector('body.is-touch')) {
                window.scroll(0, document.querySelector('.wiki-content').querySelector('.is-content').querySelector('p:last-child').offsetTop - 40);
            }
        }
    },
    template: `
    <div class="pagination-manager">
        <div class="page-action" v-if="page > 1">
            <a href="javascript:{}" class="page-prev" title="Ir a la página anterior" @click="$emit('setPage', page - 1); doScroll()">
                <i class="fas fa-chevron-left"></i>
            </a>
        </div>
        <div class="pagination-input" v-if="total > 1">
            <input type="text" :placeholder="page" v-model="value" ref="refInput">de {{ total }}
        </div>
        <div class="page-action" v-if="page < total">
            <a href="javascript:{}" class="page-next" title="Ir a la página anterior" @click="$emit('setPage', page + 1); doScroll()">
                <i class="fas fa-chevron-right"></i>
            </a>
        </div>
    </div>
    `
});

/* Componentes del foro */
Vue.component('titulo-especial', {
    props: ['title'],
    template: `
    <h3 class="is-tweakeable"><span class="is-measurable" v-html="title"></span></h3>
    `
});

Vue.component('cuerpo-widget', {
    props: ['class'],
    computed: {
        currentClass() {
            if (this.class === undefined) return 'plank-inner';
            else return 'plank-inner' + ' ' + this.class;
        }
    },
    template: `
    <div class="plank-content">
        <div :class="currentClass">
            <slot></slot>
        </div>						 
    </div>
    `
});

Vue.component('separador-foro', {
    props: ['faction'],
    data() {
        return {
            image: forumDefaults.separator
        }
    },
    template: `
    <section class="forumseparator-element">
        <img :src="image" />
    </section>
    `
});

Vue.component('tema-ref', {
    props: ['info'],
    data() {
        return {
            profileName: forumConfig.profileOptions.profileName || 'perfil'
        }
    },
    computed: {
        userColor() {
            return 'color: ' + this.info.lastpost.who.color;
        }
    },
    template: `
    <div class="ltopic-element">
        <a class="ltopic-last" :href="info.lastpost.url" :title="'Ir al último mensaje del tema «' + info.name + '»'">
            <i class="fas fa-link"></i>
        </a>
        <div class="ltopic-data">
            <a class="ltopic-title" :href="info.url" :title="'Ir al tema «' + info.name + '»'">{{ info.name }}</a>
            <small class="ltopic-info"><a :href="info.lastpost.who.url" :style="userColor" :title="'Ir al ' + profileName + ' de «' + info.lastpost.who.name + '»'">{{ info.lastpost.who.name | just-name }}</a>, {{ info.lastpost.date }} en <a :href="info.forum.url" :title="'Ir al subforo «' + info.forum.name + '»'">{{ info.forum.name }}</a></small>
        </div>
    </div>
    `
});

Vue.component('campo-foro', {
    props: ['name'],
    mounted() {
        const classList = this.$el.parentElement.classList;

        classList.add('field-element');
        classList.add('field-' + FNR.utility.genSlug(this.name, '-'));
    },
    template: `
    <div class="forum-field">
        <div class="field-name">{{ name | capitalize }}</div>
        <div class="field-content">
            <slot></slot>
        </div>
    </div>
    `
});

Vue.component('boton-foro', {
    props: ['url', 'name', 'icon', 'type', 'input'],
    computed: {
        realClass() {
            if (this.input === 'true') return 'forum-button is-input';
            else return 'forum-button';
        },
        realName() {
            return 'text' + (this.type === 'no-name' ? ' is-hidden-touch' : '');
        },
        realUrl() {
            if (this.input === 'true') return 'javascript:{}';
            else return this.url;
        }
    },
    mounted() {
        const classList = this.$el.parentElement.classList;

        classList.add('btn-element');
        classList.add('btn-' + FNR.utility.genSlug(this.name, '-'));
    },
    template: `
    <a :href="realUrl" targer="_blank" :class="realClass" :title="name">
        <span class="icon">
            <i :class="icon"></i>
        </span>
        <span :class="realName">{{ name }}</span>
        <span v-if="input === 'true'" class="input-real">
            <slot name="input"></slot>
        </span>
    </a>
    `
});

Vue.component('cargando-foro', {
    props: ['text'],
    template: `
    <section id="loading-element">
        <div id="loading-content">
            <i class="fas fa-circle-notch fa-spin"></i>
            <span>{{ text }}</span>
        </div>
    </section>
    `
});

Vue.component('aviso-foro', {
    template: `    
    <div class="forum-infoblock">
        <h5>Antes de proceder recuerda:</h5>
        <slot></slot>
    </div>
    `
});

Vue.component('afiliaciones-foro', {
    data() {
        return {
            afis: {}
        }
    },
    created() {
        FNR.forum.getAffiliates().then((data) => {
            this.afis = data;
        });
    },
    template: `
    <ul v-html="afis.normal" class="no-style"></ul>
    `
});

/* Navbar del foro */
Vue.component('controles-foro', {
    data() {
        return {
            maPage: 0,
            userName: _userdata.username,
            userLevel: _userdata.user_level,
            userId: _userdata.user_id,
            userLog: _userdata.session_logged_in,
            userMP: 0,
            userOut: '',
            isActive: false
        };
    },
    computed: {
        isActiveClass() {
            return 'has-bg' + ((this.isActive) ? ' visible' : ' not-visible');
        }
    },
    methods: {
        turnActive() {
            this.isActive = (this.isActive) ? false : true;
        }
    },
    created() {
        if (this.userLog !== 0) {
            if (document.querySelector('#i_icon_mini_new_message') !== null && document.querySelector('#i_icon_mini_new_message').title.match(/[0-255]/) !== null) {
                this.userMP = parseInt(document.querySelector('#i_icon_mini_new_message').title.match(/[0-255]/)[0]);
            }

            this.userOut = document.querySelector('#logout').href;
        }
    },
    template: `
    <div class="main-body">
   		<nav id="forum-breadcrumb" class="breadcrumb has-succeeds-separator left" aria-label="breadcrumbs">
        	<ul>
            	<li>
                	<a href="/" title="Ir a «Inicio»">Inicio</a>
            	</li>
        	</ul>
    	</nav>
        <nav class="right">   
            <section id="forum-navbar-desktop" class="is-hidden-touch">
                <navbar-foro :username="userName" :userlevel="userLevel" :userid="userId" :userlog="userLog" :usermp="userMP" :userout="userOut" />
            </section>
            <section id="forum-navbar-mobile" class="is-hidden-desktop">
                <div id="hmg-button" @click="turnActive()" class="is-pointer">
                    <i class="fas fa-bars"></i>
                </div>
                <div id="hmg-menu" :class="isActiveClass">
                    <h3>{{ userName | just-name }}<i class="fas fa-times is-pointer" @click="turnActive()"></i></h3>
                    <navbar-foro :username="userName" :userlevel="userLevel" :userid="userId" :userlog="userLog" :usermp="userMP" :userout="userOut" />
                </div>
                <div class="bg-active" @click="turnActive()"></div>
            </section>
            <section v-if="maPage === 1" id="multiaccount-transition">
                <cargando-foro text="Cambiando de cuenta…"></cargando-foro>
            </section>
        </nav>
    </div>
    `
});

Vue.component('navbar-foro', {
    props: ['username', 'userlevel', 'userid', 'userlog', 'usermp', 'userout'],
    data() {
        return {
            profileName: forumConfig.profileOptions.profileName || 'perfil',
            items: forumContent.navbar,
            navigation: forumContent.links,
            directions: forumConfig.usableDirections,
            multiAccount: {
                status: false,
                position: -1,
                accounts: []
            }
        }
    },
    computed: {
        isStatusClass() {
            return ((this.userlog === 1) ? 'is-logged' : 'is-unlogged') + ((this.userlevel === 1) ? ' is-admin' : ' is-user')
        },
        mpText() {
            return 'Mensajería' + ((this.usermp !== 0) ? ' (' + this.usermp + ')' : '')
        },
        links() {
            return this.navigation.filter((item) => {
                return item.icon !== undefined;
            });
        }
    },
    methods: {
        changeAccount() {
            this.$parent.maPage = 1;

            FNR.user.changeAccount(this.userout, this.multiAccount.accounts[this.multiAccount.position].name, this.multiAccount.accounts[this.multiAccount.position].password).then((r) => {
                if (r) {
                    window.location.reload();
                }
            });
        }
    },
    created() {
        this.multiAccount.status = FNR.cache.getData('usermultiaccounts') !== false && FNR.cache.getData('userpassword') !== false && FNR.cache.getData('usermultiaccounts').length > 1;
        this.multiAccount.accounts = (FNR.cache.getData('usermultiaccounts') === false ? [] : FNR.cache.getData('usermultiaccounts').map((item) => {
            return {
                name: item.name,
                password: sjcl.decrypt(FNR.cache.getData('userpassword'), item.password)
            }
        })).filter((item) => {
            return item.name !== _userdata.username;
        }).sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });
    },
    template: `
    <ul :class="isStatusClass">
        <li class="navbar-item is-hidden-desktop" v-for="link in links">
            <a :href="link.url" :title="'Ir a «' + link.name + '»'">
                <div class="icon">
                    <i :class="link.icon"></i>
                </div>
                <div class="text">{{ link.name }}</div>
            </a>
        </li>
        <li class="navbar-item" v-for="item in items">
            <a :href="item.url" :title="'Ir a «' + item.name + '»'">
                <div class="icon">
                    <i :class="item.icon"></i>
                </div>
                <div class="text">{{ item.name }}</div>
            </a>
        </li>
        <template v-if="!userlog">
            <li class="navbar-item">
                <a href="/register" title="Registrarse en el foro">
                    <div class="icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="text">Registrarse</div>
                </a>
            </li>
            <li class="navbar-item">
                <a href="/login" title="Iniciar sesión en el foro">
                    <div class="icon">
                        <i class="fas fa-sign-in-alt"></i>
                    </div>
                    <div class="text">Conectarse</div>
                </a>
            </li>
        </template>
        <template v-else>
            <li class="navbar-item">
                <a href="/privmsg?folder=inbox" title="Ir a tu mensajería privada">
                    <div class="icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="text">{{ mpText }}</div>
                </a>
            </li>
            <li class="navbar-item has-dropdown is-dropeable has-bg">
                <a class="navbar-link is-pointer" title="Accionar menú de usuario">
                    <div class="icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="text">{{ username | just-name }}</div>
                </a>
                <div class="navbar-dropdown is-right">
                    <template v-if="userlevel === 1">
                        <a class="navbar-item" href="/admin" title="Ir al «Panel de Administrador»">
                            <div class="icon">
                                <i class="fas fa-cogs"></i>
                            </div>
                            <div class="text">Panel Administrador</div>
                        </a>
                    </template>
                    <a class="navbar-item" :href="directions.ucp" title="Ir al «Panel de Usuario»">
                        <div class="icon">
                            <i class="fas fa-sliders-h"></i>
                        </div>
                        <div class="text">Panel Usuario</div>
                    </a>
                    <a class="navbar-item" :href="'/u' + userid" :title="'Ir a tu ' + profileName">
                        <div class="icon">
                            <i class="far fa-id-card"></i>
                        </div>
                        <div class="text">{{ profileName | capitalize }}</div>
                    </a>
                    <a class="navbar-item" href="/search?search_id=egosearch" title="Ir a tus temas personales">
                        <div class="icon">
                            <i class="fas fa-archive"></i>
                        </div>
                        <div class="text">Temas personales</div>
                    </a>
                    <a class="navbar-item" :href="userout" title="Cerrar sesión">
                        <div class="icon">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        <div class="text">Cerrar sesión</div>
                    </a>
                    <template v-if="multiAccount.status">
                        <hr/>
                        <div title="Cambiar de cuenta" class="select-container">
                            <select v-model="multiAccount.position" @change="changeAccount()" @click="$event.stopPropagation()">
                                <option value="-1" hidden selected>Selec. personaje</option>
                                <option v-for="(account, index) in multiAccount.accounts" :value="index">{{ account.name }}</option>
                            </select>
                        </div>
                    </template>
                </div>
            </li>
        </template>
    </ul>
    `
});

/* Widgets del foro */
Vue.component('links-ayuda', {
    data() {
        return {
            links: forumContent.links
        }
    },
    template: `
    <div class="columns is-multiline is-gapless is-vcentered">
        <a :href="link.url" :title="'Ir a «' + link.name + '»'" class="column" v-for="link in links">{{ link.name }}</a>
    </div>
    `
});

Vue.component('links-anuncios', {
    data() {
        return {
            announcements: forumContent.announcements
        }
    },
    template: `
    <div id="anmt-main">
        <template v-for="(announcement, index) in announcements">
            <a :href="announcement.url" :title="'Ir al anuncio «' + announcement.name + '»'" class="anmt-element"><span class="anmt-title">{{ announcement.name }}</span><span class="anmt-date">{{ announcement.date }}</span></a>
            <div class="anmt-sep" v-if="(announcements.length - 1) !== index"></div>
        </template>
    </div>
    `
});

Vue.component('links-staff', {
    data() {
        return {
            staff: forumContent.staff
        }
    },
    template: `
    <div id="admin-main">
        <a :href="admin.url" class="admin-element" :style="'background-image: url(' + admin.avatar + ')'" :title="admin.title" v-for="admin in staff"><span class="admin-name">{{ admin.name }}</span><span class="admin-desc">{{ admin.desc }}</span></a>
    </div>
    `
});

Vue.component('sabias-que', {
    data() {
        return {
            content: forumContent.sq[Math.floor(Math.random() * forumContent.sq.length)]
        }
    },
    created() {
        setInterval(() => {
            this.content = forumContent.sq[Math.floor(Math.random() * forumContent.sq.length)];
        }, 12000);
    },
    template: `
    <img id="sq-img" :src="content" alt="¿Sabías que?" />
    `
});

Vue.component('busquedas', {
    data() {
        return {
            content: forumContent.searches[Math.floor(Math.random() * forumContent.searches.length)]
        }
    },
    created() {
        setInterval(() => {
            this.content = forumContent.searches[Math.floor(Math.random() * forumContent.searches.length)];
        }, 16000);
    },
    template: `
    <a id="search-img" :href="content.url" :title="content.desc">
        <img :src="content.img" alt="Búsqueda" />
    </a>
    `
});

/* Tablillas del foro */
Vue.component('note-info', {
    template: `
    <div class="admin-block admin-note">
        <div class="admin-icon fas fa-caret-right"></div>
        <div class="admin-content admin-title">
            <slot></slot>
        </div>
    </div>
    `
});

Vue.component('redirect', {
    props: ['to'],
    computed: {
        currentStatus() {
            if (window.location.pathname.match(/t(\d+)-/)) return true;
            else return false;
        }
    },
    created() {
        if (this.currentStatus) {
            window.location.replace(this.to);
        }
    },
    template: `
    <div class="is-content">
        <template v-if="!currentStatus">
            <p>No hay mensaje.</p>
        </template>
    </div>
    `
});

Vue.component('quote', {
    props: ['from'],
    template: `
    <div class="admin-block admin-box user-coolquote">
        <div class="coolquote-quote">
            <div class="fas fa-quote-left"></div>
            <div class="coolquote-content">
                <slot></slot>
            </div>
            <div class="fas fa-quote-right"></div>
        </div>
        <div class="coolquote-from">{{ from }}</div>
    </div>
    `
});

/* Wiki del foro */
Vue.component('wiki-index-items-d', {
    props: ['content'],
    template: `
    <ul>
        <li v-for="content in content">
            <div class="wiki-controls">
                <router-link :to="content.id" v-if="!content.children.length" :title="'Ir al artículo de «' + content.name + '»'">{{ content.name }}</router-link>
                <a class="wiki-cascade" :title="'Desplegar categoría de «' + content.name + '»'" v-else>
                    <span class="text">{{ content.name }}</span>
                    <span class="icon">
                        <i class="fas fa-plus"></i>
                        <i class="fas fa-minus"></i>
                    </span>
                </a>
            </div>
            <wiki-index-items-d v-if="content.children.length" :content="content.children"></wiki-index-items-d>
        </li>
    </ul>
    `
});

Vue.component('wiki-index', {
    computed: {
        indexContent() {
            const getChildren = (name) => {
                return filtered.filter((item) => {
                    return item.component.page_parent === name;
                }).map((item) => {
                    return {
                        id: item.path,
                        name: item.component.page_name,
                        children: getChildren(item.component.page_name)
                    }
                });
            };

            const filtered = routes.filter((item) => {
                return item.component !== undefined;
            }).filter((item) => {
                return !item.component.page_skip;
            });

            return filtered.filter((item) => {
                return item.component.page_parent === undefined;
            }).map((item) => {
                return {
                    id: item.path,
                    name: item.component.page_name,
                    children: getChildren(item.component.page_name)
                };
            });
        }
    },
    template: `
    <aside class="wiki-index is-content profile-sticky">
        <div class="is-hidden-touch">
            <h3>Contenido</h3>
            <wiki-index-items-d :content="indexContent"></wiki-index-items-d>
        </div>
        <div class="select-container is-hidden-desktop">
            <select>
                <option value="-1" hidden selected>Contenido</option>
                <template v-for="content in indexContent">
                    <template v-if="content.children.length">
                        <option :value="content.id" disabled >— {{ content.name }}</option>
                        <template v-for="content in content.children">
                            <template v-if="content.children.length">
                                <option :value="content.id" disabled >&nbsp&nbsp&nbsp&nbsp— {{ content.name }}</option>
                                <template v-for="content in content.children">
                                    <template v-if="content.children.length">
                                        <option :value="content.id" disabled >&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp— {{ content.name }}</option>
                                        <template v-for="content in content.children">
                                            <template v-if="content.children.length">
                                                <option :value="content.id" disabled >&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp— {{ content.name }}</option>
                                                <template v-for="content in content.children">
                                                    <option :value="content.id">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp— {{ content.name }}</option>
                                                </template>
                                            </template>
                                            <option :value="content.id" v-else >&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp— {{ content.name }}</option>
                                        </template>
                                    </template>
                                    <option :value="content.id" v-else >&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp— {{ content.name }}</option>
                                </template>
                            </template>
                            <option :value="content.id" v-else >&nbsp&nbsp&nbsp&nbsp— {{ content.name }}</option>
                        </template>
                    </template>
                    <option :value="content.id" v-else >— {{ content.name }}</option>
                </template>
            </select>
        </div>
    </aside>
    `
});

Vue.component('wiki-contenido', {
    props: ['mode'],
    template: `
    <div class="wiki-body has-small-topiclist">
        <wiki-index></wiki-index>
        <template v-if="mode === 'app'">
            <slot></slot>
        </template>
        <template v-else>
            <section class="wiki-content is-dramatic">
                <slot></slot>
            </section>
        </template>
    </div>
    `
});

Vue.component('wiki-nav', {
    computed: {
        more() {
            return routes.filter((item) => {
                return item.component
            }).filter((item) => {
                return item.component.page_parent === routes.filter((item) => {
                    return item.path === router.history.current.path
                })[0].component.page_parent
            }).length > 1;
        },
        nav() {
            const list = routes.filter((item) => {
                return item.component
            }).filter((item) => {
                return item.component.page_parent === routes.filter((item) => {
                    return item.path === router.history.current.path
                })[0].component.page_parent
            }),
                current = list.map((item) => {
                    return item.path
                }).indexOf(router.history.current.path);

            return {
                next: current + 1 >= list.length ? false : list[current + 1],
                prev: current - 1 < 0 ? false : list[current - 1]
            }
        }
    },
    template: `
    <div class="wiki-nav" v-if="more">
        <h2>Navegación</h2>
        <template v-if="nav.prev !== false">* <router-link :to="nav.prev.path" :title="'Ir al artículo «' + nav.prev.component.page_name + '»'">Página anterior: {{ nav.prev.component.page_name }}</router-link></template>
        <br v-if="nav.prev !== false && nav.next !== false"/>
        <template v-if="nav.next !== false">* <router-link :to="nav.next.path" :title="'Ir al artículo «' + nav.next.component.page_name + '»'">Página siguiente: {{ nav.next.component.page_name }}</router-link></template>
    </div>
    `
});

Vue.component('wiki-children', {
    props: ['name', 'category'],
    computed: {
        nav() {
            return routes.filter((item) => {
                return item.component
            }).filter((item) => {
                return item.component.page_parent === this.category;
            });
        }
    },
    template: `
    <div class="wiki-nav" v-if="nav.length > 0">
        <h2>{{ name }}</h2>
        <template v-for="route in nav">* <router-link :to="route.path" :title="'Ir al artículo «' + route.component.page_name + '»'">{{ route.component.page_name }}</router-link><br/></template>
    </div>
    `
});

/* Modal del foro */
Vue.component('modal-foro', {
    props: ['title'],
    methods: {
        modalClose() {
            this.$parent.state.modal = false;
            this.$emit('modal-close');
        }
    },
    template: `    
    <div id="forum-modal">
        <div class="modal-element">
            <div class="modal-title">
                <h3>{{ title }}</h3>
                <a @click="modalClose()">
                    <i class="fas fa-times"></i>
                </a>
            </div>
            <div class="modal-content">
                <div class="is-content">
                    <slot name="content"></slot>
                </div>
                <slot name="controls"></slot>
            </div>
        </div>
        <div class="is-bgmodal bg-active" @click="modalClose()"></div>
    </div>
    `
});

Vue.component('controles-modal', {
    template: `    
    <div class="modal-buttons">
        <slot></slot>
    </div>
    `
});

/* Expediente */
Vue.component('expediente-usuario', {
    data() {
        return {
            info: {
                name: _userdata.username,
                level: _userdata.user_level,
                log: _userdata.session_logged_in
            },
            config: forumConfig.profileUser,
            profile: profile
        }
    },
    computed: {
        userRank() {
            return this.profile.fields[forumConfig.profileOptions.profileRank].content;
        },
        userCite() {
            return this.profile.fields[forumConfig.profileOptions.profileCite].content
        },
        userCover() {
            return this.profile.fields[forumConfig.profileOptions.profileCover].content
        },
        usableMiniFields() {
            if (this.config.miniFields === undefined || !this.config.miniFields.length) return [];
            else return Object.entries(this.profile.fields).filter((item) => {
                return this.config.miniFields.indexOf(item[0]) > -1;
            }).map((item) => {
                return {
                    id: item[0],
                    title: item[1].label,
                    content: item[1].content
                };
            }).sort((a, b) => {
                if (this.config.miniFields.indexOf(a.id) > this.config.miniFields.indexOf(b.id)) {
                    return 1;
                } else {
                    return -1;
                }
            }).map((item) => {
                return {
                    id: FNR.utility.genSlug(item.title, '-'),
                    title: item.title,
                    content: item.content
                };
            });
        },
        usableBigFields() {
            if (this.config.mainFields === undefined || !Object.keys(this.config.mainFields).length) return [];
            else return Object.entries(this.profile.fields).filter((item) => {
                return Object.keys(this.config.mainFields).indexOf(item[0]) > -1;
            }).map((item) => {
                return {
                    id: item[0],
                    title: item[1].label,
                    subtitle: this.config.mainFields[item[0]],
                    content: (item[1].content === ' &nbsp;-' ? '' : item[1].content)
                };
            }).sort((a, b) => {
                if (Object.keys(this.config.mainFields).indexOf(a.id) > Object.keys(this.config.mainFields).indexOf(b.id)) {
                    return 1;
                } else {
                    return -1;
                }
            }).map((item) => {
                return {
                    id: FNR.utility.genSlug(item.title, '-'),
                    title: item.title,
                    subtitle: item.subtitle,
                    content: item.content
                };
            });
        },
        lengthBigFields() {
            let length = 0;

            this.usableBigFields.map((item) => {
                if (item.content === undefined) return;

                length += item.content.length;
            });

            return length;
        },
        usableExtraFields() {
            if (this.config.extraFields === undefined || !this.config.extraFields.length) return [];
            else return Object.entries(this.profile.fields).filter((item) => {
                return this.config.extraFields.indexOf(item[0]) > -1;
            }).map((item) => {
                return {
                    id: item[0],
                    title: item[1].label,
                    content: (item[1].content === ' &nbsp;-' ? '' : item[1].content)
                };
            }).sort((a, b) => {
                if (this.config.extraFields.indexOf(a.id) > this.config.extraFields.indexOf(b.id)) {
                    return 1;
                } else {
                    return -1;
                }
            }).map((item) => {
                return {
                    id: FNR.utility.genSlug(item.title, '-'),
                    title: item.title,
                    content: item.content
                };
            });
        },
        lengthExtraFields() {
            let length = 0;

            this.usableExtraFields.map((item) => {
                if (item.content === undefined) return;

                length += item.content.length;
            });

            return length;
        },
        usableLinkFields() {
            if (this.profile.contact.length) return [];
            else return Object.entries(this.profile.contact).filter((item) => {
                return item[1].label !== 'Mensaje Privado';
            }).map((item) => {
                return {
                    id: FNR.utility.genSlug(item[1].label, '-'),
                    title: item[1].label,
                    url: item[1].content,
                    icon: this.config.contactFields[item[0]],
                    desc: 'Ir a ' + item[1].label + ' de «' + this.profile.name + '»'
                }
            });
        },
        chronologyField() {
            if (this.config.cronoField === undefined || !this.config.cronoField.length) return [];
            else return FNR.utility.genArray(this.profile.fields[FNR.utility.genSlug(this.config.cronoField, '_')].content);
        },
        relationshipsField() {
            if (this.config.relaField === undefined || !this.config.relaField.length) return [];
            else return FNR.utility.genArray(this.profile.fields[FNR.utility.genSlug(this.config.relaField, '_')].content);
        },
        lengthHistoryFields() {
            let length = 0;

            length += this.chronologyField.length;
            length += this.relationshipsField.length;

            return length;
        },
        currentClass() {
            return 'usergroup-' + this.profile.colour
        }
    },
    created() {
        // Updates stored profiles.
        FNR.user.getProfile(window.location.href.split('/u')[1]);
    },
    template: `       
    <section class="profile-element">    
        <cabespecial-foro><template slot="title">Perfil de {{ profile.name }}</template></cabespecial-foro>
        <section :class="currentClass">
            <section id="profile-head">
                <div id="profile-userside">
                    <div id="profile-minifields" class="profile-container is-align-items-flex-start wiki-index is-content has-text-left" v-if="lengthBigFields">
                        <h3>Contenido</h3>
                        <ul>
                            <li v-if="lengthBigFields">
                                <div class="wiki-controls">
                                    <a href="#anchor-info">Información</a>
                                </div>
                            </li>
                            <li v-if="lengthExtraFields">
                                <div class="wiki-controls">
                                    <a href="#anchor-extras">Extras</a>
                                </div>
                            </li>
                            <li v-if="lengthHistoryFields">
                                <div class="wiki-controls">
                                    <a href="#anchor-history">Historial</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <ul id="profile-minifields" class="profile-container is-align-items-center wiki-index is-content" v-else>
                        <li :id="'profile-minifield-' + field.id" v-for="field in usableMiniFields" class="minifield-element">
                            <span class="minifield-label">{{ field.title }}</span>
                            <span class="minifield-content">{{ field.content }}</span>
                        </li>
                    </ul>
                </div>
                <div id="profile-userinfo" :style="'background-image: url(' + userCover + ');'">
                    <div id="profile-userdata">
                        <div id="profile-rank">{{ userRank }}</div>
                        <div id="profile-username">{{ profile.name }}</div>
                    </div>
                    <div id="profile-usergest" v-if="Object.keys(profile.admin).length">
                        <a :href="profile.admin.admin" :title="'Administrar a «' + profile.name + '»'">Administrar</a> / <a :href="profile.admin.ban" :title="'Banear a «' + profile.name + '»'">Banear</a>
                    </div>
                </div>
            </section>
            <section id="profile-subhead">
                <div class="columns is-centered is-vcentered is-gapless">
                    <div class="column is-6 is-full-mobile">
                        <div id="profile-quote" class="is-content">
                            <quote>{{ userCite }}</quote>
                        </div>
                    </div>
                    <div class="column is-5 is-full-mobile">
                        <div id="profile-links" class="columns is-flex is-vcentered is-multiline py-4">
                            <div class="column is-full-touch is-half-desktop">
                                <ul class="profile-linklist">
                                    <li>
                                        <a :href="profile.links.posts" :title="'Mensajes de «' + profile.name + '»'">
                                            <i :class="config.contactFields.mensajes"></i> Mensajes
                                        </a>
                                    </li>
                                    <li>
                                        <a :href="profile.links.topics" :title="'Temas de «' + profile.name + '»'">
                                            <i :class="config.contactFields.temas"></i> Temas
                                        </a>
                                    </li>
                                    <li v-if="profile.contact.mensaje_privado !== undefined">
                                        <a :href="profile.contact.mensaje_privado.content" :title="'Enviar un mensaje privado a «' + profile.name + '»'">
                                            <i :class="config.contactFields.mp"></i> Mensaje Privado
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div class="column is-full-touch is-half-desktop">
                                <ul class="profile-linklist">
                                    <li :id="'profile-link-' + field.id" v-for="field in usableLinkFields">
                                        <a :href="field.url" :title="field.desc">
                                            <i :class="field.icon"></i> {{ field.title }}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id="profile-fields" class="profile-container is-relative" v-if="lengthBigFields">
                <a id="anchor-info" class="page-anchor"></a>
                <aside id="profile-infominifields" class="wiki-index profile-sticky">
                    <h3>Datos básicos</h3>
                    <ul class="p-0">
                        <li :id="'profile-minifield-' + field.id" v-for="field in usableMiniFields" class="minifield-element">
                            <span class="minifield-label">{{ field.title }}</span>
                            <span class="minifield-content">{{ field.content }}</span>
                        </li>
                    </ul>
                </aside>
                <ul id="profile-infofields">
                    <li :id="'profile-field-' + field.id" class="profilefield-element" v-for="field in usableBigFields" v-if="field.content.length">
                        <div class="field-head">
                            <h4>{{ field.title }}</h4>
                            <h6>{{ field.subtitle }}</h6>
                        </div>
                        <div class="field-content is-content" v-html="field.content"></div>
                    </li>
                </ul>
            </section>
            <section id="profile-extras" class="profile-extra is-relative" v-if="lengthExtraFields">
                <a id="anchor-extras" class="page-anchor"></a>
                <div class="profile-extra-header">
                    <span>Extras</span>
                </div>
                <ul class="profile-container profile-extra-space">
                    <li :id="'profile-extrafield-' + field.id" class="extrafield-element" v-for="field in usableExtraFields" v-if="field.content.length">
                        <div class="extrafield-head">
                            <h4>{{ field.title }}</h4>
                        </div>
                        <div class="extrafield-content is-content" v-html="field.content"></div>
                    </li>
                </ul>
            </section>
            <section id="profile-history" class="profile-extra is-relative" v-if="lengthHistoryFields">
                <a id="anchor-history" class="page-anchor"></a>
                <div class="profile-extra-header">
                    <span>Historial</span>
                </div>
                <ul class="profile-container profile-extra-space">
                    <li id="profile-extrafield-chronology" class="extrafield-element" v-if="chronologyField.length">
                        <div class="extrafield-head">
                            <h4>Cronología</h4>
                        </div>
                        <ul id="chronology-element" class="is-two-columns-list">
                            <template v-for="element in chronologyField">
                                <elemento-cronologia :element="element" type="profile" />
                            </template>
                        </ul>
                    </li>
                    <li id="profile-extrafield-relationships" class="extrafield-element" v-if="relationshipsField.length">
                        <div class="extrafield-head">
                            <h4>Relaciones</h4>
                        </div>
                        <ul id="relationships-element" class="is-two-columns-list">
                            <template v-for="element in relationshipsField">
                                <elemento-relaciones :element="element" type="profile" />
                            </template>
                        </ul>
                    </li>
                </ul>
            </section>
        </section>
    </section>
    `
});

/* Tablillas */
Vue.component('cuerpo-principal', {
    props: ['title'],
    computed: {
        realTitle() {
            if (typeof this.title !== 'undefined') return this.title;
            else if (typeof this.$attrs['data-title'] !== 'undefined') return this.$attrs['data-title'];
            else return '';
        }
    },
    template: `    
    <div class="main-slat">
        <div class="mainslat-title" v-if="realTitle.length">{{ realTitle }}</div>
        <div class="mainslat-content">
            <slot></slot>
        </div>
    </div>
    `
});

Vue.component('cuerpo-interior', {
    props: ['title'],
    computed: {
        realTitle() {
            if (typeof this.title !== 'undefined') return this.title;
            else if (typeof this.$attrs['data-title'] !== 'undefined') return this.$attrs['data-title'];
            else return '';
        }
    },
    template: `    
    <div class="slat-interior">
        <div class="slatinterior-title" v-if="realTitle.length">{{ realTitle }}</div>
        <div class="slatinterior-content">
            <slot></slot>
        </div>
    </div>
    `
});

Vue.component('cuerpo-lista', {
    props: ['title'],
    computed: {
        realTitle() {
            if (typeof this.title !== 'undefined') return this.title;
            else if (typeof this.$attrs['data-title'] !== 'undefined') return this.$attrs['data-title'];
            else return '';
        }
    },
    template: `    
    <div class="slat-list">
        <div class="slatlist-title" v-if="realTitle.length">{{ realTitle }}</div>
        <ol class="slatlist-content">
            <slot></slot>
        </ol>
    </div>
    `
});