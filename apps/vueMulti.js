Vue.component('modal-multicuentas', {
    props: ['element', 'type'],
    data() {
        return {
            state: {
                modal: false
            },
            content: {
                edit: JSON.parse(JSON.stringify(this.element)),
                current: this.element
            }
        }
    },
    computed: {
        modalTitle() {
            if (this.type === 'new') return 'Nuevo usuario';
            else if (this.type === 'edit') return 'Editar usuario';
        },
        oneCheck() {
            let final = '';

            if (this.content.edit.name.length < 4) {
                final += '<li>Escribe el nombre de la cuenta.</li>';
            }

            if (this.content.edit.password.length < 4) {
                final += '<li>Escribe la contraseña de la cuenta.</li>';
            }

            return final;
        },
        finalCheck() {
            const {
                name: curName,
                password: curPass
            } = this.content.current;
            const {
                name: editName,
                password: editPass
            } = this.content.edit;

            return curName !== editName || curPass !== editPass;
        }
    },
    methods: {
        modalClose() {
            this.$parent.modal.type = 'new';
            this.$parent.modal.status = false;
            this.$parent.setEntry();
            this.$parent.forceRerender();
        },
        pushElement() {
            if (this.oneCheck.length) {
                return;
            }

            if (this.finalCheck) {
                this.modalClose();
            }

            if (this.$parent.modal.type === 'edit') {
                let id = this.$parent.content.accounts.edit.map((item) => {
                    return item.id;
                }).indexOf(this.content.current.id);

                this.$parent.content.accounts.edit.splice(id, 1);
            }

            this.$parent.content.accounts.edit.push({
                name: this.content.edit.name,
                type: 'password',
                id: FNR.utility.genSlug(this.content.edit.name),
                password: this.content.edit.password
            });

            this.modalClose();
        }
    },
    template: `
    <modal-foro :title="modalTitle" @modal-close="modalClose()">
        <template slot="content">
            <aviso-foro v-show="oneCheck.length">
                <ul v-html="oneCheck"></ul>
            </aviso-foro>
            <ul class="forum-fieldlist no-style">
                <li>
                    <campo-foro name="Nombre">
                        <input type="text" v-model="content.edit.name" placeholder="Escribe el nombre de la cuenta." />
                    </campo-foro>
                </li>
                <li>
                    <campo-foro name="Contraseña">
                        <div class="character-selector">
                            <input :type="content.edit.type" v-model="content.edit.password" placeholder="Escribe la contraseña de la cuenta." />
                            <a class="character-custom" @click="content.edit.type === 'text' ? content.edit.type = 'password' : content.edit.type = 'text'" title="Cambiar modo">
                                <template v-if="content.edit.type === 'text'">
                                    <i class="fas fa-eye-slash"></i>
                                </template>
                                <template v-else-if="content.edit.type === 'password'">
                                    <i class="fas fa-eye"></i>
                                </template>
                            </a>
                        </div>
                    </campo-foro>
                </li>
            </ul>
        </template>
        <template slot="controls">
            <controles-modal>
                <button class="button1 btn-main" @click="pushElement()" title="Guardar entrada">Guardar</button>
            </controles-modal>
        </template>
    </modal-foro>
    `
});

Vue.component('gestor-multicuentas', {
    data() {
        return {
            render: 0,
            modal: {
                type: 'new',
                status: false,
                bonus: false
            },
            state: {
                new: false,
                error: false,
                page: 0,
                pagination: 0
            },
            entry: {},
            content: {
                page: 1,
                default: forumConfig.skinOptions.paginationDefault,
                loading: 1,
                encrypted: {},
                password: {
                    type: 'password',
                    value: ''
                },
                accounts: {
                    current: [],
                    edit: []
                }
            }
        }
    },
    computed: {
        msgCheck() {
            let final = '';

            if (this.content.password.value.length < 5) {
                final += '<li>Escribe la contraseña maestra.</li>';
            }

            return final;
        },
        finalCheck() {
            return JSON.stringify(this.content.accounts.current) !== JSON.stringify(this.content.accounts.edit);
        },
        sortedCharacters() {
            return this.content.accounts.edit.sort((a, b) => {
                if (a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return 0;
            }).slice((this.content.page - 1) * this.content.default, this.content.page * this.content.default);
        },
    },
    methods: {
        modalClose() {
            this.state.page = 3;
            setTimeout(() => {
                window.location.reload();
            }, 2500);
        },
        forceRerender() {
            this.render += 1;
        },
        setEntry() {
            this.entry = {
                name: '',
                id: '',
                type: 'password',
                password: ''
            };
        },
        addEntry(e) {
            e.preventDefault();

            this.modal.status = true;
        },
        save(e) {
            e.preventDefault();

            this.updateData();
        },
        updateLocal() {
            this.updateData();
        },
        updateForum() {
            this.content.accounts.edit = FNR.cache.getData('usermultiaccounts').map((item) => {
                return {
                    name: item.name,
                    password: sjcl.decrypt(this.content.password.value, item.password)
                };
            });
            this.updateData();
        },
        setData() {
            if (this.msgCheck.length) {
                return;
            }

            this.state.page = 3;

            FNR.cache.setData('userpassword', this.content.password.value, -1);

            setTimeout(() => {
                window.location.reload();
            }, 2500);
        },
        setPage(id) {
            this.content.loading = 0;
            this.content.page = id;
            this.forceRerender();

            setTimeout(() => {
                this.content.loading = 1;
            }, 350);
        },
        updateData() {
            this.state.page = 3;

            const data = this.content.accounts.edit.map((item) => {
                return {
                    name: item.name,
                    password: sjcl.encrypt(this.content.password.value, item.password)
                };
            });

            FNR.cache.setData('userpassword', this.content.password.value, -1);
            FNR.cache.setData('usermultiaccounts', data, -1);

            FNR.user.profile.setData([{
                name: forumConfig.profileUser.accountsField,
                type: 'textarea',
                value: JSON.stringify([{
                    password: this.state.new ? sjcl.encrypt(this.content.password.value, 'gaylien_masterpass') : this.content.encrypted.password,
                    accounts: data
                }]).replace(/"/g, '`')
            }]).then((r) => {
                if (r) {
                    FNR.html.genNotification('Atención', 'Información actualizada sin inconvenientes.', 'fas fa-check');

                    setTimeout(() => {
                        window.location.reload();
                    }, 2500);
                } else {
                    FNR.html.genNotification('Atención', 'Hubo un problema al actualizar. Dale otro intento.', 'fas fa-exclamation');
                }
            });
        }
    },
    created() {
        FNR.user.profile.getData([{
            name: forumConfig.profileUser.accountsField,
            type: 'textarea'
        }]).then((r) => {
            this.content.encrypted = FNR.utility.genArray(r[0].value)[0];
            this.state.new = Object.keys(this.content.encrypted).length === 0;

            if (!FNR.cache.getData('userpassword')) {
                this.state.page = 1;
            } else {
                try {
                    sjcl.decrypt(FNR.cache.getData('userpassword'), this.content.encrypted.password);
                } catch (error) {
                    if (error.message === "ccm: tag doesn't match") {
                        this.state.error = true;
                        FNR.cache.delData('userpassword');
                        setTimeout(() => {
                            window.location.reload();
                        }, 2500);
                    }
                } finally {
                    if (!this.state.error) {
                        if (this.state.new && FNR.cache.getData('usermultiaccounts').length > 0) {
                            this.state.page = 3;

                            FNR.user.profile.setData([{
                                name: forumConfig.profileUser.accountsField,
                                type: 'textarea',
                                value: JSON.stringify([{
                                    password: sjcl.encrypt(FNR.cache.getData('userpassword'), 'gaylien_masterpass'),
                                    accounts: FNR.cache.getData('usermultiaccounts')
                                }]).replace(/"/g, '`')
                            }]).then((r) => {
                                if (r) {
                                    FNR.html.genNotification('Atención', 'Información actualizada sin inconvenientes.', 'fas fa-check');

                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 2500);
                                } else {
                                    FNR.html.genNotification('Atención', 'Hubo un problema al actualizar. Dale otro intento.', 'fas fa-exclamation');
                                }
                            });
                        } else {
                            let data = [];

                            this.content.password.value = FNR.cache.getData('userpassword');

                            if (!this.state.new) {
                                data = JSON.parse(JSON.stringify(this.content.encrypted)).accounts.map((item) => {
                                    return {
                                        name: item.name,
                                        type: 'password',
                                        id: FNR.utility.genSlug(item.name),
                                        password: sjcl.decrypt(this.content.password.value, item.password)
                                    }
                                });
                            }

                            this.setEntry();
                            this.content.accounts.edit = data;
                            this.content.accounts.current = JSON.parse(JSON.stringify(data));
                            this.state.page = 2;

                            if (!this.state.new && JSON.stringify(FNR.cache.getData('usermultiaccounts')) !== JSON.stringify(this.content.encrypted.accounts)) {
                                this.modal.bonus = true;
                            }
                        }
                    }
                }
            }
        });
    },
    template: `
    <section id="forum-multiaccount" class="wiki-content is-dramatic">
        <div class="is-content">
            <h2>Multicuentas</h2>
            <hr />
            <p>En esta página podrás configurar tu cambio de cuenta rápido.</p>
            <p>Ante cualquier duda o problema, contacta con la administración.</p>
        </div>
        <separador-foro />
        <template v-if="state.page === 0">
            <cargando-foro text="Cargando utilidad…"></cargando-foro>
        </template>
        <template v-else-if="state.page === 1">
            <section class="forum-wikilist">
                <aviso-foro v-show="msgCheck.length">
                    <ul v-html="msgCheck"></ul>
                </aviso-foro>
                <ul class="forum-fieldlist no-style">
                    <li>
                        <campo-foro name="Contraseña maestra">
                            <div class="character-selector">
                                <input :type="content.password.type" v-model="content.password.value" />
                                <a class="character-custom" @click="content.password.type === 'text' ? content.password.type = 'password' : content.password.type = 'text'" title="Cambiar modo">
                                    <template v-if="content.password.type === 'text'">
                                        <i class="fas fa-eye-slash"></i>
                                    </template>
                                    <template v-else-if="content.password.type === 'password'">
                                        <i class="fas fa-eye"></i>
                                    </template>
                                </a>
                            </div>
                        </campo-foro>
                    </li>
                </ul>
                <div id="usereply-comand">
                    <button class="button1 btn-main" @click="setData()">Guardar</button>
                </div>
            </section>
        </template>
        <template v-else-if="state.page === 2">
            <modal-multicuentas v-if="modal.status" :type="modal.type" :element="entry"></modal-multicuentas>
            <modal-foro v-if="modal.bonus" title="Atención" @modal-close="modalClose()">
                <template slot="content">
                    <p>Hemos detectado que tienes dos versiones de tu base de datos de cuentas asociadas diferentes. Por favor, elige o actualizar la del dispositivo o la del foro.</p>
                </template>
                <template slot="controls">
                    <controles-modal>
                        <button class="button1 btn-main" @click="updateForum()" title="Actualizar versión foro">Actualizar foro</button>
                        <button class="button1" @click="updateLocal()" title="Actualizar versión local">Actualizar local</button>
                    </controles-modal>
                </template>
            </modal-foro>
            <mando-foro id="upper-controls" app="true">
                <template slot="pagination" v-if="content.accounts.edit.length > 1">
                    <paginacion-foro :page="content.page" :total="Math.ceil(content.accounts.edit.length / content.default)" @setPage="setPage" />
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
            <section id="forum-accountlist" class="forum-wikilist">
                <lista-temas-cabecera elements="['Cuentas', 'Información']"></lista-temas-cabecera>
                <ul :class="'wikilist-contents no-style' + (!sortedCharacters.length || content.loading === 0 ? ' no-results': '')" :key="render">
                    <template v-if="!sortedCharacters.length">
                        <li class="is-not-topic is-not-lastpost">
                            <h6>No hay cuentas configuradas</h6>
                        </li>
                    </template>
                    <template v-else-if="content.loading === 0">
                        <li class="is-not-topic is-not-lastpost">
                            <cargando-foro text="Cargando cuentas…"></cargando-foro>
                        </li>
                    </template>
                    <template v-else v-for="(item, index) in sortedCharacters">
                        <elemento-multicuentas :element="item" :id="index" :key="index"></elemento-multicuentas>
                    </template>
                </ul>
            </section>
            <mando-foro id="lower-controls" app="true">
                <template slot="pagination" v-if="sortedCharacters.length > 1">
                    <paginacion-foro :page="content.page" :total="Math.ceil(content.accounts.edit.length / content.default)" @setPage="setPage" />
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
        <template v-else-if="state.page === 3">
            <cargando-foro text="Actualizando información…"></cargando-foro>
        </template>
    </section>
    `
});

Vue.component('elemento-multicuentas', {
    props: ['element', 'id'],
    data() {
        return {
            content: this.element
        }
    },
    methods: {
        deleteElement() {
            FNR.html.genPrompt('Necesitamos confirmación', 'Te dispones a eliminar una cuenta almacenada en el gestor. ¿Estás segur@?', 'Escribe «ELIMINAR» para confirmar', '').then(r => {
                if (r === 'ELIMINAR') {
                    this.$parent.content.accounts.edit.splice(this.id, 1);

                    this.$parent.forceRerender();
                }
            });
        },
        editElement() {
            this.$parent.modal.type = 'edit';
            this.$parent.entry = this.content;
            this.$parent.modal.status = true;
        }
    },
    template: `
    <li>
        <campo-foro :name="content.name">
            <div class="character-selector">
                <input :type="content.type" v-model="content.password" disabled/>
                <span class="character-custom rp-controls">
                    <span @click="editElement()" title="Editar entrada">Editar</span> / <span @click="deleteElement()" title="Eliminar entrada">Eliminar</span>
                </span>
            </div>
        </campo-foro>
    </li>
    `
});