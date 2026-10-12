Vue.component('modal-relaciones', {
    props: ['element', 'type'],
    data() {
        return {
            state: {
                modal: false
            },
            info: {
                users: this.$parent.users,
                user: '',
                people: []
            },
            content: {
                edit: JSON.parse(JSON.stringify(this.element)),
                current: this.element
            }
        }
    },
    computed: {
        modalTitle() {
            if (this.type === 'new') return 'Nueva entrada';
            else if (this.type === 'edit') return 'Editar entrada';
        },
        oneCheck() {
            let final = '';

            if (!Object.keys(this.content.edit).length) return final;

            if (this.content.edit.name.length < 3) {
                final += '<li>Escribe el nombre del personaje.</li>';
            }

            if (this.content.edit.color === -1) {
                final += '<li>Selecciona una facción para el personaje.</li>';
            }

            if (this.content.edit.url.indexOf('/u') === -1) {
                final += '<li>Escribe el enlace al perfil del personaje.</li>';
            }

            if (!this.content.edit.img.match(/(jpg|jpeg|png)$/i)) {
                final += '<li>Escribe el enlace a la imagen del personaje (debe ser de 190x190).</li>';
            }

            if (this.content.edit.desc.length < 151) {
                final += '<li>Escribe una descripción lo suficientemente larga (150 carácteres al menos).</li>';
            }

            return final;
        },
        finalCheck() {
            return JSON.stringify(this.content.current) !== JSON.stringify(this.content.edit);
        },
        sortedCharacters() {
            if (!Object.keys(this.content.edit).length) return this.$parent.users.map((item) => {
                return item.user;
            });
            else return this.info.users.filter((item) => {
                return this.info.people.indexOf(item.user) === -1;
            }).filter((item) => {
                return item.user.toLowerCase().indexOf(this.content.edit.name.toLowerCase()) > -1;
            });
        }
    },
    methods: {
        modalClose() {
            this.$parent.modal.type = 'new';
            this.$parent.modal.status = false;
            this.$parent.setEntry();
        },
        addCharacter(character) {
            this.content.edit.type = true;
            this.content.edit.name = character.user;
            this.content.edit.img = character.img;
            this.content.edit.color = character.color;
            this.content.edit.url = character.id;
        },
        updateData() {
            const data = JSON.parse(JSON.stringify(this.info.users)).filter((item) => {
                return item.user === this.content.current.name;
            })[0];

            this.content.edit.img = data.img;
        },
        pushElement() {
            if (this.oneCheck.length) {
                return;
            }

            if (this.finalCheck) {
                this.modalClose();
            }

            if (this.$parent.modal.type === 'edit') {
                this.$parent.content.edit.splice(this.$parent.content.edit.map((item) => {
                    return item.position;
                }).indexOf(this.content.current.position), 1);
            }

            let data = this.content.edit;

            if (this.$parent.modal.type === 'new') {
                data.position = this.$parent.content.edit.length;
            }

            this.$parent.content.edit.push(data);

            this.modalClose();
        }
    },
    template: `
    <modal-foro :title="modalTitle" @modal-close="modalClose()">
        <template v-if="content.edit.type">
            <template slot="content">
                <aviso-foro v-show="oneCheck.length">
                    <ul v-html="oneCheck"></ul>
                </aviso-foro>
                <ul class="forum-fieldlist no-style">
                    <li>
                        <campo-foro name="Nombre">
                            <div class="character-selector">
                                <input type="text" v-model="content.edit.name" placeholder="Escribe el nombre del personaje." disabled />
                                <a class="character-custom" @click="updateData()" :title="'Actualizar avatar de «' + content.current.name + '»'">
                                    <i class="fas fa-redo-alt"></i>
                                </a>
                            </div>
                        </campo-foro>
                    </li>
                </ul>
                <h4 class="mt-5">Descripción</h4>
                <ul class="forum-fieldlist no-style">
                    <li class="has-no-label">
                        <campo-foro name="Descripción">
                            <textarea v-model="content.edit.desc" placeholder="Escribe la descripción del personaje."></textarea>
                        </campo-foro>
                    </li>
                </ul>
            </template>
            <template slot="controls">
                <controles-modal>
                    <button class="button1 btn-main" @click="pushElement()" title="Guardar entrada">Guardar</button>
                </controles-modal>
            </template>
        </template>
        <template v-else>
            <template slot="content">
                <aviso-foro v-show="oneCheck.length">
                    <ul v-html="oneCheck"></ul>
                </aviso-foro>
                <ul class="forum-fieldlist no-style">
                    <li>
                        <campo-foro name="Nombre">
                            <div class="character-selector">                                
                                <input type="text" v-model="content.edit.name" placeholder="Escribe el nombre del personaje." />
                                <ul class="no-style selector-list" v-if="sortedCharacters.length > 0">
                                    <li v-for="(character, index) in sortedCharacters" @click="addCharacter(character)" :title="'Seleccionar ' + character.user">{{ character.user }}<i class="fas fa-plus"></i></li>
                                </ul>
                            </div>
                        </campo-foro>
                    </li>
                    <li>
                        <campo-foro name="Imagen">
                            <input type="text" v-model="content.edit.img" placeholder="Escribe el enlace a la imagen del personaje." />
                        </campo-foro>
                    </li>
                    <li>
                        <campo-foro name="Perfil">
                            <input type="text" v-model="content.edit.url" placeholder="Escribe el enlace al perfil del personaje." />
                        </campo-foro>
                    </li>
                    <li>
                        <campo-foro name="Facción">
                            <div class="select-container">
                                <select v-model="content.edit.color">
                                    <option value="-1" hidden>Selecciona la facción del personaje.</option>
                                    <option value="azul">Imperio Galáctico</option>
                                    <option value="rojo">Remanente Purista</option>
                                    <option value="naranja">Autoridad del Sector Corporativo</option>
                                    <option value="verde">Cártel</option>
                                    <option value="turquesa">Nueva Rebelión</option>
                                    <option value="amarillo">Neutral</option>
                                </select>
                            </div>
                        </campo-foro>
                    </li>
                </ul>
                <h4 class="mt-5">Descripción</h4>
                <ul class="forum-fieldlist no-style">
                    <li class="has-no-label">
                        <campo-foro name="Descripción">
                            <textarea v-model="content.edit.desc" placeholder="Escribe la descripción del personaje."></textarea>
                        </campo-foro>
                    </li>
                </ul>
            </template>
            <template slot="controls" v-if="!oneCheck.length && finalCheck">
                <controles-modal>
                    <button class="button1 btn-main" @click="pushElement()" title="Guardar entrada">Guardar</button>
                </controles-modal>
            </template>
        </template>
    </modal-foro>
    `
});

Vue.component('gestor-relaciones', {
    data() {
        return {
            render: 0,
            modal: {
                type: 'new',
                status: false
            },
            users: [],
            state: {
                page: 0,
                pagination: 0
            },
            entry: {},
            content: {
                edit: [],
                current: []
            }
        }
    },
    computed: {
        sortedContent() {
            return JSON.parse(JSON.stringify(this.content.edit)).sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        },
        paginationContent() {
            const limit = parseInt(forumConfig.skinOptions.paginationDefault / 2) + 1;
            const pages = Math.floor((this.sortedContent.length - 1) / limit) + 1;

            let list = [];

            for (let i = 0; i < pages; i++) {
                list.push(i);
            };

            this.forceRerender();

            return {
                pages: list,
                content: this.sortedContent.slice(this.state.pagination * limit, (this.state.pagination + 1) * limit)
            };
        },
        finalCheck() {
            return JSON.stringify(this.content.current) !== JSON.stringify(this.content.edit);
        }
    },
    methods: {
        forceRerender() {
            this.render += 1;
        },
        setEntry() {
            this.entry = {
                type: false,
                color: -1,
                url: '',
                img: '',
                name: '',
                desc: ''
            };
        },
        addEntry(e) {
            e.preventDefault();

            this.modal.status = true;
        },
        save(e) {
            e.preventDefault();

            this.state.page = 2;

            const data = this.sortedContent.map((item) => {
                if (item.position !== undefined) {
                    delete item.position;
                }

                return item;
            });

            FNR.user.profile.setData([{
                name: forumConfig.profileUser.relaField,
                type: 'textarea',
                value: JSON.stringify(data).replace(/"/g, '`')
            }]).then((r) => {
                if (r) {
                    FNR.html.genNotification('Atención', 'Información actualizada sin inconvenientes.', 'fas fa-check');

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    FNR.html.genNotification('Atención', 'Hubo un problema al actualizar. Dale otro intento.', 'fas fa-exclamation');
                }
            });
        }
    },
    created() {
        FNR.user.profile.getData([{
            name: forumConfig.profileUser.relaField,
            type: 'textarea'
        }]).then((r) => {
            const data = FNR.utility.genArray(r[0].value).map((item, index) => {
                let result = item;

                result['position'] = index;

                return result;
            });

            this.content.edit = data;
            this.content.current = JSON.parse(JSON.stringify(data));

            FNR.forum.getMembers().then((r) => {
                this.setEntry();
                this.users = r;
                this.state.page = 1;
            });
        });
    },
    template: `
    <section id="forum-relationships" class="wiki-content is-dramatic">
        <div class="is-content">
            <h2>Relaciones</h2>
            <hr />
            <p>En esta página podrás editar las relaciones de tu personaje.</p>
            <p>Ante cualquier duda o problema, contacta con la administración.</p>
        </div>
        <separador-foro />
        <template v-if="state.page === 0">
            <cargando-foro text="Cargando utilidad…"></cargando-foro>
        </template>
        <template v-else-if="state.page === 1">
            <modal-relaciones v-if="modal.status" :type="modal.type" :element="entry"></modal-relaciones>
            <mando-foro id="upper-controls" app="true">
                <template slot="pagination" v-if="paginationContent.pages.length > 1">
                    <a class="page-action" title="Ir a la página anterior" v-if="state.pagination > 0" @click="state.pagination -= 1">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                    <template v-for="page in paginationContent.pages">
                        <strong v-if="page === state.pagination">{{ page + 1 }}</strong>
                        <a class="page-link" :title="'Ir a la página «' + (page + 1) + '»'" v-else @click="state.pagination = page">{{ page + 1 }}</a>
                    </template>
                    <a class="page-action" title="Ir a la página siguiente" v-if="(state.pagination + 1) < paginationContent.pages.length" @click="state.pagination += 1">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </template>
                <template slot="controls">
                    <li @click="addEntry($event)">
                        <boton-foro url="#" name="Añadir" icon="fas fa-plus"></boton-foro>
                    </li>
                    <li v-if="finalCheck" @click="save($event)">
                        <boton-foro url="#" name="Guardar" icon="fas fa-save" type="no-name"></boton-foro>
                    </li>
                </template>
            </mando-foro>
            <section id="forum-rplist" class="forum-wikilist">
                <lista-temas-cabecera elements="['Personajes', 'Información']"></lista-temas-cabecera>
                <ul :class="'wikilist-contents no-style' + (!paginationContent.content.length ? ' no-results': '')" :key="render">
                    <template v-if="!paginationContent.content.length">
                        <li class="is-not-topic is-not-lastpost">
                            <h6>No hay entradas en tus relaciones</h6>
                        </li>
                    </template>
                    <template v-else v-for="character in paginationContent.content">
                        <elemento-relaciones :element="character" type="manager" :id="character.position" />
                    </template>
                </ul>
            </section>
            <mando-foro id="lower-controls" app="true">
                <template slot="pagination" v-if="paginationContent.pages.length > 1">
                    <a class="page-action" title="Ir a la página anterior" v-if="state.pagination > 0" @click="state.pagination -= 1">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                    <template v-for="page in paginationContent.pages">
                        <strong v-if="page === state.pagination">{{ page + 1 }}</strong>
                        <a class="page-link" :title="'Ir a la página «' + (page + 1) + '»'" v-else @click="state.pagination = page">{{ page + 1 }}</a>
                    </template>
                    <a class="page-action" title="Ir a la página siguiente" v-if="(state.pagination + 1) < paginationContent.pages.length" @click="state.pagination += 1">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </template>
                <template slot="controls">
                    <li @click="addEntry($event)">
                        <boton-foro url="#" name="Añadir" icon="fas fa-plus"></boton-foro>
                    </li>
                    <li v-if="finalCheck" @click="save($event)">
                        <boton-foro url="#" name="Guardar" icon="fas fa-save" type="no-name"></boton-foro>
                    </li>
                </template>
            </mando-foro>
        </template>
        <template v-else-if="state.page === 2">
            <cargando-foro text="Actualizando información…"></cargando-foro>
        </template>
    </section>
    `
});

Vue.component('elemento-relaciones', {
    props: ['element', 'type', 'id'],
    data() {
        return {
            profileName: forumConfig.profileOptions.profileName || 'perfil',
            content: this.element
        }
    },
    computed: {
        realClass() {
            return 'rela-list usergroup-' + this.content.color;
        }
    },
    methods: {
        deleteElement() {
            this.$parent.content.edit.splice(this.$parent.content.edit.map((item) => {
                return item.position;
            }).indexOf(this.id), 1);

            if (this.$parent.paginationContent.content.length === 0 && this.$parent.state.pagination !== 0) {
                this.$parent.state.pagination -= 1;
            }

            this.$parent.forceRerender();
        },
        editElement() {
            this.$parent.modal.type = 'edit';
            this.$parent.entry = this.content;
            this.$parent.modal.status = true;
        }
    },
    template: `
    <li :class="realClass">
        <template v-if="type === 'manager'">
            <a class="rela-element rela-manager">
                <div class="rela-image" :style="'background-image: url(' + content.img + ')'"></div>
                <div class="rela-content">
                    <div class="rela-title">
                        <h4>{{ content.name }}</h4>
                        <div class="rp-controls"><span @click="editElement()" title="Editar entrada">Editar</span> / <span @click="deleteElement()" title="Eliminar entrada">Eliminar</span></div>
                    </div>
                    <div class="small-text is-content" :inner-html.prop="content.desc | turn-br"></div>
                </div>
            </a>
        </template>
        <template v-else-if="type === 'profile'">
            <template v-if="content.type">
                <a class="rela-element" :href="content.url" :title="'Ir al ' + profileName + ' de «' + content.name + '»'">
                    <div class="rela-image" :style="'background-image: url(' + content.img + ')'"></div>
                    <div class="rela-content">
                        <div class="rela-title">
                            <h4>{{ content.name }}</h4>
                        </div>
                        <div class="small-text is-content" :inner-html.prop="content.desc | turn-br"></div>
                    </div>
                </a>
            </template>
            <template v-else>
                <a class="rela-element">
                    <div class="rela-image" :style="'background-image: url(' + content.img + ')'"></div>
                    <div class="rela-content">
                        <div class="rela-title">
                            <h4>{{ content.name }}</h4>
                        </div>
                        <div class="small-text is-content" :inner-html.prop="content.desc | turn-br"></div>
                    </div>
                </a>
            </template>
        </template>
    </li>
    `
});