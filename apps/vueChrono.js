Vue.component('modal-cronologia', {
    props: ['element', 'type'],
    data() {
        return {
            page: 0,
            state: {
                modal: false
            },
            info: {
                user: '',
                people: [],
                selector: true
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

            if (this.content.edit.name.length < 5) {
                final += '<li>Escribe un título lo suficientemente largo.</li>';
            }

            if (this.content.edit.link.indexOf('/t') === -1) {
                final += '<li>Escribe un enlace válido.</li>';
            }

            let date = [];

            if (1 > parseFloat(this.content.edit.date.day) || parseFloat(this.content.edit.date.day) > forumData.date.day || this.content.edit.date.day === '' || Number.isNaN(parseFloat(this.content.edit.date.day))) {
                date.push('un día correcto (1 al ' + forumData.date.day + ')');
            }

            if (1 > parseFloat(this.content.edit.date.month) || parseFloat(this.content.edit.date.month) > forumData.date.month || this.content.edit.date.month === '' || Number.isNaN(parseFloat(this.content.edit.date.month))) {
                date.push('un mes correcto (1 al ' + forumData.date.month + ')');
            }

            if (this.content.edit.date.time === 'DFI' && parseFloat(this.content.edit.date.year) > forumData.date.year || this.content.edit.date.time === 'DFI' && parseFloat(this.content.edit.date.year) < 1 || this.content.edit.date.year === '' || Number.isNaN(parseFloat(this.content.edit.date.year))) {
                date.push('un año correcto');
            }

            if (this.content.edit.date.time === -1) {
                date.push('un periodo correcto');
            }

            if (date.length) {
                let datetxt = '';

                datetxt += '<li>Recuerda poner ';

                [].forEach.call(date, (item, index, array) => {
                    datetxt += item;

                    if ((array.length - 2) === index) {
                        datetxt += ' y ';
                    } else if (array.length === (index + 1)) {
                        datetxt += '.';
                    } else if (array.length > index) {
                        datetxt += ', ';
                    }
                });

                datetxt += '</li>';

                final += datetxt;
            }

            return final;
        },
        secondCheck() {
            let final = '';

            if (!Object.keys(this.content.edit).length) return final;

            if (this.content.edit.status === -1) {
                final += '<li>Selecciona un estado para el tema.</li>';
            }

            if (!this.info.people.length) {
                final += '<li>Selecciona al menos un personaje.</li>';
            }

            return final;
        },
        finalCheck() {
            return JSON.stringify(this.content.current) !== JSON.stringify(this.finalData);
        },
        finalData() {
            let data = JSON.parse(JSON.stringify(this.content.edit));

            if (!Object.keys(this.content.edit).length) return data;

            let longString = '';
            let shortString = '';

            [].forEach.call(JSON.parse(JSON.stringify(this.sortedEditCharacters)), (item, index, array) => {
                longString += item;
                shortString += Vue.filter('just-name')(item);

                if ((array.length - 2) === index) {
                    longString += ' y ';
                    shortString += ' y ';
                } else if (array.length === (index + 1)) {
                    longString += '';
                    shortString += '';
                } else if (array.length > index) {
                    longString += ', ';
                    shortString += ', ';
                }
            });

            data.people.count = this.info.people.length;
            data.people.list = longString;
            data.people.short = shortString;

            if (this.$parent.modal.type === 'new') {
                data.position = this.$parent.content.edit.length;
            }

            return data;
        },
        sortedCharacters() {
            if (!Object.keys(this.content.edit).length) return this.$parent.users.map((item) => {
                return item.user;
            });
            else return this.$parent.users.map((item) => {
                return item.user;
            }).filter((item) => {
                return this.info.people.indexOf(item) === -1;
            }).filter((item) => {
                return item.toLowerCase().indexOf(this.info.user.toLowerCase()) > -1;
            });
        },
        sortedEditCharacters() {
            return this.info.people.sort((a, b) => {
                if (a < b) return -1;
                else if (a > b) return 1;
                return 0;
            });
        }
    },
    methods: {
        modalClose() {
            this.$parent.modal.type = 'new';
            this.$parent.modal.status = false;
            this.$parent.setEntry();
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

            this.$parent.content.edit.push(this.finalData);

            this.modalClose();
        },
        addCharacter(character) {
            this.info.people.push(character);
            this.info.selector = false;
            this.info.user = '';

            setTimeout(() => {
                this.info.selector = true;
            }, 250);
        },
        deleteCharacter(index) {
            const old = JSON.parse(JSON.stringify(this.content.edit.status));

            this.info.people.splice(index, 1);
            this.forceRerender();
            this.content.edit.status = -1;
            this.content.edit.status = old;
        }
    },
    created() {
        let list = [];

        if (this.content.edit.people.list !== '') {
            if (this.content.edit.people.list.indexOf(' y ') === -1) {
                list = [this.content.edit.people.list];
            } else {
                list = this.content.edit.people.list.split(' y ')[0].split(', ').concat(this.content.edit.people.list.split(' y ')[1]);
            }
        }

        this.info.people = list;
    },
    template: `
    <modal-foro :title="modalTitle" @modal-close="modalClose()">
        <template v-if="page === 0">
            <template slot="content">
                <aviso-foro v-show="oneCheck.length">
                    <ul v-html="oneCheck"></ul>
                </aviso-foro>
                <ul class="forum-fieldlist no-style">
                    <li>
                        <campo-foro name="Título">
                            <input type="text" v-model="content.edit.name" placeholder="Escribe el nombre del tema." />
                        </campo-foro>
                    </li>
                    <li>
                        <campo-foro name="Enlace">
                            <input type="text" v-model="content.edit.link" placeholder="Escribe el enlace del tema." />
                        </campo-foro>
                    </li>
                    <li>
                        <campo-foro name="Fecha">
                            <div class="input-date">
                                <div class="date-element date-dmy">
                                    <label>
                                        Día
                                        <input type="text" v-model="content.edit.date.day" placeholder="0" />
                                    </label>
                                    <label>
                                        Mes
                                        <input type="text" v-model="content.edit.date.month" placeholder="0" />
                                    </label>
                                    <label>
                                        Año
                                        <input type="text" v-model="content.edit.date.year" placeholder="0" />
                                    </label>
                                </div>
                                <div class="date-element not-show mt-4">
                                    <label>
                                        Periodo
                                        <div class="select-container">
                                            <select v-model="content.edit.date.time">
                                                <option value="-1" hidden>-</option>
                                                <option value="AFI">AFI</option>
                                                <option value="DFI">DFI</option>
                                            </select>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </campo-foro>
                    </li>
                </ul>
            </template>
            <template slot="controls" v-if="!oneCheck.length">
                <controles-modal>
                    <button class="button1 btn-main" @click="page = 1" title="Paso siguiente">Siguiente</button>
                </controles-modal>
            </template>
        </template>
        <template v-else-if="page === 1">
            <template slot="content">
                <aviso-foro v-show="secondCheck.length">
                    <ul v-html="secondCheck"></ul>
                </aviso-foro>
                <ul class="forum-fieldlist no-style">
                    <li>
                        <campo-foro name="Estado">
                            <div class="select-container">
                                <select v-model="content.edit.status">
                                    <option value="-1" selected="selected" hidden="hidden">Selecciona un estado para el tema</option>
                                    <option value="ropened">Activo</option>
                                    <option value="rclosed">Cerrado</option>
                                    <option value="rabandoned">Abandonado</option>
                                </select>
                            </div>
                        </campo-foro>
                    </li>
                    <li>
                        <campo-foro name="Personajes">
                            <div class="character-selector">
                                <input type="text" v-model="info.user" placeholder="Escribe el nombre de un personaje." />
                                <ul class="no-style selector-list" v-if="sortedCharacters.length > 0 && info.selector">
                                    <li v-for="(character, index) in sortedCharacters" @click="addCharacter(character)" :title="'Seleccionar «' + character + '»'">{{ character }}<i class="fas fa-plus"></i></li>
                                </ul>
                                <a class="character-custom" @click="addCharacter(info.user)" v-if="info.user.length > 2" :title="'Seleccionar «' + info.user + '»'">
                                    <i class="fas fa-plus"></i>
                                </a>
                            </div>
                            <ul v-if="info.people.length" class="no-style character-list">
                                <li v-for="(character, index) in sortedEditCharacters" @click="deleteCharacter(index)" :title="'Quitar ' + character"><i class="fas fa-times"></i> {{ character }}</li>
                            </ul>
                        </campo-foro>
                    </li>
                </ul>
            </template>
            <template slot="controls">
                <controles-modal>
                    <button class="button2" @click="page = 0" title="Paso anterior">Anterior</button>
                    <button class="button1 btn-main" @click="pushElement()" title="Guardar entrada">Guardar</button>
                </controles-modal>
            </template>
        </template>
    </modal-foro>
    `
});

Vue.component('gestor-cronologia', {
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
            return JSON.parse(JSON.stringify(this.content.edit)).sort(({
                date: a,
                name: n1
            }, {
                date: b,
                name: n2
            }) => {
                if (a.time !== b.time) return a.time === 'AFI' ? -1 : 1;


                const before = a.time === 'AFI' ? b : a;
                const after = a.time === 'AFI' ? a : b;

                if (parseFloat(a.year) !== parseFloat(b.year)) return parseFloat(before.year) - parseFloat(after.year);
                if (parseFloat(a.month) !== parseFloat(b.month)) return parseFloat(before.month) - parseFloat(after.month);
                if (parseFloat(a.day) !== parseFloat(b.day)) return parseFloat(before.day) - parseFloat(after.day);
                return n1 - n2;
            });
        },
        paginationContent() {
            const limit = forumConfig.skinOptions.paginationDefault;
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
                link: '',
                name: '',
                status: -1,
                people: {
                    list: '',
                    short: '',
                    count: 0
                },
                date: {
                    time: 'DFI',
                    day: '',
                    month: '',
                    year: ''
                }
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
                if (item.desc !== undefined) {
                    delete item.desc;
                }

                if (item.position !== undefined) {
                    delete item.position;
                }

                return item;
            });

            FNR.user.profile.setData([{
                name: forumConfig.profileUser.cronoField,
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
            name: forumConfig.profileUser.cronoField,
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
    <section id="forum-chronology" class="wiki-content is-dramatic">
        <div class="is-content">
            <h2>Cronología</h2>
            <hr />
            <p>En esta página podrás editar la cronología de tu personaje.</p>
            <p>Ante cualquier duda o problema, contacta con la administración.</p>
        </div>
        <separador-foro />
        <template v-if="state.page === 0">
            <cargando-foro text="Cargando utilidad…"></cargando-foro>
        </template>
        <template v-else-if="state.page === 1">
            <modal-cronologia v-if="modal.status" :type="modal.type" :element="entry"></modal-cronologia>
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
                <lista-temas-cabecera elements="['Temas', 'Información']"></lista-temas-cabecera>
                <ul :class="'wikilist-contents no-style' + (!paginationContent.content.length ? ' no-results': '')" :key="render">
                    <template v-if="!paginationContent.content.length">
                        <li class="is-not-topic is-not-lastpost">
                            <h6>No hay entradas en tu cronología</h6>
                        </li>
                    </template>
                    <template v-else v-for="rp in paginationContent.content">
                        <elemento-cronologia :element="rp" type="manager" :id="rp.position" />
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


Vue.component('elemento-cronologia', {
    props: ['element', 'type', 'id'],
    data() {
        return {
            content: this.element
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
    <li class="rp-list">
        <template v-if="type === 'manager'">
            <a class="rp-element rp-manager">
                <div class="rp-icon">
                    <template v-if="content.status === 'ropened'">
                        <i class="fas fa-lock-open"></i>
                    </template>
                    <template v-else-if="content.status === 'rclosed'">
                        <i class="fas fa-lock"></i>
                    </template>
                    <template v-else-if="content.status === 'rabandoned'">
                        <i class="fas fa-times"></i>
                    </template>
                </div>
                <div class="rp-content">
                    <div class="rp-name">
                        <span>{{ content.name }}</span>
                        <small>
                            {{ content.date.day | to-number | in-two-digits }}/{{ content.date.month | to-number | in-two-digits }}/{{ content.date.year | to-number | in-two-digits }} - <template v-if="content.people.count < 4">{{ content.people.short }}</template><template v-else>Invitados</template>
                        </small>
                    </div>
                    <div class="rp-controls">
                        <span @click="editElement()" title="Editar entrada">Editar</span> / <span @click="deleteElement()" title="Eliminar entrada">Eliminar</span>
                    </div>
                </div>
            </a>
        </template>
        <template v-else-if="type === 'profile'">
            <a class="rp-element" :href="content.link" :title="'Ir al tema «' + content.name + '»'">
                <div class="rp-icon">
                    <template v-if="content.status === 'ropened'">
                        <i class="fas fa-lock-open"></i>
                    </template>
                    <template v-else-if="content.status === 'rclosed'">
                        <i class="fas fa-lock"></i>
                    </template>
                    <template v-else-if="content.status === 'rabandoned'">
                        <i class="fas fa-times"></i>
                    </template>
                </div>
                <div class="rp-content">
                    <div class="rp-name">
                        <span>{{ content.name }}</span>
                        <small>
                            {{ content.date.day | to-number | in-two-digits }}/{{ content.date.month | to-number | in-two-digits }}/{{ content.date.year | to-number | in-two-digits }} - <template v-if="content.people.count < 4">{{ content.people.short }}</template><template v-else>Invitados</template>
                        </small>
                    </div>
                </div>
            </a>
        </template>
    </li>
    `
});